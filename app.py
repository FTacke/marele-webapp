from flask import Flask, render_template, jsonify, send_from_directory, request, redirect, url_for, flash, make_response, session
from dotenv import load_dotenv
import os
import jwt
import json
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash, generate_password_hash

# ----------------------------------------------------------------
# Konfiguration und Authentifizierung
# ----------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, "passwords.env"))

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "defaultsecret")

# Schlüssel laden (entweder aus dem lokalen keys-Ordner oder aus den Umgebungsvariablen)
LOCAL_PRIVATE_KEY_PATH = os.path.join(BASE_DIR, "keys", "private.pem")
LOCAL_PUBLIC_KEY_PATH = os.path.join(BASE_DIR, "keys", "public.pem")
PRIVATE_KEY_PATH = LOCAL_PRIVATE_KEY_PATH if os.path.exists(LOCAL_PRIVATE_KEY_PATH) else os.getenv("PRIVATE_KEY_PATH")
PUBLIC_KEY_PATH = LOCAL_PUBLIC_KEY_PATH if os.path.exists(LOCAL_PUBLIC_KEY_PATH) else os.getenv("PUBLIC_KEY_PATH")

try:
    with open(PRIVATE_KEY_PATH, "r") as pf:
        PRIVATE_KEY = pf.read()
    with open(PUBLIC_KEY_PATH, "r") as pf:
        PUBLIC_KEY = pf.read()
except Exception as e:
    raise Exception(f"Schlüsseldateien nicht gefunden: {e}")

# Benutzergruppen und Passwörter (alle mit _PASSWORD in .env)
GROUPS = {}
for key, value in os.environ.items():
    if key.endswith("_PASSWORD"):
        group_name = key[:-9].lower()  # Entfernt '_PASSWORD' und macht Kleinbuchstaben
        GROUPS[group_name] = value

for group, password in GROUPS.items():
    if password is None:
        raise ValueError(f"Passwort für Gruppe '{group}' fehlt in der .env-Datei.")

# Ordner 'grabaciones' und 'items'
GRABACIONES_FOLDER = os.path.join(app.root_path, "grabaciones")
ITEMS_FOLDER = os.path.join(app.root_path, "items")

# ---------------------------------------------------------
# Authentifizierung
# ---------------------------------------------------------
# Entferne die doppelte Definition der index-Funktion, die zu einem Fehler führt

# Die ursprüngliche index-Funktion bleibt unverändert, die zweite wird entfernt

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

# ----------------------------------------------------------------
# Counter-Funktion
# ----------------------------------------------------------------

def load_counters():
    if not os.path.exists("counters.json"):
        return {"total": {"overall": 0, "monthly": {}, "days": []}, "groups": {}}
    with open("counters.json", "r") as f:
        return json.load(f)

def save_counters(data):
    with open("counters.json", "w") as f:
        json.dump(data, f, indent=2)

def increment_counters(group: str):
    data = load_counters()
    now = datetime.utcnow()
    month = f"{now.year}-{now.month:02d}"
    day = now.strftime("%Y-%m-%d")

    data["total"]["overall"] += 1
    data["total"]["monthly"][month] = data["total"]["monthly"].get(month, 0) + 1
    if "days" not in data["total"]:
        data["total"]["days"] = []
    data["total"]["days"].append(day)

    grp = data["groups"].setdefault(group, {"overall": 0, "monthly": {}, "days": []})
    grp["overall"] += 1
    grp["monthly"][month] = grp["monthly"].get(month, 0) + 1
    grp["days"].append(day)

    save_counters(data)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        group = request.form.get("group")
        if group:
            group = group.lower()
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

        # Zugriffszähler erhöhen
        increment_counters(group)

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

# ---------------------------------------------------------
# Start der Flask-App
# ---------------------------------------------------------

# Lokale Testumgebung
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6001, debug=True)

#if __name__ == "__main__":
#    app.run(host="0.0.0.0", port=5000, debug=False)
