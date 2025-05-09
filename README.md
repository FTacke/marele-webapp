# MAR.ELE

[![GitLab CI](https://gitlab.uni-marburg.de/tackef/marele/badges/main/pipeline.svg)](https://gitlab.uni-marburg.de/tackef/marele/-/pipelines)  
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]

**MAR.ELE** ist ein Korpusprojekt zur Erforschung der Aussprache des Spanischen als Fremdsprache. Basierend auf Audioaufnahmen mit Studierenden der Universität Marburg, beinhaltet es sowohl Textlesungen als auch Wortlisten.* Das laufend erweiterte Korpus wird ausschließlich für linguistische und didaktische Zwecke veröffentlicht und ermöglicht systematische Studien zu Ausspracheproblemen und Kompetenzentwicklung.

## Inhalt des Korpus

- **Vollständige Aufnahmen** jeder Person (mindestens 6 Minuten pro Informant:in)  
- **Informant:innen**: relevante soziodemografische Daten (Alter, Geschlecht, Nationalität, Spanischniveau A1–C2)²  
- **Lesematerial**: fortlaufender Text und Wortliste aus dem FEC-Projekt³  

## Web-App

Über die Web-App können Nutzer:innen im Browser:

- die vollständige Aufnahme jeder Person im Player abspielen  
- unter “Informant:innen” soziodemografische Daten einsehen  
- unter “Analyse” einzelne Wörter und Textpassagen vergleichen und abspielen  
- Audio-Snippets herunterladen und Spektrogramme erzeugen  

## Nutzung

1. Repository klonen und Docker-Container starten:  
   ```bash
   git clone https://gitlab.uni-marburg.de/tackef/marele.git
   cd MAR.ELE
   docker-compose up --build
   ```  
2. `http://localhost:5000` im Browser öffnen  
3. Unter “Informant:innen” und “Analyse” das Korpus erkunden  

## Zitation

Bitte zitieren Sie das Corpus als:  
Tacke, F. (2025–). **MAR.ELE – Korpus zur Erforschung der Aussprache des Spanischen als Fremdsprache**. Universität Marburg. DOI: wird vergeben.

## Credits

- **Projektleitung & Konzeption:** Felix Tacke  
- **Aufnahmen:** Felix Tacke & Studierende  
- **Datenmanagement & Aufbereitung:** Felix Tacke & Sarah Haas  
- **Programmierung & Infrastruktur:** Felix Tacke  

---

* Pustka, E. et al. (2018): “(Inter-)Fonología del Español Contemporáneo (I)FEC: Methodology…”, *Loquens*, 5(1): e046.  
² Selbstbewertung gemäß Gemeinsamen Europäischen Referenzrahmen für Sprachen (A1–C2).  
³ Wortliste entsprechend dem FEC-Projekt für Vergleichsstudien.
