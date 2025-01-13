document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const transcriptionFile = urlParams.get('transcription');
  const audioFile = urlParams.get('audio');


  console.log('Transcription File:', transcriptionFile);
  console.log('Audio File:', audioFile);

  const transcriptionContainer = document.getElementById('transcriptionContainer');
  const metadataList = document.getElementById('metadataList');

  if (!transcriptionContainer || !metadataList) {
    console.error('HTML-Container transcriptionContainer oder metadataList nicht gefunden.');
    return;
  }
  const markInput = document.getElementById('markInput');
  markInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      markLetters();
    }
  });

  let isPlaying = false;

  // Erstellung des neuen Audio-Players
  const visualAudioPlayer = document.createElement('audio');
  visualAudioPlayer.id = 'visualAudioPlayer';
  document.querySelector('.custom-audio-player').prepend(visualAudioPlayer);
  visualAudioPlayer.src = audioFile; // Stellen Sie sicher, dass 'audioFile' korrekt definiert ist

  // Funktion zum Laden und Anzeigen der Metadaten
  function loadMetadata(transcriptionFile, metadataList) {
    fetch(transcriptionFile)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Fehler beim Laden der Metadaten: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        const metadata = data.metadata || {};

        // Vorherige Inhalte löschen
        metadataList.innerHTML = '';

        // Metadaten einfügen (formatierte Anzeige mit <p>-Tags)
        const codeElement = document.createElement('p');
        codeElement.innerHTML = `Informante: <span style="color: #cb4316;">${metadata.Code || 'N/A'}</span>`;
        metadataList.appendChild(codeElement);

        const spanishLevelElement = document.createElement('p');
        spanishLevelElement.innerHTML = `Nivel de Español: <span style="color: #cb4316;">${metadata.L2_3Spanish || 'N/A'}</span>`;
        metadataList.appendChild(spanishLevelElement);

        const recordingDateElement = document.createElement('p');
        recordingDateElement.innerHTML = `Fecha de Grabación:<br> <span style="color: #cb4316;">${metadata.RecordingDate || 'N/A'}</span>`;
        metadataList.appendChild(recordingDateElement);

        console.log('Metadaten erfolgreich geladen.');
      })
      .catch(error => console.error('Fehler beim Laden der Metadaten:', error));
  }

  // Event-Listener für das Laden der Metadaten
  visualAudioPlayer.addEventListener('loadedmetadata', function() {
    // Aktualisieren Sie hier die Gesamtdauer des Audios
    const durationMinutes = Math.floor(visualAudioPlayer.duration / 60) || 0;
    const durationSeconds = Math.floor(visualAudioPlayer.duration % 60) || 0;

    // Sicherstellen, dass das 'durationDisplay'-Element existiert
    const durationDisplay = document.getElementById('durationDisplay');
    if (durationDisplay) {
      durationDisplay.textContent = `${pad(durationMinutes)}:${pad(durationSeconds)}`;
    }

    // Sicherstellen, dass das 'progressBar'-Element existiert
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.value = 0;
    }

    // Sicherstellen, dass das 'timeDisplay'-Element existiert
    const timeDisplay = document.getElementById('timeDisplay');
    if (timeDisplay) {
      timeDisplay.textContent = `00:00 / ${pad(durationMinutes)}:${pad(durationSeconds)}`;
    }
  });

// Funktion zum Erstellen eines Download-Links
function createDownloadLink(elementId, fileUrl, fileType) {
  const element = document.getElementById(elementId);
  if (element && fileUrl) {
    element.href = fileUrl;
    element.download = `export.${fileType}`;
  }
}

// Links für MP3 und JSON setzen
createDownloadLink('downloadMp3', audioFile, 'mp3');
createDownloadLink('downloadJson', transcriptionFile, 'json');

// TXT ERSTELLEN
// TXT ERSTELLEN
// TXT ERSTELLEN

