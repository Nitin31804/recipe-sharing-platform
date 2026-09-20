# Quick Deployment Guide for Windows

## ✅ Prerequisites (One-time setup)

### Step 1: Install Heroku CLI

1. Download from: https://devcenter.heroku.com/articles/heroku-cli
2. Run the installer
3. Verify installation:
   ```
   heroku --version
   ```

### Step 2: Verify Git Setup

```bash
git --version  # Should output git version
```

### Step 3: GitHub Account (Optional but Recommended)

Push your code to GitHub for backup:
```bash
git remote add github https://github.com/yourusername/html-css-js-project.git
git push github main
```

---

## 🚀 Deploy to Heroku (5 minutes)

### Step 1: Login to Heroku

Open PowerShell and run:

```bash
heroku login
```

This opens a browser window to authenticate.

### Step 2: Create Heroku App

```bash
cd C:\Users\Admin\copilot-worktrees\html-css-js-project\nitin31804-verbose-disco

# Create app (replace 'your-app-name' with your app name)
heroku create your-app-name
```

**Tips for app name:**
- Must be lowercase
- Can contain letters, numbers, hyphens
- Must be unique globally
- Example: `nitin-registration-app-2026`

### Step 3: Add Database

```bash
heroku addons:create heroku-postgresql:hobby-dev --app your-app-name
```

This adds a free PostgreSQL database.

### Step 4: Configure Environment Variables

```bash
# Generate secure JWT secret
$secret = [System.Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::GetBytes(32))

# Set environment variables
heroku config:set NODE_ENV=production --app your-app-name
heroku config:set JWT_SECRET=$secret --app your-app-name
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com --app your-app-name
```

### Step 5: Deploy

```bash
# Add Heroku remote (should already be done)
git remote add heroku https://git.heroku.com/your-app-name.git

# Deploy
git push heroku main:main
```

### Step 6: View Your App

```bash
# Open in browser
heroku open --app your-app-name

# Or manually: https://your-app-name.herokuapp.com
```

---

## 🧪 Verify Deployment

### Check if Running

```bash
heroku ps --app your-app-name
```

Should show: `web.1 (Free): up`

### Test API Endpoint

```bash
curl https://your-app-name.herokuapp.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-09-20T22:53:00.123Z",
  "uptime": 123.45,
  "registeredUsers": 0
}
```

### View Logs

```bash
heroku logs --tail --app your-app-name
```

Press `Ctrl+C` to stop.

---

## 📝 Common Tasks

### Test Registration API

```bash
curl -X POST https://your-app-name.herokuapp.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Run Tests on Server

```bash
heroku run npm test --app your-app-name
```

### View Database

```bash
heroku pg:psql --app your-app-name
```

### Restart App

```bash
heroku restart --app your-app-name
```

---

## 🛑 Stop/Remove App

### Pause App (Free tier)

```bash
heroku ps:scale web=0 --app your-app-name
```

### Delete App

```bash
heroku apps:destroy --app your-app-name --confirm your-app-name
```

---

## 💰 Costs

**Free Tier (Hobby Dev):**
- ✅ Web dyno: Free
- ✅ PostgreSQL: Free (up to 10k rows)
- ⏰ Sleep after 30 min of inactivity (wake on request)
- ❌ No custom domain

**Paid Tier (Professional):**
- 💵 $7-50/month for web dyno
- 💵 $9-200/month for database
- ✅ Always running (no sleep)
- ✅ Custom domain support
- ✅ Better performance

---

## 🔧 Troubleshooting

### Issue: "Deploy key failed"

**Solution:** Add SSH key:
```bash
heroku keys:add  # Adds your public key
git push heroku main:main
```

### Issue: "Cannot find module 'express'"

**Solution:** Dependencies not installed:
```bash
heroku run npm install --app your-app-name
```

### Issue: "Port already in use"

**Solution:** Heroku manages ports automatically. Remove any hardcoded ports from your code.

### Issue: "Database connection failed"

**Solution:** Get database URL:
```bash
heroku config --app your-app-name  # Shows DATABASE_URL
```

---

## 📊 Monitor Your App

### View Metrics

```bash
heroku metrics --app your-app-name
```

### Add Monitoring

```bash
heroku addons:create papertrail:choklad --app your-app-name  # Free logging
```

### View Config

```bash
heroku config --app your-app-name
```

---

## 🎉 Success!

Your app is now live on the internet! 

**Share your app:**
- Frontend: `https://your-app-name.herokuapp.com`
- API: `https://your-app-name.herokuapp.com/api/register`

**Next steps:**
1. Add custom domain (paid feature)
2. Setup automatic deploys from GitHub
3. Add monitoring and alerting
4. Scale database as needed
5. Implement caching and performance optimization

---

## 📚 Helpful Commands Reference

```bash
# Account
heroku login                    # Login to Heroku
heroku logout                   # Logout
heroku auth:whoami              # Check logged-in user

# Apps
heroku apps                     # List all apps
heroku create app-name          # Create new app
heroku rename old-name new-name # Rename app
heroku open                     # Open app in browser
heroku destroy --app app-name   # Delete app

# Deployment
git push heroku main:main       # Deploy current branch
git push heroku develop:main    # Deploy different branch
heroku releases                 # View deployment history
heroku rollback                 # Revert to previous version

# Config & Variables
heroku config                   # View environment variables
heroku config:set KEY=value     # Set variable
heroku config:unset KEY         # Remove variable

# Database
heroku pg:info                  # Database info
heroku pg:psql                  # Connect to database
heroku pg:backups               # Manage backups

# Logs & Monitoring
heroku logs                     # View recent logs
heroku logs --tail              # Stream logs (live)
heroku logs -n 100              # View last 100 lines
heroku ps                       # View running processes
heroku ps:scale web=2           # Scale to 2 dynos

# Troubleshooting
heroku run bash                 # Open shell on server
heroku run npm test             # Run tests on server
heroku restart                  # Restart app
```

---

**Deployment Time:** ~5 minutes  
**Monthly Cost:** Free tier (or $7+ for paid)  
**Status:** Ready to deploy! 🚀
