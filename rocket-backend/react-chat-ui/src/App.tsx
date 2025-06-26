import React, { useState, useEffect } from 'react';
import './App.css';

type Message = {
  role: 'user' | 'ai';
  text: string;
};

// @ts-ignore
const vscode = acquireVsCodeApi();

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [fileText, setFileText] = useState('');

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const { command, content } = event.data;
      if (command === 'fileResult') {
        console.log('📎 File received from extension:', content); // 🔍 Debug log
        setFileText(content);
        const fileMsg: Message = {
          role: 'user',
          text: `📎 Attached file content:\n\n${content}`,
        };
        setMessages((prev) => [...prev, fileMsg]);
      }
    });
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Detect file mention
    const fileMention = input.match(/@([\w\-./\\]+)/);
    if (fileMention) {
      const filename = fileMention[1];
      console.log('📥 Detected file mention:', filename);
      vscode.postMessage({ command: 'readFile', filename });
    }

    // Send input + fileText to backend
    const finalMessage = input + (fileText ? `\n\n${fileText}` : '');
    console.log('🚀 Sending to backend:', finalMessage);

    fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: finalMessage }),
    })
      .then(res => res.json())
      .then(data => {
        const aiReply: Message = { role: 'ai', text: data.reply };
        setMessages((prev) => [...prev, aiReply]);
        setFileText(''); // Clear after use
      })
      .catch(err => {
        console.error('❌ Backend error:', err);
        const errorReply: Message = { role: 'ai', text: 'Error getting reply from AI.' };
        setMessages((prev) => [...prev, errorReply]);
      });

    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default App;
