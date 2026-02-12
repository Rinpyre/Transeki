# Transeki ⛩️

> **A native desktop manga reader built for local library safety.**

![Browse page + details panel screenshot](.github/screenshot.png)

## 🧐 The Problem

Even though I mostly read on my phone now (using _Yokai_), I used to read on PC and I feel the pain.

- I hate having 10 browser tabs open to search different sources.
- I hate bookmarking URLs only to find them dead a month later.
- I want a local library that survives even if the source extension breaks.

## 🛠️ The Project

My goal is a **Native Desktop Manga Reader** that prioritizes local library management.

I specifically learned **React**, **Vite**, **Tailwind**, and **GitHub Actions** to build this. I wanted full control over the app, so AI is used to help me learn and plan, not to write the core logic.

### Tech Stack

- **Core:** Electron + React + Vite
- **Styling:** TailwindCSS
- **Why Electron?** Because I prefer JavaScript. _(Yes, I know it consumes 300MB of RAM, but... it is what it is)_

## 🚧 Current Status (Early WIP)

Started `January 11, 2026 at 2:25 AM`.

- **Browse Page:** Functional for one hard coded source, but basic. I'm planning to remake the layout soon to match my vision better and support multiple sources.
- **Details Panel:** Opens as soon as you click a manga card. Currently uses fetches demo data because the extension system is being built.  
  _> It does only changes the tile and cover in the panel to the manga clicked to show it works._
- **UI:** Clean and functional, but I'm obsessing over small details (like corner radius) as I learn.

## 🗺️ Roadmap

1. Build the actual **Extension System** (Inspired by Tachiyomi's architecture).
2. Finish the **Library Page** (The core feature).
3. Build the **Reader** and **Settings**. (Vertical focused at first).
4. Offline Downloads & Auto-updates.

_> Long term dream? Maybe sync/accounts, but that's a long way off._

## ⚡ Getting Started (For Devs)

If you want to run the app locally:

```bash
# Clone the repository
git clone https://github.com/Rinpyre/Transeki.git

# Enter the directory
cd Transeki

# Install dependencies
npm install

# Run the dev server with hot reload
npm run dev
```

## ⚠️ The "Developer" Disclaimer

I have AuDHD, so my coding schedule is... chaotic.

- I might code 4 hours one week, then nothing for two weeks.
- I sometimes get stuck fixing a 2px misalignment instead of building big features.
- This is a slow-burn hobby project. I am not promising a release date.

## 🤝 Community & Discord

If you want to hang out, watch the progress, or give feedback on the UI, join the Discord.

- Discord: [discord.gg/Transeki](https://dicord.gg/hazHVm3nXe)
- Reddit: [r/Transeki](https://www.reddit.com/r/Transeki)
- GitHub: [rinpyre/Transeki](https://github.com/Rinpyre/Transeki)
