# Transeki

A native desktop manga reader because the current alternative is either having 10 tabs open to search multiple sources or bookmarking in the browser—since a source might go down and take your reading list with it.

## The Problem

You find a source, build up a reading list, but then DMCA or whatever hits and the site disappears. Your reading list? Gone. So you end up managing bookmarks across browsers, keeping spreadsheets, or just... losing track of stuff.

## What's the Plan?

The idea is to have extensions as sources you can add to a folder and they just work. Eventually a UI too. But first I need the extension system, library page, reader, and settings in place. Then maybe offline downloads and auto-updating. Extensions will be in a separate repo so people can actually contribute to them without breaking the main app and to learn from our godfather [Tachiyomi](https://github.com/tachiyomiorg).

## Tech Stack

It's built with **React** and **Tailwind** for UI, **Vite** to bundle it all together, and **Electron** because... I preferred JavaScript before and I still do so... too bad for that 300MB that Electron consumes.

## Current State

Started 4 weeks ago. It's... in shambles or "a work in progress", take your pick. Right now it only has the browsing page and a simple looking layout that I'll remake soon and the only thing good in it is the details panel, which, without actual sources doesn't do much, but hey, it got a loading animation at least.

![Browse page + details panel screenshot](.github/screenshot.png)

> **Fair warning:** I have AuDHD, I'm lazy (or have _Executive Dysfunction_ if you prefer fancy names), and I code maybe 1-4 hours a week sometimes. Expect irregular updates, mood swings in how I communicate on discord, and no release date yet. Could take a year. Might take longer if life gets busy. This is a slow-burn ~~(chaos-burn)~~ project.

---

If you want to hang out in the Discord, watch the... sadly slow progress, and occasionally get muted for randomly bringing up Naruto/DBZ/One Piece out of the blue, come on in (not to hate, but hey... I got preferences too you know, so too bad). Just don't expect an instant update if you ask `"when update"`, but do feel free to do so, who knows, maybe it works.

**Discord:** [discord.gg/Transeki](https://discord.gg/hazHVm3nXe)  
**GitHub:** [rinpyre/Transeki](https://github.com/Rinpyre/Transeki)

(_If you read this far, you might as well join the Discord already. 🤷_)
