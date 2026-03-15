import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsService } from '../api/projects';
import { CheckCircle, XCircle } from 'lucide-react';
import './Login.css';

export default function JoinProject() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'unauth'>('loading');
  const [message, setMessage] = useState('Processing your invitation...');

  useEffect(() => {
    if (token) {
      localStorage.setItem('pending_invite_token', token);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    const currentToken = token || localStorage.getItem('pending_invite_token');

    if (!currentToken) {
      setStatus('error');
      setMessage('No invitation token was found in the link.');
      return;
    }

    if (!isAuthenticated) {
      setStatus('unauth');
      return;
    }

    const accept = async () => {
      try {
        const data = await projectsService.acceptInvite(currentToken);
        localStorage.removeItem('pending_invite_token');
        setStatus('success');
        setMessage(data.message || 'You have successfully joined the project!');
        setTimeout(() => {
          if (data.projectId) {
            navigate(`/projects/${data.projectId}`);
          } else {
            navigate('/dashboard');
          }
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Failed to accept invitation. It might have expired.');
        localStorage.removeItem('pending_invite_token'); 
      }
    };
    
    accept();
  }, [token, isAuthenticated, authLoading, navigate]);

  return (
    <div className="auth-layout">
      <div className="login-card-container">
        <div className="card login-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          {status === 'loading' && <p>{message}</p>}
          
          {status === 'success' && (
            <>
              <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 1.5rem auto' }} />
              <h3 style={{ marginBottom: '1rem', color: '#10B981' }}>Success</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{message}</p>
              <p>Redirecting you to the project...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle size={48} color="#EF4444" style={{ margin: '0 auto 1.5rem auto' }} />
              <h3 style={{ marginBottom: '1rem', color: '#EF4444' }}>Invitation Failed</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{message}</p>
              <Link to="/dashboard" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Go back to Dashboard
              </Link>
            </>
          )}

          {status === 'unauth' && (
            <>
              <h3 style={{ marginBottom: '1rem' }}>Almost there!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                You've been invited to a project, but you need to log in or register an account first.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/login" className="btn btn-accent">Login</Link>
                <Link to="/register" className="btn btn-outline">Register</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
