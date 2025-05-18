import React, { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const TranscripIADicapta = () => {
  const [language, setLanguage] = useState('');
  const [mainFile, setMainFile] = useState(null);
  const [bibleFile, setBibleFile] = useState(null);
  const [message, setMessage] = useState('');

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    // Add more languages if needed
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
      setMessage('Please complete all fields.');
      return;
    }

    setMessage('Form submitted (add logic here).');
    // Add logic to send files to backend here
  };

  return (
    <div className="container">
      <h1>Transcrip IA Dicapta</h1>
      <p className="subtitle">Upload your files for transcription</p>

      <form onSubmit={handleSubmit} className="transcrip-form">
        <div className="form-group2">
          <label>Language</label>
          <select
            className="input-short"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Select a language</option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group2">
          {mainFile ? (
            <div className="file-label-selected">
              <p className="file-name">Main file: {mainFile.name}</p>
            </div>
          ) : (
            <label className="file-label" htmlFor="main-file-upload">
              Upload main file <FileUploadIcon className="file-icon" />
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

        <div className="form-group2">
          {bibleFile ? (
            <div className="file-label-selected">
              <p className="file-name">Bible file: {bibleFile.name}</p>
            </div>
          ) : (
            <label className="file-label" htmlFor="bible-file-upload">
              Upload Bible file <FileUploadIcon className="file-icon" />
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

        <div className="form-actions">
          <button className="process-btn2" type="submit">
            Submit
          </button>
        </div>
      </form>

      {message && <p className="message-info">{message}</p>}
    </div>
  );
};

export default TranscripIADicapta;
