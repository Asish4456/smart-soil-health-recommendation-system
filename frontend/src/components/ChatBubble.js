import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./ChatBubble.css";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am your AgriExpert. How can I help you today?", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopAudio();
    }
  };

  const playAudio = (audioBase64) => {
    if (isMuted) return;
    stopAudio();
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.play();
    audio.onended = () => setIsPlaying(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_RAG_URL}/ask`, {
        question: input,
        language: language,
      });

      const botMessage = {
        text: response.data.answer,
        isUser: false,
        audio: response.data.audio,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (response.data.audio && !isMuted) {
        playAudio(response.data.audio);
      }
    } catch (error) {
      console.error("Error calling RAG API:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I encountered an error. Please try again later.", isUser: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, scale: 0.8, y: 30, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-avatar">
                  <span>🌱</span>
                </div>
                <div>
                  <span className="chat-header-title">AgriExpert</span>
                  <span className="chat-header-status">
                    <span className="status-dot" /> Online
                  </span>
                </div>
              </div>
              <div className="header-actions">
                <button
                  onClick={toggleMute}
                  className={`mute-btn ${isMuted ? "muted" : ""}`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
                {isPlaying && (
                  <button onClick={stopAudio} className="stop-btn" title="Stop Audio">
                    ⏹
                  </button>
                )}
                <button onClick={toggleChat} className="close-btn">✕</button>
              </div>
            </div>

            <div className="chat-messages">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    className={`message ${msg.isUser ? "user" : "bot"}`}
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  >
                    {!msg.isUser && (
                      <div className="bot-avatar-small">🌱</div>
                    )}
                    <div className="message-bubble">
                      {msg.text}
                      {msg.audio && (
                        <button
                          className="play-audio-btn"
                          onClick={() => playAudio(msg.audio)}
                          title="Play Audio"
                          disabled={isMuted}
                        >
                          {isMuted ? "🔇" : "▶"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  className="message bot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bot-avatar-small">🌱</div>
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-controls">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="lang-select"
              >
                <option value="en">🌐 English</option>
                <option value="te">🌐 Telugu</option>
                <option value="hi">🌐 Hindi</option>
              </select>
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about soil health..."
              />
              <motion.button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="send-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>➤</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="chat-bubble-wrapper"
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="chat-bubble-pulse" />
        <div className="chat-bubble">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                ✕
              </motion.span>
            ) : (
              <motion.span
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                🌾
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatBubble;
