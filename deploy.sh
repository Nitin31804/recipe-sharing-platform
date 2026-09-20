#!/bin/bash
# Heroku Deployment Script
# Usage: bash deploy.sh

set -e

echo "🚀 Starting Heroku Deployment..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Installing..."
    # Installation varies by OS - manual installation recommended
    echo "Please install Heroku CLI from https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

echo "✅ Heroku CLI found"

# Check if git repo is initialized
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not a git repository"
    exit 1
fi

echo "✅ Git repository found"

# Login to Heroku
echo "📝 Logging in to Heroku..."
heroku login

# Create app name from user input or use default
read -p "Enter app name (e.g., my-registration-app): " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "❌ App name is required"
    exit 1
fi

echo "🔧 Creating Heroku app: $APP_NAME"
heroku create "$APP_NAME" || echo "App may already exist"

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

echo "🔐 Setting environment variables..."
heroku config:set NODE_ENV=production --app "$APP_NAME"
heroku config:set JWT_SECRET="$JWT_SECRET" --app "$APP_NAME"
heroku config:set FRONTEND_URL="https://${APP_NAME}.herokuapp.com" --app "$APP_NAME"

# Add PostgreSQL database
echo "🗄️  Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:hobby-dev --app "$APP_NAME" || echo "Database may already exist"

echo "📤 Deploying to Heroku..."
git push heroku main:main

echo "✅ Deployment complete!"
echo ""
echo "🎉 Your app is live at: https://${APP_NAME}.herokuapp.com"
echo ""
echo "📊 View logs:"
echo "  heroku logs --tail --app $APP_NAME"
echo ""
echo "🧪 Run tests on Heroku:"
echo "  heroku run npm test --app $APP_NAME"
echo ""
echo "💬 Check your app status:"
echo "  heroku ps --app $APP_NAME"
echo ""
echo "🛑 To stop the app:"
echo "  heroku ps:scale web=0 --app $APP_NAME"
