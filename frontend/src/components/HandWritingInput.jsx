import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';

const HandwritingInput = ({ onSave }) => {
  const canvasRef = useRef(null);

  const handleSave = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    onSave(dataUrl);
  };

  return (
    <div className="handwriting-input">
      <canvas ref={canvasRef} width="400" height="200" className="border-2 border-gray-400"></canvas>
      <Button onClick={handleSave}>Save Handwriting</Button>
    </div>
  );
};

export default HandwritingInput;