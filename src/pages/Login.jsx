import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, Briefcase } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { employees, admins } = useAppData();
  
  const [userType, setUserType] = useState('employee'); // 'admin' or 'employee'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
console.log('Employees List:', employees);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Simulate brief network delay for dynamic UX feel
    setTimeout(() => {
      const result = login(email, password, employees, admins);
      setIsLoading(false);
      if (!result.success) {
        setError(result.error);
      }
    }, 800);
  };



  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(220, 225, 235, 0.1) 90.1%), hsl(var(--background))',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Orbs */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(255,255,255,0) 70%)',
        top: '-100px',
        right: '-100px',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%)',
        bottom: '-150px',
        left: '-150px',
        zIndex: 0
      }} />

      {/* Login Card */}
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-premium)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          zIndex: 10,
          border: '1px solid rgba(255, 255, 255, 0.6)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'hsl(var(--primary))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '16px'
            }}
          >
            <Briefcase size={28} color="white" />
          </div>
          <h2
            className="heading-font"
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'hsl(var(--foreground))',
              marginBottom: '6px'
            }}
          >
            Welcome back
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted))' }}>
            Sign in to access your WorkFlow workspace
          </p>
        </div>

        {/* User Type Tabs */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '8px',
          marginBottom: '24px',
          backgroundColor: 'hsl(var(--surface))',
          padding: '4px',
          borderRadius: 'var(--radius-md)'
        }}>
          <button
            type="button"
            onClick={() => {
              setUserType('employee');
              setError('');
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: userType === 'employee' ? 'hsl(var(--primary))' : 'transparent',
              color: userType === 'employee' ? 'white' : 'hsl(var(--muted-foreground))',
              transition: 'all 0.2s'
            }}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => {
              setUserType('admin');
              setError('');
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: userType === 'admin' ? 'hsl(var(--primary))' : 'transparent',
              color: userType === 'admin' ? 'white' : 'hsl(var(--muted-foreground))',
              transition: 'all 0.2s'
            }}
          >
            Admin
          </button>
        </div>

        {/* Error Callout */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'hsl(var(--danger-light))',
              border: '1px solid hsla(var(--danger), 0.2)',
              color: 'hsl(var(--danger-foreground))',
              fontSize: '0.88rem',
              fontWeight: 500,
              marginBottom: '20px'
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email/SGID Input */}
          <div>
            <label className="label-text">Email or SGID</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }}>
                <Mail size={18} />
              </span>
              <input
                type="text"
                placeholder={userType === 'admin' ? 'ADMIN001 or admin@company.com' : 'EMP101 or employee@company.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '44px' }}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="label-text" style={{ marginBottom: 0 }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted))' }}>
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'hsl(var(--muted))',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px 18px', height: '46px', marginTop: '4px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div 
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}
              />
            ) : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Local spinner animation keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
