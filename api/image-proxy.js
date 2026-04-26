// Vercel Serverless Function to proxy catbox.moe images (bypass CORS for download)
const fetch = require('node-fetch');

async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url || !url.startsWith('https://i.ibb.co/')) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Upstream error: ${response.status}`);
        }

        const buffer = await response.buffer();

        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(buffer);
    } catch (error) {
        console.error('Image proxy error:', error);
        return res.status(500).json({ error: error.message || 'Failed to fetch image' });
    }
}

module.exports = handler;
