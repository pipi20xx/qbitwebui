# qbitwebui

A modern lightweight web interface for qBittorrent, built with Vite.

[More images below](#preview)

<img width="1920" height="1080" alt="demo" src="https://github.com/user-attachments/assets/a1241d7a-2258-476e-a669-c9f316973188" />

## Features

- Real-time torrent monitoring with auto-refresh
- Add torrents via magnet links or .torrent files
- Detailed torrent view (general info, trackers, peers, files)
- Filter by status (all, downloading, seeding, active, stopped)
- Multi-select with bulk actions (start, stop, delete)
- Dark theme

## Docker

```yaml
services:
  qbitwebui:
    image: ghcr.io/maciejonos/qbitwebui:latest
    ports:
      - "8080:80"
    environment:
      - QBITTORRENT_URL=http://localhost:8080
    restart: unless-stopped
```

Or build locally:

```bash
docker compose up -d
```

## Development

```bash
# Set qBittorrent backend URL
export QBITTORRENT_URL=http://localhost:8080

# Install and run
npm install
npm run dev
```

## Tech Stack

React 19, TypeScript, Tailwind CSS v4, Vite, TanStack Query

## Preview
<table>
  <tr>
    <td colspan="2"><img src="https://github.com/user-attachments/assets/81458271-608a-45be-a9f8-e9e3883e3c72" alt="demo2" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/b2aa1367-00ad-4ddb-ae5f-0f364046a435" alt="demo3" /></td>
    <td><img src="https://github.com/user-attachments/assets/048245a9-e751-4965-9ad9-862570079019" alt="demo4" /></td>
  </tr>
</table>
