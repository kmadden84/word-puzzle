import React, { useState, useEffect } from 'react';
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
    resetAllGameData,
    getDifficultyWordCount
  } = useGame();
  
  const isGameInProgress = gameStatus === 'playing' && guesses.length > 0;

  const [progress, setProgress] = useState({
    beginner: 0,
    intermediate: 0,
    advanced: 0
  });

  // Calculate progress percentages when solvedWords changes
  useEffect(() => {
    const newProgress = {};
    
    for (const level of ['beginner', 'intermediate', 'advanced']) {
      const solved = solvedWords[level]?.length || 0;
      const total = getDifficultyWordCount(level);
      newProgress[level] = total > 0 ? (solved / total) * 100 : 0;
    }
    
    setProgress(newProgress);
  }, [solvedWords, getDifficultyWordCount]);

  return (
    <div className="difficulty-selector">
      <div className="difficulty-header">
        <h3>Difficulty Level</h3>
      </div>
      <div className="difficulty-options">
        {['beginner', 'intermediate', 'advanced'].map((level) => {
          const solved = solvedWords[level]?.length || 0;
          const total = getDifficultyWordCount(level);
          
          return (
            <button
              key={level}
              className={`difficulty-option ${difficulty === level ? 'selected' : ''}`}
              onClick={() => changeDifficulty(level)}
              disabled={isGameInProgress}
            >
              <span className="difficulty-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
              <span className="difficulty-description">
                {level === 'beginner' ? '3-5 letter words' : 
                 level === 'intermediate' ? '5-6 letter words' : 
                 '7+ letter words'}
              </span>
              <div className="difficulty-progress">
                <span className="difficulty-solved">
                  {solved}/{total} solved
                </span>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ width: `${progress[level]}%` }}
                  ></div>
                </div>
              </div>
            </button>
          );
        })}
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