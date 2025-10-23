import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const AiAssistant = ({ knowledgeBase }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '¡Hola! Soy el asistente de CryptoTax Pro. ¿En qué puedo ayudarte hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const findBestResponse = (query) => {
    const queryWords = query.toLowerCase().split(/\s+/);
    let bestMatch = { score: 0, answer: "Lo siento, no he entendido tu pregunta. ¿Puedes reformularla? También puedes consultar las preguntas frecuentes." };

    knowledgeBase.forEach(item => {
      let currentScore = 0;
      item.keywords.forEach(keyword => {
        if (queryWords.some(qw => qw.includes(keyword) || keyword.includes(qw))) {
          currentScore++;
        }
      });
      if (currentScore > bestMatch.score) {
        bestMatch = { score: currentScore, answer: item.answer };
      }
    });

    return bestMatch.answer;
  };

  const handleSend = () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponseText = findBestResponse(input);
      const aiMessage = { sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="crypto-card p-6 rounded-3xl h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
        <Sparkles className="w-7 h-7 mr-3 text-fintech-blue-light" />
        Asistente IA
      </h2>
      <div className="flex-grow bg-slate-900/50 rounded-2xl p-4 overflow-y-auto h-96 mb-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 my-4 ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 bg-gradient-to-br from-fintech-blue to-fintech-blue-dark rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${msg.sender === 'ai' ? 'bg-fintech-blue/20 rounded-bl-none' : 'bg-fintech-blue-dark/20 rounded-br-none'}`}>
              <p className="text-sm text-gray-200">{msg.text}</p>
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 my-4 justify-start"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-fintech-blue to-fintech-blue-dark rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-fintech-blue/20 rounded-bl-none">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-0"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-200"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-400"></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-white/5 border-white/10 flex-grow"
          suppressHydrationWarning 
        />
        <Button onClick={handleSend} className="bg-gradient-to-r from-fintech-blue to-fintech-blue-dark text-white" size="icon">
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default AiAssistant;