function downloadTxtFile() {
  const metaInfo = document.getElementById('sidebarContainer-meta').innerText;
  const transcriptionContent = document.getElementById('transcriptionContainer').innerText;
  const fullText = metaInfo + "\n\n" + transcriptionContent;

  // URL des Audiofiles holen und den Dateinamen extrahieren
  const audioUrl = document.getElementById('visualAudioPlayer').src;
  let filename = 'export';

  if (audioUrl) {
    // Audio-Dateiname ohne Erweiterung
    filename = audioUrl.split('/').pop().split('.').slice(0, -1).join('.');
  }

  const textBlob = new Blob([fullText], { type: 'text/plain' });

  const downloadLink = document.createElement("a");
  downloadLink.download = `${filename}.txt`; // Verwenden des extrahierten Dateinamens
  downloadLink.href = window.URL.createObjectURL(textBlob);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);

  downloadLink.click();
  document.body.removeChild(downloadLink);
}

document.getElementById('downloadTxt').addEventListener('click', downloadTxtFile);






// AUDIO-PLAYER
// AUDIO-PLAYER
// AUDIO-PLAYER

// Kontrollelemente
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const progressBar = document.getElementById('progressBar');
const volumeControl = document.getElementById('volumeControl');
const speedControlSlider = document.getElementById('speedControlSlider');
const muteBtn = document.getElementById('muteBtn'); // Mute-Button
const timeDisplay = document.getElementById('timeDisplay'); // Zeit-Anzeige
const speedDisplay = document.getElementById('speedDisplay'); // Geschwindigkeitsanzeige

// Funktion zur Aktualisierung des Play/Pause-Buttons
function updatePlayPauseButton() {
  const playPauseBtn = document.getElementById('playPauseBtn'); // Aktualisieren Sie die ID auf 'playPauseBtn'
  if (visualAudioPlayer.paused || visualAudioPlayer.ended) {
    // Wenn der Player pausiert ist oder beendet wurde, ändern Sie das Icon in "Play"
    playPauseBtn.classList.remove('bi-pause-circle-fill');
    playPauseBtn.classList.add('bi-play-circle-fill');
  } else {
    // Wenn der Player gerade spielt, ändern Sie das Icon in "Pause"
    playPauseBtn.classList.remove('bi-play-circle-fill');
    playPauseBtn.classList.add('bi-pause-circle-fill');
  }
}

// Play/Pause-Funktionalität
playPauseBtn.addEventListener('click', function() {
  if (visualAudioPlayer.paused) {
    visualAudioPlayer.play();
    updatePlayPauseButton();
  } else {
    visualAudioPlayer.pause();
    updatePlayPauseButton();
  }
});



// Funktion zur Überprüfung, ob Strg + Leertaste gedrückt wurde
function isCtrlSpacePressed(event) {
  return event.ctrlKey && event.keyCode === 32; // 32 ist der Keycode für die Leertaste
}



// Vorwärts-/Rückwärts-Funktionalität
rewindBtn.addEventListener('click', function() {
  visualAudioPlayer.currentTime -= 3;
});

forwardBtn.addEventListener('click', function() {
  visualAudioPlayer.currentTime += 3;
});

// Event-Listener für das Drücken von Strg + Komma
document.addEventListener('keydown', function(event) {
if (event.ctrlKey && event.key === ',') {
  // Strg + Komma wurde gedrückt, führen Sie die Aktion für Rückwärts aus
  visualAudioPlayer.currentTime -= 3;
}
});

// Event-Listener für das Drücken von Strg + Punkt
document.addEventListener('keydown', function(event) {
if (event.ctrlKey && event.key === '.') {
  // Strg + Punkt wurde gedrückt, führen Sie die Aktion für Vorwärts aus
  visualAudioPlayer.currentTime += 3;
}
});


rewindBtn.addEventListener('click', function() {
  // Wechseln zu dem temporären Icon
  rewindBtn.classList.remove('fa-rotate-left');
  rewindBtn.classList.add('fa-rotate-left', 'fa-fade');

  // Zurückwechseln zum ursprünglichen Icon nach einer kurzen Verzögerung
  setTimeout(() => {
      rewindBtn.classList.remove('fa-rotate-left', 'fa-fade');
      rewindBtn.classList.add('fa-rotate-left');
  }, 1000); // 500 Millisekunden Verzögerung
});

