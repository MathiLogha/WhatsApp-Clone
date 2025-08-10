import React from 'react';

export default function ConversationsList({ conversations, activeWa, onSelect }){
  return (
    <div className="conversations-list">
      <h3>Chats</h3>
      {conversations.map(c => (
        <div key={c.wa_id}
             className={'conv-item ' + (c.wa_id === activeWa ? 'active' : '')}
             onClick={() => onSelect(c.wa_id)}>
          <div className="avatar">{(c.name || c.wa_id)[0]}</div>
          <div className="meta">
            <div className="name">{c.name || c.wa_id}</div>
            <div className="preview">{c.lastMessage || ''}</div>
          </div>
          {c.unread > 0 && <div className="unread-badge">{c.unread}</div>}
        </div>
      ))}
    </div>
  );
}
