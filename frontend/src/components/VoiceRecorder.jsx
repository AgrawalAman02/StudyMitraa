import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";

const VoiceRecorder = ({ onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const recorderControls = useVoiceVisualizer();
    const {
        // ... (Extracted controls and states, if necessary)
        recordedBlob,
        error,
    } = recorderControls;

    useEffect(() => {
        if (!recordedBlob) return;

        console.log(recordedBlob);
    }, [recordedBlob, error]);

    // Get the error when it occurs
    useEffect(() => {
        if (!error) return;

        console.error(error);
    }, [error]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      onSave(audioUrl);
      audioChunksRef.current = [];
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="voice-recorder">
      {isRecording ? (
        <>
        <VoiceVisualizer controls={recorderControls} />
        <Button onClick={handleStopRecording}>Stop Recording</Button>
        
        </>
      ) : (
        <Button onClick={handleStartRecording}>Start Recording</Button>
      )}
    </div>
  );
};

export default VoiceRecorder;