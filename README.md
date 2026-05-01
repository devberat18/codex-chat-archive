# Codex Chat Archive

Codex Chat Archive is a cross-platform desktop application that reads local Codex session logs and presents them as readable chat history. It helps you browse past sessions, review conversations, search within them, and export selected history in portable formats.

## Problem

Codex session logs are useful, but they are stored as local log files that are difficult to read directly. Raw session data is optimized for persistence, not for reviewing a conversation later. This project turns those local logs into a simple chat-oriented view.

## Features

### Current

- Browse local Codex sessions
- View conversations in readable format
- Export as Markdown / JSON
- Basic search

### Planned

- Global search
- Live updates
- VSCode extension
- Better tool call visualization

## Tech Stack

- Tauri
- React
- TypeScript

## Installation

```bash
git clone https://github.com/beratemredemir/codex-chat-archive.git
cd codex-chat-archive
npm install
```

Run in development:

```bash
npm run tauri dev
```

Build the application:

```bash
npm run tauri build
```

## Usage

Open the application, select a local Codex session, view the conversation in a readable format, and export it as Markdown or JSON when needed.

## Default Paths

- macOS/Linux: `~/.codex/sessions`
- Windows: `%USERPROFILE%\.codex\sessions`

## Roadmap

- [x] Browse local Codex sessions
- [x] Readable conversation view
- [x] Markdown export
- [x] JSON export
- [x] Basic search
- [ ] Global search
- [ ] Live updates
- [ ] VSCode extension
- [ ] Better tool call visualization

## Contributing

Contributions are welcome. Please keep changes focused, practical, and aligned with the current scope of the application.

## License

MIT License

## Disclaimer

This project is not affiliated with OpenAI or Codex.
