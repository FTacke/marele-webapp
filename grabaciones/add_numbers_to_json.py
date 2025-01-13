import json
import os

def add_numbers_to_json(input_path):
    """
    Liest eine JSON-Datei ein, fügt bei den Worten der Sprecher 'spk1' und 'spk2'
    das neue Attribut 'number' hinzu oder überschreibt es und speichert die aktualisierte Datei.
    """
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    spk1_counter = 1
    spk2_counter = 1

    for segment in data.get("segments", []):
        speaker = segment.get("speaker")
        words = segment.get("words", [])

        for word in words:
            if speaker == "spk1":
                word_number = f"{spk1_counter:03d}"
                spk1_counter += 1
            elif speaker == "spk2":
                word_number = f"s{spk2_counter:02d}"
                spk2_counter += 1
            else:
                continue

            # Überschreibe vorhandene oder setze neue Nummerierung
            word["number"] = word_number

    with open(input_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def process_json_files_in_subfolder(subfolder_name="grabaciones"):
    """
    Durchsucht den angegebenen Unterordner nach .json-Dateien
    und wendet add_numbers_to_json auf jede an.
    """
    current_folder = os.getcwd()
    print(f"[INFO] -> Aktuelles Arbeitsverzeichnis: {current_folder}")

    # Pfad zum Unterordner
    target_path = os.path.join(current_folder, subfolder_name)
    if not os.path.isdir(target_path):
        print(f"[FEHLER] -> Unterordner '{subfolder_name}' existiert nicht!")
        return

    # Alle JSON-Dateien im Unterordner ermitteln
    json_files = [
        file for file in os.listdir(target_path) 
        if file.lower().endswith(".json")
    ]

    if not json_files:
        print(f"[INFO] -> Keine .json-Dateien im Ordner '{subfolder_name}' gefunden.")
        return

    print(f"[INFO] -> Gefundene JSON-Dateien in '{subfolder_name}': {json_files}")

    # Jede JSON-Datei bearbeiten
    for json_file in json_files:
        input_path = os.path.join(target_path, json_file)
        print(f"\n--- Bearbeite Datei: {json_file} ---")
        add_numbers_to_json(input_path)

    print("\nAlle JSON-Dateien wurden erfolgreich bearbeitet.")

if __name__ == "__main__":
    process_json_files_in_subfolder("grabaciones")
