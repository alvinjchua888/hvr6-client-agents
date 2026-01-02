import { Link, useLocation } from 'react-router-dom';
import { Activity, Users, PlayCircle, BarChart3 } from 'lucide-react';
import './Header.css';

export default function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-brand">
            <Activity size={32} />
            <div>
              <h1>HVR 6.0</h1>
              <p>SAP Data Replication</p>
            </div>
          </div>
          
          <nav className="header-nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <BarChart3 size={20} />
              Dashboard
            </Link>
            <Link 
              to="/agents" 
              className={`nav-link ${isActive('/agents') ? 'active' : ''}`}
            >
              <Users size={20} />
              Agents
            </Link>
            <Link 
              to="/jobs" 
              className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
            >
              <PlayCircle size={20} />
              Jobs
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
