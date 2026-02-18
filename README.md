# Al-Qur'an Digital Mushaf

A high-performance, mobile-first Digital Mushaf web application using official Kemenag RI Mushaf images.

## ✨ Features

- **Real Page Flip** - Smooth page-flip animation using StPageFlip library
- **Smart Preloading** - Preloads adjacent pages for instant navigation
- **Offline Ready** - All data stored in LocalStorage
- **Surah Navigation** - Quick access to all 114 Surahs
- **Bookmark System** - Save pages with notes
- **Dark Mode** - Comfortable night reading with CSS filters
- **Immersive Mode** - Distraction-free reading
- **Mobile Optimized** - Swipe gestures + touch support

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 🌐 Deploy to GitHub Pages

### Option 1: Automatic Deploy (Recommended)

1. Push this code to your GitHub repository
2. Go to **Settings** → **Pages**
3. Under **Build and deployment** → **Source**, select **GitHub Actions**
4. Push to `main` branch - it will auto-deploy!

### Option 2: Manual Deploy with gh-pages

```bash
# Install gh-pages package
npm install -D gh-pages

# Update package.json "homepage" field to your URL:
# "homepage": "https://YOUR_USERNAME.github.io/quran-app"

# Build and deploy
npm run build
npm run deploy
```

### ⚙️ Important Configuration

Before deploying, edit `vite.config.js`:

```javascript
export default defineConfig({
  base: '/YOUR_REPO_NAME/', // Change to match your repo name
  // ... rest of config
});
```

And update `package.json`:

```json
{
  "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
}
```

## 📖 Data Source

Official Kemenag RI Mushaf images:
```
https://media.qurankemenag.net/khat2/QK_{page}.webp
```

## 🛠️ Tech Stack

- Vanilla JavaScript (ES6+)
- Vite
- Tailwind CSS (via CDN)
- StPageFlip

## 📱 Live Demo

After deploying to GitHub Pages, your app will be available at:
```
https://YOUR_USERNAME.github.io/quran-app
```

## 📄 License

MIT
