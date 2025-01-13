from flask import Flask, render_template, jsonify, send_from_directory, request, redirect, url_for, flash, make_response
from dotenv import load_dotenv
import os
import jwt
from datetime import datetime, timedelta

# Lade Umgebungsvariablen aus der Datei 'password.env'
load_dotenv(dotenv_path='password.env')

# Flask-App initialisieren
app = Flask(__name__)

# Passwort und JWT-Secret-Key aus Umgebungsvariablen laden
PASSWORD = os.getenv('APP_PASSWORD', 'default_password')  # Aus der .env-Datei oder Standardwert
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default_jwt_secret')  # Aus der .env-Datei oder Standardwert

# Ordner 'grabaciones' (eine Ebene unterhalb deines app.py)
GRABACIONES_FOLDER = os.path.join(app.root_path, 'grabaciones')

# Ordner 'items' (Ebenen gleich wie grabaciones)
ITEMS_FOLDER = os.path.join(app.root_path, 'items')

# ---------------------------------------------------------
# Authentifizierung
# ---------------------------------------------------------

@app.route('/', methods=['GET', 'POST'])
def index():
    """
    Zeigt die Login-Seite an und authentifiziert den Benutzer.
    """
    if request.method == 'POST':
        entered_password = request.form.get('password')
        if entered_password == PASSWORD:
            # JWT-Token erstellen
            token = jwt.encode(
                {"user": "authenticated_user", "exp": datetime.utcnow() + timedelta(hours=1)},
                JWT_SECRET_KEY,
                algorithm="HS256"
            )
            response = make_response(redirect(url_for('informantes')))
            response.set_cookie('jwt_token', token, httponly=True, secure=True)  # Token als HttpOnly-Cookie setzen
            return response
        else:
            flash('Falsches Passwort. Bitte erneut versuchen.', 'error')

    return render_template('index.html')  # Zeigt die Login-Seite an

@app.route('/logout')
def logout():
    """
    Löscht das JWT-Token durch Entfernen des Cookies.
    """
    response = make_response(redirect(url_for('index')))
    response.delete_cookie('jwt_token')
    return response

# Middleware: JWT-Token validieren
def validate_jwt():
    token = request.cookies.get('jwt_token')
    if not token:
        return False
    try:
        jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        return True
    except jwt.ExpiredSignatureError:
        flash('Sitzung abgelaufen. Bitte erneut anmelden.', 'error')
        return False
    except jwt.InvalidTokenError:
        flash('Ungültiger Token. Bitte erneut anmelden.', 'error')
        return False

# ---------------------------------------------------------
# Routen für deine 4 HTML-Seiten mit Authentifizierungsschutz
# ---------------------------------------------------------
@app.route('/informantes')
def informantes():
    if not validate_jwt():
        return redirect(url_for('index'))
    return render_template('informantes.html')

@app.route('/analisis')
def analisis():
    if not validate_jwt():
        return redirect(url_for('index'))
    return render_template('analisis.html')

@app.route('/player')
def player():
    if not validate_jwt():
        return redirect(url_for('index'))
    return render_template('player.html')

# ---------------------------------------------------------
# Routen, die deine JS-Dateien aufrufen
# ---------------------------------------------------------

@app.route('/grabaciones_files')
def grabaciones_files():
    """
    Gibt eine Liste aller .json- und .mp3-Dateien direkt aus 'grabaciones/' zurück.
    """
    if not os.path.isdir(GRABACIONES_FOLDER):
        return jsonify({'json_files': [], 'mp3_files': []})

    files = os.listdir(GRABACIONES_FOLDER)
    json_files = [f for f in files if f.lower().endswith('.json')]
    mp3_files = [f for f in files if f.lower().endswith('.mp3')]
    return jsonify({'json_files': json_files, 'mp3_files': mp3_files})

@app.route('/get_audio_items')
def get_audio_items():
    """
    Listet alle .mp3-Dateien im Ordner 'items'.
    """
    if not os.path.isdir(ITEMS_FOLDER):
        return jsonify([])

    all_files = os.listdir(ITEMS_FOLDER)
    mp3_files = [f for f in all_files if f.lower().endswith(".mp3")]
    return jsonify(mp3_files)

@app.route('/items/<filename>')
def serve_item(filename):
    """
    Liefert einzelne MP3-Dateien aus 'items'.
    """
    return send_from_directory(ITEMS_FOLDER, filename)

@app.route('/grabaciones/<path:filename>')
def serve_grabaciones_file(filename):
    """
    Liefert Dateien aus 'grabaciones/' (z.B. .json oder .mp3).
    """
    return send_from_directory(GRABACIONES_FOLDER, filename)

# ---------------------------------------------------------
# Start der Flask-App
# ---------------------------------------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
