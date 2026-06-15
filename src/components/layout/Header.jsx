import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ setIsMobileOpen }) => {
  const { currentUser } = useAuth();
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'System Overview';
      case '/employees':
        return 'Employee Directory';
      case '/attendance':
        return 'Attendance Logs';
      case '/tasks':
        return 'Daily Task Management';
      case '/departments':
        return 'Department Management';
      case '/reports':
        return 'Reports & Analytics';
      case '/profile':
        return 'My Profile';
      default:
        return 'WorkFlow';
    }
  };

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: 'hsl(var(--card))',
        borderBottom: '1px solid hsl(var(--border))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Title & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          className="btn-icon"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          style={{ display: 'none' }}
          id="sidebar-toggle"
        >
          <Menu size={20} />
        </button>

        <h2
          className="heading-font animate-fade-in"
          key={location.pathname} // Forces fade-in animation trigger on route changes
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'hsl(var(--foreground))'
          }}
        >
          {getPageTitle()}
        </h2>
      </div>

      {/* Date & Time Widget + Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Time and Date */}
        <div
          className="header-datetime"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '0.85rem',
            color: 'hsl(var(--muted))',
            fontWeight: 500,
            backgroundColor: 'hsl(var(--muted-light))',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} style={{ color: 'hsl(var(--primary))' }} />
            <span>{formatDate(time)}</span>
          </div>
          <div style={{ width: '1px', height: '14px', backgroundColor: 'hsl(var(--border))' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} style={{ color: 'hsl(var(--primary))' }} />
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatTime(time)}</span>
          </div>
        </div>

        {/* Notifications and Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn-icon"
            style={{ position: 'relative' }}
            title="System Notifications"
          >
            <Bell size={20} />
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'hsl(var(--danger))'
              }}
            />
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'hsl(var(--border))' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'hsl(var(--primary-light))',
                color: 'hsl(var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid hsla(var(--primary), 0.15)'
              }}
            >
              {currentUser?.name ? currentUser.name.split(' ').map(n=>n[0]).join('') : 'U'}
            </div>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'hsl(var(--foreground))'
              }}
              className="header-username"
            >
              {currentUser?.name}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle {
            display: inline-flex !important;
          }
          .header-datetime {
            display: none !important;
          }
          .header-username {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