forwardBtn.addEventListener('click', function() {
  // Wechseln zu dem temporären Icon
  forwardBtn.classList.remove('fa-rotate-right');
  forwardBtn.classList.add('fa-rotate-right', 'fa-fade');

  // Zurückwechseln zum ursprünglichen Icon nach einer kurzen Verzögerung
  setTimeout(() => {
    forwardBtn.classList.remove('fa-rotate-right', 'fa-fade');
    forwardBtn.classList.add('fa-rotate-right');
  }, 1000); // 500 Millisekunden Verzögerung
});


// Lautstärkeregelung und Stummschaltung
volumeControl.addEventListener('input', function() {
    visualAudioPlayer.volume = this.value;
    updateVolumeIcon(this.value);
});

muteBtn.addEventListener('click', function() {
    visualAudioPlayer.muted = !visualAudioPlayer.muted;
    updateVolumeIcon(volumeControl.value);
});

function updateVolumeIcon(volume) {
    if (volume > 0) {
        muteBtn.classList.remove('fa-volume-xmark');
        muteBtn.classList.add('fa-volume-high');
    } else {
        muteBtn.classList.remove('fa-volume-high');
        muteBtn.classList.add('fa-volume-xmark');
    }
}

// Wiedergabegeschwindigkeitsregelung
speedControlSlider.addEventListener('input', function() {
    const speed = parseFloat(this.value);
    visualAudioPlayer.playbackRate = speed;
    speedDisplay.textContent = `${speed.toFixed(1)}x`;
});

// Fortschrittsanzeige und Zeitaktualisierung
visualAudioPlayer.addEventListener('timeupdate', function() {
    progressBar.value = (visualAudioPlayer.currentTime / visualAudioPlayer.duration) * 100;
    updateTimeDisplay();
});

progressBar.addEventListener('input', function() {
    visualAudioPlayer.currentTime = (this.value / 100) * visualAudioPlayer.duration;
});

// Funktion zur Aktualisierung der Zeit-Anzeige
function updateTimeDisplay() {
    const currentMinutes = Math.floor(visualAudioPlayer.currentTime / 60);
    const currentSeconds = Math.floor(visualAudioPlayer.currentTime % 60);
    const durationMinutes = Math.floor(visualAudioPlayer.duration / 60) || 0;
    const durationSeconds = Math.floor(visualAudioPlayer.duration % 60) || 0;

    timeDisplay.textContent = `${pad(currentMinutes)}:${pad(currentSeconds)} / ${pad(durationMinutes)}:${pad(durationSeconds)}`;
}

