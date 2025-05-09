document.addEventListener('DOMContentLoaded', function () {
  console.log('index_script loaded');

  const totalWordCountElement = document.getElementById('totalWordCount');
  const totalDurationElement = document.getElementById('totalDuration');

  
    
});

// Fügt das aktuelle Jahr in ein Element mit der ID "currentYear" ein
document.addEventListener("DOMContentLoaded", function() {
  const year = new Date().getFullYear();
  document.getElementById("currentYear").textContent = year;
});