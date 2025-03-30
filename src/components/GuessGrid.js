import React from 'react';
import './GuessGrid.css';

const GuessGrid = ({ guesses, currentGuess, wordLength, maxGuesses, shake }) => {
  // Create empty rows to fill the grid
  const rows = [];
  
  // Always enable scrolling to fix display issues
  const needsScrolling = true;
  
  // Log the scrolling decision
  
  // Helper to create a row with cells
  const createRow = (cells, key) => (
    <div key={key} className="guess-row">
      {cells}
    </div>
  );
  
  // Add existing guesses
  for (let i = 0; i < guesses.length; i++) {
    const guess = guesses[i];
    const row = [];
    
    for (let j = 0; j < wordLength; j++) {
      let cellClass = 'letter-cell';
      let status = guess.result[j].status; // Get the status directly
      
      // Map status to CSS class
      if (status === 'correct') {
        cellClass += ' correct';
      } else if (status === 'partial') {
        cellClass += ' present';
      } else if (status === 'incorrect') {
        cellClass += ' absent';
      }
      
      // Add flip animation class
      cellClass += ' flip';
      
      row.push(
        <div 
          key={j} 
          className={cellClass} 
          data-letter={guess.word[j]}
        >
          {guess.word[j]}
        </div>
      );
    }
    
    rows.push(createRow(row, i));
  }
  
  // Add current guess
  if (guesses.length < maxGuesses) {
    const row = [];
    
    for (let j = 0; j < wordLength; j++) {
      let cellClass = 'letter-cell';
      
      if (j < currentGuess.length) {
        cellClass += ' filled';
        
        // Apply shake animation if the guess is invalid
        if (shake && j === 0) {
          cellClass += ' shake';
        }
      }
      
      // Add pop animation only to the last character
      if (j === currentGuess.length - 1 && currentGuess.length > 0) {
        cellClass += ' pop';
      }
      
      row.push(
        <div 
          key={j} 
          className={cellClass} 
          data-letter={j < currentGuess.length ? currentGuess[j] : ''}
        >
          {j < currentGuess.length ? currentGuess[j] : ''}
        </div>
      );
    }
    
    rows.push(createRow(row, guesses.length));
  }
  
  // Add empty rows to fill the grid
  for (let i = rows.length; i < maxGuesses; i++) {
    const row = [];
    
    for (let j = 0; j < wordLength; j++) {
      row.push(
        <div 
          key={j} 
          className="letter-cell" 
          data-letter=""
        >
          {""}
        </div>
      );
    }
    
    rows.push(createRow(row, i));
  }
  
  // Add "scrollable" class to container if needed
  const containerClass = `guess-grid-container${needsScrolling ? ' scrollable' : ''}`;

  return (
    <div className={containerClass}>
      <div className="guess-grid">
        {rows}
      </div>
    </div>
  );
};

export default GuessGrid; 