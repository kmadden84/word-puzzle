import React from 'react';
import './Modal.css';

const HelpModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>How to Play</h2>
        
        <div className="help-content">
          <p>Guess the word in 6 tries or less!</p>
          
          <h3>Rules:</h3>
          <ul>
            <li>Each guess must be a valid word with the correct number of letters</li>
            <li>After each guess, the color of the tiles will change to show how close your guess was</li>
          </ul>
          
          <div className="example-section">
            <h3>Example:</h3>
            <div className="example">
              <div className="example-row">
                <div className="example-cell correct">R</div>
                <div className="example-cell">E</div>
                <div className="example-cell">A</div>
                <div className="example-cell">C</div>
                <div className="example-cell">T</div>
              </div>
              <p><span className="example-highlight correct-text">R</span> is in the word and in the correct spot.</p>
            </div>
            
            <div className="example">
              <div className="example-row">
                <div className="example-cell">S</div>
                <div className="example-cell partial">P</div>
                <div className="example-cell">A</div>
                <div className="example-cell">C</div>
                <div className="example-cell">E</div>
              </div>
              <p><span className="example-highlight partial-text">P</span> is in the word but in the wrong spot.</p>
            </div>
            
            <div className="example">
              <div className="example-row">
                <div className="example-cell">P</div>
                <div className="example-cell">I</div>
                <div className="example-cell">Z</div>
                <div className="example-cell incorrect">Z</div>
                <div className="example-cell">A</div>
              </div>
              <p><span className="example-highlight incorrect-text">Z</span> is not in the word in any spot.</p>
            </div>
          </div>
          
          <h3>Difficulty Levels:</h3>
          <ul>
            <li><strong>Beginner:</strong> 3-5 letter words, simpler vocabulary</li>
            <li><strong>Intermediate:</strong> 5-6 letter words, standard vocabulary</li>
            <li><strong>Advanced:</strong> 7+ letter words, more challenging vocabulary</li>
          </ul>
          <p>You can change the difficulty level before starting a new game. Once a game is in progress, you must complete it before changing difficulty.</p>
          
          <h3>Hints:</h3>
          <p>You can use up to 3 hints per puzzle. A hint will reveal a letter's position.</p>
          
          <h3>Daily Puzzles:</h3>
          <p>A new puzzle will be available each day for each difficulty level. Come back daily to maintain your streak!</p>
        </div>
        
      </div>
    </div>
  );
};

export default HelpModal; 