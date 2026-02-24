/**
 * Cloudflare Worker: CORS Proxy for Anthropic API
 *
 * Deployment Instructions:
 * 1. Go to dash.cloudflare.com → Workers & Pages → Create
 * 2. Copy and paste this entire code into the editor
 * 3. Click "Deploy"
 * 4. Copy your worker URL (e.g., https://your-worker.your-subdomain.workers.dev)
 * 5. Paste that URL in the chatbot settings on the survey site
 *
 * This worker proxies requests to the Anthropic API with proper CORS headers.
 */

export default {
  async fetch(request) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Forward the request to Anthropic API
    const forwardedRequest = new Request(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'x-api-key': request.headers.get('x-api-key') || '',
          'anthropic-version': request.headers.get('anthropic-version') || '2023-06-01',
          'content-type': request.headers.get('content-type') || 'application/json',
        },
        body: request.body,
      }
    );

    const response = await fetch(forwardedRequest);

    // Add CORS headers to response
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version');

    return newResponse;
  },
};
