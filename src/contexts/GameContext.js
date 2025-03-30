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

  useEffect(() => {
    // Load game state from localStorage
    const savedState = localStorage.getItem('wordPuzzleState');
    const savedStats = localStorage.getItem('wordPuzzleStats');
    const savedDifficulty = localStorage.getItem('wordPuzzleDifficulty');
    
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
    
    const todaysPuzzle = getTodaysPuzzle(savedDifficulty || difficulty);
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
      const newPuzzle = getTodaysPuzzle(difficulty);
      setPuzzle(newPuzzle);
      resetGame(false);
    } else {
      showMessage('Finish current game before changing difficulty', 'info');
    }
  }, [difficulty]);

  const submitGuess = () => {
    if (!puzzle) return;
    
    // Normalize guess for validation to ensure proper length checking
    const normalizedGuess = currentGuess.trim();
    
    // Check if guess is empty after mobile input changes
    if (normalizedGuess.length === 0) {
      showMessage('Please enter a word', 'error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    if (normalizedGuess.length !== puzzle.word.length) {
      showMessage(`Word must be ${puzzle.word.length} letters`, 'error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    if (!/^[A-Za-z]+$/.test(normalizedGuess)) {
      showMessage('Only letters allowed', 'error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    // Normalize for comparison - both to lowercase and trim any whitespace
    const normalizedGuessLower = normalizedGuess.toLowerCase();
    const normalizedTarget = puzzle.word.toLowerCase().trim();
    
    // Debug logging
    console.log(`Checking guess: "${normalizedGuess}" against target: "${puzzle.word}"`);
    console.log(`Normalized guess: "${normalizedGuessLower}" against normalized target: "${normalizedTarget}"`);
    console.log(`Direct comparison result: ${normalizedGuessLower === normalizedTarget}`);

    // Run the test matching function for debugging
    const isMatch = testWordMatching(normalizedGuess, puzzle.word);
    console.log(`Test matching result: ${isMatch}`);

    const result = checkGuess(normalizedGuess, puzzle.word);
    const newGuesses = [...guesses, { word: normalizedGuess, result }];
    setGuesses(newGuesses);
    setCurrentGuess('');

    // Check if guess is correct using normalized strings for comparison
    if (normalizedGuessLower === normalizedTarget) {
      console.log("CORRECT GUESS DETECTED! Marking as won.");
      setGameStatus('won');
      showMessage('Great job!', 'success');
      updateStats(true);
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
      const todaysPuzzle = getTodaysPuzzle(difficulty);
      setPuzzle(todaysPuzzle);
    }
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setHintsRemaining(3);
    setRevealedHints([]);
  };

  const getNextWord = () => {
    // Get the next word in the current difficulty level
    const nextPuzzle = getTodaysPuzzle(difficulty, puzzle?.id);
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
    submitGuess,
    useHint,
    resetGame,
    getNextWord,
    changeDifficulty
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext; 