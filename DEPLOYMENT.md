# 🚀 Deployment Guide - GitHub Pages

## ✅ Yes, it WILL work on GitHub Pages!

Follow these steps to deploy your Quran App:

---

## Step 1: Build the Project

```bash
cd "D:\1Computer\1AI\Sandbox\quran-app"
npm install
npm run build
```

This creates a `dist/` folder with all production files.

---

## Step 2: Configure BEFORE First Deploy

### 2.1 Edit `vite.config.js`

Change line 5 to match your repository name:

```javascript
base: '/quran-app/', // ← Change 'quran-app' to your repo name
```

### 2.2 Edit `package.json`

Change line 8 to your GitHub URL:

```json
"homepage": "https://YOUR_USERNAME.github.io/quran-app",
```

---

## Step 3: Choose Deployment Method

### 🎯 Method A: GitHub Actions (Recommended - Automatic)

1. Create a new GitHub repository named `quran-app`
2. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quran-app.git
git push -u origin main
```

3. Go to your repository on GitHub
4. Click **Settings** → **Pages**
5. Under **Source**, select **GitHub Actions**
6. Done! 🎉 Every push to `main` will auto-deploy

Your app will be live at:
```
https://YOUR_USERNAME.github.io/quran-app
```

---

### 📦 Method B: Manual Deploy with gh-pages

1. Install gh-pages:

```bash
npm install -D gh-pages
```

2. Build and deploy:

```bash
npm run build
npm run deploy
```

3. Go to **Settings** → **Pages**
4. Under **Source**, select **Deploy from a branch**
5. Select `gh-pages` branch and `/ (root)` folder
6. Save

---

## 🔧 Troubleshooting

### Blank page after deploy?

**Problem**: Wrong `base` path in `vite.config.js`

**Solution**: Make sure `base` matches your repo name exactly:
- Repo: `github.com/user/quran-app` → `base: '/quran-app/'`
- Repo: `github.com/user/my-quran` → `base: '/my-quran/'`

### Images not loading?

The app uses external images from Kemenag servers, so they should work fine.
If not, check browser console for CORS errors.

### GitHub Actions not working?

1. Go to **Settings** → **Actions** → **General**
2. Under **Actions permissions**, select **Allow all actions and reusable workflows**
3. Save and re-push to main branch

---

## ✅ What Gets Deployed

The `dist/` folder contains:
- `index.html` (main page)
- `assets/` (JS and CSS bundles)
- Total size: ~50KB (very light!)

No backend needed - everything runs in the browser!

---

## 🌐 Testing Locally Before Deploy

```bash
npm run build
npm run preview
```

Opens `http://localhost:4173` to test production build.

---

## 📱 Mobile Testing

Once deployed, test on your phone:
1. Open your GitHub Pages URL on mobile
2. Try swipe gestures
3. Test dark mode
4. Add bookmarks
5. Check immersive mode

---

## 🎉 Success!

Your app is now live and accessible worldwide!

**Example URL**: `https://username.github.io/quran-app`
