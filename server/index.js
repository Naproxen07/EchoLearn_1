// server/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { WebSocket } from 'ws';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ----ENV----
const PORT = process.env.PORT || 5179;
const LLM_API_KEY = process.env.LLM_API_KEY 
const LLM_API_URL = process.env.LLM_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const MURF_API_KEY = process.env.MURF_API_KEY 
const MURF_WS_URL = process.env.MURF_WS_URL || 'wss://api.murf.ai/v1/speech/stream-input'
const MURF_VOICE_ID = process.env.MURF_VOICE_ID || 'en-US-ally';

// 1) Get assistant text from  LLM
app.post('/api/chat', async (req, res) => {
    try{
        const { user } = req.body;
        if(!user) return res.status(400).json({ error: 'user text required' });

        // Minimal Gemini-compatbile call (gemini-2.0-flash)
        const r = await fetch(`${LLM_API_URL}?key=${LLM_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: user }]
                    }
                ]
            })
        });

        if (!r.ok) {
            const text = await r.text();
            throw new Error(`Gemini error ${r.status}: ${text}`);
        }

        const data = await r.json();
        const assistant = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||'Sorry, I have no reply.';
        res.json({ assistant });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: String(err) });
    }
});

// 2) Stream TTS audio from Murf over HTTP using their WebSocket Streaming
// Client requests: /api/tts-stream?text=...&format=mp3
app.get('/api/tts-stream', async (req, res) => {
    try{
        const text = req.query.text?.toString();
        const format = (req.query.format || 'mp3').toString();
        if(!text) return res.status(400).send('missing text');

        //We'll stream back as audio/mpeg or audio/wav
        const mime = format === 'wav' ? 'audio/wav' : 'audio/mpeg';
        res.writeHead(200, {
            'Content-Type': mime,
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-store',
        });

        // ----------MURF WS HANDSHAKE (example scaffold) ---------------
        // NOTE: confirm URL, auth header and payload per Murf docs.
        const ws = new WebSocket(`${MURF_WS_URL}?api-key=${MURF_API_KEY}&sample_rate=24000&channel_type=MONO&format=${format}`);

ws.on('open', () => {
    // 1️⃣ Send voice config (optional)
    const voiceConfig = {
        voice_config: {
            voiceId: MURF_VOICE_ID,   // e.g. 'en-US-ally'
            style: 'Conversational',   // optional
            rate: 0,
            pitch: 0,
            variation: 1
        }
    };
    ws.send(JSON.stringify(voiceConfig));

    // 2️⃣ Send the text
    const textMsg = {
        text: text,
        end: true  // indicates this is the final text chunk
    };
    ws.send(JSON.stringify(textMsg));
});

let firstChunk = true;
ws.on('message', (msg, isBinary) => {
    if (isBinary) {
        // Murf sends binary audio directly
        res.write(msg);
    } else {
        try {
            const data = JSON.parse(msg.toString());

            // Murf may also send audio in base64 inside JSON
            if (data.audio) {
                let audioBytes = Buffer.from(data.audio, 'base64');
                if (firstChunk && audioBytes.length > 44 && format === 'wav') {
                    audioBytes = audioBytes.slice(44); // strip WAV header
                    firstChunk = false;
                }
                res.write(audioBytes);
            }

            if (data.final) {
                res.end(); // close response when stream finishes
            }

            if (data.type === 'error') {
                console.error('Murf error:', data);
            }
        } catch (err) {
            console.error('Non-JSON message:', msg.toString());
        }
    }
});


        ws.on('message', (msg, isBinary) => {
        // Murf typically sends audio frames (binary) + small JSON control frames.
        if (isBinary) {
            res.write(msg); // pipe audio chunk straight to client
        } 
        else {
        try {
            const evt = JSON.parse(msg.toString());
            if (evt.type === 'error') {
                console.error('Murf error:', evt);
            }
            // Handle other control messages if needed
        } catch (_) {
            // Non‑JSON text message; ignore
        }
        }
    });

    ws.on('close', () => {
        try { res.end(); } catch (_) {}
    });

    ws.on('error', (e) => {
        console.error('Murf WS error:', e);
        try { res.end(); } catch (_) {}
    });

} catch (err) {
    console.error(err);
    res.status(500).send('TTS error: ' + String(err));
}
});
app.get('/', (req, res) => {
    res.send('Server is running. Use /api/chat or /api/tts-stream.');
});

app.listen(PORT, () => console.log(`server on http://localhost:${PORT}`));
