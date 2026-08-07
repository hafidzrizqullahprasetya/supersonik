const api = window.SupabaseAPI;
const loginView = document.querySelector('#login-view');
const dashboardView = document.querySelector('#dashboard-view');
const loginForm = document.querySelector('#login-form');
const loginStatus = document.querySelector('#login-status');
const dashboardStatus = document.querySelector('#dashboard-status');
const chantList = document.querySelector('#chant-admin-list');
const chantForm = document.querySelector('#chant-form');
const settingsForm = document.querySelector('#settings-form');
const modal = document.querySelector('#admin-modal');
const modalTitle = document.querySelector('#modal-title');
const modalMessage = document.querySelector('#modal-message');
const modalActions = document.querySelector('#modal-actions');
const modalKicker = document.querySelector('#modal-kicker');
const editorAudio = document.querySelector('#editor-audio');
let chants = [];
let settings = {};

function showModal({ title, message, tone = 'success', confirm = false }) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalKicker.textContent = tone === 'error' ? 'CIVILION ADMIN / ERROR' : 'CIVILION ADMIN';
  modalActions.replaceChildren();
  return new Promise((resolve) => {
    const close = (value) => { modal.hidden = true; resolve(value); };
    if (confirm) {
      const cancel = document.createElement('button');
      cancel.className = 'secondary';
      cancel.textContent = 'Batal';
      cancel.addEventListener('click', () => close(false), { once: true });
      modalActions.append(cancel);
    }
    const action = document.createElement('button');
    action.className = confirm ? 'danger' : '';
    action.textContent = confirm ? 'Hapus' : 'Tutup';
    action.addEventListener('click', () => close(true), { once: true });
    modalActions.append(action);
    modal.hidden = false;
    action.focus();
  });
}

modal.addEventListener('click', (event) => { if (event.target === modal) modal.hidden = true; });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) modal.hidden = true; });

const defaultSources = [
  ['Teknik Gadjah Mada', 'TeknikGadjahMadaGitar.mp3', 'audio/mpeg'], ['Bela Kau', 'syalalaGitar.mp3', 'audio/mpeg'], ['CIVILION yang Kutunggu', 'SupersonikYangKutungguGitar.mp3', 'audio/mpeg'], ['La Grande Teknik', 'LaGrandeGitar.mp3', 'audio/mpeg'], ['Kemenangan', 'KemenanganGitar.mp3', 'audio/mpeg'], ['Hari Ini', 'HariIniGitar.mp3', 'audio/mpeg'], ['Bukalah Matamu', 'BukalahMatamuGitar', 'audio/mpeg'], ['Ayo Bang Ayo Neng', 'AyoBangGitar.mp3', 'audio/mpeg'], ['We Are The Champion', 'weAreThe.wav', 'audio/wav'], ['Andeca Andeci', 'andecaAndeci.wav', 'audio/wav'], ['Pesta Pora', 'kamiPemenangnya.wav', 'audio/wav'], ['Teknik Datang Lagi', 'kamiDatangLagi.wav', 'audio/wav'], ['Terbaik Untukmu', 'terbaikUntukmu.wav', 'audio/wav'], ['Biru-Biru (Basket) Teknik', 'hitamHitam.wav', 'audio/wav'], ['CIVILION Tunjukkan Aksimu', 'supersonikTunjukkanAksimu.wav', 'audio/wav'], ['Seiring Jejak Langkah (POZNAN DANCE)', 'seiringJejakLangkahku.wav', 'audio/wav'], ['Syalala Tunjukkan Semangatmu', 'syalalalaTunjukkan.wav', 'audio/wav'], ['Kukibarkan', 'kukibarkanBendera.wav', 'audio/wav'], ['Teknik Satu', 'teknikSatu.wav', 'audio/wav'], ['Kalau Aku Teknik', 'kalauAkuTeknik.wav', 'audio/wav'], ['Teknik Jaya', 'ayoTeknikJaya.wav', 'audio/wav'], ['Ji Ro Lu Pat', 'jiRoLuPat.wav', 'audio/wav'], ['Disini CIVILION', 'disiniSupersonik.wav', 'audio/wav'], ['Eee Ayo Ayo Ayo', 'yoAyoTeknikku.wav', 'audio/wav'], ['Jangan Lawan', 'sudahKubilang.wav', 'audio/wav'], ['Ambrol Protol', 'ambrolProtol.wav', 'audio/wav'], ['Nama Hewan dan Artinya', 'namaHewan.wav', 'audio/wav'], ['Dudidudidam', 'dudiDudiDam.wav', 'audio/wav']
];

