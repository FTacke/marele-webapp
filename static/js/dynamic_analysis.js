document.addEventListener("DOMContentLoaded", function() {
  // =====================================
  // (1) JAHR IM FOOTER
  // =====================================
  const yearElem = document.getElementById("currentYear");
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }

  // =====================================
  // (2) CUSTOM AUDIO-PLAYER
  // =====================================
  const audioPlayer = document.getElementById("tableAudioPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const rewindBtn = document.getElementById("rewindBtn");
  const forwardBtn = document.getElementById("forwardBtn");
  const progressBar = document.getElementById("progressBar");
  const volumeControl = document.getElementById("volumeControl");
  const muteBtn = document.getElementById("muteBtn");
  const speedControl = document.getElementById("speedControlSlider");
  const speedDisplay = document.getElementById("speedDisplay");
  const timeDisplay = document.getElementById("timeDisplay");

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
  function updateTimeDisplay() {
    if (!audioPlayer || !audioPlayer.duration) {
      timeDisplay.textContent = "0:00 / 0:00";
      return;
    }
    const current = formatTime(audioPlayer.currentTime);
    const total = formatTime(audioPlayer.duration);
    timeDisplay.textContent = `${current} / ${total}`;
  }

  if (
    audioPlayer &&
    playPauseBtn &&
    progressBar &&
    volumeControl &&
    muteBtn &&
    rewindBtn &&
    forwardBtn &&
    speedControl &&
    speedDisplay &&
    timeDisplay
  ) {
    playPauseBtn.addEventListener("click", () => {
      if (audioPlayer.paused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    });
    audioPlayer.addEventListener("play", () => {
      playPauseBtn.classList.remove("bi-play-circle-fill");
      playPauseBtn.classList.add("bi-pause-circle-fill");
    });
    audioPlayer.addEventListener("pause", () => {
      playPauseBtn.classList.remove("bi-pause-circle-fill");
      playPauseBtn.classList.add("bi-play-circle-fill");
    });
    audioPlayer.addEventListener("timeupdate", () => {
      if (!audioPlayer.duration) return;
      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.value = progress;
      updateTimeDisplay();
    });
    progressBar.addEventListener("input", () => {
      if (!audioPlayer.duration) return;
      const newTime = (progressBar.value / 100) * audioPlayer.duration;
      audioPlayer.currentTime = newTime;
    });
    rewindBtn.addEventListener("click", () => {
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 3);
    });
    forwardBtn.addEventListener("click", () => {
      if (audioPlayer.duration) {
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 3);
      }
    });
    volumeControl.addEventListener("input", () => {
      audioPlayer.volume = volumeControl.value;
      if (audioPlayer.volume === 0) {
        muteBtn.classList.remove("fa-volume-high");
        muteBtn.classList.add("fa-volume-xmark");
      } else {
        muteBtn.classList.remove("fa-volume-xmark");
        muteBtn.classList.add("fa-volume-high");
      }
    });
    muteBtn.addEventListener("click", () => {
      if (audioPlayer.volume > 0) {
        audioPlayer.volume = 0;
        volumeControl.value = 0;
        muteBtn.classList.remove("fa-volume-high");
        muteBtn.classList.add("fa-volume-xmark");
      } else {
        audioPlayer.volume = 1;
        volumeControl.value = 1;
        muteBtn.classList.remove("fa-volume-xmark");
        muteBtn.classList.add("fa-volume-high");
      }
    });
    speedControl.addEventListener("input", () => {
      audioPlayer.playbackRate = speedControl.value;
      speedDisplay.textContent = `${speedControl.value}x`;
    });
    speedDisplay.textContent = `${speedControl.value}x`;
    audioPlayer.addEventListener("loadedmetadata", () => {
      updateTimeDisplay();
    });
    audioPlayer.addEventListener("play", () => {
      audioPlayer.playbackRate = speedControl.value;
      speedDisplay.textContent = `${speedControl.value}x`;
    });
  }

// =====================================
// (3) DYNAMISCHE KREUZTABELLE
// =====================================
const analysisTable = document.getElementById("analysisTable");
if (!analysisTable) {
  console.error("Element mit der ID 'analysisTable' nicht gefunden!");
  return;
}

let allMp3Files = [];
let candidateFirstCols = []; // Alle gefundenen L1-ES-Kandidaten
let candidateCols = [];      // Für Werte "inf-001" bis "inf-023"
let allCandidates = [];      // (1) Vereinigt L1-ES und inf-001..023

// Mögliche Zeilen:
  const possibleRows = [
    "001 continúa", "002 reloj", "003 viuda", "004 tabúes", "005 estudiéis", "006 querría", "007 caída", "008 pacto", "009 miau", "010 chalet",
    "011 jinete", "012 rehusa", "013 numeró", "014 toros", "015 guau", "016 muy", "017 flor", "018 ríe", "019 hoy", "020 juzgar",
    "021 signo", "022 labio", "023 deuda", "024 queja", "025 ketchup", "026 o hay", "027 ladrón", "028 club", "029 vainilla", "030 la papa",
    "031 iceberg", "032 número", "033 vacuo", "034 ángel", "035 afgano", "036 plan", "037 la caza", "038 logro", "039 un yunque", "040 mismo",
    "041 coñac", "042 el vino", "043 admirar", "044 un sueño", "045 buey", "046 él vino", "047 tengo", "048 montón", "049 álbum", "050 esdrújulo",
    "051 bou", "052 yo lo sé", "053 un chico", "054 algo", "055 diurno", "056 ahí", "057 la tapa", "058 enfermo", "059 diablo", "060 caudal",
    "061 nadie", "062 ¡TÓMATELO!", "063 causa", "064 búho", "065 la tira", "066 llave", "067 perro", "068 caldo", "069 suntuoso", "070 guante",
    "071 cuidar", "072 óptimo", "073 ñandú", "074 baile", "075 drama", "076 vienes", "077 gracias", "078 oído", "079 la casa", "080 ración",
    "081 tan blanco", "082 ciempiés", "083 deshielo", "084 muchacho", "085 salud", "086 palas", "087 rosbif", "088 pastel", "089 con agua", "090 quería",
    "091 paz", "092 étnico", "093 champán", "094 honra", "095 un tío", "096 obtiene", "097 la quita", "098 baúl", "099 la pita", "100 pero",
    "101 la capa", "102 oye", "103 reír", "104 tenue", "105 lleno", "106 las casas", "107 Europa", "108 allí", "109 numero", "110 los otros",
    "111 cambiáis", "112 virrey", "113 diurético", "114 numero", "115 número", "116 numeró", "117 la caza", "118 la casa", "119 las casas", "120 ahí",
    "121 allí", "122 pero", "123 perro", "124 barón", "125 varón", "s01 El segundo planeta", "s02 –¡Ah!¡Ah!", "s03 ¡Un admirador vien", 
    "s04 –Gritó el vanidos", "s05 al divisar a lo le", "s06 Para los vanidosos", "s07 todos los demás ho", "s08 –¡Buenos días!", "s09 –dijo el principit",
    "s10 ¡Qué sombrero tan ", "s11 –Es para saludar a", "s12 –respondió el vani", "s13 Desgraciadamente,", "s14 nunca pasa nadie p", "s15 –¿Ah, sí?", 
    "s16 –preguntó sin comp", "s17 –¿Tú me admiras mu", "s18 verdad?", "s19 –preguntó el vanid", "s20 –¿Qué significa ad", "s21 –Admirar significa",
    "s22 que yo soy el homb", "s23 el mejor vestido,", "s24 el más rico", "s25 y el más inteligent", "s26 –¡Si tú estás solo", "s27 –¡Hazme ese favor,", 
    "s28 admírame de todas mane", "s29 –¡Bueno!", "s30 Te admiro", "s31 –dijo el principit", "s32 pero ¿para qué te", "s33 Y el principito se",
    "s34 “Decididamente,", "s35 las personas grand", "s36 se decía para sí e", "s37 El planeta siguient", "s38 Fue una visita muy", "s39 pues,", 
    "s40 hundió al principit", "s41 –¡Buenos días!", "s42 ¿Qué haces ahí?", "s43 –preguntó al bebede", "s44 que estaba sentado", "s45 ante un sinnúmero d",
    "s46 y otras tantas bote", "s47 –¡Bebo!", "s48 –respondió el bebed", "s49 –¿Por qué bebes?", "s50 –volvió a preguntar", "s51 –Para olvidar.", 
    "s52 –¿Para olvidar qué", "s53 –inquirió el princi", "s54 –Para olvidar que s", "s55 –confesó el bebedor", "s56 –¿Vergüenza de qué", 
    "s57 –se informó el prin", "s58 –¡Vergüenza de beb", "s59 –concluyó el bebede", "s60 que se encerró nuev", "s61 –¡Ah, vale!", "s62 ¡Adiós!", 
    "s63 –Y el principito,", "s64 perplejo,", "s65 se marchó.", "s66 “No hay la menor duda", "s67 de que las persona", "s68 seguía diciéndose p", "s69 el principito duran"
  ];
  let rowSelections = possibleRows.slice(0, 3);

  // Die Spaltenauswahl wird nach Laden der MP3s initialisiert.
let colSelections = [];

// MP3-Liste laden und Kandidaten ermitteln
fetch("/get_audio_items")
  .then((res) => res.json())
  .then((data) => {
    allMp3Files = data || [];

    // Bestimme candidateFirstCols (alle L1-ES):
    candidateFirstCols = [];
    allMp3Files.forEach(file => {
      const parts = file.split("_");
      if (parts.length > 0) {
        if (parts[0].startsWith("inf-L1-ES")) {
          let candidate = "";
          if (parts[0] === "inf-L1-ES" && parts.length >= 2) {
            candidate = parts[0] + "_" + parts[1];
          } else {
            candidate = parts[0];
          }
          if (candidate && !candidateFirstCols.includes(candidate)) {
            candidateFirstCols.push(candidate);
          }
        }
      }
    });
    // Falls keine Kandidaten gefunden wurden, Fallback
    if (candidateFirstCols.length === 0) {
      candidateFirstCols = ["inf-L1-ESa"];
    }
    candidateFirstCols.sort();

    // Bestimme candidateCols (inf-001 bis inf-023)
    candidateCols = Array.from({ length: 23 }, (_, i) => 
      `inf-${String(i + 1).padStart(3, "0")}`
    );

    // (1) allCandidates = L1-ES + inf-001..023
    // ggf. sortieren, z. B. alphabetisch:
    // allCandidates = [...candidateFirstCols, ...candidateCols].sort();
    // oder einfach anhängen:
    allCandidates = [...candidateFirstCols, ...candidateCols];

    // (2) Initiale Spaltenauswahl festlegen:
    function getRandomCandidate(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    const initialFirstCol = getRandomCandidate(candidateFirstCols);

    // Für weitere Spalten wählen wir zufällig aus candidateCols (also ohne L1-ES).
    let randomCandidates = [];
    while (randomCandidates.length < 2) {
      let candidate = getRandomCandidate(candidateCols);
      if (!randomCandidates.includes(candidate)) {
        randomCandidates.push(candidate);
      }
    }
    colSelections = [initialFirstCol, ...randomCandidates];

    // Jetzt Tabelle zeichnen
    renderCrossTable();
  })
  .catch((err) => console.error("Fehler beim Laden der /get_audio_items:", err));

function renderCrossTable() {
  analysisTable.innerHTML = "";

  // --- THEAD ---
  const thead = analysisTable.createTHead();
  const headerRow = thead.insertRow();
  const cornerCell = headerRow.insertCell();
  cornerCell.textContent = "";

  colSelections.forEach((colVal, colIdx) => {
    const th = headerRow.insertCell();
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";

    // (3) Dieses Select enthält nun ALLE Kandidaten:
    const select = document.createElement("select");
    allCandidates.forEach((optVal) => {
      const opt = document.createElement("option");
      opt.value = optVal;
      opt.textContent = optVal;
      if (optVal === colVal) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
    select.addEventListener("change", () => {
      colSelections[colIdx] = select.value;
      renderCrossTable();
    });
    container.appendChild(select);

    // Entfernen-Button
    const removeColButton = document.createElement("button");
    removeColButton.innerHTML = `<i class="bi bi-trash3"></i>`;
    removeColButton.className = "remove-btn";
    removeColButton.style.marginLeft = "6px";
    removeColButton.addEventListener("click", () => {
      colSelections.splice(colIdx, 1);
      renderCrossTable();
    });
    container.appendChild(removeColButton);

    th.appendChild(container);
  });

  // Spalte für "+ Informante"-Button
  const addColCell = headerRow.insertCell();
  const addColButton = document.createElement("button");
  addColButton.textContent = "+ Informante";
  addColButton.className = "link";
  addColButton.addEventListener("click", () => {
    if (colSelections.length === 0) {
      colSelections.push(candidateFirstCols[0]);
    } else {
      // Nur aus den "inf-001..023" ergänzen (so war deine bisherige Logik)
      let additional = colSelections.slice(1); 
      let maxIndex = -1;
      additional.forEach(col => {
        let idx = candidateCols.indexOf(col);
        if (idx > maxIndex) {
          maxIndex = idx;
        }
      });
      const nextCandidate = candidateCols[maxIndex + 1];
      if (nextCandidate) {
        colSelections.push(nextCandidate);
      }
    }
    renderCrossTable();
  });
  addColCell.appendChild(addColButton);

  // --- TBODY ---
  const tbody = analysisTable.createTBody();
  rowSelections.forEach((rowVal, rowIndex) => {
    const tr = tbody.insertRow();

    // Erste Spalte: Zeilen-Header mit Dropdown
    const rowCell = tr.insertCell();
    const rowContainer = document.createElement("div");
    rowContainer.style.display = "flex";
    rowContainer.style.alignItems = "center";

    const rowSelect = document.createElement("select");
    possibleRows.forEach((optVal) => {
      const opt = document.createElement("option");
      opt.value = optVal;
      opt.textContent = optVal;
      if (optVal === rowVal) {
        opt.selected = true;
      }
      rowSelect.appendChild(opt);
    });
    rowSelect.addEventListener("change", () => {
      rowSelections[rowIndex] = rowSelect.value;
      renderCrossTable();
    });
    rowContainer.appendChild(rowSelect);

    const removeRowButton = document.createElement("button");
    removeRowButton.innerHTML = `<i class="bi bi-trash3"></i>`;
    removeRowButton.className = "remove-btn";
    removeRowButton.style.marginLeft = "6px";
    removeRowButton.addEventListener("click", () => {
      rowSelections.splice(rowIndex, 1);
      renderCrossTable();
    });
    rowContainer.appendChild(removeRowButton);
    rowCell.appendChild(rowContainer);

    // Intersection-Zellen
    colSelections.forEach((colVal) => {
      const td = tr.insertCell();

      // Ermittele aus dem Zeilenwert den Identifier (z.B. "110" aus "110 continúa")
      const trimmedRow = rowVal.trim();
      const firstSpace = trimmedRow.indexOf(" ");
      let identifier = "";
      if (firstSpace === -1) {
        identifier = trimmedRow.toLowerCase();
      } else {
        identifier = trimmedRow.substring(0, firstSpace).toLowerCase();
      }

      // Prefix:
      const prefix = `${colVal}_${identifier}_`;
      // Suche in der MP3-Liste den Dateinamen, der mit diesem Prefix beginnt
      const foundFile = allMp3Files.find(f => f.trim().startsWith(prefix));
      if (foundFile) {
        const link = document.createElement("a");
        link.href = `/items/${foundFile}`;
        const lastUnderscore = foundFile.lastIndexOf("_");
        const dotIndex = foundFile.lastIndexOf(".mp3");
        const linkText = foundFile.substring(lastUnderscore + 1, dotIndex);
        link.textContent = linkText;
        link.className = "link-analysis";
        link.setAttribute("download", foundFile);
        link.addEventListener("click", (evt) => {
          evt.preventDefault();
          if (audioPlayer) {
            audioPlayer.src = `/items/${foundFile}`;
            audioPlayer.play().catch(err => console.warn(err));
          } else {
            alert("Kein <audio> mit id='tableAudioPlayer' vorhanden!");
          }
        });
        td.appendChild(link);
      } else {
        td.textContent = "-";
        console.warn(`MP3-Datei nicht gefunden (Prefix: ${prefix})`);
      }

      // Farbliche Markierung für L1-ES
      if (colVal.indexOf("L1-ES") !== -1) {
        td.classList.add("highlight-L1-ES");
      }
    });
  });

  // Letzte Zeile: "Add Row"-Button
  const addRowTr = tbody.insertRow();
  const addRowTd = addRowTr.insertCell();
  addRowTd.colSpan = colSelections.length + 1;
  const addRowButton = document.createElement("button");
  addRowButton.textContent = "+ Enunciado";
  addRowButton.className = "link";
  addRowButton.addEventListener("click", () => {
    let maxIndex = -1;
    rowSelections.forEach((r) => {
      const idx = possibleRows.indexOf(r);
      if (idx > maxIndex) {
        maxIndex = idx;
      }
    });
    const nextRow = possibleRows[maxIndex + 1];
    if (nextRow) {
      rowSelections.push(nextRow);
      renderCrossTable();
    }
  });
  addRowTd.appendChild(addRowButton);
}

});
