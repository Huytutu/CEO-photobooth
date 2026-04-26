// Vercel Serverless Function to proxy image upload to ImgBB
const fetch = require('node-fetch');

async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'IMGBB_API_KEY not configured' });
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // ImgBB accepts base64 directly via URL-encoded form body
        const params = new URLSearchParams();
        params.append('key', apiKey);
        params.append('image', image);

        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: params
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ImgBB error:', response.status, errorText);
            throw new Error(`Upload service returned ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.data || !data.data.url) {
            console.error('Invalid ImgBB response:', data);
            throw new Error('Invalid response from upload service');
        }

        return res.status(200).json({
            success: true,
            url: data.data.url
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Upload failed'
        });
    }
}

module.exports = handler;

module.exports.config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
};
