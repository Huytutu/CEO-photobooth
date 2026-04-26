// Netlify Function: proxy catbox.moe images to avoid CORS on download
const fetch = require('node-fetch');

exports.handler = async function (event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const url = event.queryStringParameters && event.queryStringParameters.url;

    if (!url || !url.startsWith('https://0x0.st/')) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid URL' }) };
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Upstream error: ${response.status}`);
        }

        const buffer = await response.buffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
            },
            body: buffer.toString('base64'),
            isBase64Encoded: true,
        };

    } catch (error) {
        console.error('Image proxy error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || 'Failed to fetch image' })
        };
    }
};
