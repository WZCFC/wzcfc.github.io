// Keep every published project reachable from the moon, including with normal link shortcuts.
const meteors = Array.from(document.querySelectorAll('.project-sky .meteor'));
const destinations = meteors.map(link => link.href);
function shuffleProjects() {
  for (let i = destinations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [destinations[i], destinations[j]] = [destinations[j], destinations[i]];
  }
  meteors.forEach((link, index) => { link.href = destinations[index]; });
}
window.addEventListener('pageshow', shuffleProjects);
