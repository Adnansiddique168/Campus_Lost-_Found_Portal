"use client";
import React, { useState, useEffect, useRef } from 'react';

type Message = {
  id: number;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  createdAt: string;
};

export default function UserChat({ currentUser, otherUserEmail, otherUserName, onClose }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?userEmail=${currentUser.email}&otherEmail=${otherUserEmail}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds for real-time feel
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser.email, otherUserEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msgContent = input;
    setInput('');
    
    // Optimistic UI update
    const tempMsg: Message = {
      id: Date.now(),
      senderEmail: currentUser.email,
      receiverEmail: otherUserEmail,
      content: msgContent,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentUser.email,
          receiverEmail: otherUserEmail,
          content: msgContent
        })
      });
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Chat with {otherUserName || "User"}</h3>
            <p className="text-indigo-200 text-xs">{otherUserEmail}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
          {isLoading ? (
            <p className="text-center text-gray-500 mt-10">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="text-center mt-10">
              <div className="text-4xl mb-2">👋</div>
              <p className="text-gray-500 text-sm">No messages yet. Say hi!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderEmail === currentUser.email;
              return (
                <div className="flex flex-col" key={msg.id}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-indigo-600 text-white self-end rounded-br-sm' : 'bg-white text-gray-800 self-start rounded-bl-sm border border-gray-200 shadow-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className={`text-[10px] mt-1 ${isMe ? 'text-gray-400 self-end mr-1' : 'text-gray-400 self-start ml-1'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
