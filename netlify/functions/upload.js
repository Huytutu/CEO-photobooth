// Netlify Function: proxy image upload to Catbox.moe
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
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, {
            filename: 'photo.png',
            contentType: 'image/png',
            knownLength: buffer.length
        });

        const contentLength = form.getLengthSync();

        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: form,
            headers: {
                ...form.getHeaders(),
                'Content-Length': contentLength,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Catbox error:', response.status, errorText);
            throw new Error(`Catbox returned ${response.status}`);
        }

        const imageUrl = await response.text();

        if (!imageUrl || !imageUrl.trim().startsWith('https://')) {
            console.error('Invalid Catbox response:', imageUrl);
            throw new Error('Invalid response from Catbox');
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
