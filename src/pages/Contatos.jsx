import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const STAGES = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado'];
const fmt = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR');
const AV_COLORS = [
  { bg: '#1e1800', color: '#F5C518' },
  { bg: '#002a12', color: '#00e676' },
  { bg: '#2a0000', color: '#ff7777' },
  { bg: '#1a1060', color: '#AFA9EC' },
];

function tagStyle(t) {
  if (t === 'Qualificado') return { bg: '#002a12', color: '#00e676' };
  if (t === 'Quente') return { bg: '#2a0000', color: '#ff7777' };
  if (t === 'Morno') return { bg: '#1e1800', color: '#F5C518' };
  return { bg: '#1a1a1a', color: '#555' };
}

function ini(n) { return (n || '').split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase(); }

export default function Contatos() {
  const [deals, setDeals] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { api.deals.list().then(setDeals); }, []);

  const filtered = deals.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 12, background: '#111' }}>
        <span style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600, flex: 1, color: '#fff' }}>Contatos</span>
        <input
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '7px 12px', color: '#fff', fontSize: 13, width: 200, outline: 'none', fontFamily: 'DM Sans' }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#444', fontSize: 13 }}>Nenhum contato encontrado</div>
        )}
        {filtered.map((d, i) => {
          const av = AV_COLORS[i % AV_COLORS.length];
          const ts = tagStyle(d.tag);
          return (
            <div key={d.id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6, transition: 'border-color 0.15s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
            >
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, border: `1px solid ${av.color}22` }}>
                {ini(d.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{d.name}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{d.company} · {d.source}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: ts.bg, color: ts.color }}>{d.tag}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#666' }}>{STAGES[d.stage]}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#F5C518', marginTop: 2 }}>{fmt(d.value)}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 120 }}>
                <div style={{ fontSize: 11, color: '#378ADD' }}>{d.email}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{d.phone}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