// Hilfsfunktion zum Hinzufügen führender Nullen
function pad(number) {
    return number < 10 ? '0' + number : number;
}



  

  loadTranscription(transcriptionFile, transcriptionContainer);
  loadMetadata(transcriptionFile, metadataList);

  function loadTranscription(transcriptionFile, transcriptionContainer) {
    fetch(transcriptionFile)
        .then(response => response.json())
        .then(transcriptionData => {
            
            const segments = transcriptionData.segments;

            segments.forEach((segment, index) => {
                const speakerId = segment.speaker;
                const words = segment.words;

                const transcriptionElement = document.createElement('div');
                if (index === 0) {
                    transcriptionElement.classList.add('transcription-list');
                } else if (index === 1) {
                    transcriptionElement.classList.add('transcription-text');
                } else {
                    transcriptionElement.classList.add('transcription');
                }

                const speakerInfo = transcriptionData.speakers.find(speaker => speaker.spkid === speakerId);
                const speakerName = speakerInfo ? speakerInfo.name : "Unbekannter Sprecher";

                const speakerStartTime = formatTime(words[0].start);
                const speakerEndTime = formatTime(words[words.length - 1].end);

                const speakerTimeElement = document.createElement('div');
                speakerTimeElement.textContent = `${speakerStartTime} - ${speakerEndTime}`;
                speakerTimeElement.classList.add('speaker-time');
                transcriptionElement.appendChild(speakerTimeElement);

                const speakerElement = document.createElement('span');
                speakerElement.textContent = speakerName;
                speakerElement.classList.add('speaker');
                transcriptionElement.appendChild(speakerElement);

                speakerElement.addEventListener('click', function() {
                  const firstWordStartTime = words[0].start;
                  const lastWordEndTime = words[words.length - 1].end;
                  playVisualAudio(firstWordStartTime, lastWordEndTime, true);
                  console.log(`Speaker: ${speakerName} Start: ${firstWordStartTime} End: ${lastWordEndTime}`);
                });

                speakerElement.addEventListener('click', function () {
                  if (audioPlayer) {
                    if (audioPlayer.paused || audioPlayer.ended) {
                      audioPlayer.play();
                    } else {
                      audioPlayer.pause();
                    }
                    updatePlayPauseButton();
                  }
                });

                function playVisualAudio(startTime, endTime, shouldPause) {
                  if (visualAudioPlayer) {
                    visualAudioPlayer.currentTime = startTime;
                    visualAudioPlayer.play();

                    // Aktualisieren des Play/Pause-Buttons
                    updatePlayPauseButton();
                
                    const onTimeUpdate = function () {
                      if (visualAudioPlayer.currentTime >= endTime) {
                          if (shouldPause) {
                              visualAudioPlayer.pause();
                              visualAudioPlayer.removeEventListener('timeupdate', onTimeUpdate);
          
                              // Aktualisieren des Play/Pause-Buttons nach dem Pausieren
                              updatePlayPauseButton();
                          }
                      }
                  };
          
                  visualAudioPlayer.addEventListener('timeupdate', onTimeUpdate);
              }
          }

                words.forEach((word, index) => {
                    const wordContainer = document.createElement('div');
                    wordContainer.classList.add('word-container');
                    wordContainer.style.display = 'flex';
                    wordContainer.style.alignItems = 'center';
                    wordContainer.style.marginBottom = '5px';

                    const numberElement = document.createElement('span');
                    numberElement.textContent = word.number + ' ';
                    numberElement.classList.add('word-number');
                    numberElement.style.color = '#cb4316';
                    numberElement.style.marginRight = '10px';
                    wordContainer.appendChild(numberElement);

                    const wordElement = document.createElement('span');
                    wordElement.textContent = word.text + ' ';
                    wordElement.classList.add('word');
                    wordElement.dataset.start = word.start;
                    wordElement.dataset.end = word.end;
                    wordContainer.appendChild(wordElement);

                    wordElement.addEventListener('click', function (event) {
                        if (event.ctrlKey) {
                            const clickedWord = event.target;
                            const startPrev = index > 0 ? parseFloat(words[index - 0].start) : parseFloat(word.start);
                            const endNext = parseFloat(clickedWord.dataset.end);

                            playVisualAudio(startPrev, endNext, false);

                            // Aktualisieren des Play/Pause-Buttons
                            updatePlayPauseButton();

                            console.log('Start-Play:', clickedWord.textContent, 'Start:', startPrev, 'End:', endNext);
                        } else {
                            const startPrev = index > 0 ? Math.max(0, parseFloat(words[index - 0].start) - 0.15) : 0;
                            const endNext = index < words.length - 1 ? Math.min(parseFloat(words[index + 0].end) + 0.05, parseFloat(words[words.length - 1].end)) : parseFloat(words[words.length - 1].end);

                            playVisualAudio(startPrev, endNext, true);

                            if (!event.ctrlKey) {
                                event.currentTarget.dataset.start = startPrev;
                                event.currentTarget.dataset.end = endNext;
                            }

                            // Aktualisieren des Play/Pause-Buttons, um sicherzustellen, dass die Anzeige synchron bleibt
                            updatePlayPauseButton();

                            console.log('Word:', event.currentTarget.textContent, 'Start:', startPrev, 'End:', endNext);
                        }
                    });

                    transcriptionElement.appendChild(wordContainer);
                });

                transcriptionContainer.appendChild(transcriptionElement);
            });
        })
        .catch(error => console.error('Fehler beim Laden der Transkription:', error));
}


        

          // WORTMARKIERUNG
          // WORTMARKIERUNG
          // WORTMARKIERUNG

          // Event-Listener für den visuellen Audioplayer
        visualAudioPlayer.addEventListener('play', function () {
          isPlaying = true;
          updateWordsHighlight(); // Um das aktuelle Wort sofort zu markieren
        });

        visualAudioPlayer.addEventListener('pause', function () {
          isPlaying = false;
        });

        visualAudioPlayer.addEventListener('timeupdate', function () {
          updateWordsHighlight();
        });

        visualAudioPlayer.addEventListener('ended', function () {
          // Hier deine Logik für das Ende des visualAudioPlayers
        });

        // Laden Sie das Audio in den visuellen Audioplayer
        visualAudioPlayer.src = audioFile;

        // Optional: Füge ein Event-Listener für das Ende des audioPlayers hinzu
        visualAudioPlayer.addEventListener('ended', function () {
          // Hier deine Logik für das Ende des audioPlayers
        });

        function updateWordsHighlight() {
          if (!isPlaying) return;
        
          const currentTime = visualAudioPlayer.currentTime;
        
          const words = document.querySelectorAll('.word');
          words.forEach(word => {
            const start = parseFloat(word.dataset.start);
            const end = parseFloat(word.dataset.end);
        
            // Überprüfen, ob die aktuelle Zeit zwischen dem Start- und Endzeitpunkt des Worts liegt
            if (currentTime >= start && currentTime <= end) {
              // Markiere das aktuelle Wort
              word.classList.add('playing');
        
              // Überprüfen, ob das Wort nicht im Sichtbereich ist
              if (!isElementInViewport(word)) {
                // Scrollen Sie zum aktuellen Wort, um sicherzustellen, dass es sichtbar ist
                word.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            } else {
              // Entferne die Klasse, wenn die aktuelle Zeit nicht im Bereich des Worts liegt
              word.classList.remove('playing');
            }
          });
        }
        
        
        // Überprüfen, ob ein Element im Sichtbereich ist
        function isElementInViewport(element) {
          const rect = element.getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
          );
        }

        
          function formatNumber(number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          }

          function formatTime(timeInSeconds) {
            const hours = Math.floor(timeInSeconds / 3600);
            const minutes = Math.floor((timeInSeconds % 3600) / 60);
            const seconds = Math.round(timeInSeconds % 60);
            return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          }
        });

        document.addEventListener("DOMContentLoaded", function () {
          const scrollToTopBtn = document.getElementById("scrollToTopBtn");

          // Show the button when the user scrolls down 20px from the top of the document
          window.addEventListener("scroll", function () {
              if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                  scrollToTopBtn.style.display = "block";
              } else {
                  scrollToTopBtn.style.display = "none";
              }
          });

          // Scroll to the top when the button is clicked
          scrollToTopBtn.addEventListener("click", function () {
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
          });
        });


