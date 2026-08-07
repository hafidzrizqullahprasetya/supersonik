window.civilionContentPromise = (async () => {
  try {
    if (!window.SupabaseAPI) return null;
    const [settings, chants] = await Promise.all([
      SupabaseAPI.select('site_settings', 'select=key,value'),
      SupabaseAPI.select('chants', 'select=*&published=eq.true&order=sort_order.asc')
    ]);
    const byKey = Object.fromEntries(settings.map((item) => [item.key, item.value]));
    const hero = byKey.hero || {};
    const release = byKey.release || {};
    const branding = byKey.branding || {};
    const footer = byKey.footer || {};
    if (hero.title === 'SUPERSONIK' || hero.eyebrow?.includes('Supersonik')) {
      hero.eyebrow = '209 posts · 2,449 followers';
      hero.title = 'CIVILION';
      hero.title_emphasis = '1949';
      hero.description = 'Official Instagram of Civilion 1949, Civil Engineering UGM fanatics. ¡Vinci per noi!';
      hero.location = 'Departemen Teknik Sipil dan Lingkungan UGM, Yogyakarta';
    }
    if (release.cover_label === 'SUPERSONIK') release.cover_label = 'CIVILION 1949';
    if (release.title === 'NYALAKAN' && release.title_emphasis === 'TRIBUNMU.') {
      release.title = 'THIS IS US!';
      release.title_emphasis = '';
      release.cover_title = 'CIVILION CHANT!';
    }
    if (branding.logo_url === 'logo-supersonik.png') branding.logo_url = 'logo-civilion.jpg';
    if (branding.collaborator_logo_url === 'logo-logo.png') branding.collaborator_logo_url = 'logo-civilion.jpg';
    if (branding.source_url?.includes('sites.google.com')) branding.source_url = 'https://www.instagram.com/civilion1949/';
    if (footer.text?.includes('Supersonik')) footer.text = 'CIVILION 1949. Teknik Sipil dan Lingkungan UGM.';

    const setText = (selector, value) => {
      const element = document.querySelector(selector);
      if (element && value != null) element.textContent = value;
    };
    const setEyebrow = (selector, value) => {
      const element = document.querySelector(selector);
      if (element && value != null) element.lastChild.textContent = ` ${value}`;
    };
    setEyebrow('.hero .eyebrow', hero.eyebrow);
    setText('#hero-title span', hero.title);
    setText('#hero-title em', hero.title_emphasis);
    setText('.hero-bottom p', hero.description);
    setText('.hero-meta span:last-child', hero.location);
    setEyebrow('.release-heading .eyebrow', release.eyebrow);
    setText('#release-title span:first-child', release.title);
    setText('#release-title span:last-child', release.title_emphasis);
    setText('.record-copy > span', release.cover_label);
    setText('.record-copy strong', release.cover_title);
    setText('.site-footer > p', footer.text);
    if (hero.background_url) document.querySelector('.hero-media').style.backgroundImage = `url("${hero.background_url}")`;
    if (branding.logo_url) document.querySelectorAll('.brand-logo').forEach((logo) => { logo.src = branding.logo_url; });
    if (branding.collaborator_logo_url) document.querySelector('.logo-image-row img').src = branding.collaborator_logo_url;
    if (branding.source_url) document.querySelectorAll('a[href*="sites.google.com"], a[href*="instagram.com"]').forEach((link) => { link.href = branding.source_url; });

    if (chants.length) {
      const list = document.querySelector('.chant-list');
      const detail = document.querySelector('.chant-detail');
      list.replaceChildren();
      chants.forEach((chant, index) => {
        const entry = document.createElement('div');
        entry.className = 'chant-entry';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chant-item';
        button.setAttribute('aria-expanded', 'false');
        button.dataset.title = chant.title.replace(/supersonik/gi, 'CIVILION');
        button.dataset.databaseContent = 'true';
        button.dataset.source = chant.audio_url;
        button.dataset.type = chant.audio_type || 'audio/mpeg';
        button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><strong></strong><b class="chant-icon" aria-hidden="true"><i class="fa-solid fa-arrow-up-right-from-square"></i></b>`;
        button.querySelector('strong').textContent = chant.title;
        entry.append(button);
        list.append(entry);
        window.CIVILION_LYRICS[chant.audio_url.split('/').pop()] = (chant.lyrics || []).map((line) => line.replace(/supersonik/gi, 'CIVILION'));
      });
      if (detail && list.firstElementChild) list.firstElementChild.append(detail);
    }
  } catch (error) {
    console.warn('Supabase content fallback:', error.message);
  } finally {
    document.body.classList.remove('content-loading');
  }
  return null;
})();
