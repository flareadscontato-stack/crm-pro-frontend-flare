import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const STAGES = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado'];
const fmt = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR');
const ini = (n) => (n || '').split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase();

function tagStyle(t) {
  if (t === 'Qualificado') return { bg: '#002a12', color: '#00e676' };
  if (t === 'Quente') return { bg: '#2a0000', color: '#ff7777' };
  if (t === 'Morno') return { bg: '#1e1800', color: '#F5C518' };
  return { bg: '#1a1a1a', color: '#555' };
}

export default function Pipeline() {
  const [deals, setDeals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [histInput, setHistInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', value: '', stage: 0, tag: 'Qualificado', source: 'Orgânico' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => api.deals.list().then(setDeals);
  useEffect(() => { load(); }, []);

  const filtered = deals.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.company.toLowerCase().includes(search.toLowerCase());
    const matchTag = !filterTag || d.tag === filterTag;
    return matchSearch && matchTag;
  });

  const moveStage = async (id, stage) => {
    await api.deals.update(id, { stage });
    await api.deals.addHistory(id, 'Movido para ' + STAGES[stage]);
    await load();
    const updated = (await api.deals.list()).find(d => d.id === id);
    if (selected?.id === id) setSelected(updated);
  };

  const deleteDeal = async (id) => {
    await api.deals.delete(id);
    setConfirmDelete(null);
    setSelected(null);
    load();
  };

  const addHistory = async () => {
    if (!histInput.trim() || !selected) return;
    await api.deals.addHistory(selected.id, histInput.trim());
    setHistInput('');
    const list = await api.deals.list();
    const updated = list.find(d => d.id === selected.id);
    setSelected(updated);
    setDeals(list);
  };

  const saveDeal = async () => {
    if (!form.name || !form.company) return;
    setSaving(true);
    try {
      await api.deals.create({ ...form, value: parseFloat(form.value) || 0, stage: parseInt(form.stage) });
      setShowAdd(false);
      setForm({ name: '', company: '', email: '', phone: '', value: '', stage: 0, tag: 'Qualificado', source: 'Orgânico' });
      load();
    } finally { setSaving(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 10, background: '#111', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Space Grotesk, system-ui', fontSize: 16, fontWeight: 600, color: '#fff', marginRight: 4 }}>Pipeline</span>
        <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={inputSm} />
        <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={inputSm}>
          <option value="">Todos</option>
          {['Qualificado', 'Quente', 'Morno', 'Frio'].map(t => <option key={t}>{t}</option>)}
        </select>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#555' }}>{filtered.length} negócios</span>
        <button onClick={() => setShowAdd(true)} style={btnYellow}>+ Novo negócio</button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 10, padding: '14px 16px', overflowX: 'auto', overflowY: 'hidden' }}>
        {STAGES.map((stage, si) => {
          const stageDeals = filtered.filter(d => d.stage === si);
          const stageVal = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={si} style={{ minWidth: 210, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage}</div>
                  <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{fmt(stageVal)}</div>
                </div>
                <span style={{ background: '#1a1a1a', borderRadius: 10, padding: '1px 7px', fontSize: 10, color: '#555' }}>{stageDeals.length}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stageDeals.length === 0 && <div style={{ fontSize: 11, color: '#2a2a2a', textAlign: 'center', padding: '20px 0', border: '1px dashed #1e1e1e', borderRadius: 8 }}>vazio</div>}
                {stageDeals.map(d => {
                  const ts = tagStyle(d.tag);
                  return (
                    <div key={d.id} onClick={() => setSelected(d)} style={{ background: '#111', border: '1px solid ' + (selected?.id === d.id ? '#F5C518' : '#1e1e1e'), borderRadius: 10, padding: 10, cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' }}
                      onMouseEnter={e => { if (selected?.id !== d.id) e.currentTarget.style.borderColor = '#2a2a2a'; }}
                      onMouseLeave={e => { if (selected?.id !== d.id) e.currentTarget.style.borderColor = '#1e1e1e'; }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{d.name}</div>
                        <button onClick={e => { e.stopPropagation(); setConfirmDelete(d); }} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px', borderRadius: 4 }}
                          onMouseEnter={e => e.target.style.color = '#ff4444'}
                          onMouseLeave={e => e.target.style.color = '#333'}>×</button>
                      </div>
                      <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>{d.company}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#F5C518' }}>{fmt(d.value)}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: ts.bg, color: ts.color }}>{d.tag}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#333', marginTop: 6 }}>{d.source} · {d.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {confirmDelete && (
        <div style={overlayStyle}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 24, width: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Excluir negócio?</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>"{confirmDelete.name}" será excluído permanentemente.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={btnGhost}>Cancelar</button>
              <button onClick={() => deleteDeal(confirmDelete.id)} style={btnDanger}>Sim, excluir</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <Drawer title={selected.name} onClose={() => setSelected(null)}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e1800', color: '#F5C518', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{ini(selected.name)}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{selected.company}</div>
            </div>
            <button onClick={() => setConfirmDelete(selected)} style={{ marginLeft: 'auto', background: '#2a0000', border: '1px solid #440000', borderRadius: 8, color: '#ff7777', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>Excluir</button>
          </div>

          <div style={{ background: '#1a1a1a', borderRadius: 10, padding: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#F5C518', marginBottom: 4, fontFamily: 'Space Grotesk, system-ui' }}>{fmt(selected.value)}</div>
            <div style={{ fontSize: 11, color: '#555' }}>{selected.source} · {selected.date}</div>
          </div>

          <DField label="E-mail" value={selected.email || '—'} />
          <DField label="Telefone" value={selected.phone || '—'} />

          <div style={fLabel}>Mover etapa</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
            {STAGES.map((s, i) => (
              <button key={s} onClick={() => moveStage(selected.id, i)} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, background: i === selected.stage ? '#1e1800' : '#1a1a1a', color: i === selected.stage ? '#F5C518' : '#555', border: '1px solid ' + (i === selected.stage ? '#F5C518' : '#2a2a2a'), cursor: 'pointer' }}>{s}</button>
            ))}
          </div>

          <div style={fLabel}>Histórico</div>
          <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 10 }}>
            {(selected.history || []).map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F5C518', marginTop: 6, flexShrink: 0 }} />
                <div><div style={{ fontSize: 12, color: '#ccc' }}>{h.text}</div><div style={{ fontSize: 10, color: '#444', marginTop: 1 }}>{h.date}</div></div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={histInput} onChange={e => setHistInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHistory()} placeholder="Adicionar nota..." style={{ flex: 1, ...inputDark }} />
            <button onClick={addHistory} style={btnYellow}>+</button>
          </div>
        </Drawer>
      )}

      {showAdd && (
        <Drawer title="Novo negócio" onClose={() => setShowAdd(false)}>
          {[['Nome', 'name', 'text', 'Nome do contato'], ['Empresa', 'company', 'text', 'Empresa'], ['E-mail', 'email', 'email', 'email@empresa.com'], ['Telefone', 'phone', 'text', '(48) 99999-9999'], ['Valor (R$)', 'value', 'number', '0']].map(([label, key, type, ph]) => (
            <div key={key}><div style={fLabel}>{label}</div><input type={type} placeholder={ph} value={form[key]} onChange={set(key)} style={inputDark} /></div>
          ))}
          <div style={fLabel}>Etapa</div>
          <select value={form.stage} onChange={set('stage')} style={inputDark}>{STAGES.map((s, i) => <option key={i} value={i}>{s}</option>)}</select>
          <div style={fLabel}>Status</div>
          <select value={form.tag} onChange={set('tag')} style={inputDark}>{['Qualificado', 'Quente', 'Morno', 'Frio'].map(t => <option key={t}>{t}</option>)}</select>
          <div style={fLabel}>Origem</div>
          <select value={form.source} onChange={set('source')} style={inputDark}>{['Meta Ads', 'Google Ads', 'Orgânico', 'Indicação'].map(s => <option key={s}>{s}</option>)}</select>
          <button onClick={saveDeal} disabled={saving} style={{ ...btnYellow, width: '100%', marginTop: 8, padding: '10px' }}>{saving ? 'Salvando...' : 'Adicionar negócio'}</button>
        </Drawer>
      )}
    </div>
  );
}

function Drawer({ title, onClose, children }) {
  return (
    <div style={overlayStyle}>
      <div style={{ background: '#111', borderLeft: '1px solid #1e1e1e', width: 360, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#111', zIndex: 1 }}>
          <span style={{ fontFamily: 'Space Grotesk, system-ui', fontSize: 14, fontWeight: 600, color: '#fff' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

function DField({ label, value }) {
  return <div style={{ marginBottom: 12 }}><div style={fLabel}>{label}</div><div style={{ fontSize: 13, color: '#ccc' }}>{value}</div></div>;
}

const overlayStyle = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' };
const btnYellow = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const btnGhost = { background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' };
const btnDanger = { background: '#2a0000', color: '#ff7777', border: '1px solid #440000', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' };
const inputDark = { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, marginBottom: 10, outline: 'none' };
const inputSm = { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 12, outline: 'none' };
const fLabel = { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 };
