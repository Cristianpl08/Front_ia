import React, { useState, useEffect } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import AddIcon from '@mui/icons-material/Add';

import CircularProgress from '@mui/material/CircularProgress';
import FileUploadIcon from '@mui/icons-material/FileUpload';


const TextToSpeechForm = () => {
  const [srtFile, setSrtFile] = useState(null);
  const [srtContent, setSrtContent] = useState('');
  const urlback = 'https://backend-ia.dicapta.com';
  const [finalFileName, setFinalFileName] = useState('');
  const [numSpeakers, setNumSpeakers] = useState(1);
  const [voiceModels, setVoiceModels] = useState([]);
  const [speakers, setSpeakers] = useState([{ name: '', id: '', model: voiceModels[0] }]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);


  useEffect(() => {
    const fetchVoiceModels = async () => {
      try {
        const response = await fetch(`${urlback}/api/get-voice-models`);
        const data = await response.json();
        if (response.ok) {
          // Filtrar los modelos de voz donde can_do_text_to_speech es true
          const filteredVoiceModels = data.voice_models.filter(model => model.can_do_text_to_speech);
          setVoiceModels(filteredVoiceModels);
        } else {
          console.error('Error fetching voice models:', data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchVoiceModels();
  }, []);
  
  // ... existing code ...
  useEffect(() => {
    setSpeakers(Array(numSpeakers).fill().map((_, i) => ({
      name: speakers[i]?.name || '',
      id: speakers[i]?.id || '',
      model: speakers[i]?.model || voiceModels[0] || ''
    })));
  }, [numSpeakers, voiceModels]);
  useEffect(() => {
    setSpeakers(Array(numSpeakers).fill().map((_, i) => ({
      name: speakers[i]?.name || '',
      id: speakers[i]?.id || '',
      model: speakers[i]?.model || voiceModels[0]
    })));
  }, [numSpeakers]);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch(`${urlback}/api/get-voices`);
        const data = await response.json();
        if (response.ok) {
          setAvailableVoices(data.voices);
        } else {
          console.error('Error fetching voices:', data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchVoices();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSrtFile(file);

    if (file) {
      const formData = new FormData();
      formData.append('srt_file', file);

      try {
        const response = await fetch(`${urlback}/api/parse-srt`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setSrtContent(result.parsed_srt);

          const uniqueVoices = [...new Set(result.parsed_srt.map(item => item[3]))];
          setNumSpeakers(uniqueVoices.length);
          setSpeakers(uniqueVoices.map(voice => ({
            name: voice,
            id: '',
            model: voiceModels[0] || ''
          })));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleSpeakersChange = (index, field, value) => {
    const updatedSpeakers = [...speakers];
    updatedSpeakers[index][field] = value;
    setSpeakers(updatedSpeakers);
  };

  const handleClear = () => {
    setSrtFile(null);
    setFinalFileName('');
    setNumSpeakers(1);
    setSpeakers([{ name: '', id: '', model: VOICE_MODELS[0] }]);
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!srtFile || !finalFileName) {
      setMessage('Please fill in all the fields');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('srt_file', srtFile);
    formData.append('final_file_name', finalFileName);
    formData.append('model', speakers[0]?.model || 'eleven_turbo_v2');
    const voiceNames = speakers.map(speaker => speaker.name);
    const voiceIds = speakers.map(speaker => speaker.id);
    formData.append('voice_names', JSON.stringify(voiceNames));
    formData.append('voice_ids', JSON.stringify(voiceIds));

    try {
      const response = await fetch(`${urlback}/api/process-srt`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.blob();
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${finalFileName}.mp3`);
      document.body.appendChild(link);
      link.click();
      setMessage('File processed and downloaded');
    } catch (error) {
      setMessage('There was an error processing your request.');
    }

    setIsLoading(false);
  };

  return (
    <div className="container">
      <h1>Text-To Speech</h1>
      <p className="subtitle">Dicapta's magic tool</p>

      <div className="form-group" style={{ marginLeft: '30%' }}>
        {srtFile ? (
          <div className="file-label-selected">
            <p className="file-name">Selected file: {srtFile.name}</p>
          </div>
        ) : (
          <label className="file-label" htmlFor="srt-upload">
            Upload .srt File <FileUploadIcon className="file-icon" />
            <input
              id="srt-upload"
              type="file"
              accept=".srt"
              onChange={handleFileChange}
              className="input-short"
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      <div className="form-group" style={{ marginLeft: '30%' }}>
        <label>Final file name</label>
        <DriveFileRenameOutlineIcon className="file-icon" />
        <input
          type="text"
          value={finalFileName}
          onChange={(e) => setFinalFileName(e.target.value)}
          className="input-short"
        />
      </div>

      {speakers.map((speaker, index) => (
        <div key={index} className="speaker-group">
          <div className="form-group">
            <label>Voice {index + 1} - Name:</label>
            <input
              type="text"
              value={speaker.name}
              onChange={(e) => handleSpeakersChange(index, 'name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Voice {index + 1} - ID:</label>
            <select
              value={speaker.id}
              onChange={(e) => handleSpeakersChange(index, 'id', e.target.value)}
            >
              <option value="">Select Voice ID</option>
              {availableVoices.map(voice => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name} ({voice.voice_id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Voice {index + 1} - Model:</label>
            <select
              value={speaker.model}
              onChange={(e) => handleSpeakersChange(index, 'model', e.target.value)}
            >
               {voiceModels.map((model) => (
          <option key={model.model_id} value={model.model_id}>
            {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <div className="form-actions">
        <button className="clean-btn" type="button" onClick={handleClear}>
          Clear
        </button>
        <button
          className="process-btn"
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Process'}
        </button>
      </div>

      <p>{message}</p>
    </div>
  );
};

export default TextToSpeechForm;