const BASE = import.meta.env.VITE_API_URL || '/api';;

function getToken() {
  return localStorage.getItem('crm_token');
}

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

export const api = {
  auth: {
    login: (body) => req('POST', '/auth/login', body),
    register: (body) => req('POST', '/auth/register', body),
  },
  deals: {
    list: () => req('GET', '/deals'),
    create: (body) => req('POST', '/deals', body),
    update: (id, body) => req('PUT', `/deals/${id}`, body),
    delete: (id) => req('DELETE', `/deals/${id}`),
    addHistory: (id, text) => req('POST', `/deals/${id}/history`, { text }),
  },
  tasks: {
    list: () => req('GET', '/tasks'),
    create: (body) => req('POST', '/tasks', body),
    update: (id, body) => req('PUT', `/tasks/${id}`, body),
    delete: (id) => req('DELETE', `/tasks/${id}`),
  },
  ads: {
    status: () => req('GET', '/ads/status'),
    metaConnect: (body) => req('POST', '/ads/meta/connect', body),
    metaMetrics: () => req('GET', '/ads/meta/metrics'),
    metaDisconnect: () => req('POST', '/ads/meta/disconnect'),
    googleAuthUrl: () => req('GET', '/ads/google/auth-url'),
    googleMetrics: () => req('GET', '/ads/google/metrics'),
    googleDisconnect: () => req('POST', '/ads/google/disconnect'),
  },
};
