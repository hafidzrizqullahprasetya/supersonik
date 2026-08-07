window.civilionContentPromise.then(() => {
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

document.querySelectorAll('.chant-icon').forEach((icon) => {
  if (!icon.querySelector('.fa-solid')) icon.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i>';
});

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = 'Buka menu';
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.querySelector('.sr-only').textContent = isOpen ? 'Buka menu' : 'Tutup menu';
  navigation.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('resize', () => {
  if (window.innerWidth > 720) closeMenu();
});

const player = document.querySelector('.player-panel');
const recordArt = document.querySelector('.record-art');
const playButton = document.querySelector('.play-button');
const progressButton = document.querySelector('.progress');
const currentTime = document.querySelector('.current-time');
const durationLabel = document.querySelector('.duration');
const trackTitle = document.querySelector('.track-copy h3');
const trackLabel = document.querySelector('.track-copy span');
const trackAudio = document.querySelector('.track-audio');
const trackSource = trackAudio.querySelector('source');
const chantItems = [...document.querySelectorAll('.chant-item')];
const chantEntries = [...document.querySelectorAll('.chant-entry')];
const chantDetail = document.querySelector('.chant-detail');
const lyricsPanel = document.querySelector('.lyrics-panel');
const lyricsTitle = document.querySelector('.lyrics-heading h3');
const lyricsLines = document.querySelector('.lyrics-lines');

const titlesBySource = window.CIVILION_TITLES || {
  'TeknikGadjahMadaGitar.mp3': 'Teknik Gadjah Mada',
  'syalalaGitar.mp3': 'Bela Kau',
  'SupersonikYangKutungguGitar.mp3': 'Supersonik yang Kutunggu',
  'LaGrandeGitar.mp3': 'La Grande Teknik',
  'KemenanganGitar.mp3': 'Kemenangan',
  'HariIniGitar.mp3': 'Hari Ini',
  'BukalahMatamuGitar': 'Bukalah Matamu',
  'AyoBangGitar.mp3': 'Ayo Bang Ayo Neng',
  'weAreThe.wav': 'We Are The Champion',
  'andecaAndeci.wav': 'Andeca Andeci',
  'kamiPemenangnya.wav': 'Pesta Pora',
  'kamiDatangLagi.wav': 'Teknik Datang Lagi',
  'terbaikUntukmu.wav': 'Terbaik Untukmu',
  'hitamHitam.wav': 'Biru-Biru (Basket) Teknik',
  'supersonikTunjukkanAksimu.wav': 'Tunjukkan Aksimu',
  'seiringJejakLangkahku.wav': 'Seiring Jejak Langkah (POZNAN DANCE)',
  'syalalalaTunjukkan.wav': 'Syalala Tunjukkan Semangatmu',
  'kukibarkanBendera.wav': 'Kukibarkan',
  'teknikSatu.wav': 'Teknik Satu',
  'kalauAkuTeknik.wav': 'Kalau Aku Teknik',
  'ayoTeknikJaya.wav': 'Teknik Jaya',
  'jiRoLuPat.wav': 'Ji Ro Lu Pat',
  'disiniSupersonik.wav': 'Disini Supersonik',
  'yoAyoTeknikku.wav': 'Eee Ayo Ayo Ayo',
  'sudahKubilang.wav': 'Jangan Lawan',
  'ambrolProtol.wav': 'Ambrol Protol',
  'namaHewan.wav': 'Nama Hewan dan Artinya',
  'dudiDudiDam.wav': 'Dudidudidam'
};

function sourceFilename(source) {
  return source.split('/').pop();
}

function renderLyrics(item) {
  const filename = sourceFilename(item.dataset.source);
  const title = item.dataset.databaseContent ? item.dataset.title : (titlesBySource[filename] || item.dataset.title);
  const lines = window.CIVILION_LYRICS[filename] || lyricsBySource[filename] || [];
  lyricsTitle.textContent = title;
  lyricsLines.replaceChildren(...lines.map((line) => {
    const element = document.createElement('p');
    element.textContent = line;
    return element;
  }));
  lyricsPanel.hidden = lines.length === 0;
}

function formatTime(time) {
  if (!Number.isFinite(time)) return '0:00';
  return `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;
}

function updateProgress() {
  const progress = trackAudio.duration ? trackAudio.currentTime / trackAudio.duration : 0;
  currentTime.textContent = formatTime(trackAudio.currentTime);
  durationLabel.textContent = formatTime(trackAudio.duration);
  progressButton.value = progress * 100;
  progressButton.style.setProperty('--progress', `${progress * 100}%`);
}

function setPlaying(isPlaying) {
  player.classList.toggle('playing', isPlaying);
  recordArt.classList.toggle('playing', isPlaying);
  playButton.setAttribute('aria-label', `${isPlaying ? 'Jeda' : 'Putar'} ${trackTitle.textContent}`);
}

function selectTrack(item, shouldPlay = false) {
  const entry = item.closest('.chant-entry');
  const wasOpen = entry.classList.contains('active');
  if (wasOpen && !shouldPlay) {
    entry.classList.remove('active');
    item.setAttribute('aria-expanded', 'false');
    trackAudio.pause();
    return;
  }
  chantEntries.forEach((chantEntry) => {
    const active = chantEntry === entry;
    chantEntry.classList.toggle('active', active);
    chantEntry.querySelector('.chant-item').setAttribute('aria-expanded', String(active));
  });
  if (chantDetail.parentElement !== entry) entry.append(chantDetail);
  const filename = sourceFilename(item.dataset.source);
  const title = item.dataset.databaseContent ? item.dataset.title : (titlesBySource[filename] || item.dataset.title);
  item.dataset.title = title;
  item.querySelector('strong').textContent = title;
  trackTitle.textContent = title;
  trackLabel.textContent = `Chant ${item.querySelector('span').textContent}`;
  trackSource.src = item.dataset.source;
  if (item.dataset.type) trackSource.type = item.dataset.type;
  trackAudio.load();
  updateProgress();
  renderLyrics(item);
  if (shouldPlay) {
    trackAudio.play().catch(() => setPlaying(false));
    window.setTimeout(() => chantDetail.scrollIntoView({
      behavior: 'smooth',
      block: window.matchMedia('(max-width: 720px)').matches ? 'start' : 'nearest'
    }), 180);
  }
}

playButton.addEventListener('click', () => {
  if (trackAudio.paused) trackAudio.play().catch(() => setPlaying(false));
  else trackAudio.pause();
});

progressButton.addEventListener('input', () => {
  if (!trackAudio.duration) return;
  trackAudio.currentTime = (Number(progressButton.value) / 100) * trackAudio.duration;
  updateProgress();
});

chantItems.forEach((item) => {
  item.addEventListener('click', () => {
    const isActive = item.closest('.chant-entry').classList.contains('active');
    selectTrack(item, !isActive);
  });
});

trackAudio.addEventListener('play', () => setPlaying(true));
trackAudio.addEventListener('pause', () => setPlaying(false));
trackAudio.addEventListener('ended', () => {
  setPlaying(false);
  trackAudio.currentTime = 0;
  updateProgress();
});
trackAudio.addEventListener('timeupdate', updateProgress);
trackAudio.addEventListener('loadedmetadata', updateProgress);

chantItems.forEach((item) => {
  const title = item.dataset.databaseContent ? item.dataset.title : titlesBySource[sourceFilename(item.dataset.source)];
  if (title) {
    item.dataset.title = title;
    item.querySelector('strong').textContent = title;
  }
});
updateProgress();
selectTrack(chantItems[0]);
});
