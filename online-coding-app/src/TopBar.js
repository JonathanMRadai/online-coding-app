import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function TopBar({ onExit, codeBlockName, role }) {
  return (
    <AppBar position="static" sx={{ boxShadow: 'none', background: '#2c3e50' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: '#ecf0f1', fontWeight: 'bold' }}>
          Code Block: {codeBlockName}
        </Typography>
        <Typography variant="body1" sx={{ marginRight: 2, color: '#bdc3c7' }}>
          Role: {role.charAt(0).toUpperCase() + role.slice(1)}
        </Typography>
        <IconButton color="inherit" onClick={onExit}>
          <CloseIcon /> {/* The "X" (close) icon */}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
