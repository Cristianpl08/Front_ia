import React, { useState } from 'react';

const TranscripIADicapta = () => {
  const [language, setLanguage] = useState('es');
  const [file, setFile] = useState(null);
  const [bibleFile, setBibleFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleBibleFileChange = (e) => setBibleFile(e.target.files[0]);
  const handleLanguageChange = (e) => setLanguage(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los archivos y el idioma
    alert('Formulario enviado');
  };

  return (
    <div className="transcrip-ia-container">
      <h1 style={{ marginBottom: '40px' }}>Transcrip IA Dicapta</h1>
      <form className="transcrip-ia-form" onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', maxWidth: '400px', margin: '0 auto' }}>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="language">Idioma:</label>
          <select id="language" value={language} onChange={handleLanguageChange} style={{ marginLeft: '10px' }}>
            <option value="es">Español</option>
            <option value="en">Inglés</option>
            <option value="fr">Francés</option>
            {/* Agrega más idiomas si es necesario */}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="file">Archivo principal:</label>
          <input id="file" type="file" onChange={handleFileChange} style={{ marginLeft: '10px' }} />
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="bibleFile">Archivo Bible:</label>
          <input id="bibleFile" type="file" onChange={handleBibleFileChange} style={{ marginLeft: '10px' }} />
        </div>
        <button type="submit" style={{ background: '#b6fcd5', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Enviar</button>
      </form>
    </div>
  );
};

export default TranscripIADicapta; 