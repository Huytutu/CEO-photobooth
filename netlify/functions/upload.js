// Netlify Function: proxy image upload to 0x0.st
const FormData = require('form-data');
const fetch = require('node-fetch');

exports.handler = async function (event) {
    // CORS preflight
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { image } = JSON.parse(event.body);

        if (!image) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'No image data provided' }) };
        }

        const buffer = Buffer.from(image, 'base64');

        const form = new FormData();
        form.append('file', buffer, {
            filename: 'photo.png',
            contentType: 'image/png',
            knownLength: buffer.length
        });

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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, url: imageUrl.trim() })
        };

    } catch (error) {
        console.error('Upload error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message || 'Upload failed' })
        };
    }
};
