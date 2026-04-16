import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Star } from 'lucide-react';
import './Projects.css'; // Reuse container styles

export default function StarredPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="projects-page-container">
          <section className="projects-section-card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center', 
            padding: '6rem 2rem',
            minHeight: '60vh'
          }}>
            <div style={{
              width: 72,
              height: 72,
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <Star size={32} style={{ color: 'var(--accent-amber)' }} />
            </div>
            
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 600 }}>
              No starred items
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto', lineHeight: 1.5 }}>
              You haven't starred any projects or tasks yet. Click the star icon on important items to keep them easily accessible here.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
