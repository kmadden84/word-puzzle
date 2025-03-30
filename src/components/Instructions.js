import React, { useEffect } from 'react';
import './Instructions.css';

const Instructions = ({ onClose, isDarkMode }) => {
  const maxGuesses = 6;
  
  // Add body class when modal opens and remove when it closes
  useEffect(() => {
    // Add class to prevent body scrolling
    document.body.classList.add('modal-open');
    
    // Clean up function to remove class when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Handle close with cleanup
  const handleClose = () => {
    document.body.classList.remove('modal-open');
    onClose();
  };
  
  return (
    <div className={`modal-overlay ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="modal-container">
        <button className="close-button" onClick={handleClose}>×</button>
        <h2>How to Play</h2>
        
        <div className="modal-content">
          <div className="instruction-section">
            <p>Guess the word in {maxGuesses} tries or less!</p>
            
            <h3>Rules:</h3>
            <ul>
              <li>Each guess must be a valid word with the correct number of letters</li>
              <li>After each guess, the color of the tiles will change to show how close your guess was</li>
            </ul>
          </div>
          
          <div className="instruction-section">
            <h3>Example:</h3>
            
            <div className="example">
              <div className="example-row">
                <div className="example-tile correct">R</div>
                <div className="example-tile">E</div>
                <div className="example-tile">A</div>
                <div className="example-tile">C</div>
                <div className="example-tile">T</div>
              </div>
              <p>R is in the word and in the correct spot.</p>
            </div>
            
            <div className="example">
              <div className="example-row">
                <div className="example-tile">S</div>
                <div className="example-tile present">P</div>
                <div className="example-tile">A</div>
                <div className="example-tile">C</div>
                <div className="example-tile">E</div>
              </div>
              <p>P is in the word but in the wrong spot.</p>
            </div>
            
            <div className="example">
              <div className="example-row">
                <div className="example-tile">P</div>
                <div className="example-tile">I</div>
                <div className="example-tile">Z</div>
                <div className="example-tile absent">Z</div>
                <div className="example-tile">A</div>
              </div>
              <p>Z is not in the word in any spot.</p>
            </div>
          </div>
          
          <div className="instruction-section">
            <h3>Difficulty Levels:</h3>
            <ul>
              <li>Beginner: 3-5 letter words, simpler vocabulary</li>
              <li>Intermediate: 5-6 letter words, standard vocabulary</li>
              <li>Advanced: 7+ letter words, more challenging vocabulary</li>
            </ul>
            <p>You can change the difficulty level before starting a new game. Once a game is in progress, you must complete it before changing difficulty.</p>
          </div>
          
          <div className="instruction-section">
            <h3>Hints:</h3>
            <p>You can use up to 3 hints per puzzle. A hint will reveal a letter's position.</p>
          </div>
          
          <div className="instruction-section">
            <h3>Daily Puzzles:</h3>
            <p>A new puzzle will be available each day for each difficulty level. Come back daily to maintain your streak!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions; 