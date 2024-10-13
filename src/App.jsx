import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import TextToSpeechForm from './components/TextToSpeechForm'; // Importa el formulario

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación

  // Función para manejar el inicio de sesión exitoso
  const handleLoginSuccess = () => {
    setIsAuthenticated(true); // Cambia el estado cuando el usuario se logea correctamente
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <TextToSpeechForm /> // Si está autenticado, mostramos el formulario
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} /> // Si no, mostramos el componente de login
      )}
    </div>
  );
}

export default App;