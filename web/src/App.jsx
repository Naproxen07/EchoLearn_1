// web/src/App.jsx

import React, { useEffect, useRef, useState } from 'react';


export default function App() {
    //to be removed later
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}

//    const [count, setCount] = useState(0);
//    const [supported, setSupported] = useState(false);
//    const [listening, setListening] = useState(false);
//    const [userText, setUserText] = useState('');
//    const [assistant, setAssistant] = useState('');
//    const audioRef = useRef(null);
//    const recognitionRef = useRef(null);
//
//
//    useEffect(() => {
//        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//        if (SpeechRecognition) {
//            const rec = new SpeechRecognition();
//            rec.lang = 'en-US';
//            rec.interimResults = true;
//            rec.continuous = true;
//            rec.onresult = (e) => {
//                let finalText = '';
//                for (let i = e.resultIndex; i < e.results.length; i++) {
//                    finalText += e.results[i][0].transcript;
//                }
//                setUserText((t) => finalText || t);
//            };
//            rec.onend = () => setListening(false);
//            recognitionRef.current = rec;
//            setSupported(true);
//            }
//        }, []);
//
//
//        const start = () => {
//            if (recognitionRef.current && !listening) {
//                setUserText('');
//                recognitionRef.current.start();
//                setListening(true);
//            }
//        };
//
//
//        const stop = () => {
//            if (recognitionRef.current && listening) {
//                recognitionRef.current.stop();
//                setListening(false);
//            }
//        };
//
//
//        const send = async () => {
//            const text = userText.trim();
//            if (!text) return;
//
//
//        // 1) Get assistant reply
//        const r = await fetch('http://localhost:5179/api/chat', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ user: text }),
//        });
//        const data = await r.json();
//        const reply = data.assistant || 'Sorry, no reply';
//        setAssistant(reply);
//
//
//        // 2) Stream Murf audio
//        const url = `http://localhost:5179/api/tts-stream?format=mp3&text=${encodeURIComponent(reply)}`;
//        const audio = audioRef.current;
//        audio.src = url; // starts playing as chunks arrive
//        audio.play();
//        };
//
//
//        return (
//  <div className="min-h-screen p-6 flex flex-col items-center gap-4 font-sans">
//    <h1 className="text-2xl font-bold">Real‑Time Voice Chatbot</h1>
//
//    <div className="w-full max-w-xl flex flex-col gap-3">
//      <label className="text-sm opacity-70">Your message</label>
//      <textarea
//        className="border rounded-xl p-3 w-full"
//        rows={3}
//        value={userText}
//        onChange={(e) => setUserText(e.target.value)}
//        placeholder={supported ? 'Speak or type…' : 'Type here…'}
//      />
//
//      <div className="flex gap-2">
//        {supported && !listening && (
//          <button className="px-3 py-2 rounded-xl bg-black text-white" onClick={start}>
//            🎙️ Start
//          </button>
//        )}
//        {supported && listening && (
//          <button className="px-3 py-2 rounded-xl bg-gray-800 text-white" onClick={stop}>
//            ⏹ Stop
//          </button>
//        )}
//        <button className="px-3 py-2 rounded-xl bg-indigo-600 text-white" onClick={send}>
//          ➤ Send
//        </button>
//      </div>
//
//      <div className="mt-4">
//        <div className="text-sm opacity-70 mb-1">Assistant</div>
//        <div className="border rounded-xl p-3 whitespace-pre-wrap">{assistant || '—'}</div>
//      </div>
//
//      <audio ref={audioRef} controls className="mt-3 w-full" />
//    </div>
//
//    <p><strong>Debug Info:</strong></p>
//    <p>Supported: {supported ? 'Yes' : 'No'}</p>
//    <p>Listening: {listening ? 'Yes' : 'No'}</p>
//    <p>User Text: {userText || 'Empty'}</p>
//    <p>Assistant Reply: {assistant || 'Empty'}</p>
//
//    <p className="text-xs opacity-60 mt-6 text-center max-w-xl">
//      Tip: Web Speech API works best in Chromium browsers. If it’s unavailable, just type your message and press Send.
//    </p>
//  </div>
//);
//}
//