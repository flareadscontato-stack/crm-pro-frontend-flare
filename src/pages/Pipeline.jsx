import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const STAGES = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado'];
const fmt = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR');

function tagStyle(t) {
  if (t === 'Qualificado') return { bg: '#002a12', color: '#00e676', label: 'Qualificado' };
  if (t === 'Quente') return { bg: '#2a0000', color: '#ff7777', label: 'Quente' };
  if (t === 'Morno') return { bg: '#1e1800', color: '#F5C518', label: 'Morno' };
  return { bg: '#1a1a1a', color: '#555', label: 'Frio' };
}

export default function Pipeline() {
  const [deals, setDeals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [histInput, setHistInput] = useState('');
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', value: '', stage: 0, tag: 'Qualificado', source: 'Orgânico' });
  const [saving, setSaving] = useState(false);

  const load = () => api.deals.list().then(setDeals);
  useEffect(() => { load(); }, []);

  const moveStage = async (id, stage) => {
    await api.deals.update(id, { stage });
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    await api.deals.addHistory(id, `Movido para ${STAGES[stage]}`);
    await load();
    if (selected?.id === id) {
      const updated = (await api.deals.list()).find(d => d.id === id);
      setSelected(updated);
    }
  };

  const addHistory = async () => {
    if (!histInput.trim() || !selected) return;
    await api.deals.addHistory(selected.id, histInput.trim());
    setHistInput('');
    const updated = (await api.deals.list()).find(d => d.id === selected.id);
    setSelected(updated);
    load();
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
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 12, background: '#111' }}>
        <span style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600, flex: 1, color: '#fff' }}>Pipeline de Vendas</span>
        <button onClick={() => setShowAdd(true)} style={btnYellow}>+ Novo negócio</button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 10, padding: '14px 16px', overflowX: 'auto', overflowY: 'hidden' }}>
        {STAGES.map((stage, si) => {
          const stageDeals = deals.filter(d => d.stage === si);
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
                {stageDeals.length === 0 && <div style={{ fontSize: 11, color: '#333', textAlign: 'center', padding: '16px 0' }}>vazio</div>}
                {stageDeals.map(d => {
                  const ts = tagStyle(d.tag);
                  const pct = Math.min(Math.round((d.value / 60000) * 100), 100);
                  return (
                    <div key={d.id} onClick={() => setSelected(d)} style={{ background: '#111', border: `1px solid ${selected?.id === d.id ? '#F5C518' : '#1e1e1e'}`, borderRadius: 10, padding: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>{d.company}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#F5C518' }}>{fmt(d.value)}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: ts.bg, color: ts.color }}>{ts.label}</span>
                      </div>
                      <div style={{ height: 2, background: '#1a1a1a', borderRadius: 2, marginTop: 8 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#F5C518', borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <Drawer title={selected.name} onClose={() => setSelected(null)}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {(() => { const ts = tagStyle(selected.tag); return <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 10, background: ts.bg, color: ts.color }}>{ts.label}</span>; })()}
            <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 10, background: '#1a1a1a', color: '#555' }}>{selected.source}</span>
          </div>
          <DField label="Valor" value={fmt(selected.value)} accent="#F5C518" />
          <DField label="E-mail" value={selected.email || '—'} />
          <DField label="Telefone" value={selected.phone || '—'} />
          <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Mover para</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
            {STAGES.map((s, i) => (
              <button key={s} onClick={() => moveStage(selected.id, i)} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, background: i === selected.stage ? '#1e1800' : '#1a1a1a', color: i === selected.stage ? '#F5C518' : '#666', border: `1px solid ${i === selected.stage ? '#F5C518' : '#2a2a2a'}`, cursor: 'pointer', transition: 'all 0.1s' }}>{s}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Histórico</div>
          {(selected.history || []).map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F5C518', marginTop: 6, flexShrink: 0 }} />
              <div><div style={{ fontSize: 12, color: '#ccc' }}>{h.text}</div><div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{h.date}</div></div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <input value={histInput} onChange={e => setHistInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHistory()} placeholder="Adicionar nota..." style={{ flex: 1, ...inputStyle }} />
            <button onClick={addHistory} style={{ ...btnYellow, padding: '0 14px' }}>+</button>
          </div>
        </Drawer>
      )}

      {showAdd && (
        <Drawer title="Novo negócio" onClose={() => setShowAdd(false)}>
          {[['Nome', 'name', 'text', 'Nome do contato'], ['Empresa', 'company', 'text', 'Empresa'], ['E-mail', 'email', 'email', 'email@empresa.com'], ['Telefone', 'phone', 'text', '(48) 99999-9999'], ['Valor (R$)', 'value', 'number', '0']].map(([label, key, type, ph]) => (
            <div key={key}>
              <div style={fLabel}>{label}</div>
              <input type={type} placeholder={ph} value={form[key]} onChange={set(key)} style={inputStyle} />
            </div>
          ))}
          <div style={fLabel}>Etapa</div>
          <select value={form.stage} onChange={set('stage')} style={selectStyle}>
            {STAGES.map((s, i) => <option key={i} value={i}>{s}</option>)}
          </select>
          <div style={fLabel}>Status</div>
          <select value={form.tag} onChange={set('tag')} style={selectStyle}>
            {['Qualificado', 'Quente', 'Morno', 'Frio'].map(t => <option key={t}>{t}</option>)}
          </select>
          <div style={fLabel}>Origem</div>
          <select value={form.source} onChange={set('source')} style={selectStyle}>
            {['Meta Ads', 'Google Ads', 'Orgânico', 'Indicação'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={saveDeal} disabled={saving} style={{ ...btnYellow, width: '100%', marginTop: 8 }}>{saving ? 'Salvando...' : 'Adicionar negócio'}</button>
        </Drawer>
      )}
    </div>
  );
}

function Drawer({ title, onClose, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ background: '#111', borderLeft: '1px solid #1e1e1e', width: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#111', zIndex: 1 }}>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 600, color: '#fff' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

function DField({ label, value, accent }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={fLabel}>{label}</div>
      <div style={{ fontSize: 13, color: accent || '#ccc' }}>{value}</div>
    </div>
  );
}

const btnYellow = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk' };
const inputStyle = { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, marginBottom: 10, outline: 'none', fontFamily: 'DM Sans' };
const selectStyle = { ...inputStyle, cursor: 'pointer' };
const fLabel = { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 };
