import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './App.css';
// @ts-ignore
const vscode = acquireVsCodeApi();
const App = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [fileText, setFileText] = useState('');
    useEffect(() => {
        window.addEventListener('message', (event) => {
            const { command, content } = event.data;
            if (command === 'fileResult') {
                console.log('📎 File received from extension:', content); // 🔍 Debug log
                setFileText(content);
                const fileMsg = {
                    role: 'user',
                    text: `📎 Attached file content:\n\n${content}`,
                };
                setMessages((prev) => [...prev, fileMsg]);
            }
        });
    }, []);
    const handleSend = () => {
        if (!input.trim())
            return;
        const userMsg = { role: 'user', text: input };
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
            const aiReply = { role: 'ai', text: data.reply };
            setMessages((prev) => [...prev, aiReply]);
            setFileText(''); // Clear after use
        })
            .catch(err => {
            console.error('❌ Backend error:', err);
            const errorReply = { role: 'ai', text: 'Error getting reply from AI.' };
            setMessages((prev) => [...prev, errorReply]);
        });
        setInput('');
    };
    return (_jsxs("div", { className: "chat-container", children: [_jsx("div", { className: "chat-messages", children: messages.map((msg, idx) => (_jsx("div", { className: `chat-bubble ${msg.role}`, children: _jsx("span", { children: msg.text }) }, idx))) }), _jsxs("div", { className: "chat-input", children: [_jsx("input", { type: "text", placeholder: "Ask something...", value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSend() }), _jsx("button", { onClick: handleSend, children: "Send" })] })] }));
};
export default App;
