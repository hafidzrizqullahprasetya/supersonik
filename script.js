const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.querySelector('.sr-only').textContent = isOpen ? 'Buka menu' : 'Tutup menu';
  navigation.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = 'Buka menu';
    navigation.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 720 && navigation.classList.contains('open')) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = 'Buka menu';
    navigation.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
});

const player = document.querySelector('.player-panel');
const recordArt = document.querySelector('.record-art');
const playButton = document.querySelector('.play-button');
const progressButton = document.querySelector('.progress');
const progressFill = document.querySelector('.progress-fill');
const currentTime = document.querySelector('.current-time');
const release = document.querySelector('.release');
const lyricsToggle = document.querySelector('.lyrics-toggle');
const lyricsToggleLabel = document.querySelector('.lyrics-toggle-label');
const syncedLyrics = document.querySelector('.synced-lyrics');
const syncedLines = [...document.querySelectorAll('.synced-line')];
const duration = 222;
let elapsed = 0;
let timer;
let activeLineIndex = -1;

function setLyricsOpen(isOpen) {
  lyricsToggle.setAttribute('aria-expanded', String(isOpen));
  lyricsToggleLabel.textContent = isOpen ? 'Sembunyikan lirik' : 'Tampilkan lirik';
  syncedLyrics.classList.toggle('open', isOpen);
  release.classList.toggle('lyrics-open', isOpen);
}

function updateLyrics() {
  let nextActiveIndex = 0;

  syncedLines.forEach((line, index) => {
    if (elapsed >= Number(line.dataset.time)) nextActiveIndex = index;
  });

  syncedLines.forEach((line, index) => {
    line.classList.toggle('active', index === nextActiveIndex);
    line.classList.toggle('passed', index < nextActiveIndex);
    line.setAttribute('aria-current', index === nextActiveIndex ? 'true' : 'false');
  });

  if (nextActiveIndex !== activeLineIndex && syncedLyrics.classList.contains('open')) {
    syncedLines[nextActiveIndex].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  activeLineIndex = nextActiveIndex;
}

function updatePlayer() {
  const minutes = Math.floor(elapsed / 60);
  const seconds = String(Math.floor(elapsed % 60)).padStart(2, '0');
  currentTime.textContent = `${minutes}:${seconds}`;
  progressFill.style.width = `${(elapsed / duration) * 100}%`;
  updateLyrics();
}

function pausePlayer() {
  clearInterval(timer);
  player.classList.remove('playing');
  recordArt.classList.remove('playing');
  playButton.setAttribute('aria-label', 'Putar Ramuan Kemenangan');
}

function playPlayer() {
  clearInterval(timer);
  player.classList.add('playing');
  recordArt.classList.add('playing');
  playButton.setAttribute('aria-label', 'Jeda Ramuan Kemenangan');
  setLyricsOpen(true);
  timer = setInterval(() => {
    elapsed += 1;
    if (elapsed >= duration) {
      elapsed = 0;
      pausePlayer();
    }
    updatePlayer();
  }, 1000);
}

playButton.addEventListener('click', () => {
  if (player.classList.contains('playing')) pausePlayer();
  else playPlayer();
});

progressButton.addEventListener('click', (event) => {
  const rect = progressButton.getBoundingClientRect();
  elapsed = Math.max(0, Math.min(duration, ((event.clientX - rect.left) / rect.width) * duration));
  updatePlayer();
});

lyricsToggle.addEventListener('click', () => {
  setLyricsOpen(lyricsToggle.getAttribute('aria-expanded') !== 'true');
});

syncedLines.forEach((line) => {
  line.addEventListener('click', () => {
    elapsed = Number(line.dataset.time);
    updatePlayer();
    if (!player.classList.contains('playing')) playPlayer();
  });
});

updatePlayer();

const joinForm = document.querySelector('.join-form');
const formMessage = document.querySelector('.form-message');

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = new FormData(joinForm).get('email');
  formMessage.textContent = `Sip, kabar tribun berikutnya akan dikirim ke ${email}.`;
  joinForm.reset();
});
