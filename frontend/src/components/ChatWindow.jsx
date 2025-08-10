import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ wa_id, messages = [], onSend }){
  const [text, setText] = useState('');
  const containerRef = useRef();

  useEffect(() => {
    // scroll to bottom when messages change
    if(containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  if(!wa_id) return <div className="chat-window empty">Select a conversation</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">Conversation: {wa_id}</div>

      <div className="messages" ref={containerRef}>
        {messages.map(m => <MessageBubble key={m._id || m.message_id} msg={m} />)}
      </div>

      <div className="chat-input">
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type a message"/>
        <button onClick={() => { if(!text.trim()) return; onSend(text.trim()); setText(''); }}>Send</button>
      </div>
    </div>
  );
}
