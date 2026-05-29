import React, { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CircularProgress from '@mui/material/CircularProgress';

const urlback = 'https://backend-ia.dicapta.com';

const RTFProcessingTools = () => {
  const [activeTab, setActiveTab] = useState('process-mp3');
  const [mp3File, setMp3File] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  const handleMp3Change = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') {
      setMessage('Please upload only MP3 files');
      setMp3File(null);
      return;
    }

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    });

    setMp3File(file);
    setMessage('');
    setResult(null);
  };

  const getDownloadFileName = (response) => {
    const contentDisposition = response.headers.get('content-disposition');

    if (!contentDisposition) {
      return 'mp3_transcript_with_timestamps.txt';
    }

    const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    return fileNameMatch?.[1] || 'mp3_transcript_with_timestamps.txt';
  };

  const handleProcessMp3 = async (event) => {
    event.preventDefault();

    if (!mp3File) {
      setMessage('Please select an MP3 file.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('mp3_file', mp3File);

      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const endpoint = '/api/process-mp3-with-timestamps';
      console.log('Enviando petición a:', `${urlback}${endpoint}`);

      const response = await fetch(`${urlback}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      console.log('Respuesta recibida:', response);
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);

      if (!response.ok) {
        let errorMessage = 'Error processing MP3 file';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const processedFileName = getDownloadFileName(response);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = processedFileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);

      setResult({
        status: 'Success',
        message: 'MP3 file processed successfully with Whisper and transcript downloaded',
        processedFile: processedFileName,
      });
    } catch (error) {
      console.error('Error processing MP3 file:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="rtf-tools-page">
      <h1 className="rtf-tools-title">RTF Processing Tools</h1>

      <section className="rtf-tabs-shell">
        <div className="rtf-tabs" role="tablist" aria-label="RTF processing tools">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'process-mp3'}
            className={`rtf-tab ${activeTab === 'process-mp3' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('process-mp3');
              setMessage('');
            }}
          >
            Process MP3
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'associate-timestamps'}
            className={`rtf-tab ${activeTab === 'associate-timestamps' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('associate-timestamps');
              setMessage('');
            }}
          >
            Associate Timestamps
          </button>
        </div>
      </section>

      <section className="rtf-panel">
        {activeTab === 'process-mp3' ? (
          <>
            <h2>Generate Transcript with Timestamps from MP3</h2>
            <p className="rtf-panel-description">
              Upload an MP3 audio file to process and generate a transcript with timestamps using Whisper.
            </p>

            <form onSubmit={handleProcessMp3} className="rtf-process-form">
              <label className="rtf-upload-box" htmlFor="mp3-upload">
                <FileUploadIcon className="rtf-upload-icon" />
                <span>Select MP3 File</span>
                <input
                  id="mp3-upload"
                  type="file"
                  accept="audio/mpeg,audio/mp3"
                  onChange={handleMp3Change}
                  style={{ display: 'none' }}
                />
              </label>

              {mp3File && (
                <div className="rtf-selected-file">
                  Selected: {mp3File.name}
                </div>
              )}

              <button className="rtf-process-button" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <CircularProgress size={26} style={{ color: '#ffffff' }} />
                    Processing...
                  </>
                ) : (
                  'Process MP3 File'
                )}
              </button>
            </form>

            {result && (
              <div className="rtf-result-card">
                <h3>Processing Complete!</h3>
                <div className="rtf-result-row">
                  <strong>Status:</strong>
                  <span>{result.status}</span>
                </div>
                <div className="rtf-result-row">
                  <strong>Message:</strong>
                  <span>{result.message}</span>
                </div>
                <div className="rtf-result-row">
                  <strong>Processed File:</strong>
                  <span>{result.processedFile}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rtf-empty-tab">
            <h2>Associate Timestamps</h2>
            <p className="rtf-panel-description">
              Upload timestamped transcript files here when the association endpoint is available.
            </p>
          </div>
        )}

        {message && <p className="rtf-message">{message}</p>}
      </section>
    </main>
  );
};

export default RTFProcessingTools;
