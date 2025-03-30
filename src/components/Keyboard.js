import React, { useState, useEffect } from 'react';
import { getKeyboardState } from '../utils/gameUtils';
import './Keyboard.css';

const Keyboard = ({ onKeyPress, guesses, gameStatus }) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobileDevice(isMobile && isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  // Determine the status of each key based on past guesses
  const getKeyStatus = (key) => {
    if (gameStatus !== 'playing') {
      return 'disabled';
    }

    // Special keys don't need status
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return '';
    }

    // Determine highest priority status (correct > present > absent)
    let status = '';
    
    for (const guess of guesses) {
      const result = guess.result;
      
      for (let i = 0; i < guess.word.length; i++) {
        if (guess.word[i] === key) {
          if (result[i] === 'correct') {
            return 'correct'; // Highest priority, return immediately
          } else if (result[i] === 'present' && status !== 'correct') {
            status = 'present';
          } else if (result[i] === 'absent' && status === '') {
            status = 'absent';
          }
        }
      }
    }
    
    return status;
  };

  const handleKeyPress = (key) => {
    if (gameStatus === 'playing') {
      onKeyPress(key);
    }
  };

  // If it's a mobile device, show a message instead of the keyboard
  if (isMobileDevice) {
    return (
      <div className="mobile-keyboard-message">
        <p>Use your device's keyboard to type</p>
      </div>
    );
  }

  return (
    <div className="keyboard">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const isEnter = key === 'ENTER';
            const isBackspace = key === 'BACKSPACE';
            const isSpecial = isEnter || isBackspace;
            const status = getKeyStatus(key);
            
            return (
              <button
                key={key}
                className={`keyboard-key ${isSpecial ? 'special' : ''} ${isEnter ? 'enter-key' : ''} ${status}`}
                onClick={() => handleKeyPress(key)}
                disabled={gameStatus !== 'playing'}
                aria-label={isBackspace ? 'Backspace' : key}
              >
                {isBackspace ? '⌫' : isEnter ? (
                  <span className="enter-key-content">
                    <span className="checkmark">✓</span> ENTER
                  </span>
                ) : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard; 