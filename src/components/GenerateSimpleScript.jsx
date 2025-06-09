import React, { useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CircularProgress from '@mui/material/CircularProgress';

const GenerateSimpleScript = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const urlback = 'https://backend-ia.dicapta.com';

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Video file selected:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      });
      
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        console.warn('Invalid file type:', file.type);
        setMessage('Please upload only video files');
        return;
      }
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!videoFile) {
      console.warn('No video file selected');
      setMessage('Please upload a video file.');
      return;
    }

    setIsLoading(true);
    setMessage('Processing video... This may take several minutes.');
    console.log('Starting video processing');

    try {
      const formData = new FormData();
      formData.append('video_file', videoFile);
      console.log('FormData created with video file');
      
      console.log('Sending request to:', `${urlback}/api/process-video`);
      const response = await fetch(`${urlback}/api/process-video`, {
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
        throw new Error(errorData.error || 'Error processing video');
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
      setMessage('Video processed successfully! SRT file has been downloaded.');
    } catch (error) {
      console.error('Error in video processing:', {
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

  return (
    <div className="container">
      <h1>Generate Simple SRT</h1>
      <p className="subtitle">Upload your video for processing</p>

      <form onSubmit={handleSubmit} className="transcrip-form">
        <div className="form-group2">
          {videoFile ? (
            <div className="file-label-selected">
              <p className="file-name">Video: {videoFile.name}</p>
            </div>
          ) : (
            <label className="file-label" htmlFor="video-upload">
              Upload Video <FileUploadIcon className="file-icon" />
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="input-short"
                style={{ display: 'none' }}
              />
            </label>
          )}
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
            Process Video
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
