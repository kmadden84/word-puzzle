import React from 'react';
import { useGame } from '../contexts/GameContext';
import './DifficultySelector.css';

const DifficultySelector = () => {
  const { 
    difficulty, 
    changeDifficulty, 
    gameStatus, 
    guesses, 
    solvedWords, 
    clearSolvedWords,
    resetAllGameData
  } = useGame();
  
  const isGameInProgress = gameStatus === 'playing' && guesses.length > 0;

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', description: '3-5 letter words' },
    { value: 'intermediate', label: 'Intermediate', description: '5-6 letter words' },
    { value: 'advanced', label: 'Advanced', description: '7+ letter words' }
  ];

  return (
    <div className="difficulty-selector">
      <div className="difficulty-selector-header">
        <h3>Difficulty</h3>
        {isGameInProgress && (
          <span className="difficulty-locked-message">
            Finish current game to change
          </span>
        )}
      </div>

      <div className="difficulty-options">
        {difficultyOptions.map(option => (
          <button
            key={option.value}
            className={`difficulty-option ${difficulty === option.value ? 'selected' : ''}`}
            onClick={() => changeDifficulty(option.value)}
            disabled={isGameInProgress}
          >
            <span className="difficulty-label">{option.label}</span>
            <span className="difficulty-description">{option.description}</span>
            <span className="difficulty-solved">
              {solvedWords[option.value]?.length || 0} solved
            </span>
          </button>
        ))}
      </div>
      
      {/* Button to reset solved words history */}
      <div className="reset-solved-container">
        <button 
          className="reset-solved-button"
          onClick={clearSolvedWords}
          title="This will reset your list of solved words, allowing you to solve all puzzles again"
        >
          Reset Solved Words
        </button>
        
        {/* Add a button for complete reset */}
        <button 
          className="reset-all-button"
          onClick={() => {
            if (window.confirm('This will clear ALL game data including stats. Continue?')) {
              resetAllGameData();
            }
          }}
          title="This will reset ALL game data including stats and history"
        >
          Reset Game Data
        </button>
      </div>
    </div>
  );
};

export default DifficultySelector; 