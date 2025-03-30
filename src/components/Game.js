import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import GuessGrid from './GuessGrid';
import Keyboard from './Keyboard';
import Message from './Message';
import DifficultySelector from './DifficultySelector';
import Fireworks from './Fireworks';
import Instructions from './Instructions';
import LevelCompleteModal from './LevelCompleteModal';
import './Game.css';

const Game = () => {
  const { 
    puzzle,
    currentGuess,
    setCurrentGuess,
    gameStatus,
    guesses,
    message,
    shake,
    hintsRemaining,
    revealedHints,
    useHint,
    submitGuess,
    difficulty,
    getNextWord,
    solvedWords,
    changeDifficulty,
    getDifficultyWordCount,
    clearSolvedWords,
    showMessage
  } = useGame();
  
  const [showFireworks, setShowFireworks] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(2.5);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const inputRef = useRef(null);
  const { isDarkMode } = useTheme();

  // Focus invisible input when clicked on grid area for mobile
  const focusInput = () => {
    if (inputRef.current) {
      // Clear any existing value to prevent duplication
      if (inputRef.current.value) {
        inputRef.current.value = '';
      }
      
      // Use preventScroll in a try-catch as it's not supported in all browsers
      try {
        inputRef.current.focus({ preventScroll: true });
      } catch (e) {
        // Fallback method for browsers without preventScroll support
        const scrollX = window.pageXOffset;
        const scrollY = window.pageYOffset;
        inputRef.current.focus();
        window.scrollTo(scrollX, scrollY);
      }
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameStatus !== 'playing') return;
      if (!puzzle || !puzzle.word) return; // Skip if puzzle is null
      
      if (e.key === 'Enter') {
        e.preventDefault();
        submitGuess();
      } else if (e.key === 'Backspace') {
        // Prevent default only when we're handling it ourselves
        e.preventDefault();
        const newGuess = currentGuess.slice(0, -1);
        setCurrentGuess(newGuess);
      } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < (puzzle?.word?.length || 5)) {
        // Prevent default to avoid duplicate characters when using hidden input
        e.preventDefault();
        const newChar = e.key.toUpperCase();
        const newGuess = currentGuess + newChar;
        setCurrentGuess(newGuess);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameStatus, puzzle, setCurrentGuess, submitGuess]);

  // Show fireworks and set auto advance when game is won
  useEffect(() => {
    if (gameStatus === 'won') {
      setShowFireworks(true);
      
      // Start auto-advance countdown
      setTimeRemaining(2.5);
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0.5) {
            clearInterval(timer);
            // Go to next word after countdown
            setTimeout(getNextWord, 250);
            return 0;
          }
          return prev - 0.5;
        });
      }, 500);
      
      setAutoAdvanceTimer(timer);
      
      return () => {
        if (timer) clearInterval(timer);
      };
    } else {
      // Clear timer if game status changes
      if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
        setAutoAdvanceTimer(null);
      }
      setShowFireworks(false);
    }
  }, [gameStatus, getNextWord]);

  // Detect when all words in a difficulty level are solved
  useEffect(() => {
    // Skip this check if game is already in completed state
    if (!puzzle || gameCompleted) return;
    
    const solvedCount = solvedWords[difficulty]?.length || 0;
    const totalCount = getDifficultyWordCount(difficulty);
    
    
    // Check if we've solved all words for this difficulty and if so, show the level complete modal
    if (solvedCount >= totalCount && totalCount > 0 && !showLevelCompleteModal) {
      // Using setTimeout to make sure all other game state updates are done first
      setTimeout(() => {
        setShowLevelCompleteModal(true);
      }, 1500);
    }
  }, [solvedWords, difficulty, puzzle, getDifficultyWordCount, gameCompleted, showLevelCompleteModal]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  // Check if the game is completed (all words in advanced difficulty solved)
  // AND beginner and intermediate are also completed
  useEffect(() => {
    // Skip if no puzzle or after manual reset
    if (!puzzle || solvedWords['advanced']?.length === 0) {
      // If we had previously set gameCompleted to true, reset it
      if (gameCompleted) {
        setGameCompleted(false);
      }
      return;
    }
    
    if (difficulty === 'advanced') {
      // Check if all difficulty levels are completed
      const advancedWordCount = getDifficultyWordCount('advanced');
      const intermediateWordCount = getDifficultyWordCount('intermediate');
      const beginnerWordCount = getDifficultyWordCount('beginner');
      
      const solvedAdvancedCount = solvedWords['advanced']?.length || 0;
      const solvedIntermediateCount = solvedWords['intermediate']?.length || 0;
      const solvedBeginnerCount = solvedWords['beginner']?.length || 0;
      
      // Only set gameCompleted if all levels have been completed
      const allLevelsCompleted = 
        solvedAdvancedCount >= advancedWordCount && 
        solvedIntermediateCount >= intermediateWordCount && 
        solvedBeginnerCount >= beginnerWordCount;
      
      if (allLevelsCompleted && !gameCompleted) {
        setGameCompleted(true);
      } else if (!allLevelsCompleted && gameCompleted) {
        // Make sure to reset gameCompleted if words were removed
        setGameCompleted(false);
      }
    }
  }, [difficulty, solvedWords, getDifficultyWordCount, gameCompleted, puzzle]);

  const handleCloseModal = () => {
    setShowLevelCompleteModal(false);
    setShowFireworks(false);
    
    // For advanced difficulty, don't try to get next word if all are completed
    if (difficulty === 'advanced' && 
        solvedWords['advanced']?.length >= getDifficultyWordCount('advanced')) {
      
      // Check if all levels have been completed
      const intermediateWordCount = getDifficultyWordCount('intermediate');
      const beginnerWordCount = getDifficultyWordCount('beginner');
      const solvedIntermediateCount = solvedWords['intermediate']?.length || 0;
      const solvedBeginnerCount = solvedWords['beginner']?.length || 0;
      
      const allLevelsCompleted = 
        solvedIntermediateCount >= intermediateWordCount && 
        solvedBeginnerCount >= beginnerWordCount;
      
      if (allLevelsCompleted) {
        // Show game completion screen
        setGameCompleted(true);
        return;
      } else {
        // Just go back to Beginner level
        changeDifficulty('beginner');
        
        // The getNextWord function will reset hints based on word length,
        // no need to manually reset hints here
        
        // Clear the level complete modal flag before getting next word
        setTimeout(() => {
          getNextWord();
        }, 100);
        return;
      }
    }
    
    // This will get the next word without automatically changing difficulty
    // The difficulty change happens in GameContext when the continue button is clicked
    getNextWord();
  };

  // Determine if word length requires scrolling - always enable for now to fix scrolling issues
  const needsScrolling = true; // Force scrolling to ensure no content is cut off

  // Log the current word and scrolling state - with null check
  
  // Class for guess area with conditional scrolling
  const guessAreaClass = `guess-area${needsScrolling ? ' scrollable' : ''}`;

  // Early return if puzzle is null to prevent errors
  if (!puzzle) return <div className="loading">Loading puzzle...</div>;

  // Special state when all words in all difficulties are completed
  if (gameCompleted && puzzle) {
    return (
      <div className="game-container">
        <div className="game-completed">
          <h1>Congratulations!</h1>
          <p>You've successfully completed all words in all difficulty levels!</p>
          <p>Check back later for new words or reset your progress to play again.</p>
          <div className="game-completed-actions">
            <button 
              className="reset-button" 
              onClick={() => {
                // First clear the completedGame state
                setGameCompleted(false);
                
                // Then clear solved words
                clearSolvedWords();
                
                // Important: set to false BEFORE changing difficulty to avoid triggering level complete check
                setShowLevelCompleteModal(false);
                
                // Manually set to beginner rather than calling changeDifficulty
                // to avoid side effects that might trigger modals
                localStorage.setItem('wordPuzzleDifficulty', 'beginner');
                changeDifficulty('beginner');
                
                // Add a slight delay before getting the next word to ensure state updates complete
                setTimeout(() => {
                  // This will also set the hints based on the new word's length
                  getNextWord();
                }, 100);
              }}
            >
              Reset Progress & Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {showFireworks && <Fireworks />}
      
      <LevelCompleteModal 
        show={showLevelCompleteModal}
        difficulty={difficulty}
        onClose={handleCloseModal}
        isDarkMode={isDarkMode}
        solvedCount={solvedWords[difficulty]?.length || 0}
        totalCount={getDifficultyWordCount(difficulty)}
      />
      
      <div className="game-info">
        <div className="category">
          <span>Category: </span>
          <strong>{puzzle.category}</strong>
        </div>
        
        <button 
          className="instructions-button" 
          onClick={() => setShowInstructions(true)}
          aria-label="How to play"
        >
          How to Play
        </button>
      </div>
      
      <DifficultySelector />

      {/* Hidden input for mobile keyboard focus */}
      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        value=""  // Always empty, we manually track input
        onChange={(e) => {
          // Skip if puzzle is null
          if (!puzzle || !puzzle.word) return;
          
          // Get the typed character
          const typed = e.target.value.toUpperCase();
          
          // Ignore empty input
          if (!typed || typed.length === 0) return;
          
          // Only process if it contains a valid character and we're not at max length
          const lastChar = typed.slice(-1);
          if (/^[A-Z]$/.test(lastChar) && currentGuess.length < puzzle.word.length) {
            // Make sure we can track this state update
            const newGuess = currentGuess + lastChar;
            setCurrentGuess(newGuess);
            
            // Reset the input field immediately to prevent duplicate inputs
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          }
        }}
        onKeyDown={(e) => {
          // Skip processing as the window keydown handler will handle this
          // Just prevent default behavior for these keys to avoid double-handling
          if (e.key === 'Enter' || e.key === 'Backspace' || /^[a-zA-Z]$/.test(e.key)) {
            e.preventDefault();
          }
        }}
        onFocus={(e) => {
          // We want to prevent the default focusing behavior which often causes scrolling
          e.preventDefault();
          
          // Store current scroll position
          const scrollX = window.pageXOffset;
          const scrollY = window.pageYOffset;
          
          // Ensure the input is cleared on focus
          if (inputRef.current) {
            inputRef.current.value = '';
          }
          
          // Restore scroll position to prevent movement
          window.scrollTo(scrollX, scrollY);
        }}
        onClick={(e) => {
          // Prevent default click behavior
          e.preventDefault();
        }}
        // Additional input properties for better mobile experience
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck="false"
        aria-label="Hidden word input"
      />

      {/* Clickable area to focus input on mobile */}
      <div className={guessAreaClass} onClick={focusInput}>
        <div className="guess-area-inner">
          <GuessGrid 
            guesses={guesses} 
            currentGuess={currentGuess}
            wordLength={puzzle?.word?.length || 5}
            maxGuesses={6}
            shake={shake}
          />
        </div>
      </div>

      <div className="hint-container">
        <button 
          className="hint-button" 
          onClick={useHint} 
          disabled={gameStatus !== 'playing' || hintsRemaining <= 0}
        >
          Use Hint ({hintsRemaining} left)
        </button>
        
        <button
          className="submit-button"
          onClick={submitGuess}
          disabled={gameStatus !== 'playing' || !currentGuess || currentGuess.length !== puzzle?.word?.length}
        >
          Submit Word
        </button>
      </div>
      
      <Keyboard
        onKeyPress={(key) => {
          if (!puzzle || !puzzle.word) return; // Skip if puzzle is null
          
          if (key === 'ENTER') {
            submitGuess();
          } else if (key === 'BACKSPACE') {
            const newGuess = currentGuess.slice(0, -1);
            setCurrentGuess(newGuess);
          } else if (currentGuess.length < (puzzle?.word?.length || 5)) {
            const newGuess = currentGuess + key;
            setCurrentGuess(newGuess);
          }
        }}
        guesses={guesses}
        gameStatus={gameStatus}
      />

      {message.text && <Message text={message.text} type={message.type} />}

      {gameStatus !== 'playing' && puzzle && (
        <div className="game-result">
          <h2 className={gameStatus === 'won' ? 'success-text' : 'error-text'}>
            {gameStatus === 'won' ? 'Well done!' : 'Better luck next time!'}
          </h2>
          <p>The word was: <strong>{puzzle.word}</strong></p>
          <p className="current-difficulty">
            Difficulty: <span className="difficulty-tag">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
          </p>
          {gameStatus === 'won' && (
            <div className="next-word-container">
              <p>Next word in: <strong>{timeRemaining.toFixed(1)}</strong> seconds</p>
              <button 
                className="next-word-button"
                onClick={() => {
                  if (autoAdvanceTimer) {
                    clearInterval(autoAdvanceTimer);
                    setAutoAdvanceTimer(null);
                  }
                  getNextWord();
                }}
              >
                Next Word Now
              </button>
            </div>
          )}
          {gameStatus === 'lost' && (
            <div>
              <p>A new puzzle will be available tomorrow!</p>
              <button 
                className="next-word-button"
                onClick={getNextWord}
                style={{ marginTop: '15px' }}
              >
                Try Another Word
              </button>
            </div>
          )}
        </div>
      )}
      
      {showInstructions && <Instructions onClose={() => setShowInstructions(false)} isDarkMode={isDarkMode} />}
    </div>
  );
};

export default Game; 