<div align="center"> 
 <img width="200" height="200" alt="logo" src="https://github.com/user-attachments/assets/431cf92d-d8e6-4be7-a5b6-642ed6ab9898" />

### A modern web interface for managing multiple qBittorrent instances

Built with [React](https://react.dev/), [Hono](https://hono.dev/), and [Bun](https://bun.sh/)

[![GitHub stars](https://img.shields.io/github/stars/Maciejonos/qbitwebui?style=for-the-badge&labelColor=101418&color=9ccbfb)](https://github.com/Maciejonos/qbitwebui/stargazers)
[![GitHub License](https://img.shields.io/github/license/Maciejonos/qbitwebui?style=for-the-badge&labelColor=101418&color=abedd5)](https://github.com/Maciejonos/qbitwebui/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/Maciejonos/qbitwebui?style=for-the-badge&labelColor=101418&color=b9c8da)](https://github.com/Maciejonos/qbitwebui/releases)
[![Docker Build](https://img.shields.io/github/actions/workflow/status/Maciejonos/qbitwebui/docker.yml?style=for-the-badge&labelColor=101418&color=4EB329&label=build)](https://github.com/Maciejonos/qbitwebui/actions)
</div>

<div align="center">
  <img width="800" alt="demo1" src="https://github.com/user-attachments/assets/2338e919-47be-44e8-85aa-8f575ee50b1c" />
  <img width="800" alt="demo2" src="https://github.com/user-attachments/assets/d8efc3d3-ddff-4462-ab79-967359a1e21a" />
</div>

<details>
<summary><h3>Themes</h3></summary>
<div align="center">
<img width="800" height="1720" alt="catppuccin" src="https://github.com/user-attachments/assets/9bae8af1-3ff9-49b7-80e2-4cc9379ce8ca" />
<img width="800" height="1720" alt="dracula" src="https://github.com/user-attachments/assets/99c84462-0d0a-4a19-bfa5-b70bf9d0ce2e" />
<img width="800" height="1720" alt="nord" src="https://github.com/user-attachments/assets/f642b0ea-313f-428d-81e9-1bb8aef3dd12" />
<img width="800" height="1720" alt="gruvbox" src="https://github.com/user-attachments/assets/4b0ce8ce-6bbe-4ca0-a4c0-9cf1216d9b80" />
</div>
</details>

<details>
<summary><h3>Mobile UI (PWA)</h3></summary>
<div align="center">
<table>
  <tr>
    <td><img width="295" alt="IMG_3518" src="https://github.com/user-attachments/assets/0990bf2e-ce86-4f56-90e4-1093e30acb33" /></td>
    <td><img width="295" alt="IMG_3519" src="https://github.com/user-attachments/assets/455cecd4-215c-4d1c-aaf9-95860037c0c8" /></td>
  </tr>
</table>
</div>
</details>

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
      # Uncomment to allow HTTPS with self-signed certificates
      # - ALLOW_SELF_SIGNED_CERTS=true
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
| `ALLOW_SELF_SIGNED_CERTS` | No | `false` | Set to `true` to allow HTTPS connections to qBittorrent instances with self-signed certificates |

## Tech Stack

React 19, TypeScript, Tailwind CSS v4, Vite, TanStack Query, Hono, SQLite, Bun

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Maciejonos/qbitwebui&type=date&legend=top-left)](https://www.star-history.com/#Maciejonos/qbitwebui&type=date&legend=top-left)

## License
MIT