// INFO TEXT
// INFO TEXT
// INFO TEXT





// MARCAR LETRAS
// MARCAR LETRAS
// MARCAR LETRAS

// Objekt zur Speicherung der Anzahl der Übereinstimmungen für jede Suchanfrage
let matchCounts = {};

// Funktion zum Markieren von Buchstaben
function markLetters() {
  console.log("markLetters wird aufgerufen.");
  const markInput = document.getElementById('markInput');
  let searchLetters = markInput.value.trim().toLowerCase();
  let markType = 'exact';
  let searchQuery = searchLetters;
  let separatorRegex = /[ ,.?;]/;

  if (searchLetters.endsWith('_')) {
    markType = 'separator';
    searchQuery = searchLetters.slice(0, -1);
    separatorRegex = /\s/;
  } else if (searchLetters.endsWith('#')) {
    markType = 'punctuation';
    searchQuery = searchLetters.slice(0, -1);
    separatorRegex = /[.,;!?]/;
  }

  if (searchQuery !== '') {
    const words = document.querySelectorAll('.word');
    matchCounts[searchLetters] = 0;

    words.forEach(word => {
      const wordText = word.textContent.toLowerCase();
      for (let i = 0; i < wordText.length; i++) {
        const isExactMatch = wordText.substring(i, i + searchQuery.length) === searchQuery;
        if (isExactMatch) {
          const nextChar = wordText[i + searchQuery.length] || ' ';
          const isValidSeparator = (markType === 'separator') ? separatorRegex.test(nextChar) : true;
          const isValidPunctuation = (markType === 'punctuation') ? separatorRegex.test(nextChar) : true;

          if (isValidSeparator && isValidPunctuation) {
            markWordLetters(word, searchLetters, markType);
            matchCounts[searchLetters]++;
            break; // Stop checking this word after a match is found
          }
        }
      }
    });

    if (!document.getElementById(`button-${searchLetters}`)) {
      createResetButton(searchLetters);
    }

    markInput.value = '';
    checkResetButtonVisibility(); // Überprüfe die Sichtbarkeit des Zurücksetzen-Buttons
  }

}


