import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FullUikitDemo from './pages/fullUikit/FullUikitDemo';
import ChatroomUikitDemo from './pages/chatroomUikit/ChatroomUikitDemo';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/full-uikit" element={<FullUikitDemo />} />
        <Route path="/chatroom-uikit" element={<ChatroomUikitDemo />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;