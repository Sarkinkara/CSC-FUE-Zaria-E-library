import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseMaterials from './pages/CourseMaterials';
import Compiler from './pages/Compiler';
import Discussion from './pages/Discussion';
import HistoryAndStaff from './pages/HistoryAndStaff';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><CourseMaterials /></PrivateRoute>} />
            <Route path="/compiler" element={<PrivateRoute><Compiler /></PrivateRoute>} />
            <Route path="/discussion" element={<PrivateRoute><Discussion /></PrivateRoute>} />
            <Route path="/about" element={<HistoryAndStaff />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;