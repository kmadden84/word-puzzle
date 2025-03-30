import puzzleData from '../data/puzzles';

// Helper function to get day of year
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Count total words in a specific difficulty
export const getDifficultyWordCount = (targetDifficulty) => {
  return puzzleData.filter(puzzle => puzzle.difficulty === targetDifficulty.toLowerCase()).length;
};

// Get today's puzzle based on the date and difficulty
export const getTodaysPuzzle = (difficulty = 'beginner', currentPuzzleId = null, solvedWordIds = []) => {
  console.log(`Getting puzzle for difficulty: ${difficulty}`);
  console.log(`Solved word IDs:`, solvedWordIds);
  
  // Filter puzzles by difficulty
  const filteredPuzzles = puzzleData.filter(puzzle => 
    puzzle.difficulty === difficulty.toLowerCase()
  );
  
  // If no puzzles match the difficulty, return a default puzzle
  if (filteredPuzzles.length === 0) {
    return puzzleData[0];
  }
  
  // Create word IDs for the puzzles if they don't have them already
  const puzzlesWithIds = filteredPuzzles.map((puzzle, index) => {
    const wordId = `${difficulty}-${puzzle.word.toLowerCase()}`;
    console.log(`Created wordId: ${wordId} for word: ${puzzle.word}`);
    return {
      ...puzzle,
      wordId: wordId
    };
  });
  
  // Filter out solved words
  const availablePuzzles = puzzlesWithIds.filter(puzzle => {
    const isFiltered = !solvedWordIds.includes(puzzle.wordId);
    if (!isFiltered) {
      console.log(`Filtering out solved word: ${puzzle.word} with ID: ${puzzle.wordId}`);
    }
    return isFiltered;
  });
  
  // MODIFICATION: Don't reset and use all words when all are solved
  // This allows the level completion logic to work correctly  
  if (availablePuzzles.length === 0) {
    console.log("All words solved! Ready for level completion.");
    // Return the first puzzle with a flag indicating all are completed
    return {
      ...puzzlesWithIds[0],
      allCompleted: true
    };
  }
  
  console.log(`Available puzzles for ${difficulty}: ${availablePuzzles.length} words`);
  
  // If currentPuzzleId is provided, get the next puzzle in the list
  if (currentPuzzleId) {
    // Find the current puzzle in the available puzzles
    const currentIndex = availablePuzzles.findIndex(puzzle => puzzle.id === currentPuzzleId);
    console.log(`Looking for puzzle with ID: ${currentPuzzleId}, found at index: ${currentIndex}`);
    
    if (currentIndex !== -1 && currentIndex < availablePuzzles.length - 1) {
      // Return the next puzzle
      return availablePuzzles[currentIndex + 1];
    } else {
      // If at the end of the list or not found, return the first puzzle
      return availablePuzzles[0];
    }
  }
  
  // For demo purposes, select a random puzzle from available puzzles
  const randomIndex = Math.floor(Math.random() * availablePuzzles.length);
  const selectedPuzzle = availablePuzzles[randomIndex];
  console.log(`Selected random puzzle: ${selectedPuzzle.word}`);
  
  // Add date-based ID for persistent storage
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
  const puzzle = {
    ...selectedPuzzle,
    id: `${dateString}-${difficulty}-${randomIndex}` // Use date, difficulty and index as ID
  };
  
  console.log(`Returning puzzle: ${puzzle.word} with ID: ${puzzle.id}`);
  return puzzle;
};

// Hash function to get a consistent index from a string
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

// Check a guess against the target word
export const checkGuess = (guess, targetWord) => {
  // Normalize both words for consistency
  const normalizedGuess = guess.toLowerCase().trim();
  const normalizedTarget = targetWord.toLowerCase().trim();
  
  // Direct comparison for exact matches
  if (normalizedGuess === normalizedTarget) {
    return normalizedGuess.split('').map(letter => ({
      letter,
      status: 'correct'
    }));
  }
  
  const targetLetters = normalizedTarget.split('');
  const guessLetters = normalizedGuess.split('');
  
  // First pass: mark correct letters and track unused letters for second pass
  const result = Array(guessLetters.length).fill(null);
  const unusedTargetIndices = Array(targetLetters.length).fill(true);
  
  // Mark correct positions first
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = { letter: guess[i], status: 'correct' };
      unusedTargetIndices[i] = false; // Mark this target letter as used
    }
  }
  
  // Second pass: mark partial matches and incorrect letters
  for (let i = 0; i < guessLetters.length; i++) {
    if (result[i] === null) { // Skip positions already marked as correct
      // Check if this letter exists elsewhere in the target
      let partialMatch = false;
      
      for (let j = 0; j < targetLetters.length; j++) {
        if (unusedTargetIndices[j] && guessLetters[i] === targetLetters[j]) {
          // Found a match at a different position
          result[i] = { letter: guess[i], status: 'partial' };
          unusedTargetIndices[j] = false; // Mark this target letter as used
          partialMatch = true;
          break;
        }
      }
      
      if (!partialMatch) {
        // No match found for this letter
        result[i] = { letter: guess[i], status: 'incorrect' };
      }
    }
  }
  
  return result;
};

// Generate a keyboard state from guesses
export const getKeyboardState = (guesses) => {
  const keyState = {};
  
  // Process guesses in order
  guesses.forEach(guess => {
    guess.result.forEach(({ letter, status }) => {
      // Only upgrade key state (incorrect -> partial -> correct)
      const currentStatus = keyState[letter] || 'unused';
      
      if (status === 'correct') {
        keyState[letter] = 'correct';
      } else if (status === 'partial' && currentStatus !== 'correct') {
        keyState[letter] = 'partial';
      } else if (status === 'incorrect' && currentStatus === 'unused') {
        keyState[letter] = 'incorrect';
      }
    });
  });
  
  return keyState;
};

// Debug function to test guess checking
export const testWordMatching = (guessWord, targetWord) => {
  console.log(`Testing match: "${guessWord}" vs "${targetWord}"`);
  
  // Normalize both words for consistency
  const normalizedGuess = guessWord.toLowerCase().trim();
  const normalizedTarget = targetWord.toLowerCase().trim();
  
  console.log(`Normalized: "${normalizedGuess}" vs "${normalizedTarget}"`);
  console.log(`Direct equality check: ${normalizedGuess === normalizedTarget}`);
  
  // Try the check function
  const result = checkGuess(guessWord, targetWord);
  console.log('Check result:', result);
  
  return normalizedGuess === normalizedTarget;
}; 