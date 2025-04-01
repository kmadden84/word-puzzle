import React from 'react';
import './GuessGrid.css';

const GuessGrid = ({ guesses, currentGuess, wordLength, maxGuesses, shake, revealedHints = [] }) => {
  // Create empty rows to fill the grid
  const rows = [];
  
  // Always enable scrolling to fix display issues
  const needsScrolling = true;
  
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
    
    if (!guess || !guess.result) {
      console.error('Invalid guess object:', guess);
      continue;
    }
    
    for (let j = 0; j < wordLength; j++) {
      let cellClass = 'letter-cell';
      
      // Safely access the status
      const result = guess.result[j];
      const status = result ? result.status : 'incorrect';
      
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
      
      // Safely access the letter
      const letter = guess.word && guess.word[j] ? guess.word[j] : '';
      
      row.push(
        <div 
          key={j} 
          className={cellClass} 
          data-letter={letter}
        >
          {letter}
        </div>
      );
    }
    
    rows.push(createRow(row, i));
  }
  
  // Add current guess row with hints
  if (guesses.length < maxGuesses) {
    const currentRowIndex = guesses.length;
    const row = [];
    
    for (let j = 0; j < wordLength; j++) {
      let cellClass = 'letter-cell';
      let letterToShow = '';
      
      // Only consider hints in the current row
      const hint = revealedHints.find(h => h.position === j);
      
      if (j < currentGuess.length) {
        cellClass += ' filled';
        letterToShow = currentGuess[j];
        
        // Apply shake animation if the guess is invalid
        if (shake && j === 0) {
          cellClass += ' shake';
        }
        
        // Add pop animation only to the last character
        if (j === currentGuess.length - 1 && currentGuess.length > 0) {
          cellClass += ' pop';
        }
      } else if (hint) {
        // Show hint letter with overlay styling in the current row
        cellClass += ' hint hint-overlay';
        letterToShow = hint.letter.toUpperCase();
      }
      
      row.push(
        <div 
          key={j} 
          className={cellClass} 
          data-letter={letterToShow}
          title={hint ? "This is a hint - enter this letter" : ""}
        >
          {letterToShow}
        </div>
      );
    }
    
    rows.push(createRow(row, currentRowIndex));
  }
  
  // Add empty rows to fill the grid (without hints)
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