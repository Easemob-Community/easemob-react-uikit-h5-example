import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FullUikitDemo from './pages/fullUikit/FullUikitDemo';
import ChatroomUikitDemo from './pages/chatroomUikit/ChatroomUikitDemo';
import CustomerServiceScenario from './pages/customerService/CustomerServiceScenario';
import CustomerServiceChat from './pages/customerService/CustomerServiceChat';
import CustomerServiceVoiceChat from './pages/customerService/CustomerServiceVoiceChat';
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
        <Route path="/customer-service" element={<CustomerServiceScenario />} />
        <Route path="/customer-service/chat" element={<CustomerServiceChat />} />
        <Route path="/customer-service/voice-chat" element={<CustomerServiceVoiceChat />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;