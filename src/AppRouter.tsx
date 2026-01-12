import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FullUikitDemo from './pages/fullUikit/FullUikitDemo';
import ChatroomUikitDemo from './pages/chatroomUikit/ChatroomUikitDemo';
import { ChatroomEntryPoint } from './components/chatroom/ChatroomComponents';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/full-uikit" element={<FullUikitDemo />} />
        <Route path="/chatroom-uikit" element={<ChatroomUikitDemo />} />
        <Route path="/chatroom-uikit/chatroom" element={<ChatroomEntryPoint />} />
        <Route path="/chatroom-uikit/members" element={<ChatroomEntryPoint />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;