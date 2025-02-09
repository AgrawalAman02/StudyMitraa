import React, { useState } from "react";

const TextToSpeech = () => {
  const [text, setText] = useState("");

  const speakText = () => {
    if (!text.trim()) return;
    const speech = new SpeechSynthesisUtterance(text);

    // Auto-detect language
    const isHindi = /[अ-ह]/.test(text);
    speech.lang = isHindi ? "hi-IN" : "en-US"; // Hindi or English

    speechSynthesis.speak(speech);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <textarea
        className="border p-2 w-full"
        rows="4"
        placeholder="Enter text to speak..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={speakText}
      >
        Speak
      </button>
    </div>
  );
};

export default TextToSpeech;
