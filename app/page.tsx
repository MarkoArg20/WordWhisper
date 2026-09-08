'use client';

import { useEffect, useRef, useState } from 'react';

interface Word {
  id: string;
  word: string;
  translation: string;
  created_at: string;
  note?: string;
  ease_factor?: number;
  interval_days?: number;
  next_review_date?: string;
  review_count?: number;
  last_reviewed?: string;
}

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedWord, setTypedWord] = useState('');
  const [savedWord, setSavedWord] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<'capture' | 'list' | 'practice'>('capture');
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    fetchWords();
  }, []);

  // Filter words based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWords(words);
    } else {
      setFilteredWords(
        words.filter((word) =>
          word.word.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [words, searchQuery]);

  // Fetch due words for practice
  useEffect(() => {
    fetchDueWords();
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setSavedWord('');
      setTypedWord('');
      recognitionRef.current.start();
    }
  };

  const cancelTranscript = () => {
    setTranscript('');
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
        setTypedWord('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchWords();
        fetchDueWords();
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

  const fetchDueWords = async () => {
    try {
      const res = await fetch('/api/words/review');
      if (res.ok) {
        const { data } = await res.json();
        setDueWords(data || []);
        setCurrentReviewIndex(0);
      }
    } catch (err) {
      console.error('Error fetching due words:', err);
    }
  };

  const deleteWord = async (id: string) => {
    try {
      const res = await fetch('/api/words', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchWords();
        fetchDueWords();
      }
    } catch (err) {
      console.error('Error deleting word:', err);
    }
  };

  const openNoteDialog = (word: Word) => {
    setSelectedWord(word);
    setNoteText(word.note || '');
  };

  const closeNoteDialog = () => {
    setSelectedWord(null);
    setNoteText('');
  };

  const saveNote = async () => {
    if (!selectedWord) return;

    try {
      const res = await fetch('/api/words/note', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedWord.id, note: noteText }),
      });

      if (res.ok) {
        fetchWords();
        closeNoteDialog();
      }
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const submitReview = async (quality: number) => {
    if (currentReviewIndex >= dueWords.length) return;

    const word = dueWords[currentReviewIndex];

    try {
      const res = await fetch('/api/words/review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: word.id, quality }),
      });

      if (res.ok) {
        if (currentReviewIndex + 1 < dueWords.length) {
          setCurrentReviewIndex(currentReviewIndex + 1);
        } else {
          // All reviews done
          fetchDueWords();
        }
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const currentWord = dueWords[currentReviewIndex];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-900 sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-5 sm:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Word Whisper</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-900 bg-black/50 sticky top-[69px] z-40">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('capture')}
              className={`py-4 font-medium border-b-2 transition-all ${
                activeTab === 'capture'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Capture
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 font-medium border-b-2 transition-all ${
                activeTab === 'list'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Words ({words.length})
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`py-4 font-medium border-b-2 transition-all relative ${
                activeTab === 'practice'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Practice
              {dueWords.length > 0 && (
                <span className="absolute -top-1 -right-3 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {dueWords.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16 sm:px-8 sm:py-24">
        
        {/* Capture Tab */}
        {activeTab === 'capture' && (
          <section className="mb-20 sm:mb-32">
            <div className="max-w-2xl mb-12">
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
                Master english vocabulary
              </h2>
              <p className="text-lg text-gray-300 font-light leading-relaxed">
                Say or type a word while reading, and build your personal vocabulary list with ease.
              </p>
            </div>

            {/* Capture Card */}
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 sm:p-12 space-y-8">
              
              {/* Mic Button */}
              <div>
                <button
                  onClick={startListening}
                  disabled={isListening}
                  className="w-full group relative overflow-hidden rounded-full bg-white text-black font-semibold py-5 sm:py-6 px-8 transition-all duration-300 hover:bg-gray-100 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className={`text-xl transition-all ${isListening ? 'animate-pulse' : ''}`}>
                      🎤
                    </span>
                    <span>{isListening ? 'Listening...' : 'Tap to speak'}</span>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-800"></div>
                <p className="text-sm text-gray-500 font-light">or</p>
                <div className="flex-1 h-px bg-gray-800"></div>
              </div>

              {/* Text Input */}
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={typedWord}
                  onChange={(e) => setTypedWord(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && saveWord(typedWord)}
                  placeholder="Type a word..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0 focus:border-transparent transition-all"
                />
                <button
                  onClick={() => saveWord(typedWord)}
                  className="bg-white text-black font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-lg"
                >
                  Save
                </button>
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 relative">
                    <button
                      onClick={cancelTranscript}
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors p-1"
                      aria-label="Cancel"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <p className="text-sm text-gray-400 font-medium mb-3">You said</p>
                    <p className="text-2xl font-semibold text-white mb-4">{transcript}</p>
                    <button
                      onClick={() => saveWord(transcript)}
                      className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-lg"
                    >
                      Save this word
                    </button>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {showSuccess && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-green-950 border border-green-800 rounded-lg p-4 flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-green-300">
                      Saved: <span className="font-semibold">{savedWord}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Words List Tab */}
        {activeTab === 'list' && (
          <section>
            <div className="flex items-baseline justify-between mb-8">
              <h3 className="text-3xl font-semibold text-white">Your words</h3>
              <p className="text-sm text-gray-400 font-light">{filteredWords.length} of {words.length}</p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search words..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-12 pr-5 py-3 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {filteredWords.length === 0 && words.length === 0 ? (
              <div className="text-center py-16 sm:py-24">
                <p className="text-lg text-gray-400 font-light">No words yet</p>
                <p className="text-sm text-gray-500 font-light mt-2">Start by capturing your first word</p>
              </div>
            ) : filteredWords.length === 0 ? (
              <div className="text-center py-16 sm:py-24">
                <p className="text-lg text-gray-400 font-light">No words match your search</p>
                <p className="text-sm text-gray-500 font-light mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {filteredWords.map((word, index) => (
                  <div
                    key={word.id}
                    className="group flex items-center justify-between bg-gray-950 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-6 py-6 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => openNoteDialog(word)}
                    >
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <p className="text-xl font-semibold text-white">{word.word}</p>
                        {word.translation && (
                          <p className="text-lg font-light text-gray-300">
                            • {word.translation}
                          </p>
                        )}
                      </div>
                      {word.note && (
                        <p className="text-sm text-gray-400 italic truncate">
                          Note: {word.note}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <p>Reviewed {word.review_count || 0}x</p>
                        {word.next_review_date && (
                          <p>Next: {new Date(word.next_review_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteWord(word.id)}
                      className="ml-4 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all duration-200 p-2 rounded-lg hover:bg-gray-800 active:scale-90 flex-shrink-0"
                      aria-label="Delete word"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <section>
            {dueWords.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-2xl font-semibold text-white mb-3">All caught up! 🎉</p>
                <p className="text-gray-400">No words to review today. Come back tomorrow!</p>
              </div>
            ) : (
              <div>
                {/* Progress */}
                <div className="mb-8">
                  <p className="text-gray-400 text-sm mb-2">
                    {currentReviewIndex + 1} of {dueWords.length}
                  </p>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentReviewIndex + 1) / dueWords.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Review Card */}
                {currentWord && (
                  <div className="bg-gray-950 border border-gray-800 rounded-2xl p-12 text-center space-y-8 animate-in fade-in duration-300">
                    <div>
                      <p className="text-sm text-gray-400 mb-4">English</p>
                      <p className="text-5xl font-bold text-white mb-8">{currentWord.word}</p>
                      <p className="text-sm text-gray-400 mb-2">Macedonian</p>
                      <p className="text-3xl font-semibold text-gray-300">{currentWord.translation}</p>
                    </div>

                    {currentWord.note && (
                      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">Your note:</p>
                        <p className="text-white italic">{currentWord.note}</p>
                      </div>
                    )}

                    {/* Review Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => submitReview(0)}
                        className="flex-1 bg-red-900 hover:bg-red-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 active:scale-95"
                      >
                        Again
                      </button>
                      <button
                        onClick={() => submitReview(1)}
                        className="flex-1 bg-yellow-900 hover:bg-yellow-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 active:scale-95"
                      >
                        Hard
                      </button>
                      <button
                        onClick={() => submitReview(2)}
                        className="flex-1 bg-green-900 hover:bg-green-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 active:scale-95"
                      >
                        Easy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Note Dialog */}
      {selectedWord && activeTab === 'list' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-semibold text-white mb-2">
              {selectedWord.word}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {selectedWord.translation}
            </p>

            <label className="block text-sm font-medium text-gray-300 mb-3">
              Add a note
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a note about this word..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none h-32 transition-all"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeNoteDialog}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="flex-1 bg-white hover:bg-gray-100 text-black font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}