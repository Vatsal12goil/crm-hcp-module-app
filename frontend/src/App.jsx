import React from 'react';
import ChatInterface from './components/ChatInterface';
import LogForm from './components/LogForm';

function App() {
  return (
    <div className="page-wrapper">
      <h1 className="page-title">Log HCP Interaction</h1>
      <div className="split-layout">
        <LogForm />
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;
