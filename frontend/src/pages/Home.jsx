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
  const isMeaninglessText = (text) => {
    if (!text || typeof text !== "string") return true; // Handle empty/null cases
  
    const MIN_TEXT_LENGTH = 20; // Ensures minimum content requirement
    if (text.trim().length < MIN_TEXT_LENGTH) return true;
  
    // Regex patterns for detecting meaningless text
    const meaninglessPatterns = [
      /^[^a-zA-Z0-9]+$/, // Only symbols or whitespace
      /^(\W|\d)*$/, // Only numbers or non-word characters
      /^(.)(\1{5,})$/, // Highly repetitive single character (aaaaa, $$$$$)
      /^[#@!$%^&*()_+={}[\]|:;"'<>,.?/~`-]+$/, // Just symbols
      /^[A-Za-z]{1,2}$/, // Single or double random letters
    ];
  
    return meaninglessPatterns.some((pattern) => pattern.test(text));
  };
  
  // ✅ Test Cases
  console.log(isMeaninglessText("    ")); // true (empty)
  console.log(isMeaninglessText("!!@@###***")); // true (only symbols)
  console.log(isMeaninglessText("aaaaaa")); // true (repetitive)
  console.log(isMeaninglessText("Hello world! This is extracted text.")); // false (valid text)
  console.log(isMeaninglessText("12@#&*@#*")); // true (meaningless)
  console.lo
  
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
        try {
          const worker = await createWorker();
          await worker.load();
          await worker.reinitialize("eng");

          const { data: { text } } = await worker.recognize(file);

          if (!text || text.trim() === "" || isMeaninglessText(text)) {
            const newText = {
              text: "Image doesn't contain valid text",
              type: "ocr",
              timestamp: new Date().toISOString(),
            };
            setInputText((prevText) => [...prevText, newText]);
            return;
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

          console.log("Document added:", response.data);
        } catch (error) {
          console.error("Error processing the image file:", error);
        } finally {
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
          fileId:  "defaultFileId",
        });

        console.log("result" , result);
        

      } catch (error) {
        console.error("Error processing the PDF file:", error.message);
      }
      };
      reader.readAsDataURL(file);
    }

};



  const handleVoiceSave = (audioUrl) => {
    console.log(audioUrl);
    
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
    setInputValue("");
    const prompt = inputValue;
    axios.post("http://localhost:3000/ai/ask", {
      prompt: prompt,
      userId: "user123", // Replace with actual user ID
      fileId:"defaultFileId" // Replace with actual logic if needed
    })
    .then(response => {
      console.log(response.data);
      const message = response.data.content;
      
      const newText = {
        text: message.trim(),
        type: "ocr",
        timestamp: new Date().toISOString(),
      };
      setInputText((prevText) => [...prevText, newText]);
  
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
    <div className="min-h-screen h-[100vh] w-[100vw] bg-gray-100 text-gray-900 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">StudyMitra</h1>
      
      <div className="h-[calc(100vh-120px)] w-full max-w-3xl flex flex-col flex-grow bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
        {/* Chat Preview Section */}
        <div className="flex-grow p-6 overflow-y-auto bg-gray-50 rounded-t-lg">
          {inputText.map((chat, index) => (
            <div key={index} className="mb-4">
              
              <div className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-[80%] shadow-md ${
                  chat.type === 'user' ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                  <p className="text-xs text-gray-500">{new Date(chat.timestamp).toLocaleTimeString()}</p>
                  <span className="text-sm text-gray-800">{chat.text}</span>
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
        <div className="p-4 border-t border-gray-300 bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextButton()}
              className="flex-grow"
            />
            <Button
              variant="ghost"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg shadow-md"
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