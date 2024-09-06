import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Lobby from './Lobby';
import CodeBlockPage from './CodeBlockPage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2f80ed', // Soft blue for buttons and highlights
    },
    background: {
      default: '#121212', // Dark background for the whole app
      paper: '#1e1e1e',   // Slightly lighter background for cards and containers
    },
    text: {
      primary: '#e0e0e0', // Light text for readability
      secondary: '#b0b0b0', // Dimmed text for secondary elements
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '1.1rem',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Apply the dark theme globally */}
      <Router>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/codeblock/:id" element={<CodeBlockPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
