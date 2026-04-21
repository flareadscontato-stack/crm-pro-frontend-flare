import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' },
  logoIcon: { width: '36px', height: '36px', background: '#F5C518', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '16px', color: '#000' },
  logoText: { fontFamily: 'Space Grotesk', fontSize: '20px', fontWeight: 700, color: '#fff' },
  heading: { fontFamily: 'Space Grotesk', fontSize: '22px', fontWeight: 600, color: '#fff', marginBottom: '6px' },
  sub: { fontSize: '13px', color: '#666', marginBottom: '28px' },
  label: { display: 'block', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' },
  input: { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '14px', marginBottom: '16px', outline: 'none', transition: 'border-color 0.15s', fontFamily: 'DM Sans' },
  btn: { width: '100%', background: '#F5C518', color: '#000', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk', letterSpacing: '0.02em', transition: 'background 0.15s' },
  toggle: { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#666' },
  toggleLink: { color: '#F5C518', cursor: 'pointer', marginLeft: '4px', background: 'none', border: 'none', fontSize: '13px', fontFamily: 'DM Sans' },
  error: { background: '#2a0000', border: '1px solid #440000', borderRadius: '8px', padding: '10px 14px', color: '#ff7777', fontSize: '13px', marginBottom: '16px' },
  fieldGroup: { marginBottom: '4px' },
};

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'login' ? api.auth.login : api.auth.register;
      const data = await fn(form);
      login(data.token, data.user);
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}>C</div>
          <div style={s.logoText}>CRM Pro</div>
        </div>
        <div style={s.heading}>{mode === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}</div>
        <div style={s.sub}>{mode === 'login' ? 'Entre para acessar seu comercial' : 'Comece a organizar suas vendas'}</div>

        {error && <div style={s.error}>{error}</div>}

        {mode === 'register' && (
          <div style={s.fieldGroup}>
            <label style={s.label}>Nome completo</label>
            <input style={s.input} placeholder="Seu nome" value={form.name} onChange={set('name')} onKeyDown={onKey} />
          </div>
        )}
        {mode === 'register' && (
          <div style={s.fieldGroup}>
            <label style={s.label}>Empresa</label>
            <input style={s.input} placeholder="Nome da empresa" value={form.company} onChange={set('company')} onKeyDown={onKey} />
          </div>
        )}
        <div style={s.fieldGroup}>
          <label style={s.label}>E-mail</label>
          <input style={s.input} type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} onKeyDown={onKey} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Senha</label>
          <input style={s.input} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={onKey} />
        </div>

        <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={submit} disabled={loading}>
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>

        <div style={s.toggle}>
          {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}
          <button style={s.toggleLink} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
