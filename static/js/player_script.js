document.addEventListener('DOMContentLoaded', function () {
  // ---------------------------------------------------
  // 0) Globale Hilfsfunktionen
  // ---------------------------------------------------
  function formatTime(timeInSeconds) {
    const hours   = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function pad(num) {
    return num < 10 ? '0' + num : num.toString();
  }

  function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // ---------------------------------------------------
  // 1) URL-Parameter (audio/transcription)
  // ---------------------------------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const transcriptionFile = urlParams.get('transcription');
  const audioFile         = urlParams.get('audio');

  console.log('Transcription File:', transcriptionFile);
  console.log('Audio File:', audioFile);

  // ---------------------------------------------------
  // 2) Zentrale DOM-Elemente
  // ---------------------------------------------------
  const audioPlayer      = document.getElementById('audioPlayer');
  const transcriptionEl  = document.getElementById('transcriptionContainer');
  const documentNameEl   = document.getElementById('documentName');

  // Player Controls
  const playPauseBtn     = document.getElementById('playPauseBtn');
  const rewindBtn        = document.getElementById('rewindBtn');
  const forwardBtn       = document.getElementById('forwardBtn');
  const progressBar      = document.getElementById('progressBar');
  const volumeControl    = document.getElementById('volumeControl');
  const muteBtn          = document.getElementById('muteBtn');
  const speedControl     = document.getElementById('speedControlSlider');
  const speedDisplay     = document.getElementById('speedDisplay');
  const timeDisplay      = document.getElementById('timeDisplay');

  // Buchstabenmarkierung
  const markInput        = document.getElementById('markInput');
  const resetAllButton   = document.getElementById('resetMarkingsButton');
  const buttonsContainer = document.getElementById('buttonsContainer');

  // Scroll-to-top
  const scrollToTopBtn   = document.getElementById('scrollToTopBtn');

  // ---------------------------------------------------
  // 3) Download-Links für MP3, JSON, TXT
  // ---------------------------------------------------
  function createDownloadLink(elementId, fileUrl, fileType) {
    const element = document.getElementById(elementId);
    if (element && fileUrl) {
      element.href = fileUrl;
      element.download = `export.${fileType}`;
    }
  }

  createDownloadLink('downloadMp3', audioFile, 'mp3');
  createDownloadLink('downloadJson', transcriptionFile, 'json');

  function downloadTxtFile() {
    const metaInfo = document.getElementById('sidebarContainer-meta')
      ? document.getElementById('sidebarContainer-meta').innerText
      : '';
    const transcriptionText = transcriptionEl ? transcriptionEl.innerText : '';
    const fullText = metaInfo + "\n\n" + transcriptionText;
    let filename = 'export';
    if (audioPlayer && audioPlayer.src) {
      const audioUrl = audioPlayer.src;
      filename = audioUrl.split('/').pop().split('.').slice(0, -1).join('.');
    }
    const textBlob     = new Blob([fullText], { type: 'text/plain' });
    const downloadLink = document.createElement("a");
    downloadLink.download = `${filename}.txt`;
    downloadLink.href     = window.URL.createObjectURL(textBlob);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  const downloadTxtBtn = document.getElementById('downloadTxt');
  if (downloadTxtBtn) {
    downloadTxtBtn.addEventListener('click', downloadTxtFile);
  }

  // ---------------------------------------------------
  // 4) Audio-Player-Initialisierung
  // ---------------------------------------------------
  if (audioFile && audioPlayer) {
    audioPlayer.src = audioFile;
  }

  function updatePlayPauseButton() {
    if (audioPlayer.paused || audioPlayer.ended) {
      playPauseBtn.classList.remove('bi-pause-circle-fill');
      playPauseBtn.classList.add('bi-play-circle-fill');
    } else {
      playPauseBtn.classList.remove('bi-play-circle-fill');
      playPauseBtn.classList.add('bi-pause-circle-fill');
    }
  }

  function updateTimeDisplay() {
    if (!audioPlayer.duration) return;
    const current = audioPlayer.currentTime;
    const total   = audioPlayer.duration;
    const cMin    = Math.floor(current / 60);
    const cSec    = Math.floor(current % 60);
    const dMin    = Math.floor(total / 60);
    const dSec    = Math.floor(total % 60);
    timeDisplay.textContent = `${pad(cMin)}:${pad(cSec)} / ${pad(dMin)}:${pad(dSec)}`;
  }

  playPauseBtn.addEventListener('click', function () {
    if (audioPlayer.paused) {
      audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
    updatePlayPauseButton();
  });

  rewindBtn.addEventListener('click', function () {
    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 3);
    animateButton(rewindBtn);
  });
  forwardBtn.addEventListener('click', function () {
    if (audioPlayer.duration) {
      audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 3);
    }
    animateButton(forwardBtn);
  });

  function animateButton(btn) {
    btn.classList.add('fa-fade');
    setTimeout(() => {
      btn.classList.remove('fa-fade');
    }, 1000);
  }

  document.addEventListener('keydown', (event) => {
    if (!audioPlayer) return;
    if (event.ctrlKey && event.key === ',') {
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 3);
    }
    if (event.ctrlKey && event.key === '.') {
      if (audioPlayer.duration) {
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 3);
      }
    }
    if (event.ctrlKey && event.code === 'Space') {
      event.preventDefault();
      if (audioPlayer.paused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
      updatePlayPauseButton();
    }
  });

  volumeControl.addEventListener('input', function() {
    audioPlayer.volume = parseFloat(this.value);
    updateVolumeIcon(audioPlayer.muted ? 0 : this.value);
  });

  muteBtn.addEventListener('click', function() {
    audioPlayer.muted = !audioPlayer.muted;
    updateVolumeIcon(volumeControl.value);
  });

  function updateVolumeIcon(volume) {
    if (!audioPlayer.muted && volume > 0) {
      muteBtn.classList.remove('fa-volume-xmark');
      muteBtn.classList.add('fa-volume-high');
    } else {
      muteBtn.classList.remove('fa-volume-high');
      muteBtn.classList.add('fa-volume-xmark');
    }
  }

  speedControl.addEventListener('input', function() {
    const spd = parseFloat(this.value);
    audioPlayer.playbackRate = spd;
    speedDisplay.textContent = `${spd.toFixed(1)}x`;
  });

  audioPlayer.addEventListener('timeupdate', function() {
    if (audioPlayer.duration) {
      progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    }
    updateTimeDisplay();

    // Automatische Wort-Hervorhebung
    const currentTime = audioPlayer.currentTime;
    const words = document.querySelectorAll('.word');
    words.forEach(word => {
      const start = parseFloat(word.dataset.start);
      const end   = parseFloat(word.dataset.end);
      if (currentTime >= start && currentTime <= end) {
        word.classList.add('playing');
        if (!isElementInViewport(word)) {
          word.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        word.classList.remove('playing');
      }
    });
  });

  progressBar.addEventListener('input', function() {
    if (audioPlayer.duration) {
      audioPlayer.currentTime = (this.value / 100) * audioPlayer.duration;
    }
  });

  audioPlayer.addEventListener('play', updatePlayPauseButton);
  audioPlayer.addEventListener('pause', updatePlayPauseButton);
  audioPlayer.addEventListener('loadedmetadata', updateTimeDisplay);

  // ---------------------------------------------------
  // 5) Transcription + Metadaten (marele-Struktur)
  // ---------------------------------------------------
function loadTranscription(fileUrl) {
  if (!fileUrl) return;
  fetch(fileUrl)
    .then(r => r.json())
    .then(data => {
      if (data.filename) {
        documentNameEl.innerHTML = "Informante <span>" + 
          data.filename + 
          (data.metadata && data.metadata.L2_3Spanish ? " (" + data.metadata.L2_3Spanish + ")" : "") +
          "</span>";
      } else if (data.metadata && data.metadata.Code) {
        documentNameEl.innerHTML = "Informante <span>" + data.metadata.Code + "</span>";
      } else {  
        documentNameEl.textContent = "Sin archivo";
      }

        // B) Metadaten füllen
        setMetadata(data);

        // C) Transkription aufbauen
        transcriptionEl.innerHTML = '';
        if (!data.segments || !Array.isArray(data.segments)) {
          console.warn("Keine segments gefunden.");
          return;
        }

        data.segments.forEach((segment, idx) => {
          const segmentDiv = document.createElement('div');
          if (idx === 0) segmentDiv.classList.add('transcription-list');
          else if (idx === 1) segmentDiv.classList.add('transcription-text');
          else segmentDiv.classList.add('transcription');

          const wordsArr = segment.words || [];

          // Zuerst: Sprechername (speaker-label)
          let speakerName = "Desconocido";
          if (data.speakers && Array.isArray(data.speakers)) {
            const foundSpk = data.speakers.find(sp => sp.spkid === segment.speaker);
            if (foundSpk && foundSpk.name) {
              speakerName = foundSpk.name;
            }
          }
          const speakerLabel = document.createElement('div');
          speakerLabel.classList.add('speaker-label');
          speakerLabel.textContent = speakerName;
          // Klick auf Sprecher => Segment abspielen
          speakerLabel.addEventListener('click', () => {
            if (wordsArr.length > 0) {
              playAudioSegment(wordsArr[0].start, wordsArr[wordsArr.length - 1].end, true);
            }
          });
          segmentDiv.appendChild(speakerLabel);

          // Dann: Zeitangabe unter dem Sprecher-Label
          if (wordsArr.length > 0) {
            const st = wordsArr[0].start;
            const en = wordsArr[wordsArr.length - 1].end;
            const speakerTimeEl = document.createElement('div');
            speakerTimeEl.classList.add('speaker-time');
            speakerTimeEl.textContent = `${formatTime(st)} - ${formatTime(en)}`;
            segmentDiv.appendChild(speakerTimeEl);
          }

          // Anschließend: Wort-für-Wort-Darstellung
          wordsArr.forEach((wordObj, wIndex) => {
            const wordContainer = document.createElement('div');
            wordContainer.classList.add('word-container');

            const numberSpan = document.createElement('span');
            numberSpan.classList.add('word-number');
            const wordNum = wordObj.number || (wIndex + 1);
            const paddedNum = String(wordNum).padStart(3, '0');
            numberSpan.textContent = paddedNum + ' ';
            wordContainer.appendChild(numberSpan);

            const wordSpan = document.createElement('span');
            wordSpan.classList.add('word');
            wordSpan.textContent = wordObj.text + ' ';
            wordSpan.dataset.start = wordObj.start;
            wordSpan.dataset.end   = wordObj.end;
            wordSpan.addEventListener('click', function(evt) {
              evt.stopPropagation();
              if (evt.ctrlKey) {
                playAudioSegment(wordObj.start, wordObj.end, false);
              } else {
                playAudioSegment(wordObj.start, wordObj.end, true);
              }
            });
            wordContainer.appendChild(wordSpan);

            segmentDiv.appendChild(wordContainer);
          });

          transcriptionEl.appendChild(segmentDiv);
        });
      })
      .catch(err => console.error('Fehler beim Laden der Transkription:', err));
  }

  function playAudioSegment(startTime, endTime, shouldPause) {
    if (!audioPlayer) return;
    audioPlayer.currentTime = startTime;
    audioPlayer.play();
    const onTimeUpdate = () => {
      if (audioPlayer.currentTime >= endTime) {
        if (shouldPause) {
          audioPlayer.pause();
        }
        audioPlayer.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
    audioPlayer.addEventListener('timeupdate', onTimeUpdate);
  }

  function setMetadata(data) {
    const codeEl               = document.getElementById('code');
    const genderEl             = document.getElementById('gender');
    const l1El                 = document.getElementById('l1');
    const experienceAbroadEl   = document.getElementById('experienceAbroad');
    const commentsEl           = document.getElementById('comments');
    const spanishLevelEl       = document.getElementById('spanishLevel');
    const recordingDateEl      = document.getElementById('recordingDate');
    const filenameEl           = document.getElementById('filename');
  
    // Neue Felder:
    const birthYearEl          = document.getElementById('birthYear');
    const residencesPreviousEl = document.getElementById('residencesPrevious');
    const l2l3El               = document.getElementById('l2l3');
    const motherL1El           = document.getElementById('motherL1');
    const fatherL1El           = document.getElementById('fatherL1');
  
    if (data.metadata) {
      if (codeEl) {
        codeEl.innerHTML = `Informante: <span class="metadata-value">${data.metadata.Code || '-'}</span>`;
      }
      if (genderEl) {
        genderEl.innerHTML = `Género: <span class="metadata-value">${data.metadata.Gender || '-'}</span>`;
      }
      if (l1El) {
        l1El.innerHTML = `Lengua L1: <span class="metadata-value">${data.metadata.L1 || '-'}</span>`;
      }
      if (experienceAbroadEl) {
        experienceAbroadEl.innerHTML = `Estancias: <span class="metadata-value">${data.metadata.ExperienceAbroad || '-'}</span>`;
      }
      if (commentsEl) {
        commentsEl.innerHTML = `Comentarios: <span class="metadata-value">${data.metadata.Comments || '-'}</span>`;
      }
      if (spanishLevelEl) {
        spanishLevelEl.innerHTML = `Nivel de Español: <span class="metadata-value-L2_3Spanisch">${data.metadata.L2_3Spanish || '-'}</span>`;
      }
      if (recordingDateEl) {
        recordingDateEl.innerHTML = `Fecha de Grabación: <span class="metadata-value">${data.metadata.RecordingDate || '-'}</span>`;
      }
      
      // Neue Metadaten einfügen
      if (birthYearEl) {
        birthYearEl.innerHTML = `Nacido/a: <span class="metadata-value">${data.metadata.BirthYear || '-'}</span>`;
      }
      if (residencesPreviousEl) {
        residencesPreviousEl.innerHTML = `Proveniencia: <span class="metadata-value">${data.metadata.ResidencesPrevious || '-'}</span>`;
      }
      if (l2l3El) {
        let additionalLevels = [];
        if (data.metadata.L2) additionalLevels.push(data.metadata.L2);
        if (data.metadata.L3) additionalLevels.push(data.metadata.L3);
        if (data.metadata.L4) additionalLevels.push(data.metadata.L4);
        l2l3El.innerHTML = `L2/L3 adicionales: <span class="metadata-value">${additionalLevels.length ? additionalLevels.join(", ") : '-'}</span>`;
      }
      if (motherL1El) {
        motherL1El.innerHTML = `L1/madre: <span class="metadata-value">${data.metadata.MotherL1 || '-'}</span>`;
      }
      if (fatherL1El) {
        fatherL1El.innerHTML = `L1/padre: <span class="metadata-value">${data.metadata.FatherL1 || '-'}</span>`;
      }
    }
  
    if (filenameEl) {
      if (data.filename) {
        filenameEl.innerHTML = `Archivo (JSON): <span class="metadata-value">${data.filename}</span>`;
      } else {
        filenameEl.textContent = 'Archivo: N/A';
      }
    }
  }
  
  

  // ---------------------------------------------------
  // 6) Markieren von Buchstaben
  // ---------------------------------------------------
  let matchCounts = {};

  markInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
      markLetters();
    }
  });

  window.markLetters = function() {
    let searchInput = markInput.value.trim().toLowerCase();
    if (!searchInput) return;

    let markType = 'exact';
    let searchQuery = searchInput;
    let separatorRegex = /[ ,.?;]/;

    if (searchInput.endsWith('_')) {
      markType = 'separator';
      searchQuery = searchInput.slice(0, -1);
      separatorRegex = /\s/;
    } else if (searchInput.endsWith('#')) {
      markType = 'punctuation';
      searchQuery = searchInput.slice(0, -1);
      separatorRegex = /[.,;!?]/;
    }

    const words = document.querySelectorAll('.word');
    matchCounts[searchInput] = 0;

    words.forEach(word => {
      const wordText = word.textContent.toLowerCase();
      if (wordText.includes(searchQuery)) {
        for (let i = 0; i < wordText.length; i++) {
          const isExactMatch = wordText.substring(i, i + searchQuery.length) === searchQuery;
          if (isExactMatch) {
            const nextChar = wordText[i + searchQuery.length] || ' ';
            const isValid = (markType === 'separator' || markType === 'punctuation')
              ? separatorRegex.test(nextChar)
              : true;
            if (isValid) {
              markWordLetters(word, searchInput, markType);
              matchCounts[searchInput]++;
              break;
            }
          }
        }
      }
    });

    if (!document.getElementById(`button-${searchInput}`)) {
      createResetButton(searchInput);
    }
    markInput.value = '';
    checkResetButtonVisibility();
  };

  function markWordLetters(word, searchLetters, markType) {
    let innerHTML = word.innerHTML;
    let searchQuery = (searchLetters.endsWith('_') || searchLetters.endsWith('#'))
      ? searchLetters.slice(0, -1)
      : searchLetters;
    const separatorRegex = searchLetters.endsWith('_') ? /\s/ : /[.,;!?]/;
    const isSpecial = searchLetters.endsWith('_') || searchLetters.endsWith('#');

    let i = 0;
    while (i < innerHTML.length) {
      const regex = new RegExp(`${searchQuery}(?![^<]*>|[^<>]*</)`, 'ig');
      const match = regex.exec(innerHTML.slice(i));
      if (match) {
        const matchStart = i + match.index;
        const matchEnd = matchStart + match[0].length;
        const nextChar = innerHTML[matchEnd] || ' ';
        const isValid = isSpecial ? separatorRegex.test(nextChar) : true;
        if (isValid) {
          const highlightSpan = `<span class="highlight">${match[0]}</span>`;
          innerHTML = innerHTML.slice(0, matchStart) + highlightSpan + innerHTML.slice(matchEnd);
          i = matchStart + highlightSpan.length;
        } else {
          i = matchEnd;
        }
      } else {
        break;
      }
    }
    word.innerHTML = innerHTML;
  }

  function createResetButton(searchLetters) {
    const resetBtn = document.createElement('button');
    resetBtn.id = `button-${searchLetters}`;
    resetBtn.classList.add('letra');
    resetBtn.innerHTML = `${searchLetters} <span class="result-count">(${matchCounts[searchLetters] || 0})</span>`;
    resetBtn.addEventListener('click', () => {
      resetMarkingByLetters(searchLetters);
      resetBtn.remove();
      checkResetButtonVisibility();
    });
    buttonsContainer.appendChild(resetBtn);
    checkResetButtonVisibility();
  }

  window.resetMarkings = function() {
    const words = document.querySelectorAll('.word');
    words.forEach(word => {
      word.innerHTML = word.textContent;
    });
    resetAllButtons();
    checkResetButtonVisibility();
  };

  function resetAllButtons() {
    while (buttonsContainer.firstChild) {
      buttonsContainer.removeChild(buttonsContainer.firstChild);
    }
    matchCounts = {};
  }

  function resetMarkingByLetters(searchLetters) {
    const words = document.querySelectorAll('.word');
    words.forEach(word => {
      resetWordMarkingsByLetters(word, searchLetters);
    });
    checkResetButtonVisibility();
  }

  function resetWordMarkingsByLetters(word, searchLetters) {
    let searchQuery = searchLetters.toLowerCase();
    let markType = 'exact';

    if (searchQuery.endsWith('_')) {
      searchQuery = searchQuery.slice(0, -1);
      markType = 'separator';
    } else if (searchQuery.endsWith('#')) {
      searchQuery = searchQuery.slice(0, -1);
      markType = 'punctuation';
    }

    let wordHTML = word.innerHTML;
    let newContent = '';
    let currentIndex = 0;

    while (currentIndex < wordHTML.length) {
      const spanStart = wordHTML.indexOf('<span class="highlight">', currentIndex);
      if (spanStart === -1) {
        newContent += wordHTML.substring(currentIndex);
        break;
      } else {
        newContent += wordHTML.substring(currentIndex, spanStart);
      }
      const spanEnd = wordHTML.indexOf('</span>', spanStart);
      const highlightedTextStart = spanStart + '<span class="highlight">'.length;
      const highlightedText = wordHTML.substring(highlightedTextStart, spanEnd);
      let shouldRemove = (highlightedText.toLowerCase() === searchQuery);
      if (markType !== 'exact') {
        const nextChar = wordHTML.substring(spanEnd + '</span>'.length, spanEnd + '</span>'.length + 1);
        const valid =
          (markType === 'separator' && /\s/.test(nextChar)) ||
          (markType === 'punctuation' && /[.,;!?]/.test(nextChar));
        shouldRemove = shouldRemove && valid;
      }
      if (shouldRemove) {
        newContent += highlightedText;
      } else {
        newContent += `<span class="highlight">${highlightedText}</span>`;
      }
      currentIndex = spanEnd + '</span>'.length;
    }
    word.innerHTML = newContent;
  }

  function checkResetButtonVisibility() {
    const individualBtns = buttonsContainer.querySelectorAll('.letra');
    if (individualBtns.length === 0) {
      resetAllButton.style.display = 'none';
    } else {
      resetAllButton.style.display = 'block';
    }
  }

  // ---------------------------------------------------
  // 7) Scroll-to-top-Button
  // ---------------------------------------------------
  if (scrollToTopBtn) {
    window.addEventListener('scroll', function() {
      if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollToTopBtn.style.display = "block";
      } else {
        scrollToTopBtn.style.display = "none";
      }
    });
    scrollToTopBtn.addEventListener('click', function() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    });
  }

  // ---------------------------------------------------
  // 8) Starte das Laden der Transkription
  // ---------------------------------------------------
  if (transcriptionFile) {
    loadTranscription(transcriptionFile);
  }
});
