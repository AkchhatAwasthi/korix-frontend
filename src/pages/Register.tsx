import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Sparkles, UserPlus } from 'lucide-react';
import { authService } from '../api/auth';
import './Login.css'; // Re-use the flawless login styles

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  React.useEffect(() => {
    if (token) {
      localStorage.setItem('pending_invite_token', token);
    }
  }, [token]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.register({ name, email, password });
      
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="login-card-container">
        <div className="login-brand">
          <div className="brand-logo">
            <Sparkles size={28} color="var(--accent-blue)" />
          </div>
          <h2 className="brand-name">Join Korix</h2>
          <p className="brand-subtitle">Create your orchestrator workspace.</p>
        </div>

        <div className="card login-card">
          <form onSubmit={handleRegister} className="login-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="input-group">
              <label htmlFor="name" className="input-label">Full Name</label>
              <input 
                id="name" 
                type="text" 
                className="input-field" 
                placeholder="Ada Lovelace" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email" className="input-label">Email Address</label>
              <input 
                id="email" 
                type="email" 
                className="input-field" 
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <div className="label-wrapper">
                <label htmlFor="password" className="input-label">Password</label>
              </div>
              <input 
                id="password" 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
              {!loading && <UserPlus size={16} />}
            </button>
          </form>
          
          <div className="login-footer">
            <p className="footer-text">
              Already have an account? <Link to="/login" className="register-link">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
