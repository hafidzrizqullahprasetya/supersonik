(() => {
  const config = window.SUPABASE_CONFIG;
  if (!config?.url || !config?.publishableKey) return;

  const sessionKey = 'supersonik_admin_session';
  const baseHeaders = {
    apikey: config.publishableKey,
    'Content-Type': 'application/json'
  };

  function getSession() {
    try { return JSON.parse(localStorage.getItem(sessionKey) || 'null'); }
    catch { return null; }
  }

  function setSession(session) {
    if (session) localStorage.setItem(sessionKey, JSON.stringify(session));
    else localStorage.removeItem(sessionKey);
  }

  async function request(path, options = {}, accessToken = getSession()?.access_token) {
    const headers = { ...baseHeaders, ...(options.headers || {}) };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const response = await fetch(`${config.url}${path}`, { ...options, headers });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `${response.status} ${response.statusText}`);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  window.SupabaseAPI = {
    getSession,
    setSession,
    request,
    async signIn(email, password) {
      const session = await request('/auth/v1/token?grant_type=password', {
        method: 'POST', body: JSON.stringify({ email, password })
      }, null);
      setSession(session);
      return session;
    },
    async signOut() {
      const token = getSession()?.access_token;
      if (token) await request('/auth/v1/logout', { method: 'POST' }, token).catch(() => {});
      setSession(null);
    },
    async select(table, query = 'select=*') {
      return request(`/rest/v1/${table}?${query}`);
    },
    async upsert(table, rows, conflict = 'key') {
      return request(`/rest/v1/${table}?on_conflict=${encodeURIComponent(conflict)}`, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(rows)
      });
    },
    async insert(table, row) {
      return request(`/rest/v1/${table}`, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(row)
      });
    },
    async update(table, id, row) {
      return request(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(row)
      });
    },
    async remove(table, id) {
      return request(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
  };
})();
