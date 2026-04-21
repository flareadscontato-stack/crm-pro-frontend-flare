import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Ads() {
  const [status, setStatus] = useState({ meta: { connected: false }, google: { connected: false } });
  const [metaMetrics, setMetaMetrics] = useState(null);
  const [googleMetrics, setGoogleMetrics] = useState(null);
  const [metaForm, setMetaForm] = useState({ access_token: '', account_id: '' });
  const [showMetaForm, setShowMetaForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState('');
  const [error, setError] = useState('');

  const loadStatus = async () => {
    try {
      const s = await api.ads.status();
      setStatus(s);
      if (s.meta.connected) {
        try { const m = await api.ads.metaMetrics(); setMetaMetrics(m); } catch {}
      }
      if (s.google.connected) {
        try { const g = await api.ads.googleMetrics(); setGoogleMetrics(g); } catch {}
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { loadStatus(); }, []);

  const connectMeta = async () => {
    if (!metaForm.access_token || !metaForm.account_id) return;
    setConnecting('meta'); setError('');
    try {
      await api.ads.metaConnect(metaForm);
      setShowMetaForm(false);
      await loadStatus();
    } catch (e) { setError(e.message); } finally { setConnecting(''); }
  };

  const disconnectMeta = async () => {
    await api.ads.metaDisconnect();
    setMetaMetrics(null);
    loadStatus();
  };

  const connectGoogle = async () => {
    setConnecting('google');
    try {
      const { url } = await api.ads.googleAuthUrl();
      window.open(url, '_blank');
    } catch (e) { setError(e.message); } finally { setConnecting(''); }
  };

  const disconnectGoogle = async () => {
    await api.ads.googleDisconnect();
    setGoogleMetrics(null);
    loadStatus();
  };

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#444', fontSize: 13 }}>Carregando...</div>;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#0a0a0a' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Integração de Anúncios</h1>
        <p style={{ fontSize: 13, color: '#555' }}>Conecte Meta Ads e Google Ads para ver métricas e leads diretamente no CRM</p>
      </div>

      {error && <div style={{ background: '#2a0000', border: '1px solid #440000', borderRadius: 8, padding: '10px 14px', color: '#ff7777', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {/* META ADS */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: '#1877F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk' }}>f</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'Space Grotesk' }}>Meta Ads</div>
              <div style={{ fontSize: 10, color: '#555' }}>Facebook · Instagram</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 10, background: status.meta.connected ? '#002a12' : '#1a1a1a', color: status.meta.connected ? '#00e676' : '#555', fontWeight: 600 }}>
              {status.meta.connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {status.meta.connected && metaMetrics ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <MetricBox label="Leads (30d)" value={metaMetrics.leads} color="#00e676" />
                <MetricBox label="Custo por lead" value={`R$ ${metaMetrics.costPerLead}`} color="#F5C518" />
                <MetricBox label="Investimento" value={`R$ ${Number(metaMetrics.spend).toLocaleString('pt-BR')}`} />
                <MetricBox label="CTR" value={`${metaMetrics.ctr}%`} />
                <MetricBox label="Cliques" value={metaMetrics.clicks} />
                <MetricBox label="Impressões" value={Number(metaMetrics.impressions).toLocaleString('pt-BR')} />
              </div>
              <button onClick={disconnectMeta} style={btnDanger}>Desconectar Meta Ads</button>
            </>
          ) : showMetaForm ? (
            <div>
              <div style={fLabel}>Access Token</div>
              <input placeholder="EAAxxxxxxx..." value={metaForm.access_token} onChange={e => setMetaForm(f => ({ ...f, access_token: e.target.value }))} style={inputStyle} />
              <div style={fLabel}>Account ID</div>
              <input placeholder="act_123456789" value={metaForm.account_id} onChange={e => setMetaForm(f => ({ ...f, account_id: e.target.value }))} style={inputStyle} />
              <div style={{ fontSize: 11, color: '#555', marginBottom: 10, lineHeight: 1.5 }}>
                Obtenha o token em <span style={{ color: '#378ADD' }}>developers.facebook.com</span> → Graph API Explorer → Gerar token com permissão <code style={{ background: '#1a1a1a', padding: '1px 4px', borderRadius: 4, color: '#F5C518' }}>ads_read</code>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={connectMeta} disabled={connecting === 'meta'} style={btnYellow}>{connecting === 'meta' ? 'Conectando...' : 'Conectar'}</button>
                <button onClick={() => setShowMetaForm(false)} style={btnGhost}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 14, lineHeight: 1.6 }}>
                Conecte sua conta Meta Ads para importar métricas de campanhas e rastrear leads gerados pelos seus anúncios no Facebook e Instagram.
              </div>
              <button onClick={() => setShowMetaForm(true)} style={btnYellow}>Conectar Meta Ads</button>
            </div>
          )}
        </div>

        {/* GOOGLE ADS */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#4285F4', fontFamily: 'Space Grotesk', border: '1px solid #2a2a2a' }}>G</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'Space Grotesk' }}>Google Ads</div>
              <div style={{ fontSize: 10, color: '#555' }}>Search · Display · YouTube</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 10, background: status.google.connected ? '#002a12' : '#1a1a1a', color: status.google.connected ? '#00e676' : '#555', fontWeight: 600 }}>
              {status.google.connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {status.google.connected && googleMetrics ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <MetricBox label="Conversões (30d)" value={Math.round(googleMetrics.conversions)} color="#00e676" />
                <MetricBox label="Custo/conversão" value={`R$ ${googleMetrics.costPerConversion}`} color="#F5C518" />
                <MetricBox label="Investimento" value={`R$ ${Number(googleMetrics.spend).toLocaleString('pt-BR')}`} />
                <MetricBox label="CTR" value={`${googleMetrics.ctr}%`} />
                <MetricBox label="Cliques" value={Number(googleMetrics.clicks).toLocaleString('pt-BR')} />
                <MetricBox label="Campanhas" value={googleMetrics.campaigns} />
              </div>
              <button onClick={disconnectGoogle} style={btnDanger}>Desconectar Google Ads</button>
            </>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 10, lineHeight: 1.6 }}>
                Conecte via OAuth para importar métricas de campanhas do Google Ads. Você será redirecionado para autorizar o acesso.
              </div>
              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 6 }}>Antes de conectar, configure no .env:</div>
                {['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_DEVELOPER_TOKEN'].map(k => (
                  <div key={k} style={{ fontSize: 11, color: '#555', fontFamily: 'monospace', marginBottom: 2 }}>{k}=...</div>
                ))}
              </div>
              <button onClick={connectGoogle} disabled={connecting === 'google'} style={btnYellow}>{connecting === 'google' ? 'Abrindo OAuth...' : 'Conectar via Google'}</button>
            </div>
          )}
        </div>
      </div>

      <div style={panelStyle}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Como configurar as integrações</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#F5C518', marginBottom: 8 }}>Meta Ads</div>
            {['1. Acesse developers.facebook.com', '2. Crie um App → Graph API Explorer', '3. Gere um token com permissão ads_read', '4. Copie o ID da conta (act_XXXXXXX)', '5. Cole os dados acima e conecte'].map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: '#777', marginBottom: 4, display: 'flex', gap: 8 }}>
                <span style={{ color: '#F5C518', flexShrink: 0 }}>→</span>{s.slice(3)}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#4285F4', marginBottom: 8 }}>Google Ads</div>
            {['1. Acesse console.cloud.google.com', '2. Crie credenciais OAuth 2.0', '3. Ative a API do Google Ads', '4. Obtenha o Developer Token no Google Ads', '5. Configure o .env e conecte via OAuth'].map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: '#777', marginBottom: 4, display: 'flex', gap: 8 }}>
                <span style={{ color: '#4285F4', flexShrink: 0 }}>→</span>{s.slice(3)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, color }) {
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color || '#fff', fontFamily: 'Space Grotesk' }}>{value}</div>
    </div>
  );
}

const panelStyle = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 16 };
const btnYellow = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk' };
const btnGhost = { background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer' };
const btnDanger = { background: '#2a0000', color: '#ff7777', border: '1px solid #440000', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', width: '100%' };
const inputStyle = { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, marginBottom: 10, outline: 'none', fontFamily: 'DM Sans' };
const fLabel = { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 };
