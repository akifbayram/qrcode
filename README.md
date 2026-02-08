# QR Bin Inventory

Offline-first Progressive Web App for organizing physical storage bins with QR codes. Create named bins, print QR labels, stick them on containers, and scan to instantly look up contents. All data stays on-device in IndexedDB — no server, no accounts.

> **Work in Progress** — This project is under active development. Features may be incomplete, and breaking changes can occur.

## Features

### Current

- **Bin management** — Create, edit, and delete storage bins with names, contents, and tags
- **QR code generation** — Unique QR code per bin for quick identification
- **QR scanning** — Camera-based scanner to look up bin contents instantly
- **Photo attachments** — Attach photos to bins for visual reference
- **Label printing** — Print Avery 5160-compatible label sheets with QR codes and bin names
- **Search and filter** — Search bins by name, contents, or tags
- **Bulk operations** — Long-press to select multiple bins for batch delete or tagging
- **Export/Import** — JSON backup with base64-encoded photos for data portability
- **Offline-first PWA** — Works without internet; installable on mobile and desktop

### Planned

- Multi-image gallery improvements
- Nested bins, sub-containers, and location information
- Barcode scanning support (UPC/EAN)
- Sharing bins between devices via QR-encoded export links
- Cloud sync (optional, opt-in)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 + TypeScript 5 (strict) |
| Build | Vite 5 |
| Styling | Tailwind CSS 4 with CSS custom properties |
| Data | Dexie.js 4 (IndexedDB) |
| Routing | react-router-dom 6 (HashRouter) |
| QR Generation | qrcode |
| QR Scanning | html5-qrcode |
| PWA | vite-plugin-pwa |
| Icons | lucide-react |
| Testing | Vitest + Testing Library + happy-dom |

## Installation and Setup

**Prerequisites:** Node.js 18+

```bash
# Clone the repository
git clone https://github.com/akifbayram/qrcode.git
cd qrcode

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

## Usage

1. **Create a bin** — Tap the `+` button, enter a name, contents, and optional tags
2. **Print labels** — Go to Print, select bins, and print Avery 5160-compatible label sheets
3. **Stick labels** — Attach printed QR labels to your physical storage containers
4. **Scan to find** — Open Scan, point your camera at a label to jump to that bin's details
5. **Attach photos** — On a bin's detail page, add photos for visual reference
6. **Backup data** — Settings > Export Backup to save a JSON file with all bins and photos

## Roadmap

- [ ] Nested bins / sub-container hierarchy
- [ ] Barcode scanning (UPC/EAN)
- [ ] QR-encoded sharing between devices
- [ ] Optional cloud sync
- [ ] Drag-and-drop bin reordering
- [ ] Custom label templates
- [ ] Accessibility audit and improvements

## License

MIT