// Funktion zum Markieren von Buchstaben in einem Wort
function markWordLetters(word, searchLetters, markType) {
  let innerHTML = word.innerHTML;
  let searchQuery = searchLetters.slice(0, -1); // Entfernt das spezielle Zeichen ('#' oder '_')
  let separatorRegex = (searchLetters.endsWith('_')) ? /\s/ : /[.,;!?]/;
  let isSpecialCase = searchLetters.endsWith('_') || searchLetters.endsWith('#');

  // Setze die Suchanfrage auf die volle Eingabe für normale Fälle
  if (!isSpecialCase) {
    searchQuery = searchLetters;
  }

  let i = 0;
  while (i < innerHTML.length) {
    let match = new RegExp(`${searchQuery}(?![^<]*>|[^<>]*</)`, 'ig').exec(innerHTML.slice(i));

    if (match) {
      const matchStart = i + match.index;
      const matchEnd = matchStart + match[0].length;
      const nextChar = innerHTML[matchEnd] || ' ';

      let isValidMarkingPosition = isSpecialCase ? separatorRegex.test(nextChar) : true;

      if (isValidMarkingPosition) {
        const highlightSpan = `<span class="highlight">${match[0]}</span>`;
        innerHTML = innerHTML.slice(0, matchStart) + highlightSpan + innerHTML.slice(matchEnd);
        i = matchStart + highlightSpan.length;
      } else {
        i = matchEnd;
      }
    } else {
      break; // Kein weiteres Vorkommen gefunden, Schleife beenden
    }
  }

  word.innerHTML = innerHTML;
}


// Hilfsfunktion zum Verarbeiten eines Textsegments
function processTextSegment(segment, searchQuery, markType, separatorRegex) {
  let result = '';
  let i = 0;

  while (i < segment.length) {
    const isExactMatch = segment.substring(i, i + searchQuery.length).toLowerCase() === searchQuery;
    if (isExactMatch) {
      const nextChar = segment[i + searchQuery.length] || ' ';
      const isValidSeparator = (markType === 'separator') ? separatorRegex.test(nextChar) : true;
      if (isValidSeparator) {
        result += `<span class="highlight">${segment.substring(i, i + searchQuery.length)}</span>`;
        i += searchQuery.length;
      } else {
        result += segment[i];
        i++;
      }
    } else {
      result += segment[i];
      i++;
    }
  }

  return result;
}

// Funktion, um einen Button für die aktuelle Eingabe zu erstellen
function createResetButton(searchLetters) {
  const resetButton = document.createElement('button');
  resetButton.id = `button-${searchLetters}`;
  resetButton.classList.add('letra');
  resetButton.innerHTML = `${searchLetters} <span class="result-count">(${matchCounts[searchLetters] || 0})</span>`;

  resetButton.addEventListener('click', function() {
    resetMarkingByLetters(searchLetters);
    resetButton.remove();
    checkResetButtonVisibility(); // Überprüfe die Sichtbarkeit des Zurücksetzen-Buttons
  });

  const buttonsContainer = document.getElementById('buttonsContainer');
  buttonsContainer.appendChild(resetButton);

  checkResetButtonVisibility(); // Überprüfe die Sichtbarkeit des Zurücksetzen-Buttons
}

// Funktion zum Zurücksetzen aller Markierungen
function resetMarkings() {
  console.log("Reset der Markierungen");
  const words = document.querySelectorAll('.transcription-list .word, .transcription-text .word, .word');

  words.forEach(word => {
    resetWordMarkings(word); // Entfernt alle Markierungen im Wort
  });

  resetAllButtons(); // Entfernt alle Buttons und setzt den Zustand zurück
  checkResetButtonVisibility(); // Überprüfe die Sichtbarkeit des Zurücksetzen-Buttons
}


