document.addEventListener("DOMContentLoaded", function () {
  // -----------------------------------------------------------
  //  INFORMANTES-TABELLE
  // -----------------------------------------------------------
  const audioTable = document.getElementById("informantes-table");
  const tbody = audioTable.querySelector("tbody");
  const thead = audioTable.querySelector("thead");

  // Variablen für informantes-Daten und Sortierstatus
  let tableData = [];
  let currentSortKey = "Code";
  let sortAscending = true;

  /**
   * Sortiert tableData nach currentSortKey und Richtung (sortAscending),
   * anschließend wird renderTable() aufgerufen.
   */
  function sortAndRenderTable() {
    tableData.sort((a, b) => {
      const valA = a[currentSortKey] || "";
      const valB = b[currentSortKey] || "";
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
    if (!sortAscending) {
      tableData.reverse();
    }
    renderTable();
  }

  /**
   * Rendert die informantes-Tabelle (tbody) anhand von tableData.
   */
  function renderTable() {
    tbody.innerHTML = "";
    tableData.forEach((data) => {
      const row = document.createElement("tr");

      // Spalte: Informante (Code)
      const codeCell = document.createElement("td");
      const codeSpan = document.createElement("span");
      codeSpan.textContent = data.Code || "-";
      codeSpan.classList.add("informante");
      codeCell.appendChild(codeSpan);
      row.appendChild(codeCell);

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

      // Spalte: Género (Gender)
      const genderCell = document.createElement("td");
      genderCell.textContent = data.Gender || "-";
      row.appendChild(genderCell);

      // Spalte: Proveniencia (ResidencesPrevious)
      const residencesCell = document.createElement("td");
      const bundeslaender = {
        BW: "Baden-Württemberg",
        BY: "Bayern",
        BE: "Berlin",
        BB: "Brandenburg",
        HB: "Bremen",
        HH: "Hamburg",
        HE: "Hessen",
        MV: "Mecklenburg-Vorpommern",
        NI: "Niedersachsen",
        NRW: "Nordrhein-Westfalen",
        RP: "Rheinland-Pfalz",
        SL: "Saarland",
        SN: "Sachsen",
        ST: "Sachsen-Anhalt",
        SH: "Schleswig-Holstein",
        TH: "Thüringen"
      };
      const abbreviation = data.ResidencesPrevious || "-";
      residencesCell.textContent = abbreviation;
      if (bundeslaender[abbreviation]) {
        residencesCell.title = bundeslaender[abbreviation];
      }
      row.appendChild(residencesCell);

      // Spalte: Español (nivel) (L2_3Spanish)
      const spanishLevelCell = document.createElement("td");
      spanishLevelCell.textContent = data.L2_3Spanish || "-";
      spanishLevelCell.classList.add("spanish-level");
      row.appendChild(spanishLevelCell);

      // Spalte: L1 (Kombination aus L1 und L1Additional)
      const l1Cell = document.createElement("td");
      l1Cell.textContent = [data.L1, data.L1Additional].filter(Boolean).join(", ") || "-";
      row.appendChild(l1Cell);

      // Spalte: L2/L3 adicionales (Kombination aus L2, L3, L4)
      const l2l3l4Cell = document.createElement("td");
      l2l3l4Cell.textContent = [data.L2, data.L3, data.L4].filter(Boolean).join(", ") || "-";
      row.appendChild(l2l3l4Cell);

      // Spalte: L1 de la madre
      const motherL1Cell = document.createElement("td");
      motherL1Cell.textContent = data.MotherL1 || "-";
      row.appendChild(motherL1Cell);

      // Spalte: L1 del padre
      const fatherL1Cell = document.createElement("td");
      fatherL1Cell.textContent = data.FatherL1 || "-";
      row.appendChild(fatherL1Cell);

      // Spalte: Estancias (ExperienceAbroad)
      const experienceCell = document.createElement("td");
      experienceCell.textContent = data.ExperienceAbroad || "-";
      row.appendChild(experienceCell);

      // Spalte: Observaciones (Comments)
      const commentsCell = document.createElement("td");
      commentsCell.textContent = data.Comments || "-";
      row.appendChild(commentsCell);

      // Spalte: Fecha (RecordingDate)
      const dateCell = document.createElement("td");
      dateCell.textContent = data.RecordingDate || "-";
      row.appendChild(dateCell);

      tbody.appendChild(row);
    });
  }

  /**
   * Klick-Event auf die Spaltenüberschriften der informantes-Tabelle.
   * Sortieren nach Key, bei erneutem Klick auf dieselbe Spalte toggeln wir die Sortierrichtung.
   */
  thead.addEventListener("click", (event) => {
    const target = event.target;
    const sortKey = target.getAttribute("data-sort-key");
    if (sortKey) {
      if (sortKey === currentSortKey) {
        // Gleicher Key -> Richtung umschalten
        sortAscending = !sortAscending;
      } else {
        // Neuer Key -> aufsteigend
        currentSortKey = sortKey;
        sortAscending = true;
      }
      sortAndRenderTable();
    }
  });

  // -----------------------------------------------------------
  //  NATIVOS-TABELLE
  // -----------------------------------------------------------
  const nativosTable = document.getElementById("nativos-table");
  const nativosTbody = nativosTable.querySelector("tbody");
  const nativosThead = nativosTable.querySelector("thead");

  // Variablen für nativos-Daten und Sortierstatus
  let nativosData = [];
  let nativosCurrentSortKey = "Code";
  let nativosSortAscending = true;

  /**
   * Sortiert nativosData nach nativosCurrentSortKey und Richtung (nativosSortAscending),
   * anschließend wird renderNativosTable() aufgerufen.
   */
  function sortAndRenderNativosTable() {
    nativosData.sort((a, b) => {
      const valA = a[nativosCurrentSortKey] || "";
      const valB = b[nativosCurrentSortKey] || "";
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
    if (!nativosSortAscending) {
      nativosData.reverse();
    }
    renderNativosTable();
  }

  /**
   * Rendert die nativos-Tabelle (nativosTbody) anhand von nativosData
   * mit den gewünschten Spalten:
   *   Code (Hablante ejemplar),
   *   Audio,
   *   GeographicOrigin (Origen),
   *   Gender (Género),
   *   StandardVariety (Variedad estándar representada),
   *   Profession (Profesión),
   *   Age (Edad),
   *   RecordingDate (Fecha).
   */
  function renderNativosTable() {
    nativosTbody.innerHTML = "";

    nativosData.forEach((data) => {
      const row = document.createElement("tr");

      // Spalte: Hablante ejemplar (Code)
      const codeCell = document.createElement("td");
      const codeSpan = document.createElement("span");
      codeSpan.textContent = data.Code || "-";
      codeSpan.classList.add("informante");
      codeCell.appendChild(codeSpan);
      row.appendChild(codeCell);

      // Spalte: Audio
      const audioCell = document.createElement("td");
      const audioLink = document.createElement("a");
      audioLink.href = `/player?transcription=grabaciones/${data.Code}.json&audio=grabaciones/${data.Filename}`;
      audioLink.innerHTML = `<i class="bi bi-file-earmark-music"></i>`;
      audioLink.classList.add("link");
      audioCell.appendChild(audioLink);
      row.appendChild(audioCell);

      // Spalte: Origen (GeographicOrigin)
      const originCell = document.createElement("td");
      originCell.textContent = data.GeographicOrigin || "-";
      row.appendChild(originCell);

      // Spalte: Variedad estándar representada (StandardVariety)
      const stdVarietyCell = document.createElement("td");
      stdVarietyCell.textContent = data.StandardVariety || "-";
      row.appendChild(stdVarietyCell);

      // Spalte: Profesión (Profession)
      const professionCell = document.createElement("td");
      professionCell.textContent = data.Profession || "-";
      row.appendChild(professionCell);
      
      // Spalte: Género (Gender)
      const genderCell = document.createElement("td");
      genderCell.textContent = data.Gender || "-";
      row.appendChild(genderCell);

      // Spalte: Edad (Age)
      const ageCell = document.createElement("td");
      ageCell.textContent = data.Age || "-";
      row.appendChild(ageCell);

      // Spalte: Fecha (RecordingDate)
      const dateCell = document.createElement("td");
      dateCell.textContent = data.RecordingDate || "-";
      row.appendChild(dateCell);

      nativosTbody.appendChild(row);
    });
  }

  /**
   * Klick-Event auf die Spaltenüberschriften der nativos-Tabelle.
   * Sortieren nach Key, bei erneutem Klick auf dieselbe Spalte toggeln wir die Sortierrichtung.
   */
  nativosThead.addEventListener("click", (event) => {
    const target = event.target;
    const sortKey = target.getAttribute("data-sort-key");
    if (sortKey) {
      if (sortKey === nativosCurrentSortKey) {
        // Gleicher Key -> Richtung umschalten
        nativosSortAscending = !nativosSortAscending;
      } else {
        // Neuer Key -> aufsteigend
        nativosCurrentSortKey = sortKey;
        nativosSortAscending = true;
      }
      sortAndRenderNativosTable();
    }
  });

  // -----------------------------------------------------------
  //  JSON-Daten laden und Tabellen befüllen
  // -----------------------------------------------------------
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
              // -------------------------------------------------------
              //  Gemeinsame Metadaten, die wir in .filter() usw. nutzen
              // -------------------------------------------------------
              jsonFile: fileName, // Original JSON-Dateiname zum Filtern
              Code: metadata.Code || "-",
              Filename: metadata.Filename || "-",
              RecordingDate: metadata.RecordingDate || "-",

              // -------------------------------------------------------
              //  Daten für die INFORMANTES-Tabelle
              // -------------------------------------------------------
              BirthYear: metadata.BirthYear || "-",
              Gender: metadata.Gender || "-",
              ResidencesPrevious: metadata.ResidencesPrevious || "-",
              L2_3Spanish: metadata.L2_3Spanish || "-",
              MotherL1: metadata.MotherL1 || "-",
              FatherL1: metadata.FatherL1 || "-",
              Comments: metadata.Comments || "-",
              ExperienceAbroad: metadata.ExperienceAbroad || "-",
              L1: metadata.L1 || "-",
              L1Additional: metadata.L1Additional || "",
              L2: metadata.L2 || "",
              L3: metadata.L3 || "",
              L4: metadata.L4 || "",

              // -------------------------------------------------------
              //  Daten für die NATIVOS-Tabelle (L1-ES)
              // -------------------------------------------------------
              GeographicOrigin: metadata.GeographicOrigin || "-",
              StandardVariety: metadata.StandardVariety || "-",
              Profession: metadata.Profession || "-",
              Age: metadata.Age || "-",
            };
          })
      );

      Promise.all(fetchPromises).then((results) => {
        // Nativos-Daten: JSON-Dateien, deren Name "L1-ES" enthält
        nativosData = results.filter((item) => item.jsonFile.indexOf("L1-ES") !== -1);

        // Informantes-Daten: alle übrigen
        tableData = results.filter((item) => item.jsonFile.indexOf("L1-ES") === -1);

        // Sortierte Ausgabe Nativos
        sortAndRenderNativosTable();

        // Sortierte Ausgabe Informantes
        sortAndRenderTable();
      });
    })
    .catch((error) => console.error("Fehler beim Laden der JSON-Daten:", error));
});