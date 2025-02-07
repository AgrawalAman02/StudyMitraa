import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReactMediaRecorder } from 'react-media-recorder';

const VoiceRecorder = ({ onSave, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);

  const handleStartRecording = (startRecording) => {
    startRecording();
    setIsRecording(true);
  };

  const handleStopRecording = (stopRecording) => {
    stopRecording();
    setIsRecording(false);
  };

  const handleSaveRecording = () => {
    if (mediaBlobUrl) {
      onRecordingComplete(mediaBlobUrl);
      setMediaBlobUrl(null);
    }
  };

  return (
    <div className="voice-recorder flex flex-col items-center gap-2">
      <ReactMediaRecorder
        audio
        render={({ startRecording, stopRecording, mediaBlobUrl }) => (
          <>
            {isRecording && (
              <p className="text-red-500 font-semibold animate-pulse">
                Recording in progress...
              </p>
            )}
            {isRecording ? (
              <Button onClick={() => handleStopRecording(stopRecording)}>Stop Recording</Button>
            ) : (
              <Button onClick={() => handleStartRecording(startRecording)}>Start Recording</Button>
            )}
            {mediaBlobUrl && (
              <audio controls src={mediaBlobUrl} className="w-full mt-2">
                Your browser does not support the audio element.
              </audio>
            )}
          </>
        )}
        onStop={(blobUrl, blob) => {
          const audioUrl = URL.createObjectURL(blob);
          setMediaBlobUrl(audioUrl);
          onSave(audioUrl);
        }}
      />
      <Button onClick={handleSaveRecording} disabled={!mediaBlobUrl}>
        Save Recording
      </Button>
    </div>
  );
};

export default VoiceRecorder;