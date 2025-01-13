document.addEventListener('DOMContentLoaded', function () {
  console.log('index_script loaded');

  const totalWordCountElement = document.getElementById('totalWordCount');
  const totalDurationElement = document.getElementById('totalDuration');

  // Statistiken aus stats_all.db laden
  fetch('/get_stats_all_from_db')
    .then(response => response.json())
    .then(data => {
      const totalWordCountFromDB = data.total_word_count;
      const totalDurationFromDB = data.total_duration_all;

      // Setze die globalen Variablen und aktualisiere die Statistiken
      updateTotalStats(totalWordCountFromDB, totalDurationFromDB);
    })
    .catch(error => {
      console.error('Error fetching statistics from the database:', error);
    });

    function updateTotalStats(totalWordCount, totalDuration) {
      // Konvertiere die Zeitangabe zu einem Date-Objekt
      const durationDate = new Date(`1970-01-01T${totalDuration}Z`);
    
      // Extrahiere Stunden, Minuten und Sekunden
      const hours = durationDate.getUTCHours();
      const minutes = durationDate.getUTCMinutes();
      const seconds = durationDate.getUTCSeconds();
    
      // Formatiere die Zeitangabe
      const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
      // Aktualisiere die HTML-Elemente
      totalDurationElement.innerHTML = `<span style="color: #053c96; font-weight: bold;">${formattedDuration}</span> horas de audio`;
      totalWordCountElement.innerHTML = `<span style="color: #053c96; font-weight: bold;">${totalWordCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span> palabras transcritas`;
    }
    
});

// Fügt das aktuelle Jahr in ein Element mit der ID "currentYear" ein
document.addEventListener("DOMContentLoaded", function() {
  const year = new Date().getFullYear();
  document.getElementById("currentYear").textContent = year;
});