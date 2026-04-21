import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z', exact: true },
  { to: '/pipeline', label: 'Pipeline', icon: 'M4 20V8m6 12V4m6 16v-8' },
  { to: '/contatos', label: 'Contatos', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 2-1.5 4.5L20 17l-1.5 4.5' },
  { to: '/tarefas', label: 'Tarefas', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { to: '/ads', label: 'Ads', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const ini = (n) => n?.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', overflow: 'hidden' }}>
      <aside style={{
        width: collapsed ? 56 : 200, background: '#111', borderRight: '1px solid #1e1e1e',
        display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.2s',
      }}>
        <div style={{ padding: collapsed ? '14px 10px' : '14px 16px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setCollapsed(c => !c)}>
          <div style={{ width: 28, height: 28, background: '#F5C518', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#000', flexShrink: 0 }}>C</div>
          {!collapsed && <span style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>CRM Pro</span>}
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map(({ to, label, icon, exact }) => (
            <NavLink key={to} to={to} end={exact} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '9px 16px' : '9px 16px',
              fontSize: 13, color: isActive ? '#F5C518' : '#777', textDecoration: 'none',
              borderLeft: `2px solid ${isActive ? '#F5C518' : 'transparent'}`,
              background: isActive ? '#1e1800' : 'transparent', transition: 'all 0.1s',
              whiteSpace: 'nowrap', overflow: 'hidden',
            })}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d={icon} />
              </svg>
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: collapsed ? '10px' : '12px', borderTop: '1px solid #1e1e1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1a1a1a', borderRadius: 8, padding: collapsed ? '6px' : '8px 10px', cursor: 'pointer' }} onClick={handleLogout} title="Sair">
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F5C518', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#000', flexShrink: 0 }}>
              {ini(user?.name)}
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: 10, color: '#444' }}>Sair</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
}
