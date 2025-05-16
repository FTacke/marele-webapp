document.addEventListener('DOMContentLoaded', function () {
  console.log('index_script loaded');

  const totalWordCountElement = document.getElementById('totalWordCount');
  const totalDurationElement = document.getElementById('totalDuration');  
    
});

function toggleTooltip(e) {
  const tip = e.target.nextElementSibling;
  if (!tip) return;

  // nur den zugehörigen Tooltip ein-/ausblenden
  tip.classList.toggle('visible');

  // alle anderen sichtbaren Tooltips einklappen
  document.querySelectorAll('.tooltip-text.visible')
          .forEach(el => { if (el !== tip) el.classList.remove('visible'); });
}