// Funktion zum Entfernen aller Buttons im Container und Zurücksetzen des Zustands
function resetAllButtons() {
  const buttonsContainer = document.getElementById('buttonsContainer');
  while (buttonsContainer.firstChild) {
    buttonsContainer.removeChild(buttonsContainer.firstChild);
  }
  matchCounts = {}; // Setzt die Übereinstimmungszähler für jede Suchanfrage zurück
}

// Funktion zum Zurücksetzen der Markierungen in einem Wort
function resetWordMarkings(word) {
  // Setze das Wort auf seinen ursprünglichen Textinhalt zurück, ohne einzelne <span>-Elemente
  word.innerHTML = word.textContent;
}

// Funktion zum Zurücksetzen der Markierungen nach Buchstaben
function resetMarkingByLetters(searchLetters) {
  const words = document.querySelectorAll('.word');

  words.forEach(word => {
    resetWordMarkingsByLetters(word, searchLetters);
  });

  checkResetButtonVisibility(); // Überprüfe die Sichtbarkeit des Zurücksetzen-Buttons
}

// Funktion zum Zurücksetzen der Markierungen nach Buchstaben in einem Wort
function resetWordMarkingsByLetters(word, searchLetters) {
  let searchQuery = searchLetters.toLowerCase();
  let markType = 'exact';

  // Anpassung der Suche basierend auf der Eingabe
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
    const spanStartIndex = wordHTML.indexOf('<span class="highlight">', currentIndex);
    const spanEndIndex = spanStartIndex >= 0 ? wordHTML.indexOf('</span>', spanStartIndex) : -1;

    // Füge den Text vor dem nächsten <span>-Element hinzu
    if (spanStartIndex === -1) {
      newContent += wordHTML.substring(currentIndex);
      break;
    } else {
      newContent += wordHTML.substring(currentIndex, spanStartIndex);
    }

    // Bestimme den markierten Text im <span>-Element
    const highlightedTextStartIndex = spanStartIndex + '<span class="highlight">'.length;
    const highlightedText = wordHTML.substring(highlightedTextStartIndex, spanEndIndex);

    // Überprüfe, ob der markierte Text mit der Suchanfrage übereinstimmt
    let shouldRemoveHighlight = highlightedText.toLowerCase() === searchQuery;
    if (markType !== 'exact') {
      const nextChar = wordHTML.substring(spanEndIndex + '</span>'.length, spanEndIndex + '</span>'.length + 1);
      const isValidSeparator = markType === 'separator' && /\s/.test(nextChar);
      const isValidPunctuation = markType === 'punctuation' && /[.,;!?]/.test(nextChar);
      shouldRemoveHighlight = shouldRemoveHighlight && (isValidSeparator || isValidPunctuation);
    }

    // Entscheide, ob die Markierung entfernt werden soll
    if (shouldRemoveHighlight) {
      newContent += highlightedText;
    } else {
      newContent += `<span class="highlight">${highlightedText}</span>`;
    }

    currentIndex = spanEndIndex + '</span>'.length;
  }

  word.innerHTML = newContent;
}

// Funktion, um die Sichtbarkeit des Zurücksetzen-Buttons zu überprüfen und zu steuern
function checkResetButtonVisibility() {
  const buttonsContainer = document.getElementById('buttonsContainer');
  const individualResetButtons = buttonsContainer.querySelectorAll('.letra'); 
  const resetAllButton = document.getElementById('resetMarkingsButton'); // Verwendet die korrekte ID 'resetMarkingsButton'

  // Wenn es keine individuellen Reset-Buttons gibt, den "Borrar todo"-Button ausblenden
  if (individualResetButtons.length === 0) {
    if (resetAllButton) {
      resetAllButton.style.display = 'none';
    }
  } else {
    // Andernfalls den "Borrar todo"-Button anzeigen
    if (resetAllButton) {
      resetAllButton.style.display = 'block';
    }
  }
}



// Funktion, um den "Borrar todo" Button auszublenden
function hideResetMarkingsButton() {
  const resetAllButton = document.getElementById('resetAllButton');
  if (resetAllButton) {
    resetAllButton.remove();
  }
}

// Fügt das aktuelle Jahr in ein Element mit der ID "currentYear" ein
document.addEventListener("DOMContentLoaded", function() {
  const year = new Date().getFullYear();
  document.getElementById("currentYear").textContent = year;
});






