import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-select";
import FileUploader from "@/components/FileUploader";
import HandwritingInput from "@/components/HandwritingInput";
import VoiceRecorder from "@/components/VoiceRecorder";
import { createWorker } from "tesseract.js";
import axios from 'axios';
import { useDropzone } from "react-dropzone";
import { marked } from "marked";
import { Send, Mic, Upload, Youtube } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useUserActivity from "@/hooks/useUserActivity";
import { setIsIdle } from "@/store/userActivitySlice";
import GamifiedLearning from '../components/GamifiedLearning'
const Home = () => {
  const dispatch = useDispatch();// track isIdle from the hook 
  const { isIdle, lastActivity } = useUserActivity(30000); // 30s or your chosen timeout
  const storeIdle = useSelector((state) => state.userActivity.isIdle);
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
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputText, setInputText] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [voiceData, setVoiceData] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTranscription, setYoutubeTranscription] = useState("");
  const chatEndRef = useRef(null);


  // Function to get summary real quick
  const getSummary = async (text) => {
    try {
      const summaryResponse = await axios.post("http://localhost:3000/ai/askGeminiText", {
        prompt: `${text.trim()}\n summarize the above document in easy to understand way with proper context information`,
      });

      const summary = summaryResponse.data.content;
      console.log("Summary:", summary);

      const summaryText = {
        text: summary.trim(),
        type: "text",
        subtype: "summarization",
        timestamp: new Date().toISOString(),
      };
      setInputText((prevText) => [...prevText, summaryText]);
    } catch (error) {
      console.error("Error getting summary:", error);
    }
  };

  // Function tohandle image upload.
  const handleImage = async (file) => {
    const worker = await createWorker();
    try {
      await worker.load();
      await worker.reinitialize("eng");

      const { data: { text } } = await worker.recognize(file);

      if (!text || text.trim() === "" || isMeaninglessText(text)) {
        const newText = {
          text: "Image doesn't contain valid text",
          type: "text",
          sender: "ocr",
          timestamp: new Date().toISOString(),
        };
        setInputText((prevText) => [...prevText.slice(0, -1), newText]);
        return;
      }

      const imgBlob = new Blob([file], { type: file.type });
      const imageUrl = URL.createObjectURL(imgBlob);
      const imageText = {
        type: "image",
        imageUrl: imageUrl,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      setInputText((prevText) => [...prevText.slice(0, -1), imageText]);
      console.log("succesfully uploaded the image");

      const newText = {
        text: "And the text from the image is : " + text.trim(),
        type: "text",
        sender: "ocr",
        timestamp: new Date().toISOString(),
      };

      setInputText((prevText) => [...prevText, newText]);


      // Call getSummary from handleImage
      await getSummary(text.trim());

      const response = await axios.post("http://localhost:3000/ai/addDocument", {
        document: text.trim(),
        userId: "aitrika",
        fileId: "defaultFileId"
      });

      console.log("Document added:", response.data);
    } catch (error) {
      console.error("Error processing the image file:", error);
    } finally {
      await worker.terminate();
      setIsLoading(false); // Set loading to false
    }
  }

  // function to handle Pdf
  const handlePdf = async (file) => {
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
          sender: "ocr",
          type: "pdf",
          timestamp: new Date().toISOString(),
        };
        setInputText((prevText) => [...prevText.slice(0, -1), newTextFromPdf]);

        const summaryResponse = await axios.post("http://localhost:3000/ai/askGeminiText", {
          prompt: `${text.trim()}\n summarize the above document in easy to understand way with proper context information`,
        });

        const summary = summaryResponse.data.content;
        console.log("Summary:", summary);

        const summaryText = {
          text: summary.trim(),
          sender: "ocr",
          subtype: "summarization",
          timestamp: new Date().toISOString(),
        };
        setInputText((prevText) => [...prevText, summaryText]);

        const result = await axios.post("http://localhost:3000/ai/addDocument", {
          document: text.trim(),
          userId: "aitrika",
          fileId: "defaultFileId",
        });

        console.log("result", result);


      } catch (error) {
        console.error("Error processing the PDF file:", error.message);
      } finally {
        setIsLoading(false); // Set loading to false
      }
    };
    reader.readAsDataURL(file);
  }

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;

    setUploadedFiles(files);
    const file = files[0];

    setIsLoading(true); // Set loading to true

    const loadingMessage = {
      text: "Processing file, please wait...",
      type: "system",
      timestamp: new Date().toISOString(),
    };
    setInputText((prevText) => [...prevText, loadingMessage]);

    // Process Image with Tesseract.js
    if (file.type.startsWith("image/")) {
      handleImage(file);
    }

    // Process PDF with ConvertApi using axios
    if (file.type === "application/pdf") {
      handlePdf(file);
    }

  };