function setStatus(element, message, error = true) {
  element.textContent = message;
  element.style.color = error ? 'var(--red)' : '#287343';
}

function flattenSettings() {
  settingsForm.querySelectorAll('[name]').forEach((field) => {
    const [group, key] = field.name.split('.');
    field.value = settings[group]?.[key] || '';
  });
}

function collectSettings() {
  const next = {};
  settingsForm.querySelectorAll('[name]').forEach((field) => {
    const [group, key] = field.name.split('.');
    next[group] ||= {};
    next[group][key] = field.value;
  });
  return next;
}

function renderChants() {
  chantList.replaceChildren(...chants.map((chant, index) => {
    const row = document.createElement('div');
    row.className = 'admin-chant';
    row.innerHTML = `<span class="admin-chant-number">${String(index + 1).padStart(2, '0')}</span><span><strong class="admin-chant-title"></strong><br><small>${chant.published ? 'Published' : 'Draft'}</small></span><button type="button" aria-label="Edit chant">→</button>`;
    row.querySelector('.admin-chant-title').textContent = chant.title.replace(/supersonik/gi, 'CIVILION');
    row.querySelector('button').addEventListener('click', () => openEditor(chant));
    return row;
  }));
}

function openEditor(chant = null) {
  chantForm.hidden = false;
  chantForm.elements.id.value = chant?.id || '';
  chantForm.elements.title.value = chant?.title || '';
  chantForm.elements.sort_order.value = chant?.sort_order ?? chants.length;
  chantForm.elements.audio_url.value = chant?.audio_url || '';
  chantForm.elements.audio_type.value = chant?.audio_type || 'audio/mpeg';
  chantForm.elements.published.checked = chant?.published ?? true;
  chantForm.elements.lyrics.value = (chant?.lyrics || []).join('\n');
  editorAudio.hidden = !chant?.audio_url;
  editorAudio.src = chant?.audio_url || '';
  document.querySelector('#chant-editor-title').textContent = chant ? 'Edit chant' : 'Chant baru';
  document.querySelector('#delete-chant-button').hidden = !chant;
  chantForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadDashboard() {
  const [chantRows, settingRows] = await Promise.all([
    api.select('chants', 'select=*&order=sort_order.asc'),
    api.select('site_settings', 'select=key,value')
  ]);
  chants = chantRows;
  settings = Object.fromEntries(settingRows.map((row) => [row.key, row.value]));
  renderChants();
  flattenSettings();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus(loginStatus, 'Memproses...');
  try {
    const data = new FormData(loginForm);
    await api.signIn(data.get('email'), data.get('password'));
    await showDashboard();
  } catch (error) {
    const message = error.message.toLowerCase();
    const hint = message.includes('invalid login credentials')
      ? 'Email atau password salah, atau user belum dibuat di Supabase Auth.'
      : message.includes('email not confirmed')
        ? 'Email admin belum dikonfirmasi di Supabase Auth.'
        : 'User belum terdaftar sebagai admin atau schema Supabase belum dijalankan.';
    setStatus(loginStatus, hint);
    await showModal({ title: 'Login gagal', message: hint, tone: 'error' });
  }
});

async function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
  try { await loadDashboard(); } catch (error) { setStatus(dashboardStatus, `Gagal memuat data: ${error.message}`); }
}

