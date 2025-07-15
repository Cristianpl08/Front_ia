import React, { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CircularProgress from '@mui/material/CircularProgress';

const GenerateSimpleScript = () => {
  const [fileType, setFileType] = useState('audio'); // 'audio' or 'video'
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
      
      // Validate file type based on selection
      if (fileType === 'audio') {
        if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') {
          console.warn('Invalid audio file type:', file.type);
          setMessage('Please upload only MP3 files for audio processing');
          return;
        }
      } else if (fileType === 'video') {
        if (!file.type.startsWith('video/')) {
          console.warn('Invalid video file type:', file.type);
          setMessage('Please upload only video files for video processing');
          return;
        }
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
      setMessage(`Please upload a ${fileType} file.`);
      return;
    }

    setIsLoading(true);
    setMessage(`Processing ${fileType}... This may take several minutes.`);
    console.log(`Starting ${fileType} processing`);

    try {
      const formData = new FormData();
      const endpoint = fileType === 'audio' ? '/api/process-audio' : '/api/process-video';
      const fileField = fileType === 'audio' ? 'audio_file' : 'video_file';
      
      formData.append(fileField, mediaFile);
      
      // Add time offset and start number only for audio processing
      if (fileType === 'audio') {
        formData.append('video_time_offset', videoTimeOffset);
        formData.append('srt_start_number', srtStartNumber);
        console.log('FormData created with audio file and parameters:', {
          video_time_offset: videoTimeOffset,
          srt_start_number: srtStartNumber
        });
      } else {
        formData.append('video_time_offset', videoTimeOffset);
        formData.append('srt_start_number', srtStartNumber);
        console.log('FormData created with video file and parameters:', {
          video_time_offset: videoTimeOffset,
          srt_start_number: srtStartNumber
        });
      }
      
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
        throw new Error(errorData.error || `Error processing ${fileType}`);
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
      setMessage(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} processed successfully! DOCX file has been downloaded.`);
      
      // Clear form after successful processing
      clearForm();
    } catch (error) {
      console.error(`Error in ${fileType} processing:`, {
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
      <p className="subtitle">Upload your audio or video file for processing</p>

      <form onSubmit={handleSubmit} className="transcrip-form">
        {/* File Type Selection */}
        <div className="form-group2">
          <label className="form-label">Select File Type:</label>
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            marginTop: '8px',
            justifyContent: 'center'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="fileType"
                value="audio"
                checked={fileType === 'audio'}
                onChange={(e) => {
                  setFileType(e.target.value);
                  setMediaFile(null); // Clear file when switching types
                  setMessage('');
                }}
              />
              Audio (MP3)
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="fileType"
                value="video"
                checked={fileType === 'video'}
                onChange={(e) => {
                  setFileType(e.target.value);
                  setMediaFile(null); // Clear file when switching types
                  setMessage('');
                }}
              />
              Video
            </label>
          </div>
        </div>

        {/* File Upload */}
        <div className="form-group2">
          {mediaFile ? (
            <div className="file-label-selected">
              <p className="file-name">{fileType.charAt(0).toUpperCase() + fileType.slice(1)}: {mediaFile.name}</p>
            </div>
          ) : (
            <label className="file-label" htmlFor="media-upload">
              Upload {fileType.charAt(0).toUpperCase() + fileType.slice(1)} <FileUploadIcon className="file-icon" />
              <input
                id="media-upload"
                type="file"
                accept={fileType === 'audio' ? 'audio/mpeg,audio/mp3' : 'video/*'}
                onChange={handleFileChange}
                className="input-short"
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {/* Time Offset - Show for both audio and video */}
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

        {/* SRT Start Number - Show for both audio and video */}
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
            Process {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
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
