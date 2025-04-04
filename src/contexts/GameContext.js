import React, { createContext, useState, useEffect, useContext } from 'react';
import { getTodaysPuzzle, checkGuess, testWordMatching, getDifficultyWordCount } from '../utils/gameUtils';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

// This will now be calculated dynamically using getDifficultyWordCount
// Just keeping this as a fallback
const DIFFICULTY_FALLBACK_COUNTS = {
  beginner: 10,
  intermediate: 15,
  advanced: 20
};

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
  // Cache for the word counts by difficulty
  const [difficultyWordCounts, setDifficultyWordCounts] = useState({
    beginner: getDifficultyWordCount('beginner'),
    intermediate: getDifficultyWordCount('intermediate'),
    advanced: getDifficultyWordCount('advanced')
  });

  // Helper function to determine number of hints based on word length
  const getHintsForWordLength = (wordLength) => {
    if (wordLength <= 3) {
      return 1; // Only 1 hint for 3-letter words or shorter (avoids giving away too much)
    } else if (wordLength <= 6) {
      return 2;
    } else {
      return 3;
    }
  };

  // Helper to get the correct word count for a difficulty level
  const getWordCountForDifficulty = (difficultyLevel) => {
    return difficultyWordCounts[difficultyLevel] || 
           DIFFICULTY_FALLBACK_COUNTS[difficultyLevel] || 10;
  };

  useEffect(() => {
    // Calculate word counts on initial load
    setDifficultyWordCounts({
      beginner: getDifficultyWordCount('beginner'),
      intermediate: getDifficultyWordCount('intermediate'),
      advanced: getDifficultyWordCount('advanced')
    });
    
    // Load game state and solved words from localStorage
    const savedState = localStorage.getItem('wordPuzzleState');
    const savedStats = localStorage.getItem('wordPuzzleStats');
    const savedDifficulty = localStorage.getItem('wordPuzzleDifficulty');
    const savedSolvedWords = localStorage.getItem('wordPuzzleSolvedWords');
    
    console.log("Loading saved game state...");
    
    // Load saved solved words
    if (savedSolvedWords) {
      try {
        const parsed = JSON.parse(savedSolvedWords);
        console.log("Loaded solved words from localStorage:", parsed);
        setSolvedWords(parsed);
      } catch (e) {
        console.error('Error parsing solved words', e);
        setSolvedWords({
          beginner: [],
          intermediate: [],
          advanced: []
        });
      }
    } else {
      console.log("No saved solved words found, using empty state");
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
    
    // Set initial hints based on word length - Critical for 3-letter words to only get 1 hint
    const hintsCount = getHintsForWordLength(todaysPuzzle.word.length);
    console.log(`Initial puzzle: ${todaysPuzzle.word} (${todaysPuzzle.word.length} letters), setting ${hintsCount} hints`);
    
    if (savedState) {
      const state = JSON.parse(savedState);
      // Only restore state if it's from the same day/puzzle
      if (state.puzzleId === todaysPuzzle.id) {
        setGuesses(state.guesses);
        setHintsRemaining(state.hintsRemaining);
        setRevealedHints(state.revealedHints);
        setGameStatus(state.gameStatus);
      } else {
        // New puzzle, set hints based on word length
        setHintsRemaining(hintsCount);
      }
    } else {
      // No saved state, set hints based on word length
      setHintsRemaining(hintsCount);
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

  // Additional useEffect to monitor puzzle changes and update hints accordingly
  useEffect(() => {
    if (puzzle && puzzle.word) {
      // Calculate the correct number of hints for this word length
      const hintsCount = getHintsForWordLength(puzzle.word.length);
      
      // Only reset hints if they don't match what's expected for this word length
      if (hintsRemaining !== hintsCount && gameStatus === 'playing' && guesses.length === 0) {
        console.log(`Correcting hints: Word "${puzzle.word}" (${puzzle.word.length} letters) should have ${hintsCount} hints, but has ${hintsRemaining}`);
        setHintsRemaining(hintsCount);
      }
    }
  }, [puzzle, hintsRemaining, gameStatus, guesses.length]);

  // Helper function to add a word to the solved words list
  const markWordAsSolved = (word, puzzleDifficulty) => {
    // Ensure we're using the word's actual difficulty, not the current state difficulty
    const wordId = `${puzzleDifficulty}-${word.toLowerCase()}`;
    
    console.log(`Marking word as solved: ${word} with ID: ${wordId}`);
    console.log(`Current solved words for ${puzzleDifficulty}:`, solvedWords[puzzleDifficulty]);
    
    // Only add if not already in the list
    if (!solvedWords[puzzleDifficulty].includes(wordId)) {
      setSolvedWords(prev => {
        const updatedSolvedWords = {
          ...prev,
          [puzzleDifficulty]: [...prev[puzzleDifficulty], wordId]
        };
        console.log(`Updated solved words:`, updatedSolvedWords);
        return updatedSolvedWords;
      });
      console.log(`Marked word as solved: ${word} (${puzzleDifficulty})`);
    } else {
      console.log(`Word already marked as solved: ${word} (${puzzleDifficulty})`);
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
    console.log(`Current puzzle:`, puzzle);

    // Check results and add to guesses
    const result = checkGuess(cleanGuess, puzzle.word);
    const newGuesses = [...guesses, { word: cleanGuess, result }];
    setGuesses(newGuesses);
    setCurrentGuess('');
    // Clear revealed hints after each guess
    setRevealedHints([]);

    // Determine if the guess is correct
    if (normalizedGuessLower === normalizedTarget) {
      console.log("CORRECT GUESS DETECTED! Marking as won.");
      setGameStatus('won');
      showMessage('Great job!', 'success');
      updateStats(true);
      
      // Mark the word as solved
      // Make sure we use the actual difficulty from the puzzle object
      if (puzzle && puzzle.difficulty) {
        markWordAsSolved(puzzle.word, puzzle.difficulty);
      } else {
        console.error("Cannot mark word as solved: puzzle or difficulty missing", puzzle);
      }
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
    if (hintsRemaining <= 0 || gameStatus !== 'playing' || !puzzle || !puzzle.word) return;
    
    // Calculate max hints for this word
    const maxHints = getHintsForWordLength(puzzle.word.length);
    
    // If we've already used the max allowed hints based on word length, don't allow more
    if (revealedHints.length >= maxHints) {
      showMessage(`Maximum hints (${maxHints}) already used for this word`, 'info');
      return;
    }
    
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
    
    // Show a message with the appropriate messaging based on remaining hints
    const remainingHints = hintsRemaining - 1;
    const hintsMessage = remainingHints === 0 
      ? 'Hint revealed! (Remember to type it in)' 
      : `Hint revealed! Enter the letter shown. (${remainingHints} left)`;
    
    showMessage(hintsMessage, 'info');
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
    
    // Make sure we've got a valid puzzle before calculating hints
    if (!puzzle || !puzzle.word) {
      console.error("Cannot reset game: puzzle or word is missing", puzzle);
      return;
    }
    
    // Set hints based on word length - 3-letter words only get 1 hint
    const hintsCount = getHintsForWordLength(puzzle.word.length);
    console.log(`Resetting game with ${hintsCount} hints for ${puzzle.word.length}-letter word "${puzzle.word}"`);
    
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setHintsRemaining(hintsCount);
    setRevealedHints([]);
  };

  const getNextWord = () => {
    // Get the solved words for the current difficulty
    const solvedWordIds = solvedWords[difficulty] || [];
    console.log(`Getting next word. Current difficulty: ${difficulty}`);
    console.log(`Current solved words:`, solvedWordIds);
    
    // Get the word count for this difficulty
    const totalWords = getWordCountForDifficulty(difficulty);
    
    // Note: Removed auto-switching difficulty code here - this is now handled by the modal's continue button
    
    // Get the next word in the current difficulty level, excluding solved words
    const nextPuzzle = getTodaysPuzzle(difficulty, puzzle?.id, solvedWordIds);
    console.log("Getting next puzzle after:", puzzle?.id);
    console.log("New puzzle selected:", nextPuzzle);
    
    // Check if the returned puzzle has allCompleted flag
    if (nextPuzzle.allCompleted) {
      console.log("All words completed in this difficulty");
      
      // For advanced difficulty, just show a message since there's no next level
      if (difficulty === 'advanced') {
        showMessage('Congratulations! You\'ve solved all words!', 'success');
      }
      
      return;
    }
    
    setPuzzle(nextPuzzle);
    
    // Reset hints based on word length - crucial for 3-letter words to only get 1 hint
    const hintsCount = getHintsForWordLength(nextPuzzle.word.length);
    console.log(`Word length: ${nextPuzzle.word.length}, setting ${hintsCount} hints for word "${nextPuzzle.word}"`);
    
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setHintsRemaining(hintsCount); // This should be set to 1 for 3-letter words
    setRevealedHints([]);
    
    // Save the new state
    const state = {
      puzzleId: nextPuzzle.id,
      guesses: [],
      hintsRemaining: hintsCount,
      revealedHints: [],
      gameStatus: 'playing'
    };
    localStorage.setItem('wordPuzzleState', JSON.stringify(state));
    
    showMessage('New word loaded!', 'success');
  };

  const changeDifficulty = (newDifficulty) => {
    if (newDifficulty !== difficulty) {
      if (gameStatus !== 'playing' || guesses.length === 0) {
        // Save the old difficulty to check if we need to reset the game
        const oldDifficulty = difficulty;
        
        // Update the difficulty state
        setDifficulty(newDifficulty);
        
        // The difficulty change will trigger the useEffect that loads a new puzzle,
        // which will automatically set hints based on word length in resetGame.
        
        console.log(`Difficulty changed from ${oldDifficulty} to ${newDifficulty}`);
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

  const resetAllGameData = () => {
    // Clear all localStorage data
    localStorage.removeItem('wordPuzzleState');
    localStorage.removeItem('wordPuzzleStats');
    localStorage.removeItem('wordPuzzleDifficulty');
    localStorage.removeItem('wordPuzzleSolvedWords');
    
    // Reset state to defaults
    setStats(initialStats);
    setSolvedWords({
      beginner: [],
      intermediate: [],
      advanced: []
    });
    setDifficulty('beginner');
    
    // Get a fresh puzzle
    const newPuzzle = getTodaysPuzzle('beginner', null, []);
    setPuzzle(newPuzzle);
    
    // Reset game state with the correct number of hints for the new puzzle
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    
    // Make sure we're using the correct number of hints based on word length
    const hintCount = getHintsForWordLength(newPuzzle.word.length);
    console.log(`Resetting game data with ${hintCount} hints for ${newPuzzle.word.length}-letter word "${newPuzzle.word}"`);
    setHintsRemaining(hintCount);
    setRevealedHints([]);
    
    showMessage('Game reset! All data cleared.', 'success');
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
    clearSolvedWords,
    resetAllGameData,
    // Export the function that gets word counts dynamically
    getDifficultyWordCount: getWordCountForDifficulty,
    // Export the function that calculates hints based on word length
    getHintsForWordLength
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext; 