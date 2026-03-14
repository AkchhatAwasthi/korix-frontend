import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { authService } from '../api/auth';
import './Login.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="auth-layout">
      <div className="login-card-container">
        <div className="login-brand">
          <div className="brand-logo">
            <Sparkles size={28} color="var(--accent-blue)" />
          </div>
          <h2 className="brand-name">Korix <span className="text-gradient">AI</span></h2>
        </div>

        <div className="card login-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          {status === 'loading' && <p>{message}</p>}
          {status === 'success' && (
            <>
              <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 1.5rem auto' }} />
              <h3 style={{ marginBottom: '1rem', color: '#10B981' }}>Success</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{message}</p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Go to Login <ArrowRight size={16} />
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle size={48} color="#EF4444" style={{ margin: '0 auto 1.5rem auto' }} />
              <h3 style={{ marginBottom: '1rem', color: '#EF4444' }}>Verification Failed</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{message}</p>
              <Link to="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Return to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
