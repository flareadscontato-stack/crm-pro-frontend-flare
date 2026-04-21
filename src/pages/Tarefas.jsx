import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function priColor(p) {
  if (p === 'hot') return '#ff4444';
  if (p === 'warm') return '#F5C518';
  return '#444';
}
function priLabel(p) {
  if (p === 'hot') return 'Urgente';
  if (p === 'warm') return 'Normal';
  return 'Baixa';
}

export default function Tarefas() {
  const [tasks, setTasks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', contact: '', due: '', priority: 'warm' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => api.tasks.list().then(setTasks);
  useEffect(() => { load(); }, []);

  const toggle = async (t) => { await api.tasks.update(t.id, { done: !t.done }); load(); };
  const del = async (id) => { await api.tasks.delete(id); setConfirmDelete(null); load(); };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try { await api.tasks.create(form); setForm({ title: '', contact: '', due: '', priority: 'warm' }); setShowAdd(false); load(); }
    finally { setSaving(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'done') return t.done;
    if (filter === 'hot') return !t.done && t.priority === 'hot';
    return true;
  }).sort((a, b) => a.done - b.done);

  const pending = tasks.filter(t => !t.done).length;
  const urgent = tasks.filter(t => !t.done && t.priority === 'hot').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #1e1e1e', background: '#111', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Space Grotesk, system-ui', fontSize: 16, fontWeight: 600, color: '#fff' }}>
          Tarefas
          {pending > 0 && <span style={{ marginLeft: 8, background: '#F5C518', color: '#000', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{pending}</span>}
          {urgent > 0 && <span style={{ marginLeft: 6, background: '#2a0000', color: '#ff7777', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{urgent} urgente{urgent > 1 ? 's' : ''}</span>}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['all', 'Todas'], ['pending', 'Pendentes'], ['hot', 'Urgentes'], ['done', 'Concluídas']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, background: filter === val ? '#F5C518' : '#1a1a1a', color: filter === val ? '#000' : '#666', border: '1px solid ' + (filter === val ? '#F5C518' : '#2a2a2a'), cursor: 'pointer', fontWeight: filter === val ? 600 : 400 }}>{label}</button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <button onClick={() => setShowAdd(s => !s)} style={btnYellow}>+ Nova tarefa</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
        {showAdd && (
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={fLabel}>Título da tarefa</div>
                <input placeholder="Ex: Ligar para cliente" value={form.title} onChange={set('title')} onKeyDown={e => e.key === 'Enter' && save()} style={inputDark} />
              </div>
              <div>
                <div style={fLabel}>Contato</div>
                <input placeholder="Nome do contato" value={form.contact} onChange={set('contact')} style={inputDark} />
              </div>
              <div>
                <div style={fLabel}>Prazo</div>
                <input placeholder="Hoje, Amanhã, 25/04" value={form.due} onChange={set('due')} style={inputDark} />
              </div>
              <div>
                <div style={fLabel}>Prioridade</div>
                <select value={form.priority} onChange={set('priority')} style={inputDark}>
                  <option value="hot">Urgente</option>
                  <option value="warm">Normal</option>
                  <option value="cold">Baixa</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={save} disabled={saving} style={btnYellow}>{saving ? 'Salvando...' : 'Salvar tarefa'}</button>
              <button onClick={() => setShowAdd(false)} style={btnGhost}>Cancelar</button>
            </div>
          </div>
        )}

        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: '#333', fontSize: 13 }}>Nenhuma tarefa aqui</div>}

        {filtered.map(t => (
          <div key={t.id} style={{ background: '#111', border: '1px solid ' + (t.priority === 'hot' && !t.done ? '#2a1000' : '#1e1e1e'), borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, opacity: t.done ? 0.45 : 1 }}>
            <div onClick={() => toggle(t)} style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid ' + (t.done ? '#00e676' : '#333'), background: t.done ? '#00e676' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
              {t.done && <span style={{ fontSize: 11, color: '#000', fontWeight: 700 }}>✓</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#fff', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
              {(t.contact || t.due) && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{t.contact}{t.due ? ' · ' + t.due : ''}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: t.priority === 'hot' ? '#2a0000' : t.priority === 'warm' ? '#1e1800' : '#1a1a1a', color: priColor(t.priority) }}>{priLabel(t.priority)}</span>
              <button onClick={() => setConfirmDelete(t)} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#ff4444'}
                onMouseLeave={e => e.target.style.color = '#333'}>×</button>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div style={overlayStyle}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 24, width: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Excluir tarefa?</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>"{confirmDelete.title}" será excluída.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={btnGhost}>Cancelar</button>
              <button onClick={() => del(confirmDelete.id)} style={btnDanger}>Sim, excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const btnYellow = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const btnGhost = { background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' };
const btnDanger = { background: '#2a0000', color: '#ff7777', border: '1px solid #440000', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer' };
const inputDark = { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, marginBottom: 10, outline: 'none' };
const fLabel = { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 };
