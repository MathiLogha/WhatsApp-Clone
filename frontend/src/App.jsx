import React, { useEffect, useState, useCallback } from 'react';
import ConversationsList from './components/ConversationsList';
import ChatWindow from './components/ChatWindow';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeWa, setActiveWa] = useState(null);
  const [messages, setMessages] = useState([]);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/conversations`);
      const data = await res.json();
      setConversations(data);

      // Auto-select first conversation if none is active
      if (data.length > 0 && !activeWa) {
        setActiveWa(data[0].wa_id);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  }, [activeWa]); // Removed API from deps to avoid ESLint warning

  // Load conversations when app mounts
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load all messages (including processed) when activeWa changes
  useEffect(() => {
    if (!activeWa) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API}/api/conversations/${activeWa}/messages?includeProcessed=true`);
        const msgs = await res.json();
        setMessages(msgs);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [activeWa]);

  // Send a message
  async function sendMessage(wa_id, text) {
    try {
      const res = await fetch(`${API}/api/conversations/${wa_id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
      fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);
    }
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
