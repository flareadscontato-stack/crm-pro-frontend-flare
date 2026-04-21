import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const STAGES = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado'];
const fmt = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR');
const ini = (n) => (n || '').split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase();
const AV = [{ bg: '#1e1800', color: '#F5C518' }, { bg: '#002a12', color: '#00e676' }, { bg: '#2a0000', color: '#ff7777' }, { bg: '#1a1060', color: '#AFA9EC' }];

function tagStyle(t) {
  if (t === 'Qualificado') return { bg: '#002a12', color: '#00e676' };
  if (t === 'Quente') return { bg: '#2a0000', color: '#ff7777' };
  if (t === 'Morno') return { bg: '#1e1800', color: '#F5C518' };
  return { bg: '#1a1a1a', color: '#555' };
}

export default function Contatos() {
  const [deals, setDeals] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = () => api.deals.list().then(setDeals);
  useEffect(() => { load(); }, []);

  const filtered = deals.filter(d => {
    const ms = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.company.toLowerCase().includes(search.toLowerCase()) || (d.email || '').toLowerCase().includes(search.toLowerCase());
    const mt = !filterTag || d.tag === filterTag;
    const mst = !filterStage || d.stage === parseInt(filterStage);
    return ms && mt && mst;
  });

  const deleteDeal = async (id) => {
    await api.deals.delete(id);
    setConfirmDelete(null);
    setSelected(null);
    load();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #1e1e1e', background: '#111', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Space Grotesk, system-ui', fontSize: 16, fontWeight: 600, color: '#fff' }}>Contatos</span>
        <input placeholder="Buscar nome, empresa, email..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputSm, width: 220 }} />
        <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={inputSm}>
          <option value="">Todos os status</option>
          {['Qualificado', 'Quente', 'Morno', 'Frio'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={inputSm}>
          <option value="">Todas as etapas</option>
          {STAGES.map((s, i) => <option key={i} value={i}>{s}</option>)}
        </select>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#555' }}>{filtered.length} contatos</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: '#333', fontSize: 13 }}>Nenhum contato encontrado</div>}
        {filtered.map((d, i) => {
          const av = AV[i % AV.length];
          const ts = tagStyle(d.tag);
          return (
            <div key={d.id} onClick={() => setSelected(d)} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6, cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{ini(d.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{d.name}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{d.company} · {d.source}</div>
              </div>
              <div style={{ fontSize: 11, color: '#378ADD', minWidth: 160, display: 'none' }}>{d.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: ts.bg, color: ts.color }}>{d.tag}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#555' }}>{STAGES[d.stage]}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#F5C518', marginTop: 2 }}>{fmt(d.value)}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); setConfirmDelete(d); }} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, color: '#555', cursor: 'pointer', fontSize: 12, padding: '4px 8px', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.target.style.background = '#2a0000'; e.target.style.color = '#ff7777'; e.target.style.borderColor = '#440000'; }}
                  onMouseLeave={e => { e.target.style.background = '#1a1a1a'; e.target.style.color = '#555'; e.target.style.borderColor = '#2a2a2a'; }}>
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div style={overlayStyle} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 24, width: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Space Grotesk, system-ui', fontSize: 15, fontWeight: 600, color: '#fff' }}>Detalhes do contato</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            {[['Nome', selected.name], ['Empresa', selected.company], ['E-mail', selected.email || '—'], ['Telefone', selected.phone || '—'], ['Etapa', STAGES[selected.stage]], ['Origem', selected.source]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ fontSize: 12, color: '#555' }}>{l}</span>
                <span style={{ fontSize: 12, color: '#ccc' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
              <span style={{ fontSize: 12, color: '#555' }}>Valor</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F5C518' }}>{fmt(selected.value)}</span>
            </div>
            <button onClick={() => { setConfirmDelete(selected); setSelected(null); }} style={{ ...btnDanger, width: '100%', marginTop: 14, padding: '10px' }}>Excluir contato</button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={overlayStyle}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 24, width: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Excluir contato?</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>"{confirmDelete.name}" e todo o histórico serão excluídos permanentemente.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={btnGhost}>Cancelar</button>
              <button onClick={() => deleteDeal(confirmDelete.id)} style={btnDanger}>Sim, excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const inputSm = { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 12, outline: 'none' };
const btnGhost = { background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer' };
const btnDanger = { background: '#2a0000', color: '#ff7777', border: '1px solid #440000', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer' };
