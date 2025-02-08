import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-select";
import { Send } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import HandwritingInput from "@/components/HandwritingInput";
import VoiceRecorder from "@/components/VoiceRecorder";
import axios from 'axios';

const Home = () => {
  const isLoading = false;
  const [inputValue, setInputValue] = useState("");
  const [inputText, setInputText] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [voiceData, setVoiceData] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [showRecorder, setShowRecorder] = useState(true);

  const handleFileUpload = (files) => {
    setUploadedFiles(files);
  };

  const handleVoiceSave = (audioUrl) => {
    setRecordedAudio(audioUrl);
  };

  const handleRecordingComplete = (audioUrl) => {
    setVoiceData(audioUrl);
    setShowRecorder(false); // Hide the recorder after saving
  };

  const handleTextButton = async() => {
    setInputText((prevText) => [...prevText, inputValue]);
    const prompt = inputValue;
    const response = await axios.post("http://localhost:3000/ai/ask", {
      prompt: prompt,
      userId: "user123", // Replace with actual user ID
      fileId: "file123"  // Replace with actual file ID
    });
    console.log(response);
    
    setInputValue(""); // Clear the input field after adding the text
    if (recordedAudio) {
      setVoiceData(recordedAudio);
      setRecordedAudio(null);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleTextButton();
    }
  };

  return (
    <div className="w-full h-screen p-4 bg-[#181515] text-[#feecec]">
      {/* Title */}
      <div className="flex justify-center font-bold text-3xl font-serif mb-2">
        <h1>Welcome to StudyMitra</h1>
      </div>

      {/* Separator */}
      <div className="mb-4 mx-auto w-1/4">
        <hr />
      </div>

      {/* Main content area */}
      <div className="flex flex-col gap-4 justify-between">
        {/* Preview Column */}
        <div className="w-1/2 mx-auto border border-gray-600 p-2 rounded-md max-h-[320px] overflow-y-auto">
          <h2 className="text-xl font-bold mx-auto text-gray-600 mb-4">Preview</h2>

          {/* handle text preview */}
          {inputText.length > 0 &&
            inputText.slice(-10).map((chat, index) => (
              <div className="flex justify-end mb-4" key={index}>
                <span className="bg-[#4c4a4b7c] text-white flex h-8 min-w-4 w-fit items-end p-4 pt-8 mr-2 rounded-3xl">
                  {chat}
                </span>
              </div>
            ))}

          {/* Preview Uploaded Files (images, pdf, videos) */}
          {uploadedFiles.map((file, idx) => {
            if (file.type.startsWith("image/")) {
              return (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="mb-2 max-h-40 object-cover rounded mx-auto w-fit"
                />
              );
            } else if (file.type.startsWith("video/")) {
              return (
                <video key={idx} controls className="mb-2 max-h-40 rounded">
                  <source src={URL.createObjectURL(file)} />
                  Your browser does not support the video tag.
                </video>
              );
            } else if (file.type === "application/pdf") {
              return (
                <p key={idx} className="mb-2">
                  PDF file: <strong>{file.name}</strong>
                </p>
              );
            }
            return null;
          })}

          {/* Display recorded voice */}
          {voiceData && (
            <div className="mt-2">
              <h3 className="font-semibold mb-1">Recorded Audio:</h3>
              <audio controls src={voiceData} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        {/* Input + Tools Column */}
        <div className="w-1/2 mx-auto mt-10 border p-4">
          {showRecorder && (
            <div className="mb-2 p-4 ps-12 flex gap-2 items-center">
              <VoiceRecorder onSave={handleVoiceSave} onRecordingComplete={handleRecordingComplete} />
            </div>
          )}

          {/* File Uploader (Drag & Drop) */}
          <div className="mb-2 p-4 ps-12 flex gap-2 items-center">
            <FileUploader onFileUpload={handleFileUpload} />
          </div>

          <div className="flex">
            <div className="mb-2 mx-auto">
              <Input
                type="text"
                id="textInput"
                placeholder="Start typing..."
                className="rounded-full w-[500px] mb-2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            {/* Submit Button */}
            <Button
              variant="ghost"
              disabled={isLoading}
              className="rounded-full h-16 hover:text-blue-700 mx-auto"
              onClick={handleTextButton}
            >
              <Send />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;