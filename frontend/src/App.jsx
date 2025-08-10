import React, { useEffect, useState, useCallback } from 'react';
import ConversationsList from './components/ConversationsList';
import ChatWindow from './components/ChatWindow';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeWa, setActiveWa] = useState(null);
  const [messages, setMessages] = useState([]);

  // Stable function reference to avoid re-creation on every render
  const fetchConversations = useCallback(async () => {
  const res = await fetch(`${API}/api/conversations`);
  const data = await res.json();
  setConversations(data);
  if (data[0] && !activeWa) {
    setActiveWa(data[0].wa_id);
  }
}, [activeWa]); // Removed API from deps

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when activeWa changes
  useEffect(() => {
    if (!activeWa) return;
    (async () => {
      const res = await fetch(`${API}/api/conversations/${activeWa}/messages`);
      const msgs = await res.json();
      setMessages(msgs);
    })();
  }, [activeWa]);

  // Send message and refresh conversations
  async function sendMessage(wa_id, text) {
    const res = await fetch(`${API}/api/conversations/${wa_id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const newMsg = await res.json();
    setMessages(prev => [...prev, newMsg]);
    fetchConversations();
  }

  return (
    <div className="app-root">
      <ConversationsList
        conversations={conversations}
        activeWa={activeWa}
        onSelect={wa => setActiveWa(wa)}
      />
      <ChatWindow
        wa_id={activeWa}
        messages={messages}
        onSend={(text) => sendMessage(activeWa, text)}
      />
    </div>
  );
}
