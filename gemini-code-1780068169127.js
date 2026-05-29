import React, { useState } from 'react';
import axios from 'axios';

export default function TextExplainer({ children }) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleTextSelection = async (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX
      });

      setLoading(true);
      setExplanation('Consulting AI Tutor...');
      
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/ai/explain', 
          { text: selectedText, contextLevel: '100-200 Level Student' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExplanation(res.data.explanation);
      } catch (err) {
        setExplanation('Could not retrieve definition.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div onMouseUp={handleTextSelection} className="relative select-text">
      {children}
      {explanation && (
        <div 
          style={{ top: position.top, left: position.left }}
          className="absolute z-50 max-w-sm p-4 bg-slate-900 text-white rounded-lg shadow-xl text-sm border border-indigo-500 animate-fade-in"
        >
          <div className="flex justify-between items-center mb-1 font-bold text-indigo-400">
            <span>AI Assistant Snippet</span>
            <button onClick={() => setExplanation('')} className="text-gray-400 hover:text-white ml-4">✕</button>
          </div>
          <p className="leading-relaxed text-gray-200">{explanation}</p>
        </div>
      )}
    </div>
  );
}