import React, { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CircularProgress from '@mui/material/CircularProgress';

const urlback = 'https://backend-ia.dicapta.com';

const RTFProcessingTools = () => {
  const [activeTab, setActiveTab] = useState('process-mp3');
  const [mp3File, setMp3File] = useState(null);
  const [txtFile, setTxtFile] = useState(null);
  const [xlsxFile, setXlsxFile] = useState(null);
  const [videoTimeOffset, setVideoTimeOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  const secondsToSrtTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const srtTimeToSeconds = (srtTime) => {
    const [time, ms] = srtTime.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + (ms ? Number(ms) / 1000 : 0);
  };

  const handleTimeChange = (type, value) => {
    const currentTime = secondsToSrtTime(videoTimeOffset);
    const [time, ms] = currentTime.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);

    let newHours = hours;
    let newMinutes = minutes;
    let newSeconds = seconds;
    let newMs = ms ? Number(ms) : 0;

    switch (type) {
      case 'hours':
        newHours = Math.max(0, Math.min(99, parseInt(value) || 0));
        break;
      case 'minutes':
        newMinutes = Math.max(0, Math.min(59, parseInt(value) || 0));
        break;
      case 'seconds':
        newSeconds = Math.max(0, Math.min(59, parseInt(value) || 0));
        break;
      case 'milliseconds':
        newMs = Math.max(0, Math.min(999, parseInt(value) || 0));
        break;
      default:
        break;
    }

    const newSrtTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')},${newMs.toString().padStart(3, '0')}`;
    setVideoTimeOffset(srtTimeToSeconds(newSrtTime));
  };

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

  const handleTxtChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setMessage('Please upload only TXT files for timestamps');
      setTxtFile(null);
      return;
    }

    console.log('TXT file selected:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    setTxtFile(file);
    setMessage('');
    setResult(null);
  };

  const handleXlsxChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setMessage('Please upload only XLSX files');
      setXlsxFile(null);
      return;
    }

    console.log('XLSX file selected:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    setXlsxFile(file);
    setMessage('');
    setResult(null);
  };

  const getDownloadFileName = (response, fallbackFileName) => {
    const contentDisposition = response.headers.get('content-disposition');

    if (!contentDisposition) {
      return fallbackFileName;
    }

    const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    return fileNameMatch?.[1] || fallbackFileName;
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

      const processedFileName = getDownloadFileName(response, 'mp3_transcript_with_timestamps.txt');
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

  const handleAssociateTimestamps = async (event) => {
    event.preventDefault();

    if (!txtFile || !xlsxFile) {
      setMessage('Please select both TXT and XLSX files.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setResult(null);

    try {
      const formData = new FormData();
      const formattedOffset = secondsToSrtTime(videoTimeOffset);
      formData.append('txt_file', txtFile);
      formData.append('xlsx_file', xlsxFile);
      formData.append('video_time_offset', formattedOffset);

      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const endpoint = '/api/associate-dialogues-timestamps';
      console.log('Enviando petición a:', `${urlback}${endpoint}`);

      const response = await fetch(`${urlback}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      console.log('Respuesta recibida:', response);
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);

      if (!response.ok) {
        let errorMessage = 'Error associating timestamps';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const processedFileName = getDownloadFileName(response, 'xlsx_con_timestamps.xlsx');
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
        message: 'Files processed successfully. XLSX with timestamps downloaded.',
        processedFile: processedFileName,
      });
    } catch (error) {
      console.error('Error associating timestamps:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTimeDisplay = secondsToSrtTime(videoTimeOffset);
  const [time, ms] = currentTimeDisplay.split(',');
  const [hours, minutes, seconds] = time.split(':');

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
              setResult(null);
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
              setResult(null);
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
          <>
            <h2>Associate Dialogues with Timestamps</h2>
            <p className="rtf-panel-description">
              Upload a TXT file with timestamps and dialogues, and an XLSX file to associate them.
              The system will match dialogues and add timestamps to the XLSX file.
            </p>

            <form onSubmit={handleAssociateTimestamps} className="rtf-process-form">
              <label className="rtf-upload-box" htmlFor="txt-upload">
                <FileUploadIcon className="rtf-upload-icon" />
                <span>Select TXT File (with timestamps)</span>
                <input
                  id="txt-upload"
                  type="file"
                  accept=".txt,text/plain"
                  onChange={handleTxtChange}
                  style={{ display: 'none' }}
                />
              </label>

              {txtFile && (
                <div className="rtf-selected-file">
                  <span>Selected: {txtFile.name}</span>
                  <span>({(txtFile.size / 1024).toFixed(2)} KB)</span>
                </div>
              )}

              <label className="rtf-upload-box" htmlFor="xlsx-upload">
                <FileUploadIcon className="rtf-upload-icon" />
                <span>Select XLSX File</span>
                <input
                  id="xlsx-upload"
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleXlsxChange}
                  style={{ display: 'none' }}
                />
              </label>

              {xlsxFile && (
                <div className="rtf-selected-file">
                  <span>Selected: {xlsxFile.name}</span>
                  <span>({(xlsxFile.size / 1024).toFixed(2)} KB)</span>
                </div>
              )}

              <div className="rtf-time-offset">
                <h3>Video Time Offset:</h3>
                <div className="rtf-time-inputs">
                  <label>
                    <span>Hours</span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={hours}
                      onChange={(event) => handleTimeChange('hours', event.target.value)}
                    />
                  </label>
                  <span className="rtf-time-separator">:</span>
                  <label>
                    <span>Minutes</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(event) => handleTimeChange('minutes', event.target.value)}
                    />
                  </label>
                  <span className="rtf-time-separator">:</span>
                  <label>
                    <span>Seconds</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(event) => handleTimeChange('seconds', event.target.value)}
                    />
                  </label>
                  <span className="rtf-time-separator">,</span>
                  <label>
                    <span>Milliseconds</span>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={ms}
                      onChange={(event) => handleTimeChange('milliseconds', event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <button className="rtf-process-button" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <CircularProgress size={26} style={{ color: '#ffffff' }} />
                    Processing...
                  </>
                ) : (
                  'Associate Timestamps'
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
        )}

        {message && <p className="rtf-message">{message}</p>}
      </section>
    </main>
  );
};

export default RTFProcessingTools;
