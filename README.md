# Mrclone.ai

**An open-source workspace for creating personalized AI assistants and AI clones.**

Mrclone.ai helps people create assistants with a name, personality, instructions, and personal knowledge. This repository contains the first, frontend-only prototype.

## What works in this prototype

- Create, edit, and delete assistant profiles
- Configure an assistant's name, description, personality, and instructions
- Add knowledge notes to an assistant
- Chat with an assistant using a local demo response engine
- Save assistants and conversations in the browser's local storage
- Export an assistant configuration as JSON

> **Important:** The chat in this first prototype is a local demo, not a connected AI model. No data is sent to an AI provider. A future model adapter will connect real language models through a secure backend.

## Run locally

No build tools are required.

1. Clone this repository.
2. Open `index.html` in a modern browser.

For a local web server, run:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Project direction

1. **Assistant builder:** create and configure assistants.
2. **Knowledge:** attach notes and, later, safely process uploaded documents.
3. **Conversation:** test assistants in a chat interface.
4. **Model integrations:** add provider adapters behind a server-side API. Never put secret API keys in browser code.
5. **Open source:** document decisions, welcome contributions, and build with community feedback.

## Data and privacy

This prototype stores assistant profiles and chat history in the browser's local storage. Clearing browser storage may delete this data. Do not enter sensitive personal information. There is no authentication, cloud sync, encryption-at-rest, or server-side storage in this prototype.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and focused pull requests are welcome.

## License

MIT. See [LICENSE](LICENSE).
