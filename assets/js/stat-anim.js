// Animation for statistics (client satisfied)
document.addEventListener('DOMContentLoaded', function() {
  var clientStat = document.getElementById('clientSatisfied');
  if (clientStat) {
    let start = 0;
    let end = 90;
    let duration = 1200;
    let startTime = null;
    function animateStat(ts) {
      if (!startTime) startTime = ts;
      let progress = Math.min((ts - startTime) / duration, 1);
      let value = Math.floor(progress * (end - start) + start);
      clientStat.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(animateStat);
      } else {
        clientStat.textContent = end;
      }
    }
    requestAnimationFrame(animateStat);
  }
});
