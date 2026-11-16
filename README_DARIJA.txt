# GlowMate AI — Live AI starter

## What changed
- The chat no longer contains a list of prewritten answers.
- Browser messages are sent to `/api/chat`.
- The server forwards the conversation to an OpenAI-compatible chat-completions API.
- The secret API key stays on the server, never in `public/index.html`.
- A focused system instruction keeps GlowMate centered on hair, skin, grooming, and healthy self-care.
- Basic request-size and rate limits are included.

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Fill in `AI_BASE_URL`, `AI_MODEL`, and `AI_API_KEY` using a provider whose current terms permit this website and its audience.
4. Run `npm install`
5. Run `npm start`
6. Open `http://localhost:3000`

## Publish
Deploy this as a Node web service (not static-only hosting). Set the three AI variables in the host's **server-side environment variables** panel. Do not commit `.env` or share the API key. Static hosting alone cannot run `server.js`.

## Important
This is integration-ready, not activated: it will not produce AI answers until a compatible provider and valid key are configured. Free quotas and availability vary. A public site can incur usage or be abused; keep provider limits and server rate limits enabled. Check the provider's age, audience, region, privacy, and commercial-use terms before launch. Do not use a provider whose terms prohibit the intended audience. Do not collect sensitive health information or present the assistant as a medical professional.