document.querySelector('#logout-button').addEventListener('click', async () => { await api.signOut(); dashboardView.hidden = true; loginView.hidden = false; });
document.querySelector('#new-chant-button').addEventListener('click', () => openEditor());
document.querySelector('#close-editor').addEventListener('click', () => { chantForm.hidden = true; });
chantForm.elements.audio_url.addEventListener('input', () => {
  editorAudio.src = chantForm.elements.audio_url.value;
  editorAudio.hidden = !chantForm.elements.audio_url.value;
});
document.querySelector('#chant-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(chantForm);
  const row = { title: data.get('title'), sort_order: Number(data.get('sort_order')), audio_url: data.get('audio_url'), audio_type: data.get('audio_type'), lyrics: data.get('lyrics').split('\n').map((line) => line.trim()).filter(Boolean), published: data.get('published') === 'on', updated_at: new Date().toISOString() };
  try {
    if (data.get('id')) await api.update('chants', data.get('id'), row);
    else await api.insert('chants', row);
    await loadDashboard();
    chantForm.hidden = true;
    setStatus(dashboardStatus, 'Chant tersimpan.', false);
    await showModal({ title: 'Tersimpan', message: 'Judul, lagu, lirik, urutan, dan status publikasi sudah diperbarui.' });
  } catch (error) { setStatus(dashboardStatus, `Gagal menyimpan: ${error.message}`); await showModal({ title: 'Gagal menyimpan', message: error.message, tone: 'error' }); }
});
document.querySelector('#delete-chant-button').addEventListener('click', async () => {
  const id = chantForm.elements.id.value;
  if (!id || !(await showModal({ title: 'Hapus chant?', message: 'Data lagu dan lirik ini akan dihapus permanen.', tone: 'error', confirm: true }))) return;
  try { await api.remove('chants', id); await loadDashboard(); chantForm.hidden = true; await showModal({ title: 'Terhapus', message: 'Chant berhasil dihapus.' }); } catch (error) { setStatus(dashboardStatus, `Gagal menghapus: ${error.message}`); await showModal({ title: 'Gagal menghapus', message: error.message, tone: 'error' }); }
});
document.querySelector('#seed-button').addEventListener('click', async () => {
  if (!(await showModal({ title: 'Import chant default?', message: '28 chant akan dibuat atau diperbarui. Data dengan URL audio sama akan tertimpa.', confirm: true }))) return;
  try {
    const rows = defaultSources.map(([title, filename, audio_type], index) => ({ title, sort_order: index, audio_url: `https://ekarahmadi.github.io/supersonikChant/${filename}`, audio_type, lyrics: window.CIVILION_LYRICS[filename] || [], published: true }));
    await api.upsert('chants', rows, 'audio_url');
    await loadDashboard();
    setStatus(dashboardStatus, '28 chant berhasil diimport.', false);
    await showModal({ title: 'Import berhasil', message: '28 chant default sudah masuk ke library.' });
  } catch (error) { setStatus(dashboardStatus, `Import gagal: ${error.message}`); await showModal({ title: 'Import gagal', message: error.message, tone: 'error' }); }
});
document.querySelectorAll('.tab-button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.tab-button').forEach((item) => item.classList.toggle('active', item === button));
  document.querySelectorAll('.tab-panel').forEach((panel) => { panel.hidden = panel.id !== `${button.dataset.tab}-tab`; panel.classList.toggle('active', panel.id === `${button.dataset.tab}-tab`); });
}));
document.querySelector('#save-settings-button').addEventListener('click', async () => {
  try { const next = collectSettings(); await api.upsert('site_settings', Object.entries(next).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() })), 'key'); settings = next; setStatus(dashboardStatus, 'Pengaturan tersimpan.', false); await showModal({ title: 'Settings tersimpan', message: 'Konten halaman publik sudah diperbarui.' }); } catch (error) { setStatus(dashboardStatus, `Gagal menyimpan setting: ${error.message}`); await showModal({ title: 'Gagal menyimpan settings', message: error.message, tone: 'error' }); }
});

if (api.getSession()) showDashboard();
