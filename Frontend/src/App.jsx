// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import Stake from './pages/Stake';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stake" element={<Stake />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
