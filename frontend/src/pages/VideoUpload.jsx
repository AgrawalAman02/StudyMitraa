import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { createWorker } from "tesseract.js";
import axios from 'axios';

const VideoAnalysis = ({ onAnalysisComplete }) => {
    const [video, setVideo] = useState(null);
    const [frames, setFrames] = useState([]);
    const [selectedFrame, setSelectedFrame] = useState(null);
    const [extractedText, setExtractedText] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [analysis, setAnalysis] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const extractFrames = async (videoFile) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);

        return new Promise((resolve) => {
            video.onloadedmetadata = async () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const frameRate = 1; // Extract 1 frame per second
                const frames = [];

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                for (let i = 0; i < video.duration; i += frameRate) {
                    video.currentTime = i;
                    await new Promise(resolve => {
                        video.onseeked = () => {
                            ctx.drawImage(video, 0, 0);
                            frames.push({
                                time: i,
                                dataUrl: canvas.toDataURL('image/jpeg'),
                            });
                            resolve();
                        };
                    });
                }

                resolve(frames);
            };
        });
    };

    const processFrame = async (frame) => {
        try {
            const worker = await createWorker();
            await worker.load();
            await worker.reinitialize('eng+equ'); // Initialize with English and equation recognition

            const { data: { text } } = await worker.recognize(frame.dataUrl);
            await worker.terminate();

            return {
                time: frame.time,
                text: text.trim(),
                dataUrl: frame.dataUrl,
            };
        } catch (error) {
            console.error('Error processing frame:', error);
            return null;
        }
    };

    const handleVideoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        setVideo(URL.createObjectURL(file));

        try {
            const extractedFrames = await extractFrames(file);
            setFrames(extractedFrames);

            const processedFrames = await Promise.all(
                extractedFrames.map(processFrame)
            );

            const validFrames = processedFrames.filter(frame => frame && frame.text);
            setExtractedText(validFrames);

            // Add processed content to your AI context
            const combinedText = validFrames
                .map(frame => `Time ${frame.time}s: ${frame.text}`)
                .join('\n');

            await axios.post("http://localhost:3000/ai/addDocument", {
                document: combinedText,
                userId: "video-analysis",
                fileId: file.name
            });

        } catch (error) {
            console.error('Error processing video:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handlePromptSubmit = async () => {
        if (!prompt.trim()) return;

        try {
            const response = await axios.post("http://localhost:3000/ai/askGeminiText", {
                prompt: `Context from video:\n${extractedText
                    .map(frame => `Time ${frame.time}s: ${frame.text}`)
                    .join('\n')}\n\nQuestion: ${prompt}`,
            });

            setAnalysis(response.data.content);
        } catch (error) {
            console.error('Error getting AI response:', error);
        }
    };

    const jumpToFrame = (time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };

    return (
        <div className="w-full max-w-2xl max-h-2xl mx-auto p-4 space-y-6">
            <div className="flex flex-col items-center gap-4">
                <label className="w-full">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="text-sm text-gray-600">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Upload a video</span>
                                    <input
                                        type="file"
                                        className="sr-only"
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </label>

                {isProcessing && (
                    <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing video frames...</span>
                    </div>
                )}

                {video && (
                    <div className="w-full space-y-4">
                        <div className=" relative">
                            <video
                                ref={videoRef}
                                src={video}
                                className="w-full rounded-lg"
                                controls={false}
                                onTimeUpdate={handleTimeUpdate}
                            />
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-50 p-2 rounded-lg">
                                <Button
                                    onClick={() => {
                                        if (videoRef.current) {
                                            videoRef.current.currentTime -= 5;
                                        }
                                    }}
                                    className="p-2"
                                >
                                    <SkipBack className="w-5 h-5" />
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (videoRef.current) {
                                            if (isPlaying) {
                                                videoRef.current.pause();
                                            } else {
                                                videoRef.current.play();
                                            }
                                            setIsPlaying(!isPlaying);
                                        }
                                    }}
                                    className="p-2"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-5 h-5" />
                                    ) : (
                                        <Play className="w-5 h-5" />
                                    )}
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (videoRef.current) {
                                            videoRef.current.currentTime += 5;
                                        }
                                    }}
                                    className="p-2"
                                >
                                    <SkipForward className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 overflow-x-auto p-4 bg-gray-50 rounded-lg">
                            {frames.map((frame, index) => (
                                <div
                                    key={index}
                                    className={`relative cursor-pointer transition-all ${selectedFrame === index ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedFrame(index);
                                        jumpToFrame(frame.time);
                                    }}
                                >
                                    <img
                                        src={frame.dataUrl}
                                        alt={`Frame ${index}`}
                                        className="w-full h-10 object-cover rounded"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                                        {frame.time.toFixed(1)}s
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Ask a question about the video content..."
                                    className="flex-grow"
                                />
                                <Button onClick={handlePromptSubmit}>
                                    Ask
                                </Button>
                            </div>

                            {analysis && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h3 className="font-medium text-blue-900 mb-2">Analysis:</h3>
                                    <p className="text-blue-800">{analysis}</p>
                                </div>
                            )}

                            {selectedFrame !== null && extractedText[selectedFrame] && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium mb-2">Extracted Text:</h3>
                                    <p>{extractedText[selectedFrame].text}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoAnalysis;