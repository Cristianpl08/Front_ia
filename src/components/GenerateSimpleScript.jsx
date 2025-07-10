import React, { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CircularProgress from '@mui/material/CircularProgress';

const GenerateSimpleScript = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [videoTimeOffset, setVideoTimeOffset] = useState(0);
  const [srtStartNumber, setSrtStartNumber] = useState(1);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const urlback = 'https://backend-ia.dicapta.com';

  // Convert seconds to SRT time format (HH:MM:SS,mmm)
  const secondsToSrtTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Convert SRT time format to seconds
  const srtTimeToSeconds = (srtTime) => {
    const [time, ms] = srtTime.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + (ms ? Number(ms) / 1000 : 0);
  };

  // Parse time input and update videoTimeOffset
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

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Audio file selected:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      });
      
      // Check if file is an MP3
      if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') {
        console.warn('Invalid file type:', file.type);
        setMessage('Please upload only MP3 files');
        return;
      }
      setAudioFile(file);
    }
  };

  const clearForm = () => {
    setAudioFile(null);
    setVideoTimeOffset(0);
    setSrtStartNumber(1);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!audioFile) {
      console.warn('No audio file selected');
      setMessage('Please upload an MP3 file.');
      return;
    }

    setIsLoading(true);
    setMessage('Processing audio... This may take several minutes.');
    console.log('Starting audio processing');

    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('video_time_offset', videoTimeOffset);
      formData.append('srt_start_number', srtStartNumber);
      console.log('FormData created with audio file and parameters:', {
        video_time_offset: videoTimeOffset,
        srt_start_number: srtStartNumber
      });
      
      console.log('Sending request to:', `${urlback}/api/process-audio`);
      const response = await fetch(`${urlback}/api/process-audio`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || 'Error processing audio');
      }

      // Get the blob from the response
      const blob = await response.blob();
      console.log('Blob received:', {
        type: blob.type,
        size: `${(blob.size / 1024).toFixed(2)} KB`
      });
      
      // Create a download link for the SRT file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transcript.srt';
      document.body.appendChild(a);
      console.log('Initiating file download');
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Process completed successfully');
      setMessage('Audio processed successfully! SRT file has been downloaded.');
      
      // Clear form after successful processing
      clearForm();
    } catch (error) {
      console.error('Error in audio processing:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log('Processing state reset');
    }
  };

  const currentTimeDisplay = secondsToSrtTime(videoTimeOffset);
  const [time, ms] = currentTimeDisplay.split(',');
  const [hours, minutes, seconds] = time.split(':');

  return (
    <div className="container">
      <h1>Generate Simple SRT</h1>
      <p className="subtitle">Upload your MP3 file for processing</p>

      <form onSubmit={handleSubmit} className="transcrip-form">
        <div className="form-group2">
          {audioFile ? (
            <div className="file-label-selected">
              <p className="file-name">Audio: {audioFile.name}</p>
            </div>
          ) : (
            <label className="file-label" htmlFor="audio-upload">
              Upload MP3 <FileUploadIcon className="file-icon" />
              <input
                id="audio-upload"
                type="file"
                accept="audio/mpeg,audio/mp3"
                onChange={handleAudioChange}
                className="input-short"
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        <div className="form-group2">
          <label className="form-label">
            Video Time Offset:
          </label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontFamily: 'monospace',
            fontSize: '16px'
          }}>
            <input
              type="number"
              min="0"
              max="99"
              value={hours}
              onChange={(e) => handleTimeChange('hours', e.target.value)}
              style={{
                width: '40px',
                textAlign: 'center',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '4px'
              }}
            />
            <span>:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => handleTimeChange('minutes', e.target.value)}
              style={{
                width: '40px',
                textAlign: 'center',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '4px'
              }}
            />
            <span>:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => handleTimeChange('seconds', e.target.value)}
              style={{
                width: '40px',
                textAlign: 'center',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '4px'
              }}
            />
            <span>,</span>
            <input
              type="number"
              min="0"
              max="999"
              value={ms}
              onChange={(e) => handleTimeChange('milliseconds', e.target.value)}
              style={{
                width: '50px',
                textAlign: 'center',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '4px'
              }}
            />
          </div>
        </div>

        <div className="form-group2">
          <label htmlFor="srt-start-number" className="form-label">
            SRT Start Number:
          </label>
          <input
            id="srt-start-number"
            type="number"
            min="1"
            value={srtStartNumber}
            onChange={(e) => setSrtStartNumber(parseInt(e.target.value) || 1)}
            className="input-short"
            placeholder="1"
          />
        </div>

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
            Process Audio
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

export default GenerateSimpleScript;
