import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const NAV_ITEMS = [
  { to: '/home', label: 'Home' },
  { to: '/nearby', label: 'Nearby' },
  { to: '/activity', label: 'Activity' },
  { to: '/notifications', label: 'Alerts' },
  { to: '/profile', label: 'Profile' }
];

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    api.get('/notifications')
      .then((data) => {
        if (active) setUnreadCount(data.filter((n) => !n.is_read).length);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <>
      {/* Desktop top nav — floating liquid-glass pill over the dark app background */}
      <header className="hidden md:flex items-center justify-between px-6 py-5 sticky top-0 z-30">
        <button onClick={() => navigate('/home')} className="flex items-center gap-2 font-display font-extrabold text-lg text-white">
          <span className="text-xl"></span> NeighborSOS
        </button>

        <nav className="liquid-glass nav-pill">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `relative nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
              {item.to === '/notifications' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-coral text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="text-sm font-medium text-white/60 hover:text-coral transition-colors"
        >
          Log out
        </button>
      </header>

      {/* Mobile bottom nav — glass bar pinned to the bottom */}
      <nav className="liquid-glass md:hidden fixed bottom-3 left-3 right-3 rounded-2xl flex items-center justify-around py-2 z-30">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${
                isActive ? 'text-white' : 'text-white/40'
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
            {item.to === '/notifications' && unreadCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-coral" />
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
