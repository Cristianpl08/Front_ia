import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Menu from './components/Menu';
import TextToSpeechForm from './components/TextToSpeechForm';
import TranscripIADicapta from './components/TranscripIA';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="App">
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/menu" replace />
            ) : (
              <LoginWrapper setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Menu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/text-to-speech"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TextToSpeechFormWithBack />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transcrip-ia-dicapta"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TranscripIADicaptaWithBack />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/menu" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
    </div>
  );
}

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Wrapper para Login para manejar éxito en login
import { useNavigate } from 'react-router-dom';
const LoginWrapper = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/menu');
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
};

// Botón para volver al menú con estilo reutilizando tu clase CSS (sin estilos inline)
const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      className="clean-btn"
      onClick={() => navigate('/menu')}
      style={{ display: 'block', margin: '20px auto', cursor: 'pointer' }}
    >
      ← Volver al Menú
    </button>
  );
};

// Componente TextToSpeech con botón para volver al menú
const TextToSpeechFormWithBack = () => (
  <>
    <BackButton />
    <TextToSpeechForm />
  </>
);

// Componente TranscripIADicapta con botón para volver al menú
const TranscripIADicaptaWithBack = () => (
  <>
    <BackButton />
    <TranscripIADicapta />
  </>
);

export default App;
