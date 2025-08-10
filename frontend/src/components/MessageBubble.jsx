import React from 'react';

function StatusIcon({ status }) {
  if (status === 'sent') return <span className="tick">✓</span>;
  if (status === 'delivered') return <span className="tick">✓✓</span>;
  if (status === 'read') return <span className="tick read">✓✓</span>;
  return null;
}

export default function MessageBubble({ msg }){
  const isOutbound = msg.direction === 'outbound';
  const time = new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  return (
    <div className={`msg-row ${isOutbound ? 'out' : 'in'}`}>
      <div className="bubble">
        <div className="text">{msg.text}</div>
        <div className="meta">
          <span className="time">{time}</span>
          { isOutbound && <StatusIcon status={msg.status} /> }
        </div>
      </div>
    </div>
  );
}
