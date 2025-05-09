from flask import Flask, render_template, jsonify, send_from_directory, request, redirect, url_for, flash, make_response, session
from dotenv import load_dotenv
import os
import jwt
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash, generate_password_hash

# Lade Umgebungsvariablen aus der Datei 'passwords.env'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, "passwords.env"))

# Flask-App initialisieren
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "defaultsecret")  # In Produktion einen sicheren Schlüssel verwenden

# JWT-Schlüssel aus Umgebungsvariablen laden
LOCAL_PRIVATE_KEY_PATH = os.path.join(BASE_DIR, "keys", "private.pem")
LOCAL_PUBLIC_KEY_PATH = os.path.join(BASE_DIR, "keys", "public.pem")
PRIVATE_KEY_PATH = LOCAL_PRIVATE_KEY_PATH if os.path.exists(LOCAL_PRIVATE_KEY_PATH) else os.getenv("PRIVATE_KEY_PATH")
PUBLIC_KEY_PATH = LOCAL_PUBLIC_KEY_PATH if os.path.exists(LOCAL_PUBLIC_KEY_PATH) else os.getenv("PUBLIC_KEY_PATH")

try:
    with open(PRIVATE_KEY_PATH, "r") as private_file:
        PRIVATE_KEY = private_file.read()
    with open(PUBLIC_KEY_PATH, "r") as public_file:
        PUBLIC_KEY = public_file.read()
except FileNotFoundError as e:
    raise FileNotFoundError(f"Schlüsseldatei nicht gefunden: {e}")

# Benutzergruppen und Passwörter aus der .env-Datei laden
GROUPS = {
    "admin": os.getenv("ADMIN_PASSWORD"),
    "seminario25": os.getenv("SEMINARIO25_PASSWORD"),
    "externo1": os.getenv("EXTERNO1_PASSWORD"),
    "externo2": os.getenv("EXTERNO2_PASSWORD"),
    "guest": os.getenv("GUEST_PASSWORD")
}

# Validierung der geladenen Passwörter
for group, password in GROUPS.items():
    if password is None:
        raise ValueError(f"Passwort für Gruppe '{group}' fehlt in der .env-Datei.")

# Ordner 'grabaciones' und 'items'
GRABACIONES_FOLDER = os.path.join(app.root_path, "grabaciones")
ITEMS_FOLDER = os.path.join(app.root_path, "items")

# ---------------------------------------------------------
# Authentifizierung
# ---------------------------------------------------------
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        group = request.form.get("group")
        password = request.form.get("password")

        # Prüfen, ob der Benutzername existiert
        if group not in GROUPS:
            flash("Error: Usuario desconocido", "error")
            return render_template("index.html", logged_in=False)
        
        # Benutzername existiert, nun Passwort prüfen
        if not check_password_hash(GROUPS[group], password):
            flash("Error: Palabra clave incorrecta", "error")
            return render_template("index.html", logged_in=False)

        # JWT-Token erstellen, wenn alles korrekt ist
        token = jwt.encode(
            {
                "group": group,
                "exp": datetime.utcnow() + timedelta(hours=3)
            },
            PRIVATE_KEY,
            algorithm="RS256"
        )
        response = make_response(redirect(url_for("index")))
        response.set_cookie("jwt_token", token, httponly=True, secure=True)
        return response

    # GET-Anfrage: Überprüfen, ob ein gültiger Token im Cookie vorliegt
    token = request.cookies.get("jwt_token")
    logged_in = False
    if token:
        try:
            jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
            logged_in = True
        except jwt.ExpiredSignatureError:
            flash("Sesión expirada. Por favor, inicie sesión de nuevo.", "error")
        except jwt.InvalidTokenError:
            flash("Token no válido. Por favor, inicie sesión de nuevo.", "error")

    return render_template("index.html", logged_in=logged_in)

@app.route("/logout")
def logout():
    response = make_response(redirect(url_for("index")))
    response.delete_cookie("jwt_token")
    return response

# Middleware: JWT-Token validieren
def validate_jwt():
    token = request.cookies.get("jwt_token")
    if not token:
        return redirect(url_for("index"))
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
        return payload["group"]
    except jwt.ExpiredSignatureError:
        flash("Sesión expirada. Por favor, inicie sesión de nuevo.", "error")
        return redirect(url_for("index"))
    except jwt.InvalidTokenError:
        flash("Token no válido. Por favor, inicie sesión de nuevo.", "error")
        return redirect(url_for("index"))

# ---------------------------------------------------------
# Routen für deine Seiten
# ---------------------------------------------------------
@app.route("/proyecto")
def proyecto():
    return render_template("proyecto.html")

@app.route("/impressum")
def impressum():
    return render_template("impressum.html")

@app.route("/datenschutz")
def datenschutz():
    return render_template("datenschutz.html")

@app.route("/informantes")
def informantes():
    group = validate_jwt()
    if isinstance(group, str):
        return render_template("informantes.html")
    return group

@app.route("/analisis")
def analisis():
    group = validate_jwt()
    if isinstance(group, str):
        return render_template("analisis.html")
    return group

@app.route("/player")
def player():
    group = validate_jwt()
    if isinstance(group, str):
        return render_template("player.html")
    return group

# ---------------------------------------------------------
# Routen, die deine JS-Dateien aufrufen
# ---------------------------------------------------------
@app.route("/grabaciones_files")
def grabaciones_files():
    if not os.path.isdir(GRABACIONES_FOLDER):
        return jsonify({"json_files": [], "mp3_files": []})

    files = os.listdir(GRABACIONES_FOLDER)
    json_files = [f for f in files if f.lower().endswith(".json")]
    mp3_files = [f for f in files if f.lower().endswith(".mp3")]
    return jsonify({"json_files": json_files, "mp3_files": mp3_files})

@app.route("/get_audio_items")
def get_audio_items():
    if not os.path.isdir(ITEMS_FOLDER):
        return jsonify([])

    all_files = os.listdir(ITEMS_FOLDER)
    mp3_files = [f for f in all_files if f.lower().endswith(".mp3")]
    return jsonify(mp3_files)

@app.route("/grabaciones/<path:filename>")
def serve_grabaciones_file(filename):
    group = validate_jwt()
    if isinstance(group, str):
        return send_from_directory(GRABACIONES_FOLDER, filename)
    return group

@app.route("/items/<filename>")
def serve_item(filename):
    group = validate_jwt()
    if isinstance(group, str):
        return send_from_directory(ITEMS_FOLDER, filename)
    return group

@app.after_request
def add_security_headers(response):
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response

# ---------------------------------------------------------
# Start der Flask-App
# ---------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
