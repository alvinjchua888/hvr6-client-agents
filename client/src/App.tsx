import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Jobs from './pages/Jobs';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/jobs" element={<Jobs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
