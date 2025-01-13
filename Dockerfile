# Verwende ein offizielles Python-Image als Basis
FROM python:3.9-slim

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere die Anforderungen und installiere sie
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Kopiere den Rest der Anwendung
COPY . .

# Exponiere den Port, auf dem Flask läuft
EXPOSE 5000

# Führe die Flask-App aus
CMD ["python", "app.py"]
