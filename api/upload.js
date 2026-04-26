// Vercel Serverless Function to proxy image upload to 0x0.st
const FormData = require('form-data');
const fetch = require('node-fetch');

async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: 'No image data provided' });
        }
        
        // Convert base64 to buffer
        const buffer = Buffer.from(image, 'base64');
        
        // Create FormData for 0x0.st
        const form = new FormData();
        form.append('file', buffer, {
            filename: 'photo.png',
            contentType: 'image/png',
            knownLength: buffer.length
        });
        
        // Upload to 0x0.st via server (bypass CORS)
        const response = await fetch('https://0x0.st', {
            method: 'POST',
            body: form,
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('0x0.st error:', response.status, errorText);
            throw new Error(`Upload service returned ${response.status}`);
        }
        
        const imageUrl = await response.text();
        
        if (!imageUrl || !imageUrl.trim().startsWith('https://')) {
            console.error('Invalid 0x0.st response:', imageUrl);
            throw new Error('Invalid response from upload service');
        }
        
        return res.status(200).json({
            success: true,
            url: imageUrl.trim()
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
