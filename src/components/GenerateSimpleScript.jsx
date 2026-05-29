import React, { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CircularProgress from '@mui/material/CircularProgress';

const processingTabs = [
  {
    id: 'whisper',
    label: 'Generate Whisper',
    endpoint: '/api/process-audio',
  },
  {
    id: 'gemini-simple',
    label: 'Generate Gemini Simple',
    endpoint: '/api/process-audio-gemini',
  },
  {
    id: 'gemini-times',
    label: 'Generate Gemini with Times',
    endpoint: '/api/process-audio-gemini-time',
  },
];

const GenerateSimpleScript = () => {
  const [activeTab, setActiveTab] = useState('gemini-times');
  const [mediaFile, setMediaFile] = useState(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      });
      
      if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') {
        console.warn('Invalid audio file type:', file.type);
        setMessage('Please upload only MP3 files for audio processing');
        return;
      }
      
      setMediaFile(file);
      setMessage(''); // Clear any previous error messages
    }
  };

  const clearForm = () => {
    setMediaFile(null);
    setVideoTimeOffset(0);
    setSrtStartNumber(1);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!mediaFile) {
      console.warn('No file selected');
      setMessage('Please upload an MP3 file.');
      return;
    }

    const selectedTab = processingTabs.find((tab) => tab.id === activeTab) || processingTabs[0];

    setIsLoading(true);
    setMessage('Processing audio... This may take several minutes.');
    console.log('Starting audio processing with tab:', selectedTab.id);

    try {
      const formData = new FormData();
      const endpoint = selectedTab.endpoint;
      
      formData.append('audio_file', mediaFile);
      formData.append('video_time_offset', videoTimeOffset);
      formData.append('srt_start_number', srtStartNumber);
      
      console.log('FormData created with audio file and parameters:', {
        endpoint,
        video_time_offset: videoTimeOffset,
        srt_start_number: srtStartNumber
      });
      
      console.log('Sending request to:', `${urlback}${endpoint}`);
      const response = await fetch(`${urlback}${endpoint}`, {
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
      
      // Create a download link for the DOCX file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transcript.docx';
      document.body.appendChild(a);
      console.log('Initiating file download');
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Process completed successfully');
      setMessage('Audio processed successfully! DOCX file has been downloaded.');
      
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
  const selectedTab = processingTabs.find((tab) => tab.id === activeTab) || processingTabs[0];

  return (
    <div className="container generate-transcript-page">
      <h1>Generate Transcript</h1>
      <p className="subtitle">Upload your MP3 file for processing</p>

      <form onSubmit={handleSubmit} className="transcrip-form simple-srt-form">
        <div className="simple-srt-tabs" role="tablist" aria-label="Audio processing method">
          {processingTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`simple-srt-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage('');
              }}
            >
              <span>{tab.label.replace('Generate ', '')}</span>
            </button>
          ))}
        </div>

        <div className="simple-srt-panel">
          <div className="simple-srt-panel-heading">
            <h2>{selectedTab.label}</h2>
            <p>Choose an MP3, set the timing options, and download the generated DOCX transcript.</p>
          </div>

          <div className="form-group2 simple-srt-upload-group">
            {mediaFile ? (
              <div className="file-label-selected">
                <FileUploadIcon className="file-icon" />
                <p className="file-name">Selected: {mediaFile.name}</p>
              </div>
            ) : (
              <label className="file-label" htmlFor="media-upload">
                <FileUploadIcon className="file-icon" />
                <span>Upload MP3</span>
                <input
                  id="media-upload"
                  type="file"
                  accept="audio/mpeg,audio/mp3"
                  onChange={handleFileChange}
                  className="input-short"
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          <div className="simple-srt-settings">
            <div className="form-group2 simple-srt-setting-card">
              <label className="form-label">
                Video Time Offset
              </label>
              <div className="simple-srt-time-inputs">
                <label>
                  <span>Hours</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={hours}
                    onChange={(e) => handleTimeChange('hours', e.target.value)}
                  />
                </label>
                <span className="simple-srt-time-separator">:</span>
                <label>
                  <span>Minutes</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => handleTimeChange('minutes', e.target.value)}
                  />
                </label>
                <span className="simple-srt-time-separator">:</span>
                <label>
                  <span>Seconds</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => handleTimeChange('seconds', e.target.value)}
                  />
                </label>
                <span className="simple-srt-time-separator">,</span>
                <label>
                  <span>Milliseconds</span>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={ms}
                    onChange={(e) => handleTimeChange('milliseconds', e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="form-group2 simple-srt-setting-card">
              <label htmlFor="srt-start-number" className="form-label">
                SRT Start Number
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
          </div>

          <div className="form-actions simple-srt-actions">
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
              Process {selectedTab.label}
            </button>
            {isLoading && (
              <div className="simple-srt-loading">
                <CircularProgress size={24} style={{ color: '#333' }} />
                <span>Processing...</span>
              </div>
            )}
          </div>
        </div>

      </form>

      {message && <p className="message-info">{message}</p>}
    </div>
  );
};

export default GenerateSimpleScript;
