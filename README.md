# Mrclone.ai

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/MabroukOthman/Mrclone.ai)

**An open-source platform for creating, customizing, and chatting with personalized AI assistants.**

Mrclone.ai combines an assistant builder with a server-side AI integration. Creators configure an assistant's name, purpose, personality, instructions, and reference notes, then test it in a chat playground.

## Features

- Create, edit, and delete assistant profiles
- Configure assistant personality, purpose, and instructions
- Add knowledge notes to provide context to an assistant
- Chat with assistants through the OpenAI Responses API
- Keep the provider API key on the server, never in browser code
- Export an assistant configuration as JSON
- Rate-limited chat endpoint and baseline HTTP security headers

## Requirements

- Node.js 20 or newer
- An OpenAI API key for live AI responses

## Deploy to Render

You can deploy the Node.js app to Render using the button above. Render reads the `render.yaml` Blueprint in this repository. During setup, provide the `OPENAI_API_KEY` value privately in Render; never add it to GitHub. The service uses the free web-service plan in the Blueprint, subject to Render's current free-tier limits.

After deployment, open the service URL and check `/api/health`. The first prototype stores assistant profiles and chat history in the browser's local storage, so data does not sync across devices or users.

## Run locally

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and add your API key:

   ```bash
   cp .env.example .env
   ```

   Set `OPENAI_API_KEY` in `.env`. You can optionally change `OPENAI_MODEL`.

4. Start the server:

   ```bash
   npm start
   ```

5. Open http://localhost:3000.

The app's `/api/health` endpoint reports whether an API key is configured. Without a key, the UI still loads, but live chat returns a clear setup message.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Secret API key; configure only in the server environment |
| `OPENAI_MODEL` | Model name; defaults to `gpt-6-luna` |
| `PORT` | HTTP port; defaults to `3000` |
| `TRUST_PROXY` | Set to `true` only behind a trusted reverse proxy |

Never commit a real `.env` file or expose an API key in frontend code, screenshots, logs, or issue reports.

## Architecture

- `index.html`, `styles.css`, `app.js`: browser interface and local assistant settings
- `server.js`: Express server, health endpoint, rate-limited chat endpoint, and OpenAI Responses API call
- `/api/chat`: accepts assistant configuration and recent chat messages; returns an AI-generated answer

The initial prototype stores assistant profiles and conversations in the browser's local storage. It does not yet provide user accounts, cloud synchronization, multi-tenant data isolation, persistent server-side chat storage, or production-grade abuse prevention. Do not use it to store sensitive personal data or expose it to the public internet without adding authentication, authorization, monitoring, and appropriate privacy controls.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports, documentation improvements, and focused pull requests are welcome.

## License

MIT. See [LICENSE](LICENSE).
