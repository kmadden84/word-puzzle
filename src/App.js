import React from 'react';
import { GameProvider } from './contexts/GameContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Game from './components/Game';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <div className="app">
          <Header />
          <main>
            <Game />
          </main>
          <Footer />
        </div>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;
