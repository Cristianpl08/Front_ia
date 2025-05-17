import React, { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const TranscripIADicapta = () => {
  const [language, setLanguage] = useState('');
  const [mainFile, setMainFile] = useState(null);
  const [bibleFile, setBibleFile] = useState(null);
  const [message, setMessage] = useState('');

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'Inglés' },
    { code: 'fr', name: 'Francés' },
    { code: 'de', name: 'Alemán' },
    // Agrega más idiomas si deseas
  ];

  const handleMainFileChange = (e) => {
    setMainFile(e.target.files[0]);
  };

  const handleBibleFileChange = (e) => {
    setBibleFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!language || !mainFile || !bibleFile) {
      setMessage('Por favor completa todos los campos.');
      return;
    }

    setMessage('Formulario enviado (aquí agregar lógica).');
    // Aquí se puede agregar la lógica para enviar archivos al backend
  };

  return (
    <div className="container">
      <h1>Transcrip IA Dicapta</h1>
      <p className="subtitle">Sube tus archivos para transcripción</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>Idioma</label>
          <select
            className="input-short"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Selecciona un idioma</option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          {mainFile ? (
            <div className="file-label-selected">
              <p className="file-name">Archivo principal: {mainFile.name}</p>
            </div>
          ) : (
            <label className="file-label" htmlFor="main-file-upload">
              Subir archivo principal <FileUploadIcon className="file-icon" />
              <input
                id="main-file-upload"
                type="file"
                onChange={handleMainFileChange}
                className="input-short"
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          {bibleFile ? (
            <div className="file-label-selected">
              <p className="file-name">Archivo Bible: {bibleFile.name}</p>
            </div>
          ) : (
            <label className="file-label" htmlFor="bible-file-upload">
              Subir archivo Bible <FileUploadIcon className="file-icon" />
              <input
                id="bible-file-upload"
                type="file"
                onChange={handleBibleFileChange}
                className="input-short"
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button className="process-btn" type="submit">
            Enviar
          </button>
        </div>
      </form>

      {message && <p style={{ marginTop: '20px', textAlign: 'center' }}>{message}</p>}
    </div>
  );
};

export default TranscripIADicapta;
