import React, { createContext, useState, useEffect, useContext } from 'react';
import { getTodaysPuzzle, checkGuess, testWordMatching } from '../utils/gameUtils';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

// Initial stats structure with tracking by difficulty
const initialStats = {
  total: { 
    played: 0, 
    won: 0,
    currentStreak: 0,
    maxStreak: 0
  },
  beginner: { 
    played: 0, 
    won: 0,
    currentStreak: 0,
    maxStreak: 0
  },
  intermediate: { 
    played: 0, 
    won: 0,
    currentStreak: 0,
    maxStreak: 0
  },
  advanced: { 
    played: 0, 
    won: 0,
    currentStreak: 0,
    maxStreak: 0
  }
};

export const GameProvider = ({ children }) => {
  const [puzzle, setPuzzle] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [revealedHints, setRevealedHints] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [shake, setShake] = useState(false);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState(initialStats);
  const [difficulty, setDifficulty] = useState('beginner'); // 'beginner', 'intermediate', 'advanced'
  const [solvedWords, setSolvedWords] = useState({
    beginner: [],
    intermediate: [],
    advanced: []
  });

  useEffect(() => {
    // Load game state and solved words from localStorage
    const savedState = localStorage.getItem('wordPuzzleState');
    const savedStats = localStorage.getItem('wordPuzzleStats');
    const savedDifficulty = localStorage.getItem('wordPuzzleDifficulty');
    const savedSolvedWords = localStorage.getItem('wordPuzzleSolvedWords');
    
    // Load saved solved words
    if (savedSolvedWords) {
      try {
        const parsed = JSON.parse(savedSolvedWords);
        setSolvedWords(parsed);
      } catch (e) {
        console.error('Error parsing solved words', e);
        setSolvedWords({
          beginner: [],
          intermediate: [],
          advanced: []
        });
      }
    }
    
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        // Handle migration from old stats format
        if (!parsedStats.total) {
          setStats({
            total: parsedStats,
            beginner: { played: 0, won: 0, currentStreak: 0, maxStreak: 0 },
            intermediate: { played: 0, won: 0, currentStreak: 0, maxStreak: 0 },
            advanced: { played: 0, won: 0, currentStreak: 0, maxStreak: 0 }
          });
        } else {
          setStats(parsedStats);
        }
      } catch (e) {
        console.error('Error parsing stats', e);
        setStats(initialStats);
      }
    }
    
    if (savedDifficulty) {
      setDifficulty(savedDifficulty);
    }
    
    // Use the existing difficulty or fall back to default
    const currentDifficulty = savedDifficulty || difficulty;
    
    // Get solved words for the current difficulty
    const solvedWordIds = savedSolvedWords 
      ? JSON.parse(savedSolvedWords)[currentDifficulty] || []
      : [];
    
    // Get a puzzle, excluding solved words
    const todaysPuzzle = getTodaysPuzzle(currentDifficulty, null, solvedWordIds);
    setPuzzle(todaysPuzzle);
    
    if (savedState) {
      const state = JSON.parse(savedState);
      // Only restore state if it's from the same day/puzzle
      if (state.puzzleId === todaysPuzzle.id) {
        setGuesses(state.guesses);
        setHintsRemaining(state.hintsRemaining);
        setRevealedHints(state.revealedHints);
        setGameStatus(state.gameStatus);
      }
    }
  }, []);

  // Save solved words to localStorage when they change
  useEffect(() => {
    localStorage.setItem('wordPuzzleSolvedWords', JSON.stringify(solvedWords));
  }, [solvedWords]);

  useEffect(() => {
    // Save game state to localStorage when it changes
    if (puzzle) {
      const state = {
        puzzleId: puzzle.id,
        guesses,
        hintsRemaining,
        revealedHints,
        gameStatus
      };
      localStorage.setItem('wordPuzzleState', JSON.stringify(state));
    }
  }, [guesses, hintsRemaining, revealedHints, gameStatus, puzzle]);

  useEffect(() => {
    // Save stats to localStorage when they change
    localStorage.setItem('wordPuzzleStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    // Save difficulty to localStorage and update puzzle when difficulty changes
    localStorage.setItem('wordPuzzleDifficulty', difficulty);
    
    // Only update puzzle if we're not in the middle of a game
    if (gameStatus !== 'playing' || guesses.length === 0) {
      // Get the solved words for the current difficulty
      const solvedWordIds = solvedWords[difficulty] || [];
      
      const newPuzzle = getTodaysPuzzle(difficulty, null, solvedWordIds);
      setPuzzle(newPuzzle);
      resetGame(false);
    } else {
      showMessage('Finish current game before changing difficulty', 'info');
    }
  }, [difficulty]);

  // Helper function to add a word to the solved words list
  const markWordAsSolved = (word, puzzleDifficulty) => {
    const wordId = `${puzzleDifficulty}-${word.toLowerCase()}`;
    
    // Only add if not already in the list
    if (!solvedWords[puzzleDifficulty].includes(wordId)) {
      setSolvedWords(prev => ({
        ...prev,
        [puzzleDifficulty]: [...prev[puzzleDifficulty], wordId]
      }));
      console.log(`Marked word as solved: ${word} (${puzzleDifficulty})`);
    }
  };

  const submitGuess = () => {
    if (!puzzle) return;
    
    // Debugging - log currentGuess and its length 
    console.log(`submitGuess called with currentGuess: "${currentGuess}", length: ${currentGuess?.length}, trim length: ${currentGuess?.trim()?.length}`);
    
    // Simplify the logic to avoid unnecessary complexity
    // Make sure currentGuess is a string first
    if (!currentGuess || typeof currentGuess !== 'string') {
      console.error("Invalid currentGuess:", currentGuess);
      showMessage('Please enter a word', 'error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    // Clean up the guess - uppercase for consistency
    const cleanGuess = currentGuess.trim().toUpperCase();
    
    // Check if guess is empty
    if (cleanGuess.length === 0) {
      showMessage('Please enter a word', 'error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    // Check if guess has the correct length
    if (cleanGuess.length !== puzzle.word.length) {
      showMessage(`Word must be ${puzzle.word.length} letters`, 'error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    // Check if guess only contains letters
    if (!/^[A-Z]+$/.test(cleanGuess)) {
      showMessage('Only letters allowed', 'error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    // At this point, the guess is valid for submission - whether it's correct or not
    
    // Normalize for comparison
    const normalizedGuessLower = cleanGuess.toLowerCase();
    const normalizedTarget = puzzle.word.toLowerCase().trim();
    
    // Debug logging
    console.log(`Checking guess: "${cleanGuess}" against target: "${puzzle.word}"`);
    console.log(`Normalized guess: "${normalizedGuessLower}" against normalized target: "${normalizedTarget}"`);
    console.log(`Direct comparison result: ${normalizedGuessLower === normalizedTarget}`);

    // Check results and add to guesses
    const result = checkGuess(cleanGuess, puzzle.word);
    const newGuesses = [...guesses, { word: cleanGuess, result }];
    setGuesses(newGuesses);
    setCurrentGuess('');

    // Determine if the guess is correct
    if (normalizedGuessLower === normalizedTarget) {
      console.log("CORRECT GUESS DETECTED! Marking as won.");
      setGameStatus('won');
      showMessage('Great job!', 'success');
      updateStats(true);
      
      // Mark the word as solved
      markWordAsSolved(puzzle.word, puzzle.difficulty);
    } else if (newGuesses.length >= 6) {
      setGameStatus('lost');
      showMessage(`The word was ${puzzle.word}`, 'error');
      updateStats(false);
    }
  };

  const updateStats = (won) => {
    setStats(prevStats => {
      // Update stats for the current difficulty
      const difficultyStats = {
        ...prevStats[difficulty],
        played: prevStats[difficulty].played + 1,
        won: won ? prevStats[difficulty].won + 1 : prevStats[difficulty].won,
        currentStreak: won ? prevStats[difficulty].currentStreak + 1 : 0,
        maxStreak: won 
          ? Math.max(prevStats[difficulty].currentStreak + 1, prevStats[difficulty].maxStreak)
          : prevStats[difficulty].maxStreak
      };

      // Update total stats
      const totalStats = {
        ...prevStats.total,
        played: prevStats.total.played + 1,
        won: won ? prevStats.total.won + 1 : prevStats.total.won,
        currentStreak: won ? prevStats.total.currentStreak + 1 : 0,
        maxStreak: won 
          ? Math.max(prevStats.total.currentStreak + 1, prevStats.total.maxStreak)
          : prevStats.total.maxStreak
      };

      return {
        ...prevStats,
        [difficulty]: difficultyStats,
        total: totalStats
      };
    });
  };

  const useHint = () => {
    if (hintsRemaining <= 0 || gameStatus !== 'playing') return;
    
    // Get a hint (a letter position not yet revealed)
    const revealedPositions = revealedHints.map(h => h.position);
    const availablePositions = Array.from(
      { length: puzzle.word.length }, 
      (_, i) => i
    ).filter(pos => !revealedPositions.includes(pos));
    
    if (availablePositions.length === 0) return;
    
    const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    const newHint = {
      position: randomPosition,
      letter: puzzle.word[randomPosition]
    };
    
    setRevealedHints([...revealedHints, newHint]);
    setHintsRemaining(prev => prev - 1);
    showMessage(`Hint: Position ${randomPosition + 1} is '${newHint.letter.toUpperCase()}'`, 'info');
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const resetGame = (getNewPuzzle = true) => {
    if (getNewPuzzle) {
      // Get the solved words for the current difficulty
      const solvedWordIds = solvedWords[difficulty] || [];
      
      const todaysPuzzle = getTodaysPuzzle(difficulty, null, solvedWordIds);
      setPuzzle(todaysPuzzle);
    }
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setHintsRemaining(3);
    setRevealedHints([]);
  };

  const getNextWord = () => {
    // Get the solved words for the current difficulty
    const solvedWordIds = solvedWords[difficulty] || [];
    
    // Get the next word in the current difficulty level, excluding solved words
    const nextPuzzle = getTodaysPuzzle(difficulty, puzzle?.id, solvedWordIds);
    console.log("Getting next puzzle after:", puzzle?.id);
    setPuzzle(nextPuzzle);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setHintsRemaining(3);
    setRevealedHints([]);
    
    // Save the new state
    const state = {
      puzzleId: nextPuzzle.id,
      guesses: [],
      hintsRemaining: 3,
      revealedHints: [],
      gameStatus: 'playing'
    };
    localStorage.setItem('wordPuzzleState', JSON.stringify(state));
    
    showMessage('New word loaded!', 'success');
  };

  const changeDifficulty = (newDifficulty) => {
    if (newDifficulty !== difficulty) {
      if (gameStatus !== 'playing' || guesses.length === 0) {
        setDifficulty(newDifficulty);
      } else {
        showMessage('Complete current game before changing difficulty', 'error');
      }
    }
  };

  const clearSolvedWords = () => {
    setSolvedWords({
      beginner: [],
      intermediate: [],
      advanced: []
    });
    showMessage('Solved words history cleared!', 'success');
  };

  const value = {
    puzzle,
    guesses,
    currentGuess,
    setCurrentGuess,
    gameStatus,
    hintsRemaining,
    revealedHints,
    message,
    shake,
    stats,
    difficulty,
    solvedWords,
    submitGuess,
    useHint,
    resetGame,
    getNextWord,
    changeDifficulty,
    clearSolvedWords
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext; 