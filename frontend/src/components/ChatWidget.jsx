import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageSquare, X, Send, Minimize2, Maximize2, Wifi, WifiOff } from 'lucide-react';

const WS_URL = 'http://localhost:8080/ws-chat';
const TOPIC  = '/topic/public';
const APP_PREFIX = '/app/chat';

const parseJwt = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
};

const formatTime = (ms) => {
  const d = new Date(ms);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function ChatWidget() {
  const [isOpen,     setIsOpen]     = useState(false);
  const [minimised,  setMinimised]  = useState(false);
  const [connected,  setConnected]  = useState(false);
  const [messages,   setMessages]   = useState([]);
  const [inputText,  setInputText]  = useState('');
  const [unread,     setUnread]     = useState(0);

  const clientRef    = useRef(null);
  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);

  // Derive username from JWT stored in localStorage
  const senderName = (() => {
    const token = localStorage.getItem('token');
    if (!token) return 'Guest';
    const payload = parseJwt(token);
    // Use sub (email) or a displayName if your JWT includes it
    return payload?.name || payload?.sub?.split('@')[0] || 'User';
  })();

  // ── Connect to STOMP broker ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,

      onConnect: () => {
        setConnected(true);

        // Subscribe to the public channel
        client.subscribe(TOPIC, (frame) => {
          const msg = JSON.parse(frame.body);
          setMessages(prev => [...prev, msg]);
          // If widget is closed or minimised, bump unread counter
          setUnread(prev => (isOpen && !minimised) ? 0 : prev + 1);
        });

        // Announce arrival
        client.publish({
          destination: `${APP_PREFIX}.addUser`,
          body: JSON.stringify({ senderName, type: 'JOIN' }),
        });
      },

      onDisconnect: () => setConnected(false),
      onStompError:  () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !minimised) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnread(0);
    }
  }, [messages, isOpen, minimised]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !minimised) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setUnread(0);
    }
  }, [isOpen, minimised]);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text || !connected || !clientRef.current) return;

    clientRef.current.publish({
      destination: `${APP_PREFIX}.sendMessage`,
      body: JSON.stringify({ senderName, content: text, type: 'CHAT' }),
    });
    setInputText('');
  }, [inputText, connected, senderName]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={`fixed z-50 flex flex-col items-end gap-3 font-sans ${isOpen && !minimised ? 'inset-0 sm:bottom-6 sm:right-6 sm:inset-auto' : 'bottom-6 right-6'}`}>

      {/* ── Chat Panel ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={[
            'flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
            'shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/60 overflow-hidden transition-all duration-300',
            minimised ? 'h-[52px] w-[240px] rounded-2xl border' : 'w-full h-full sm:w-[360px] sm:h-[500px] sm:rounded-2xl sm:border',
          ].join(' ')}
        >
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 shrink-0">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={16} className="text-indigo-100" />
              <span className="text-sm font-semibold text-white">Class Channel</span>
              <span className={[
                'w-2 h-2 rounded-full',
                connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400',
              ].join(' ')} />
            </div>
            <div className="flex items-center gap-1.5">
              {connected
                ? <Wifi size={13} className="text-indigo-200" />
                : <WifiOff size={13} className="text-rose-300" />
              }
              <button
                onClick={() => setMinimised(p => !p)}
                className="p-1 rounded-md hover:bg-indigo-500 transition-colors text-indigo-100"
                title={minimised ? 'Expand' : 'Minimise'}
              >
                {minimised ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-indigo-500 transition-colors text-indigo-100"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* ── Messages area ────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {connected ? 'No messages yet. Say hello!' : 'Connecting to server…'}
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.senderName === senderName;
                    const isSystem = msg.type === 'JOIN' || msg.type === 'LEAVE';

                    if (isSystem) {
                      return (
                        <div key={i} className="text-center">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        {!isMine && (
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5 ml-1">
                            {msg.senderName}
                          </span>
                        )}
                        <div className={[
                          'max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm',
                        ].join(' ')}>
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-600 mt-0.5 mx-1">
                          {msg.timestamp ? formatTime(msg.timestamp) : ''}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* ── Input area ───────────────────────────────────────── */}
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                {!connected && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 mb-2 text-center font-medium">
                    Reconnecting to server…
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!connected}
                    placeholder={connected ? 'Type a message…' : 'Connecting…'}
                    className="flex-1 px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!connected || !inputText.trim()}
                    className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-500/30"
                    title="Send (Enter)"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── FAB Toggle Button ─────────────────────────────────────────────── */}
      <button
        onClick={() => { setIsOpen(p => !p); setMinimised(false); }}
        className={[
          'relative w-14 h-14 rounded-2xl flex items-center justify-center',
          'bg-indigo-600 hover:bg-indigo-700 text-white',
          'shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60',
          'transition-all duration-200 hover:scale-105 active:scale-95',
          isOpen && !minimised ? 'hidden sm:flex' : 'flex'
        ].join(' ')}
        title="Class Chat"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
        
        {/* Unread badge */}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unread > 9 ? '9+' : unread}
          </span>
        )}

        {/* Live indicator dot */}
        {connected && (
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-600" />
        )}
      </button>
    </div>
  );
}
