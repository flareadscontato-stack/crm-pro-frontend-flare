import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function priColor(p) {
  if (p === 'hot') return '#ff4444';
  if (p === 'warm') return '#F5C518';
  return '#444';
}

export default function Tarefas() {
  const [tasks, setTasks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', contact: '', due: '', priority: 'warm' });
  const [saving, setSaving] = useState(false);

  const load = () => api.tasks.list().then(setTasks);
  useEffect(() => { load(); }, []);

  const toggle = async (t) => {
    await api.tasks.update(t.id, { done: !t.done });
    load();
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await api.tasks.create(form);
      setForm({ title: '', contact: '', due: '', priority: 'warm' });
      setShowAdd(false);
      load();
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    await api.tasks.delete(id);
    load();
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const sorted = [...tasks].sort((a, b) => a.done - b.done);
  const pending = tasks.filter(t => !t.done).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 12, background: '#111' }}>
        <span style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600, flex: 1, color: '#fff' }}>
          Tarefas
          {pending > 0 && <span style={{ marginLeft: 8, background: '#F5C518', color: '#000', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{pending}</span>}
        </span>
        <button onClick={() => setShowAdd(s => !s)} style={btnYellow}>+ Nova tarefa</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
        {showAdd && (
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <div style={fLabel}>Título da tarefa</div>
            <input placeholder="Ex: Ligar para cliente" value={form.title} onChange={set('title')} onKeyDown={e => e.key === 'Enter' && save()} style={inputStyle} />
            <div style={fLabel}>Contato</div>
            <input placeholder="Nome do contato" value={form.contact} onChange={set('contact')} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={fLabel}>Prazo</div>
                <input placeholder="Hoje, Amanhã, 25/04" value={form.due} onChange={set('due')} style={inputStyle} />
              </div>
              <div>
                <div style={fLabel}>Prioridade</div>
                <select value={form.priority} onChange={set('priority')} style={inputStyle}>
                  <option value="hot">Urgente</option>
                  <option value="warm">Normal</option>
                  <option value="cold">Baixa</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={save} disabled={saving} style={btnYellow}>{saving ? 'Salvando...' : 'Salvar tarefa'}</button>
              <button onClick={() => setShowAdd(false)} style={btnGhost}>Cancelar</button>
            </div>
          </div>
        )}

        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#444', fontSize: 13 }}>Nenhuma tarefa ainda. Crie sua primeira!</div>
        )}

        {sorted.map(t => (
          <div key={t.id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, opacity: t.done ? 0.45 : 1, transition: 'opacity 0.2s' }}>
            <div
              onClick={() => toggle(t)}
              style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${t.done ? '#00e676' : '#333'}`, background: t.done ? '#00e676' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
            >
              {t.done && <span style={{ fontSize: 10, color: '#000', fontWeight: 700 }}>✓</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#fff', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{t.contact}{t.due ? ` · ${t.due}` : ''}</div>
            </div>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: priColor(t.priority), flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#444', minWidth: 50, textAlign: 'right' }}>
              {t.priority === 'hot' ? 'Urgente' : t.priority === 'warm' ? 'Normal' : 'Baixa'}
            </span>
            <button onClick={() => del(t.id)} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}
              onMouseEnter={e => e.target.style.color = '#ff4444'}
              onMouseLeave={e => e.target.style.color = '#333'}
            >×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnYellow = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk' };
const btnGhost = { background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' };
const inputStyle = { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, marginBottom: 10, outline: 'none', fontFamily: 'DM Sans' };
const fLabel = { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 };
