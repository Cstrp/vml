# 🎬 VML - Video Maker Library

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue.svg)](https://www.typescriptlang.org/)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.0-00C58E.svg)](https://nuxt.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub stars](https://img.shields.io/github/stars/Cstrp/vml?style=social)](https://github.com/Cstrp/vml/stargazers)

> **AI-powered video creation platform for TikTok, Instagram Reels, and YouTube Shorts**

## ✨ Features

🎥 **Short-form Video Generation** • Create engaging videos for social platforms  
🎵 **AI Text-to-Speech** • 9 high-quality voices with Kokoro TTS  
📝 **Auto Captions** • Speech-to-text with Whisper.cpp  
🎬 **Stock Video Integration** • HD footage from Pexels API  
⚡ **REST API** • Full programmatic access  
🔍 **Health Monitoring** • Real-time service status

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/Cstrp/vml.git
cd vml && pnpm install

# Setup AI models
pnpm setup

# Configure environment
cp .env.example .env
# Add your PEXELS_API_KEY

# Start development server
pnpm dev
```

Visit `http://localhost:3000` 🎉

## 🏗️ Tech Stack

**Frontend:** Nuxt 4 • Vue 3 • TypeScript • Tailwind CSS  
**Backend:** Nitro • H3 • Pino  
**AI/Media:** Whisper.cpp • Kokoro TTS • FFmpeg • Pexels API

## 📸 Demo

> Screenshots and demo videos coming soon!

## 🎯 Roadmap

- [ ] **Video Pipeline** - Complete end-to-end rendering
- [ ] **Batch Processing** - Multiple video generation
- [ ] **Custom Templates** - Pre-built video templates
- [ ] **Docker Support** - Containerized deployment

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push branch: `git push origin feature/name`
5. Open Pull Request

## 📄 License

MIT [LICENSE](LICENSE)

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/Cstrp">@Cstrp</a></strong>
</p>

---

[![Stargazers over time](https://starchart.cc/Cstrp/vml.svg?variant=adaptive)](https://starchart.cc/Cstrp/vml)
