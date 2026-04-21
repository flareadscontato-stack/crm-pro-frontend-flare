import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const STAGES = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado'];
const fmt = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR');

export default function Dashboard() {
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.deals.list(), api.tasks.list()])
      .then(([d, t]) => { setDeals(d); setTasks(t); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const totalVal = deals.reduce((s, d) => s + d.value, 0);
  const qualified = deals.filter(d => d.tag === 'Qualificado');
  const closed = deals.filter(d => d.stage === 4);
  const openDeals = deals.filter(d => d.stage < 4);
  const pendingTasks = tasks.filter(t => !t.done);
  const maxCount = Math.max(...STAGES.map((_, i) => deals.filter(d => d.stage === i).length), 1);
  const allHistory = [];
  deals.forEach(d => (d.history || []).forEach(h => allHistory.push({ ...h, dealName: d.name })));
  const recent = allHistory.slice(-5).reverse();
  const wonValue = closed.reduce((s, d) => s + d.value, 0);
  const convRate = deals.length > 0 ? Math.round((closed.length / deals.length) * 100) : 0;

  return (
    <div style={page}>
      <div style={topBar}>
        <div>
          <h1 style={pageTitle}>Dashboard</h1>
          <p style={pageSub}>Visão geral do seu comercial</p>
        </div>
        <button onClick={() => navigate('/pipeline')} style={btnYellow}>+ Novo negócio</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard label="Valor total pipeline" value={fmt(totalVal)} sub={deals.length + ' negócios'} accent="#F5C518" />
        <StatCard label="Receita fechada" value={fmt(wonValue)} sub={closed.length + ' fechados'} accent="#00e676" />
        <StatCard label="Taxa de conversão" value={convRate + '%'} sub={openDeals.length + ' em aberto'} accent="#AFA9EC" />
        <StatCard label="Tarefas pendentes" value={pendingTasks.length} sub="follow-ups" accent="#ff7777" urgent={pendingTasks.length > 3} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Panel title="Funil de vendas">
          {STAGES.map((s, i) => {
            const count = deals.filter(d => d.stage === i).length;
            const val = deals.filter(d => d.stage === i).reduce((a, d) => a + d.value, 0);
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={s} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#888' }}>{s}</span>
                  <span style={{ fontSize: 11, color: '#555' }}>{count} · {fmt(val)}</span>
                </div>
                <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: Math.max(pct, 5) + '%', height: '100%', background: i === 1 ? '#00e676' : i === 4 ? '#F5C518' : '#333', borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </Panel>

        <Panel title="Atividade recente">
          {recent.length === 0 && <p style={{ fontSize: 12, color: '#444' }}>Nenhuma atividade ainda</p>}
          {recent.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5C518', marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: '#ccc' }}>{h.text}</div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{h.dealName} · {h.date}</div>
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Panel title="Leads qualificados">
          {qualified.length === 0 && <p style={{ fontSize: 12, color: '#444' }}>Nenhum lead qualificado ainda</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {qualified.map(d => (
              <div key={d.id} onClick={() => navigate('/pipeline')} style={{ background: '#002a12', border: '1px solid #00451e', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#00e676' }}>{d.name}</div>
                <div style={{ fontSize: 10, color: '#009944', marginTop: 2 }}>{d.company} · {fmt(d.value)}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Tarefas urgentes">
          {pendingTasks.filter(t => t.priority === 'hot').length === 0 && <p style={{ fontSize: 12, color: '#444' }}>Nenhuma tarefa urgente</p>}
          {pendingTasks.filter(t => t.priority === 'hot').slice(0, 4).map(t => (
            <div key={t.id} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => navigate('/tarefas')}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444', marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: '#ccc' }}>{t.title}</div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{t.contact} · {t.due}</div>
              </div>
            </div>
          ))}
          <button onClick={() => navigate('/tarefas')} style={{ ...btnGhost, marginTop: 10, width: '100%', fontSize: 11 }}>Ver todas as tarefas</button>
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent, urgent }) {
  return (
    <div style={{ background: urgent ? '#1a0a0a' : '#111', border: '1px solid ' + (urgent ? '#440000' : '#1e1e1e'), borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }} />
      <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent, lineHeight: 1, marginBottom: 4, fontFamily: 'Space Grotesk, system-ui' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#444' }}>{sub}</div>
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

function Loader() {
  return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#444' }}>Carregando...</div>;
}

const page = { flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#0a0a0a' };
const topBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 };
const pageTitle = { fontFamily: 'Space Grotesk, system-ui', fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 };
const pageSub = { fontSize: 13, color: '#555' };
const btnYellow = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const btnGhost = { background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' };