useEffect(() => { // Whenever isIdle changes, dispatch it to Redux 
  dispatch(setIsIdle(isIdle)); 
}, [isIdle, dispatch]);

useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      alert("You had minimised tabs!");
    } else {
      alert("Welcome back to the tab after tab switch!");
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, []);


  const transcribeHelper = async (youtubeUrl) => {
    try {
      const response = await axios.post("http://localhost:3000/ai/transcribeYouTube", {
        videoUrl: youtubeUrl
      });
      const transcript = response?.data?.transcription;
      const joinedTranscript = transcript.map(item => item.text).join(" ");

      await getSummary(joinedTranscript);
      try {
        const result = await axios.post("http://localhost:3000/ai/addDocument", {
          document: joinedTranscript,
          userId: "aitrika",
          fileId: "0",
        });
        console.log("Document added:", result);
      } catch (error) {
        console.error("Error adding document:", error);
      }
      // Extract video ID from YouTube URL
      const videoId = youtubeUrl.includes('v=') ? youtubeUrl.split('v=')[1].split('&')[0] : youtubeUrl.split('/').pop();

      setInputText((prevText) => [
        ...prevText,
        {
          text: joinedTranscript.trim(),
          type: "youtube",
          videoId: videoId,
          sender: "ocr",
          timestamp: new Date().toISOString(),
        },
      ]);

      // setInputText((prevText) => [
      //   ...prevText,
      //   {
      //     text: transcript.trim(),
      //     type: "ocr",
      //     timestamp: new Date().toISOString(),
      //   }
      // ]);
    } catch (error) {
      console.error("Error transcribing YouTube video:", error);
    }
  };

  const handleRecordingComplete = (audioUrl) => {
    setVoiceData(audioUrl);
    setShowRecorder(false); // Hide the recorder after saving
  };

  const handleTextButton = () => {
    if (inputValue.includes('youtube.com') || inputValue.includes('youtu.be')) {
      transcribeHelper(inputValue);
      const videoId = youtubeUrl.includes('v=') ? youtubeUrl.split('v=')[1].split('&')[0] : youtubeUrl.split('/').pop();
      setInputText((prevText) => [
        ...prevText,
        {
          text: inputValue,
          type: "youtube",
          videoId,
          sender: "user",
          timestamp: new Date().toISOString(),
        }
      ]);
      setInputValue('');
      return;
    }
    const text = inputValue;
    const newText = {
      text: text.trim(),
      type: "text",
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setInputText((prevText) => [...prevText, newText]);
    setInputValue("");
    const prompt = inputValue;
    axios.post("http://localhost:3000/ai/ask", {
      prompt: prompt,
      userId: "aitrika",
      fileId: "0",
    })
      .then(response => {
        console.log(response.data);
        const message = response.data.content;

        const newText = {
          text: message.trim(),
          sender: "ocr",
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
      //do speech to text here & send text to chromadb
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleTextButton();
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    handleFileUpload(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true
  });


  const renderMessageContent = (chat) => {
    switch (chat.type) {
      case 'pdf':
        return (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">PDF Document</h3>
                  <p className="text-xs text-gray-500">Extracted text content</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{chat.text}</p>
              </div>
            </div>
            {chat.subtype === 'summarization' && (
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-md">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-medium text-blue-800">Quick Summary</h4>
                </div>
                <p className="text-sm text-blue-700 leading-relaxed">{chat.text}</p>
              </div>
            )}
          </div>
        );
      case 'image':
        console.log("One image is there ", chat);

        return (
          <div className="flex flex-col gap-2">
            <img src={chat.imageUrl} alt="Uploaded content" className="max-w-lg z-[10] rounded-lg shadow-sm" />
            <p className="text-sm text-gray-600">{chat.text}</p>
          </div>
        );
      case 'youtube':
        console.log("Chat video : ", chat);

        return (
          <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
            <div className="relative w-full pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
              <iframe
                src={`https://www.youtube.com/embed/${chat.videoId}`}
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Youtube className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium text-red-800 text-lg">Transcription</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-200 scrollbar-track-transparent">
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {chat.text}
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: marked(chat.text) }} />;
    }
  };
  return (
    <div className=" min-h-[100vh] w-[100vw] bg-gradient-to-b from-blue-50 to-white flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">StudyMitra</h1>
      <div className="mb-4 p-4 bg-gray-100 rounded shadow">
        <p>
          <strong>User Status:</strong> {storeIdle ? "Idle" : "Active"}
        </p>
        <p>
          <strong>Last Activity:</strong> {new Date(lastActivity).toLocaleTimeString()}
        </p>
      </div>

      <div className="h-[calc(100vh-100px)] w-full max-w-7xl flex flex-col flex-grow bg-white rounded-xl shadow-xl overflow-y-scroll border border-gray-200">
      <div {...getRootProps()} className="flex-grow relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isDragActive && (
          <div className="bg-blue-50 bg-opacity-90 w-full h-full flex items-center justify-center">
          <div className="text-center">
            <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-2" />
            <p className="text-sm sm:text-base text-blue-600 font-medium">Drop your files here</p>
          </div>
          </div>
        )}
        </div>

        <div className="h-full p-3 sm:p-6 overflow-y-auto">
        {inputText.map((chat, index) => (
  <div key={index} className="mb-3 sm:mb-4">
    <div className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`p-3 sm:p-4 rounded-xl max-w-[90%] sm:max-w-[80%] ${
        chat.sender === 'user'
          ? 'bg-blue-500 text-white'
          : chat.sender === 'system'
          ? 'bg-yellow-50 border border-yellow-200'
          : chat.sender === 'ocr'
          ? 'bg-green-50 border border-green-200'  // Highlight OCR messages
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs opacity-75">
            {chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString() : 'Invalid Date'}
          </span>
        </div>
        {renderMessageContent(chat)}
        
        {chat.sender === 'ocr' && (
  <button
    onClick={() => {
      if (!chat.text) return alert("No text to speak!"); 

      const speech = new SpeechSynthesisUtterance(chat.text);

      // Improved Hindi Detection
      const isHindi = /[\u0900-\u097F]/.test(chat.text);
      speech.lang = isHindi ? "hi-IN" : "en-US";

      // Fix: Cancel any ongoing speech before speaking
      speechSynthesis.cancel();
      speechSynthesis.speak(speech);
    }}
    className="mt-2 px-3 w-[100px] h-[100px] py-1 text-sm z-[100] bg-green-500 text-black rounded hover:bg-green-600 transition"
  >
    🔊 Speak
  </button>
        )}


      </div>
    </div>
  </div>
))}

        
  {inputText.length > 0 && (    
    <GamifiedLearning 
      documentContent={inputText
        .filter(msg => msg.type === 'text' || msg.type === 'pdf')
        .map(msg => msg.text)
        .join('\n')}
    />
  )}

        <div ref={chatEndRef} />
        </div>
      </div>

      <div className="p-2 sm:p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-4">
        {showRecorder ? (
          <div className="w-full bg-gray-50 rounded-lg p-2 sm:p-4">
          <VoiceRecorder
            onSave={(url) => {
            setRecordedAudio(url);
            setShowRecorder(false);
            }}
          />
          </div>

          
        ) : (
          <div className="flex w-full gap-1 sm:gap-2">
          <Input
            type="text"
            placeholder="Type message or YouTube URL..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextButton()}
            className="flex-grow text-sm sm:text-base"
          />
          <Button
            onClick={() => setShowRecorder(true)}
            className="bg-gray-100 hover:bg-gray-200 p-1.5 sm:p-2 rounded-lg"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleTextButton}
            className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          </div>
        )}
        </div>
      </div>
      </div>
    </div>
    );
  };

export default Home;
