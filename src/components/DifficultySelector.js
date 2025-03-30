import React from 'react';
import { useGame } from '../contexts/GameContext';
import './DifficultySelector.css';

const DifficultySelector = () => {
  const { difficulty, changeDifficulty, gameStatus, guesses } = useGame();
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
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector; 