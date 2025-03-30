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
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < (puzzle?.word?.length || 5)) {
        setCurrentGuess(prev => prev + e.key.toUpperCase());
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
        value={currentGuess}
        onChange={(e) => {
          const value = e.target.value.toUpperCase();
          if (value.length <= puzzle.word.length && /^[A-Z]*$/.test(value)) {
            setCurrentGuess(value);
            console.log("Input updated to:", value);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            console.log("Enter key detected in input, submitting guess:", currentGuess);
            e.preventDefault();
            submitGuess();
          }
        }}
        maxLength={puzzle.word.length}
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck="false"
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
            setCurrentGuess(prev => prev.slice(0, -1));
          } else if (currentGuess.length < puzzle.word.length) {
            setCurrentGuess(prev => {
              const newGuess = prev + key;
              console.log("Virtual keyboard updated guess to:", newGuess);
              return newGuess;
            });
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