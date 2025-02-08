import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-select";
import { Send } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import HandwritingInput from "@/components/HandwritingInput";
import VoiceRecorder from "@/components/VoiceRecorder";
import { createWorker } from "tesseract.js";
import ConvertApi from 'convertapi-js'
import axios from 'axios';
const Home = () => {
  const isLoading = false;
  const [inputValue, setInputValue] = useState("");
  const [inputText, setInputText] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [voiceData, setVoiceData] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [showRecorder, setShowRecorder] = useState(true);
  
  const handleFileUpload = async (files) => {
    if (files.length === 0) return;
    
    setUploadedFiles(files);
    const file = files[0];

    // Process Image with Tesseract.js
    if (file.type.startsWith("image/")) {
        const worker = await createWorker();
        await worker.load();
        await worker.reinitialize("eng");

        const imageURL = URL.createObjectURL(file);
        try {
            const { data: { text } } = await worker.recognize(imageURL);
            
            if (!text || text.trim() === "") {
          throw new Error("No text could be extracted from the image");
            }

            const newText = {
              text: text.trim(),
              type: "ocr",
              timestamp: new Date().toISOString(),
            };
         

            setInputText((prevText) => [...prevText, newText]);
            
            const response = await axios.post("http://localhost:3000/ai/addDocument", {
          document: text.trim(),
          userId: "user123",
          fileId: "defaultFileId"
            });


            console.log(response.data);
            const nextOcrChat = {
              text: inputValue.trim(),
              type: "ocr",
              timestamp: new Date().toISOString(),
            };
            setInputText((prevText) => [...prevText, nextOcrChat]);
            
        } catch (error) {
            console.error("Error processing the image file:", error);
        } finally {
            URL.revokeObjectURL(imageURL);
            await worker.terminate();
        }
    }

    // Process PDF with ConvertApi using axios
    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async (e) => {
      const base64File = e.target.result.split(",")[1]; // Get base64 part of the file

      try {
        const response = await axios.post(
        "https://v2.convertapi.com/convert/pdf/to/txt",
        {
          Parameters: [
          {
            Name: "File",
            FileValue: {
            Name: file.name,
            Data: base64File,
            },
          },
          ],
        },
        {
          headers: {
          Authorization: "Bearer secret_CvCcnX2B3RXtpZNR",
          "Content-Type": "application/json",
          },
        }
        );

        const text = atob(response.data.Files[0].FileData);
        if (!text || text.trim() === "") {
          throw new Error("No text could be extracted from the PDF");
        }

        const newTextFromPdf = {
          text: text.trim(),
          type: "ocr",
          timestamp: new Date().toISOString(),
        };
        setInputText((prevText) => [...prevText, newTextFromPdf]);

        const result = await axios.post("http://localhost:3000/ai/addDocument", {
          document: text.trim(),
          userId: "user123",
          fileId: file.name || "defaultFileId",
        });

        console.log(result.data);
        console.log(text);
        const newText = {
          text: text.trim(),
          type: "ocr",
          timestamp: new Date().toISOString(),
        };
        setInputText((prevText) => [...prevText, newText]);

        await axios.post("http://localhost:3000/ai/addDocument", {
        document: text.trim(),
        userId: "user123",
        fileId: file.name || "defaultFileId",
        });
      } catch (error) {
        console.error("Error processing the PDF file:", error);
      }
      };
      reader.readAsDataURL(file);
    }

};



  const handleVoiceSave = (audioUrl) => {
    setRecordedAudio(audioUrl);
  };

  const handleRecordingComplete = (audioUrl) => {
    setVoiceData(audioUrl);
    setShowRecorder(false); // Hide the recorder after saving
  };

  const handleTextButton = () => {
    const text = inputValue;
    const newText = {
      text: text.trim(),
      type: "user",
      timestamp: new Date().toISOString(),
    };
    setInputText((prevText) => [...prevText, newText]);
    const prompt = inputValue;
    axios.post("http://localhost:3000/ai/ask", {
      prompt: prompt,
      userId: "user123", // Replace with actual user ID
      fileId:"defaultFileId" // Replace with actual logic if needed
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error("Error querying the AI:", error);
    });
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
    <div className="min-h-screen h-[100vh] w-[100vw] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center p-2">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-violet-400 mb-6">StudyMitra</h1>
      
      <div className="h-[calc(100vh-120px)] w-full max-w-3xl flex flex-col flex-grow bg-slate-800/50 rounded-xl shadow-2xl overflow-hidden border border-violet-500/20">
        {/* Chat Preview Section */}
        <div className="flex-grow p-6 overflow-y-auto bg-slate-900/50 rounded-t-xl">
          {inputText.map((chat, index) => (
            <div key={index} className="mb-4">
              {console.log(chat)}
              
              <div className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[80%] shadow-lg ${
                  chat.type === 'user' ? 'bg-teal-500/80 backdrop-blur-sm' : 'bg-violet-500/80 backdrop-blur-sm'
                }`}>
                  <p className="text-xs text-gray-200">{new Date(chat.timestamp).toLocaleTimeString()}</p>
                  <span className="text-xs text-gray-100">{chat.text}</span>
                </div>
              </div>
              {index === inputText.length - 1 && recordedAudio && (
                <div className="mt-2 flex justify-end">
                  <audio 
                    controls
                    className="max-w-[80%] rounded-lg shadow-md"
                    src={recordedAudio}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-violet-500/20 bg-slate-800/50 rounded-b-xl">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextButton()}
            />
            <Button
              variant="ghost"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-3 rounded-lg shadow-lg"
              onClick={handleTextButton}
            >
              <Send size={20} className="text-white" />
            </Button>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <VoiceRecorder onSave={handleVoiceSave} />
            <FileUploader onFileUpload={handleFileUpload} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;