import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import GuessGrid from './GuessGrid';
import Keyboard from './Keyboard';
import Message from './Message';
import DifficultySelector from './DifficultySelector';
import Fireworks from './Fireworks';
import Instructions from './Instructions';
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
    useHint,
    submitGuess,
    difficulty,
    getNextWord
  } = useGame();
  
  const [showFireworks, setShowFireworks] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(2.5);
  const [showInstructions, setShowInstructions] = useState(false);
  const inputRef = useRef(null);
  const { isDarkMode } = useTheme();

  // Focus invisible input when clicked on grid area for mobile
  const focusInput = () => {
    if (inputRef.current) {
      // Clear any existing value to prevent duplication
      if (inputRef.current.value) {
        inputRef.current.value = '';
      }
      inputRef.current.focus();
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameStatus !== 'playing') return;
      
      if (e.key === 'Enter') {
        console.log("Enter key pressed, submitting guess:", currentGuess);
        e.preventDefault();
        submitGuess();
      } else if (e.key === 'Backspace') {
        // Prevent default only when we're handling it ourselves
        e.preventDefault();
        const newGuess = currentGuess.slice(0, -1);
        console.log("Window keydown backspace, new guess:", newGuess);
        setCurrentGuess(newGuess);
      } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < (puzzle?.word?.length || 5)) {
        // Prevent default to avoid duplicate characters when using hidden input
        e.preventDefault();
        const newChar = e.key.toUpperCase();
        const newGuess = currentGuess + newChar;
        console.log("Window keydown adding character:", newChar, "new guess:", newGuess);
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

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  if (!puzzle) return <div className="loading">Loading puzzle...</div>;

  return (
    <div className="game-container">
      {showFireworks && <Fireworks />}
      
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
          // Get the typed character
          const typed = e.target.value.toUpperCase();
          
          // Ignore empty input
          if (!typed || typed.length === 0) return;
          
          // Only process if it contains a valid character and we're not at max length
          const lastChar = typed.slice(-1);
          if (/^[A-Z]$/.test(lastChar) && currentGuess.length < puzzle.word.length) {
            console.log("Input onChange adding character:", lastChar);
            // Make sure we can track this state update
            const newGuess = currentGuess + lastChar;
            console.log("New guess will be:", newGuess);
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
        // Clear any potential selection or input state when focused
        onFocus={() => {
          // Ensure the input is cleared on focus
          if (inputRef.current) {
            setTimeout(() => {
              // Using timeout to ensure this happens after the browser's focus handling
              inputRef.current.value = '';
            }, 0);
          }
        }}
        // Ensure the cursor is at the right position
        onClick={(e) => {
          // Ensure clicks don't cause odd behavior
          e.preventDefault();
          // Make sure the input is ready to receive new characters
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        }}
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck="false"
        aria-label="Hidden word input"
      />

      {/* Clickable area to focus input on mobile */}
      <div className="guess-area" onClick={focusInput}>
        <GuessGrid 
          guesses={guesses} 
          currentGuess={currentGuess}
          wordLength={puzzle.word.length}
          maxGuesses={6}
          shake={shake}
        />
      </div>

      <div className="hint-container">
        <button 
          className="hint-button" 
          onClick={useHint} 
          disabled={gameStatus !== 'playing' || hintsRemaining <= 0}
        >
          Use Hint ({hintsRemaining} left)
        </button>
      </div>
      
      <Keyboard
        onKeyPress={(key) => {
          if (key === 'ENTER') {
            console.log("Virtual keyboard Enter pressed, submitting guess:", currentGuess);
            submitGuess();
          } else if (key === 'BACKSPACE') {
            const newGuess = currentGuess.slice(0, -1);
            console.log("Virtual keyboard backspace, new guess:", newGuess);
            setCurrentGuess(newGuess);
          } else if (currentGuess.length < puzzle.word.length) {
            const newGuess = currentGuess + key;
            console.log("Virtual keyboard updated guess to:", newGuess);
            setCurrentGuess(newGuess);
          }
        }}
        guesses={guesses}
        gameStatus={gameStatus}
      />

      {message.text && <Message text={message.text} type={message.type} />}

      {gameStatus !== 'playing' && (
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