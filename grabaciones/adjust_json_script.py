
import json

def parse_liste_words(words):
    parsed_list = []
    for line in words:
        number, word = line.strip().split('. ')
        parsed_list.append((int(number), word))
    return parsed_list

def find_word_in_json(word, json_segments):
    for segment in json_segments:
        for json_word in segment["words"]:
            if json_word["text"] == word:
                return json_word
    return None

def adjust_json_with_list(json_data, liste_words):
    parsed_liste_words = parse_liste_words(liste_words)
    adjusted_json_segments = json_data["segments"]
    for number, word in parsed_liste_words:
        if ' ' in word:  # Für Wörter, die aus mehreren Teilen bestehen
            parts = word.split(' ')
            start_word = find_word_in_json(parts[0], adjusted_json_segments)
            end_word = find_word_in_json(parts[-1], adjusted_json_segments)
            if start_word and end_word:
                combined_word = {
                    "start": start_word["start"],
                    "end": end_word["end"],
                    "text": word
                }
                for segment in adjusted_json_segments:
                    for i, json_word in enumerate(segment["words"]):
                        if json_word["text"] == parts[0]:
                            segment["words"][i] = combined_word
                            break
        else:  # Für einzelne Wörter
            json_word = find_word_in_json(word, adjusted_json_segments)
            if json_word:
                json_word["text"] = word
    return json_data

def main(json_file_path, liste_file_path, output_file_path):
    with open(liste_file_path, 'r', encoding='utf-8') as file:
        liste_words = file.readlines()

    with open(json_file_path, 'r', encoding='utf-8') as file:
        json_data = json.load(file)

    adjusted_json_data = adjust_json_with_list(json_data, liste_words)

    with open(output_file_path, 'w', encoding='utf-8') as file:
        json.dump(adjusted_json_data, file, ensure_ascii=False, indent=4)

    print(f'Adjusted JSON saved to {output_file_path}')

if __name__ == "__main__":
    # Replace with your file paths
    json_file_path = 'path_to_your_json_file.json'
    liste_file_path = 'path_to_your_liste.txt'
    output_file_path = 'path_to_output_file.json'

    main(json_file_path, liste_file_path, output_file_path)
