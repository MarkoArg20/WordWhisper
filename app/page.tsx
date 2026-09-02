'use client';

import { useEffect, useRef, useState } from 'react';

interface Word {
  id: string;
  word: string;
  created_at: string;
}

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [savedWord, setSavedWord] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Fetch words on mount
    fetchWords();
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setSavedWord('');
      recognitionRef.current.start();
    }
  };

  const saveWord = async (word: string) => {
    if (!word.trim()) return;

    try {
      const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.trim() }),
      });

      if (res.ok) {
        setSavedWord(word.trim());
        setTranscript('');
        fetchWords();
      } else {
        console.error('Failed to save word');
      }
    } catch (err) {
      console.error('Error saving word:', err);
    }
  };

  const fetchWords = async () => {
    try {
      const res = await fetch('/api/words');
      if (res.ok) {
        const { data } = await res.json();
        setWords(data || []);
      }
    } catch (err) {
      console.error('Error fetching words:', err);
    }
  };

  const deleteWord = async (id: string) => {
    try {
      const res = await fetch(`/api/words?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchWords();
      }
    } catch (err) {
      console.error('Error deleting word:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">English Learning App</h1>

        {/* Mic Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <button
            onClick={startListening}
            disabled={isListening}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg mb-4 transition"
          >
            {isListening ? '🎤 Listening...' : '🎤 Click to say a word'}
          </button>

          {transcript && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">You said:</p>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-lg font-semibold text-gray-800">{transcript}</p>
              </div>
              <button
                onClick={() => saveWord(transcript)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                ✓ Save this word
              </button>
            </div>
          )}

          {savedWord && (
            <div className="bg-green-50 border-l-4 border-green-600 p-4">
              <p className="text-green-800">✓ Saved: <span className="font-bold">{savedWord}</span></p>
            </div>
          )}
        </div>

        {/* Words List Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Words ({words.length})</h2>

          {words.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No words yet. Start capturing!</p>
          ) : (
            <div className="space-y-2">
              {words.map((word) => (
                <div
                  key={word.id}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{word.word}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(word.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteWord(word.id)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}