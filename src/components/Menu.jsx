import React from 'react';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-container">
      <h1 style={{ marginBottom: '70px' }}>Dicapta's Tools</h1>
      <div className="menu-options">
        <div className="menu-option" onClick={() => navigate('/text-to-speech')} style={{ cursor: 'pointer', marginBottom: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '5px', maxWidth: '300px', margin: '0 auto 20px auto', textAlign: 'center' }}>
          Text-to-Speech
        </div>
        <div className="menu-option" onClick={() => navigate('/transcrip-ia-dicapta')} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '20px', borderRadius: '5px', maxWidth: '300px', margin: '0 auto', textAlign: 'center' }}>
          Transcrip IA Dicapta
        </div>
      </div>
    </div>
  );
};

export default Menu;
