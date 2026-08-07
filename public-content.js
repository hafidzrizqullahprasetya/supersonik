window.supersonikContentPromise = (async () => {
  if (!window.SupabaseAPI) return null;
  try {
    const [settings, chants] = await Promise.all([
      SupabaseAPI.select('site_settings', 'select=key,value'),
      SupabaseAPI.select('chants', 'select=*&published=eq.true&order=sort_order.asc')
    ]);
    const byKey = Object.fromEntries(settings.map((item) => [item.key, item.value]));
    const hero = byKey.hero || {};
    const release = byKey.release || {};
    const branding = byKey.branding || {};
    const footer = byKey.footer || {};

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
    if (branding.source_url) document.querySelectorAll('a[href*="sites.google.com"]').forEach((link) => { link.href = branding.source_url; });

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
        button.dataset.title = chant.title;
        button.dataset.databaseContent = 'true';
        button.dataset.source = chant.audio_url;
        button.dataset.type = chant.audio_type || 'audio/mpeg';
        button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><strong></strong><b class="external-icon" aria-hidden="true"></b>`;
        button.querySelector('strong').textContent = chant.title;
        entry.append(button);
        list.append(entry);
        window.SUPERSONIK_LYRICS[chant.audio_url.split('/').pop()] = chant.lyrics || [];
      });
      if (detail && list.firstElementChild) list.firstElementChild.append(detail);
    }
  } catch (error) {
    console.warn('Supabase content fallback:', error.message);
  }
  return null;
})();
