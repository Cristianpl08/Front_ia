import React from 'react';
import { useNavigate } from 'react-router-dom';
import SurroundSoundIcon from '@mui/icons-material/SurroundSound';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';

const Menu = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-container">
      <h1 style={{ marginBottom: '70px' }}>Dicapta's Tools</h1>
      <div className="menu-options">
        <div className="menu-option" onClick={() => navigate('/text-to-speech')} style={{ cursor: 'pointer', marginBottom: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '5px', maxWidth: '300px', margin: '0 auto 20px auto', textAlign: 'center', fontFamily: 'Comic Sans MS, cursive, sans-serif',fontSize: '1.2rem' }}>
          <SurroundSoundIcon style={{ marginRight: '10px' }} />
          Text-to-Speech
        </div>
        <div className="menu-option" onClick={() => navigate('/transcrip-ia-dicapta')} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '20px', borderRadius: '5px', maxWidth: '300px', margin: '0 auto', textAlign: 'center', fontFamily: 'Comic Sans MS, cursive, sans-serif',fontSize: '1.2rem' ,marginBottom: '20px'}}>
          <DescriptionIcon style={{ marginRight: '10px' }} />
          Transcrip IA
        </div>
        <div className="menu-option" onClick={() => navigate('/generate-simple-script')} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '20px', borderRadius: '5px', maxWidth: '300px', margin: '0 auto', textAlign: 'center', fontFamily: 'Comic Sans MS, cursive, sans-serif',fontSize: '1.2rem' ,marginBottom: '20px' ,marginBottom: '20px'  }}>
          <ArticleIcon style={{ marginRight: '10px' }} />
          Generate Simple SRT
        </div>
      </div>
    </div>
  );
};

export default Menu;
