import os
import json
import subprocess
import string

def sanitize_text_for_filename(text: str, max_length: int = 22) -> str:
    """
    Entfernt alle Satzzeichen (laut string.punctuation) aus dem Text
    und kürzt den Text auf max_length Zeichen.
    """
    # Alle Satzzeichen (z. B. !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~) entfernen
    translator = str.maketrans('', '', string.punctuation)
    text_no_punc = text.translate(translator)

    # Auf max_length Zeichen kürzen
    return text_no_punc[:max_length]

def split_mp3_from_json(json_path, subfolder="grabaciones"):
    """
    Liest eine JSON-Datei ein, sucht nach einer gleichnamigen MP3 im selben Ordner,
    erstellt (falls nicht vorhanden) einen Unterordner namens "items"
    und schneidet für jedes Wort einen MP3-Ausschnitt mit 0,4s Vor- und Nachlauf.
    Speichert die Ausschnitte verlustfrei (copy mode) in diesem "items"-Ordner.

    Änderungen:
      - Alle Dateien in denselben Ordner "items".
      - Dateinamen werden begrenzt und Satzzeichen entfernt.
      - Präfix "inf-<mp3_basename>_<number>_..."
      - Falls Zieldatei existiert, wird übersprungen.
    """

    # Basisname: "001.json" => "001"
    base_name = os.path.splitext(os.path.basename(json_path))[0]

    # Pfad zur MP3: "grabaciones/001.mp3"
    mp3_path = os.path.join(subfolder, base_name + ".mp3")
    if not os.path.isfile(mp3_path):
        print(f"[WARNUNG] -> Passende MP3 '{mp3_path}' zu '{json_path}' nicht gefunden. Überspringe.")
        return

    # Unterordner für alle Split-Dateien: z.B. "grabaciones/items"
    output_dir = os.path.join(subfolder, "items")
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # JSON einlesen
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[FEHLER] -> Konnte '{json_path}' nicht einlesen: {e}")
        return

    segments = data.get("segments", [])
    if not segments:
        print(f"[INFO] -> Keine 'segments' in '{json_path}'. Überspringe.")
        return

    print(f"\nVerarbeite '{json_path}' -> MP3: '{mp3_path}' -> Ausgabe-Ordner: '{output_dir}'")

    # Zähle, wie viele Clips wir erstellt haben
    clip_count = 0

    # Über alle Segmente iterieren
    for seg_index, segment in enumerate(segments, start=1):
        words = segment.get("words", [])
        speaker = segment.get("speaker", "<unbekannt>")
        print(f"  [DEBUG] Segment #{seg_index} von Speaker '{speaker}' mit {len(words)} Wort/‒en.")

        for word_index, word in enumerate(words, start=1):
            start_time = word.get("start")
            end_time   = word.get("end")
            number     = word.get("number")  # z.B. "001" oder "s01"
            text_value = word.get("text", "ohneText")

            # Prüfen, ob wir valide Start/End-Werte haben
            if (start_time is None) or (end_time is None):
                print(f"    [WARNUNG] Wort #{word_index} ohne Start/End. Überspringe.")
                continue

            # 0,4 Sekunden Vor- und Nachlauf
            clip_start = start_time - 0.4
            clip_end   = end_time + 0.4

            # Falls der Start < 0, auf 0 setzen
            if clip_start < 0:
                clip_start = 0

            # Text säubern und auf 22 Zeichen beschränken
            text_sanitized = sanitize_text_for_filename(text_value, 22)

            # Beispiel: "inf-001_001_continúa.mp3"
            out_filename = f"inf-{base_name}_{number}_{text_sanitized}.mp3"
            out_path = os.path.join(output_dir, out_filename)

            # Falls die Zieldatei bereits existiert -> Überspringen
            if os.path.isfile(out_path):
                print(f"    -> Datei '{out_filename}' existiert bereits. Überspringe.")
                continue

            # ffmpeg-Befehl: verlustfreies Kopieren (-c copy)
            # -y überschreibt vorhandene Dateien ohne Abfrage
            ffmpeg_cmd = [
                "ffmpeg",
                "-y",
                "-i", mp3_path,
                "-ss", str(clip_start),
                "-to", str(clip_end),
                "-c", "copy",
                out_path
            ]

            try:
                subprocess.run(ffmpeg_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                clip_count += 1
                print(f"    -> {out_filename} [{clip_start:.2f} - {clip_end:.2f}] erstellt.")
            except subprocess.CalledProcessError as e:
                print(f"    [FEHLER] ffmpeg fehlgeschlagen bei {out_filename}: {e}")

    print(f"Fertig. Insgesamt {clip_count} Ausschnitt/e erstellt aus '{mp3_path}'.\n")

def process_all_json_in_grabaciones(subfolder="grabaciones"):
    """
    Durchsucht den Unterordner `grabaciones` (oder einen anderen angegebenen) nach
    allen .json-Dateien. Für jede .json wird versucht, die gleichnamige .mp3 zu schneiden.
    """
    current_folder = os.getcwd()
    target_path = os.path.join(current_folder, subfolder)

    if not os.path.isdir(target_path):
        print(f"[FEHLER] -> Unterordner '{target_path}' existiert nicht!")
        return

    # Alle .json-Dateien im Unterordner
    all_json = [f for f in os.listdir(target_path) if f.lower().endswith(".json")]
    if not all_json:
        print(f"[INFO] -> Keine .json-Dateien in '{target_path}'.")
        return

    print(f"[INFO] -> Gefundene JSON-Dateien in '{target_path}': {all_json}")
    for jfile in all_json:
        json_path = os.path.join(target_path, jfile)
        split_mp3_from_json(json_path, subfolder=subfolder)

if __name__ == "__main__":
    # Beispiel-Aufruf
    process_all_json_in_grabaciones("grabaciones")
