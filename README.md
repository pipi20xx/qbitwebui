# qbitwebui

A modern, self-hosted web interface for managing multiple qBittorrent instances.

## Features

- **Multi-instance** - Manage multiple qBittorrent instances from one dashboard
- **Instance statistics** - Overview of all instances with status, speeds, torrent counts
- **User accounts** - Register/login with secure session management
- **Prowlarr integration** - Search indexers and send torrents directly to qBittorrent
- **Real-time monitoring** - Auto-refresh torrent status, speeds, progress
- **Customizable columns** - Show/hide columns, drag and drop reorder
- **Torrent management** - Add via magnet/file, set priorities, manage trackers/peers
- **Organization** - Filter by status, category, tag, or tracker
- **Bulk actions** - Multi-select with context menu, keyboard navigation
- **Themes** - Multiple color themes included
- **Encrypted storage** - qBittorrent credentials stored with AES-256-GCM

## Docker

```yaml
services:
  qbitwebui:
    image: ghcr.io/maciejonos/qbitwebui:latest
    ports:
      - "3000:3000"
    environment:
      # Generate your own: openssl rand -hex 32
      - ENCRYPTION_KEY=your-secret-key-here
    volumes:
      - ./data:/data
    restart: unless-stopped
```

Or build locally:

```bash
docker compose up -d
```

## Development

```bash
export ENCRYPTION_KEY=$(openssl rand -hex 32)

bun install
bun run dev
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENCRYPTION_KEY` | Yes | - | Min 32 chars, used to encrypt stored credentials |
| `PORT` | No | `3000` | Server port |
| `DATABASE_PATH` | No | `./data/qbitwebui.db` | SQLite database location |
| `SALT_PATH` | No | `./data/.salt` | Encryption salt file location |

## Tech Stack

Bun, Hono, React 19, TypeScript, Tailwind CSS v4, Vite, TanStack Query, SQLite
