import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const STAGES = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado'];
const fmt = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR');

export default function Dashboard() {
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.deals.list(), api.tasks.list()])
      .then(([d, t]) => { setDeals(d); setTasks(t); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  const totalVal = deals.reduce((s, d) => s + d.value, 0);
  const qualified = deals.filter(d => d.tag === 'Qualificado');
  const closed = deals.filter(d => d.stage === 4).length;
  const openDeals = deals.filter(d => d.stage < 4).length;
  const pendingTasks = tasks.filter(t => !t.done).length;

  const maxCount = Math.max(...STAGES.map((_, i) => deals.filter(d => d.stage === i).length), 1);

  const allHistory = [];
  deals.forEach(d => (d.history || []).forEach(h => allHistory.push({ ...h, dealName: d.name })));
  const recent = allHistory.slice(-6).reverse();

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#0a0a0a' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#555' }}>Visão geral do seu comercial</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatCard label="Valor total" value={`R$ ${Math.round(totalVal / 1000)}k`} delta="+12% vs mês anterior" deltaUp accent="#F5C518" />
        <StatCard label="Qualificados" value={qualified.length} delta="leads prontos para fechar" deltaUp accent="#00e676" />
        <StatCard label="Em aberto" value={openDeals} delta="no pipeline" accent="#AFA9EC" />
        <StatCard label="Tarefas abertas" value={pendingTasks} delta="pendentes" accent="#ff7777" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <Panel title="Pipeline por etapa">
          {STAGES.map((s, i) => {
            const count = deals.filter(d => d.stage === i).length;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ width: 88, fontSize: 11, color: '#666', textAlign: 'right', flexShrink: 0 }}>{s}</span>
                <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 3, height: 20, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(pct, 12)}%`, height: '100%', background: i === 1 ? '#00e676' : '#F5C518', borderRadius: 3, display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: 10, fontWeight: 600, color: '#000' }}>
                    {count}
                  </div>
                </div>
              </div>
            );
          })}
        </Panel>
        <Panel title="Atividade recente">
          {recent.length === 0 && <p style={{ fontSize: 12, color: '#444' }}>Nenhuma atividade ainda</p>}
          {recent.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#F5C518', marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: '#ddd' }}>{h.text}</div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{h.dealName} · {h.date}</div>
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <Panel title="Leads qualificados">
        {qualified.length === 0 && <p style={{ fontSize: 12, color: '#444' }}>Nenhum lead qualificado ainda — mova um negócio para "Qualificado" no pipeline</p>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {qualified.map(d => (
            <div key={d.id} style={{ background: '#002a12', border: '1px solid #004a22', borderRadius: 8, padding: '8px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#00e676' }}>{d.name}</div>
              <div style={{ fontSize: 10, color: '#009944', marginTop: 2 }}>{d.company} · {fmt(d.value)}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function StatCard({ label, value, delta, deltaUp, accent }) {
  return (
    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 14, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }} />
      <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Grotesk', color: accent, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: deltaUp ? '#00a04a' : '#555' }}>{delta}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ fontSize: 13, color: '#444' }}>Carregando...</div>
    </div>
  );
}
