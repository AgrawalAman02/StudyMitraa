import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Brain, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const GamifiedLearning = ({ documentContent }) => {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [previousQuestions, setPreviousQuestions] = useState(new Set());
  const [userProgress, setUserProgress] = useState({
    points: 0,
    level: 1,
    completedChallenges: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const generateChallenge = async () => {
    setLoading(true);
    try {
      // Modified prompt to ensure variety and prevent repetition
      const prompt = `Based on this content: "${documentContent}", generate a new and unique multiple choice question (different from previous ones) with 4 options and mark the correct answer. Make sure each question tests a different aspect or concept. Return ONLY a JSON object with this exact format without any markdown or code blocks: {"question": "your question here", "options": ["option1", "option2", "option3", "option4"], "correctIndex": correct_answer_index}. Make the question challenging and different from: ${Array.from(previousQuestions).join(', ')}`;
      
      const response = await axios.post("http://localhost:3000/ai/askGeminiText", {
        prompt: prompt
      });

      const jsonStr = response.data.content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        const challenge = JSON.parse(jsonStr);
        if (
          challenge.question &&
          Array.isArray(challenge.options) &&
          typeof challenge.correctIndex === 'number' &&
          !previousQuestions.has(challenge.question)
        ) {
          setCurrentChallenge(challenge);
          setPreviousQuestions(prev => new Set([...prev, challenge.question]));
          setSelectedAnswer(null);
          setIsCorrect(null);
        } else {
          throw new Error('Invalid challenge format or duplicate question');
        }
      } catch (parseError) {
        console.error("Error parsing challenge JSON:", parseError);
        setCurrentChallenge({
          question: "Error generating question. Please try again.",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctIndex: 0
        });
      }
    } catch (error) {
      console.error("Error generating challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelection = (index) => {
    setSelectedAnswer(index);
    const correct = index === currentChallenge.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setUserProgress(prev => ({
        ...prev,
        points: prev.points + 10,
        completedChallenges: prev.completedChallenges + 1,
        level: Math.floor(prev.points / 100) + 1
      }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Star className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="font-bold text-2xl text-blue-600">{userProgress.points}</div>
              <div className="text-sm text-blue-600">Points</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Brain className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="font-bold text-2xl text-green-600">{userProgress.level}</div>
              <div className="text-sm text-green-600">Level</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="font-bold text-2xl text-purple-600">{userProgress.completedChallenges}</div>
              <div className="text-sm text-purple-600">Completed</div>
            </div>
          </div>
          <Progress value={(userProgress.points % 100)} className="h-2" />
          <p className="text-sm text-gray-500 mt-2 text-center">
            {100 - (userProgress.points % 100)} points to next level
          </p>
        </CardContent>
      </Card>

      {/* Challenge Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Challenge</span>
            <Button 
              onClick={generateChallenge} 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              New Challenge
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Generating challenge...</p>
            </div>
          ) : currentChallenge ? (
            <div className="space-y-4">
              <p className="text-lg font-medium text-gray-800">{currentChallenge.question}</p>
              <div className="space-y-2">
                {currentChallenge.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelection(index)}
                    disabled={isCorrect !== null}
                    className={`w-full justify-start p-4 ${
                      selectedAnswer === index
                        ? isCorrect
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                        : selectedAnswer !== null && index === currentChallenge.correctIndex
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>
              {isCorrect !== null && (
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? '🎉 Correct! +10 points' : '❌ Incorrect. Try another challenge!'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Click "New Challenge" to start learning!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamifiedLearning;