import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import AceEditor from 'react-ace';
import ace from 'ace-builds';
import { AppBar, Toolbar, Typography, Container, Paper, Box, IconButton, Rating } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';

ace.config.setModuleUrl('ace/mode/javascript_worker', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/worker-javascript.js');

let socket;

function CodeBlockPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [codeBlock, setCodeBlock] = useState(null);
  const [role, setRole] = useState('student');
  const [studentsCount, setStudentsCount] = useState(0);
  const [code, setCode] = useState('');
  const [rating, setRating] = useState(0);  // Average rating
  const [userRating, setUserRating] = useState(null); // User's rating
  const [isRated, setIsRated] = useState(false); // To track if the user has rated
  const [showSmiley, setShowSmiley] = useState(false); // To track if we should show the smiley face
  const [isHovering, setIsHovering] = useState(false); // To track hovering over the rating stars

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:4000');
    }

    // Fetch code block data
    fetch(`http://localhost:4000/api/codeblock/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCodeBlock(data);
        setCode(data.initialCode);
      });

    // Fetch the current rating
    fetch(`http://localhost:4000/api/codeblock/${id}/rating`)
      .then((res) => res.json())
      .then((data) => {
        setRating(data.averageRating); // Store average rating
      });

    socket.emit('joinCodeBlock', id);
    socket.on('role', (assignedRole) => setRole(assignedRole));

    // Update the code when a new codeUpdate event is received
    socket.on('codeUpdate', (newCode) => {
      setCode(newCode);
    });

    // Update the student count when a new studentsCountUpdate event is received
    socket.on('studentsCountUpdate', (count) => setStudentsCount(count));

    socket.on('mentorLeft', () => {
      alert('Mentor has left the session. Redirecting to the lobby...');
      navigate('/');
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [id, navigate]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit('codeChange', newCode);

    // Check if the student's code matches the solution
    if (newCode.trim() === codeBlock.solution.trim()) {
      setShowSmiley(true);  // Show the smiley face and hide the code editor
    } else {
      setShowSmiley(false);  // Show the code editor if the solution isn't correct
    }
  };

  const handleRatingChange = (newValue) => {
    if (!isRated) {  // Only allow if the user hasn't rated yet
      setUserRating(newValue);
      setIsRated(true);  // Mark as rated to replace with average rating

      // Submit the rating to the server
      fetch(`http://localhost:4000/api/codeblock/${id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newValue })
      })
        .then((res) => res.json())
        .then((data) => {
          setRating(data.averageRating);  // Update the average rating after submission
        });
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  if (!codeBlock) return <p>Loading...</p>;

  return (
    <div>
      <AppBar position="static" sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Code Block: {codeBlock.codeBlockName}
          </Typography>

          {/* Difficulty label */}
          <Typography variant="body1" sx={{ color: 'text.secondary', marginRight: 1 }}>
            Difficulty:
          </Typography>

          {/* Rating component to the left of the number of students */}
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {!isHovering && (
              <Rating
                value={rating}
                readOnly
                max={5}
                precision={0.1}
                sx={{ color: '#f1c40f', marginRight: 2 }}
              />
            )}
            {isHovering && !isRated && (
              <Rating
                value={userRating}
                onChange={(event, newValue) => handleRatingChange(newValue)}
                max={5}
                precision={1}
                sx={{ color: '#f1c40f', marginRight: 2 }}
              />
            )}
            {isHovering && isRated && (
              <Rating
                value={rating}
                readOnly
                max={5}
                precision={0.1}
                sx={{ color: '#f1c40f', marginRight: 2 }}
              />
            )}
          </div>

          <Typography variant="body1" sx={{ marginRight: 2, color: 'text.secondary' }}>
            Students: {studentsCount} | Role: {role.charAt(0).toUpperCase() + role.slice(1)}
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/')}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Paper sx={{ marginTop: 3, padding: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
          {/* Conditionally render the smiley face or the code editor */}
          {showSmiley ? (
            <Box mt={2} display="flex" justifyContent="center" alignItems="center" height="500px">
              <EmojiEmotionsIcon style={{ fontSize: '10rem', color: '#f1c40f' }} />
            </Box>
          ) : (
            <AceEditor
              mode="javascript"
              theme="monokai"
              value={code}
              onChange={handleCodeChange}
              name="codeEditor"
              editorProps={{ $blockScrolling: true }}
              width="100%"
              height="500px"
              readOnly={role === 'mentor'}
            />
          )}
        </Paper>
      </Container>
    </div>
  );
}

export default CodeBlockPage;
