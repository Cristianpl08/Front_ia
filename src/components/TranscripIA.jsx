import React, { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';

const TranscripIADicapta = () => {
  const [language, setLanguage] = useState('');
  const [finalFileName, setFinalFileName] = useState('');
  const [numberOfParts, setNumberOfParts] = useState(1);
  const [files, setFiles] = useState({});
  const [bibleFile, setBibleFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const urlback = 'https://backend-ia.dicapta.com';

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    // Add more languages if needed
  ];

  const handleFileChange = (partNumber, e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/rtf' && !file.name.toLowerCase().endsWith('.rtf')) {
      setMessage('Please upload only RTF files');
      return;
    }
    const newFiles = { ...files };
    newFiles[partNumber] = file;
    setFiles(newFiles);
  };

  const handleBibleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.toLowerCase().endsWith('.xlsx')) {
      setMessage('Please upload only XLSX files for the Bible');
      return;
    }
    setBibleFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!language || !finalFileName || !bibleFile || Object.keys(files).length !== numberOfParts) {
      setMessage('Please complete all fields and upload all required files.');
      return;
    }

    // Validate all files are RTF
    const allFilesAreRTF = Object.values(files).every(file => 
      file.type === 'application/rtf' || file.name.toLowerCase().endsWith('.rtf')
    );

    if (!allFilesAreRTF) {
      setMessage('All script files must be in RTF format');
      return;
    }

    // Validate Bible file is XLSX
    if (!bibleFile.name.toLowerCase().endsWith('.xlsx')) {
      setMessage('Bible file must be in XLSX format');
      return;
    }

    setIsLoading(true);
    setMessage('Processing files...');

    try {
      const formData = new FormData();
      const selectedLanguage = languages.find(lang => lang.code === language);
      formData.append('idioma_destino', selectedLanguage ? selectedLanguage.name : language);
      formData.append('nombre_xlsx', `${finalFileName}.xlsx`);
      formData.append('bible_file', bibleFile);

      // Log files before appending
      console.log('Files to be sent:', {
        bible: {
          name: bibleFile.name,
          type: bibleFile.type,
          size: bibleFile.size
        },
        script_files: Object.entries(files).map(([key, file]) => ({
          part: key,
          name: file.name,
          type: file.type,
          size: file.size
        }))
      });

      // Append all files
      Object.values(files).forEach((file) => {
        formData.append('archivos', file);
      });

      // Log FormData contents
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File(${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      console.log('Request details:', {
        url: `${urlback}/api/procesar-guiones-doc`,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: {
          idioma_destino: selectedLanguage ? selectedLanguage.name : language,
          nombre_xlsx: `${finalFileName}.xlsx`,
          bible_file: {
            name: bibleFile.name,
            type: bibleFile.type,
            size: bibleFile.size
          },
          archivos_count: Object.keys(files).length,
          archivos_details: Object.entries(files).map(([key, file]) => ({
            part: key,
            name: file.name,
            type: file.type,
            size: file.size
          }))
        }
      });

      const response = await fetch(`${urlback}/api/procesar-guiones-doc`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || 'Error processing files');
      }

      // Get the blob from the response
      const blob = await response.blob();
      console.log('Response received:', {
        type: blob.type,
        size: blob.size
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${finalFileName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage('Files processed successfully!');
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getPartLabel = (number) => {
    return `Part ${String.fromCharCode(64 + number)}`;
  };

  return (
    <div className="container">
      <h1>Transcrip IA Dicapta</h1>
      <p className="subtitle">Upload your RTF files for transcription</p>

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
          <label>Final File Name</label>
          <input
            type="text"
            className="input-short"
            value={finalFileName}
            onChange={(e) => setFinalFileName(e.target.value)}
            placeholder="Enter the name for the final file"
          />
        </div>

        <div className="form-group2">
          <label>Number of Parts of the script</label>
          <select
            className="input-short"
            value={numberOfParts}
            onChange={(e) => {
              setNumberOfParts(Number(e.target.value));
              setFiles({});
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group2">
          {bibleFile ? (
            <div className="file-label-selected">
              <p className="file-name">Bible file: {bibleFile.name}</p>
            </div>
          ) : (
            <label className="file-label" htmlFor="bible-file-upload">
              Upload Bible file (XLSX) <FileUploadIcon className="file-icon" />
              <input
                id="bible-file-upload"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleBibleFileChange}
                className="input-short"
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {[...Array(numberOfParts)].map((_, index) => (
          <div key={index} className="form-group2">
            {files[index + 1] ? (
              <div className="file-label-selected">
                <p className="file-name">{getPartLabel(index + 1)}: {files[index + 1].name}</p>
              </div>
            ) : (
              <label className="file-label" htmlFor={`file-upload-${index}`}>
                Upload {getPartLabel(index + 1)} (RTF) <FileUploadIcon className="file-icon" />
                <input
                  id={`file-upload-${index}`}
                  type="file"
                  accept=".rtf,application/rtf"
                  onChange={(e) => handleFileChange(index + 1, e)}
                  className="input-short"
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        ))}

        <div className="form-actions" style={{ position: 'relative', height: 48 }}>
          <button 
            className="process-btn2" 
            type="submit"
            disabled={isLoading}
            style={isLoading ? { 
              opacity: 0, 
              pointerEvents: 'none', 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              width: '100%', 
              height: '100%', 
              border: 'none', 
              background: 'transparent' 
            } : {}}
          >
            Submit
          </button>
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#e0e0e0',
              borderRadius: '8px',
              padding: '8px 16px',
              zIndex: 2,
              border: '1px solid #333',
              minWidth: 160,
              justifyContent: 'center'
            }}>
              <CircularProgress size={24} style={{ color: '#333' }} />
              <span style={{ color: '#333', fontWeight: 600 }}>Processing...</span>
            </div>
          )}
        </div>
      </form>

      {message && <p className="message-info">{message}</p>}
    </div>
  );
};

export default TranscripIADicapta;
