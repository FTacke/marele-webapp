document.addEventListener("DOMContentLoaded", function () {
  const audioTable = document.getElementById("audiofile-table");
  const tbody = audioTable.querySelector("tbody");
  const thead = audioTable.querySelector("thead");

  let tableData = []; // Speicher für die Metadaten
  let currentSortKey = "Code"; // Standardmäßig nach der ersten Spalte sortieren
  let sortAscending = true;

  // Funktion: Sortiere Daten und rendere die Tabelle neu
  function sortAndRenderTable(sortKey) {
    currentSortKey = sortKey;
    sortAscending = true; // Sortiere immer aufsteigend

    // Sortiere Daten
    tableData.sort((a, b) => {
        const valA = a[sortKey] || ""; // Fallback für leere Werte
        const valB = b[sortKey] || "";

        if (valA < valB) return -1; // Immer aufsteigend
        if (valA > valB) return 1;
        return 0;
    });

    renderTable();
}


  // Funktion: Tabelle rendern
  function renderTable() {
    tbody.innerHTML = ""; // Tabelle leeren

    tableData.forEach((data) => {
      const row = document.createElement("tr");

      // Spalte: Informante (Code)
      const codeCell = document.createElement("td");
      const codeSpan = document.createElement("span"); // Erstelle ein <span>-Element
      codeSpan.textContent = data.Code || "-"; // Füge den Text hinzu
      codeSpan.classList.add("informante"); // Klasse "informante" hinzufügen
      codeCell.appendChild(codeSpan); // Füge das <span> der Zelle hinzu
      row.appendChild(codeCell); // Füge die Zelle der Zeile hinzu

      // Spalte: Audio-Link mit Icon
      const audioCell = document.createElement("td");
      const audioLink = document.createElement("a");
      audioLink.href = `/player?transcription=grabaciones/${data.Code}.json&audio=grabaciones/${data.Filename}`;
      audioLink.innerHTML = `<i class="bi bi-file-earmark-music"></i>`;
      audioLink.classList.add("link");
      audioCell.appendChild(audioLink);
      row.appendChild(audioCell);

      // Spalte: Nacido/a (BirthYear)
      const birthYearCell = document.createElement("td");
      birthYearCell.textContent = data.BirthYear || "-";
      row.appendChild(birthYearCell);

      // Spalte: Español (nivel) (L2_3Spanish)
      const spanishLevelCell = document.createElement("td");
      spanishLevelCell.textContent = data.L2_3Spanish || "-";
      row.appendChild(spanishLevelCell);

      // Spalte: L1 (L1 und L1Additional)
      const l1Cell = document.createElement("td");
      l1Cell.textContent = [data.L1, data.L1Additional].filter(Boolean).join(", ") || "-";
      row.appendChild(l1Cell);

      // Spalte: L2/L3 adicionales (L2, L3, L4)
      const l2l3l4Cell = document.createElement("td");
      l2l3l4Cell.textContent = [data.L2, data.L3, data.L4].filter(Boolean).join(", ") || "-";
      row.appendChild(l2l3l4Cell);
      
      // Spalte: Estancias (hispanofonía) (ExperienceAbroad)
      const experienceCell = document.createElement("td");
      experienceCell.textContent = data.ExperienceAbroad || "-";
      row.appendChild(experienceCell);

      // Spalte: Fecha (RecordingDate)
      const dateCell = document.createElement("td");
      dateCell.textContent = data.RecordingDate || "-";
      row.appendChild(dateCell);

      tbody.appendChild(row); // Zeile zur Tabelle hinzufügen
    });
  }

  // Event-Listener: Klick auf Spaltenüberschriften zum Sortieren
  thead.addEventListener("click", (event) => {
    const target = event.target;
    const sortKey = target.getAttribute("data-sort-key");
    if (sortKey) {
      sortAndRenderTable(sortKey);
    }
  });

  // Fetch-Daten aus JSON-Dateien
  fetch("/grabaciones_files")
    .then((response) => response.json())
    .then((data) => {
      const jsonFiles = data.json_files || [];
      const fetchPromises = jsonFiles.map((fileName) =>
        fetch(`/grabaciones/${fileName}`)
          .then((res) => res.json())
          .then((jsonData) => {
            const metadata = jsonData.metadata || {};

            return {
              Code: metadata.Code || "-",
              Filename: metadata.Filename || "-",
              BirthYear: metadata.BirthYear || "-",
              L2_3Spanish: metadata.L2_3Spanish || "-",
              ExperienceAbroad: metadata.ExperienceAbroad || "-",
              L1: metadata.L1 || "-",
              L1Additional: metadata.L1Additional || "",
              L2: metadata.L2 || "",
              L3: metadata.L3 || "",
              L4: metadata.L4 || "",
              RecordingDate: metadata.RecordingDate || "-",
            };
          })
      );

      // Lade und verarbeite alle JSON-Dateien
      Promise.all(fetchPromises).then((results) => {
        tableData = results; // Speichere die Daten
        sortAndRenderTable("Code"); // Sortiere und rendere die Tabelle nach der ersten Spalte
      });
    })
    .catch((error) => console.error("Fehler beim Laden der JSON-Daten:", error));
});
