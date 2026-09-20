# Deployment Guide

Complete guide for deploying the Registration Form application to production.

## Architecture Overview

```
┌─────────────────────┐
│   Frontend (HTML    │
│   CSS, JavaScript)  │
└──────────┬──────────┘
           │
           ├─ Static files served by CDN or web server
           └─ API calls to /api/*
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    ┌─────────┐          ┌───────────┐
    │ Express │          │ Database  │
    │ Backend │◄────────►│ (PG/MySQL)│
    └─────────┘          └───────────┘
```

---

## Prerequisites

- Node.js 16+ or Docker
- PostgreSQL or MySQL database
- Git repository (GitHub, GitLab, etc.)
- Production server (AWS, DigitalOcean, Heroku, etc.)
- Domain name
- SSL certificate (Let's Encrypt free option available)

---

## Option 1: Heroku Deployment (Recommended for Beginners)

### Step 1: Prepare Repository

```bash
# Make sure everything is committed
git add .
git commit -m "Prepare for deployment"

# Create Procfile
echo "web: npm run server" > Procfile
```

### Step 2: Create Heroku App

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Add PostgreSQL database
heroku addons:create heroku-postgresql:hobby-dev
```

### Step 3: Configure Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
```

### Step 4: Deploy

```bash
git push heroku main
```

### Step 5: View Logs

```bash
heroku logs --tail
```

---

## Option 2: AWS EC2 Deployment

### Step 1: Launch EC2 Instance

```bash
# 1. Go to AWS Console
# 2. Launch EC2 instance
#    - AMI: Ubuntu 20.04 LTS
#    - Instance type: t3.micro (free tier)
#    - Security group: Allow HTTP(80), HTTPS(443), SSH(22)

# 3. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip
```

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 3: Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/registration-app
cd /var/www/registration-app

# Clone repository
sudo git clone https://github.com/yourusername/html-css-js-project.git .

# Install dependencies
sudo npm install --production

# Create .env file
sudo nano .env
# Add environment variables:
# NODE_ENV=production
# PORT=3000
# DATABASE_URL=postgresql://user:password@localhost/registration_db
# JWT_SECRET=your-secret-key-here
```

### Step 4: Setup Database

```bash
# Create PostgreSQL user and database
sudo -u postgres psql << EOF
CREATE USER registration_user WITH PASSWORD 'secure_password';
CREATE DATABASE registration_db OWNER registration_user;
\c registration_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

# Run migrations (if you have them)
npm run migrate
```

### Step 5: Setup Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/registration-app.service
```

Add the following content:

```ini
[Unit]
Description=Registration App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/registration-app
ExecStart=/usr/bin/node /var/www/registration-app/backend-example/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable registration-app
sudo systemctl start registration-app

# Check status
sudo systemctl status registration-app
```

### Step 6: Setup Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/default
```

Add:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;

    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 7: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com

# Setup auto-renewal
sudo certbot renew --dry-run
```

### Step 8: Restart Services

```bash
sudo systemctl restart nginx
sudo systemctl restart registration-app
```

---

## Option 3: Docker Deployment

### Step 1: Create Dockerfile

Already provided in the project. Verify it exists:

```bash
cat Dockerfile
```

### Step 2: Build Docker Image

```bash
docker build -t registration-app:latest .
```

### Step 3: Run Container

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@db:5432/registration_db \
  -e JWT_SECRET=your-secret-key \
  registration-app:latest
```

### Step 4: Use Docker Compose (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://reg_user:password@db:5432/registration_db
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db
    restart: always

  db:
    image: postgres:13
    environment:
      POSTGRES_USER: reg_user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: registration_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: always

volumes:
  postgres_data:
```

Deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Production Checklist

### Environment Configuration

- [ ] Set `NODE_ENV=production`
- [ ] Set strong `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Set correct database URL
- [ ] Set correct `FRONTEND_URL`
- [ ] Enable all security headers
- [ ] Setup CORS for your domain only

### Database

- [ ] Database is backed up regularly
- [ ] Database has strong password
- [ ] Database is not publicly accessible
- [ ] Run migrations before deployment
- [ ] Indexes created for common queries

### Security

- [ ] HTTPS enabled (SSL certificate)
- [ ] HTTP redirects to HTTPS
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Security headers set (Helmet.js)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Passwords hashed with bcrypt

### Monitoring & Logging

- [ ] Error logging configured
- [ ] Access logs enabled
- [ ] Monitoring/alerting setup
- [ ] Uptime monitoring enabled
- [ ] Performance monitoring enabled
- [ ] Log retention policy set (usually 30-90 days)

### Performance

- [ ] Database connection pooling configured
- [ ] Caching enabled where appropriate
- [ ] CDN setup for static assets
- [ ] Load balancer configured (if multiple instances)
- [ ] Response compression enabled

### Maintenance

- [ ] Regular backups scheduled
- [ ] Disaster recovery plan documented
- [ ] Update plan for dependencies
- [ ] Health check endpoint monitored
- [ ] Rollback procedure documented

---

## Deployment Commands

### Update Application

```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm ci --production

# Run migrations if needed
npm run migrate

# Restart service
sudo systemctl restart registration-app

# OR with Docker
docker-compose pull
docker-compose up -d
```

### Database Backup

```bash
# PostgreSQL backup
pg_dump -U username -h localhost registration_db > backup.sql

# MySQL backup
mysqldump -u username -p registration_db > backup.sql

# Restore
psql -U username registration_db < backup.sql
```

### Monitor Logs

```bash
# Systemd
sudo journalctl -u registration-app -f

# Docker
docker-compose logs -f app

# View specific errors
sudo grep "ERROR" /var/log/app.log
```

---

## Scaling Strategies

### Horizontal Scaling (Multiple Instances)

```
┌────────────────┐
│   Load Balancer│
└────────┬───────┘
         ├─────────────┬──────────────┐
         ▼             ▼              ▼
    ┌────────┐    ┌────────┐    ┌────────┐
    │ App 1  │    │ App 2  │    │ App 3  │
    └────────┘    └────────┘    └────────┘
         └─────────────┬──────────────┘
                       ▼
                ┌──────────────┐
                │   Database   │
                └──────────────┘
```

### Session Persistence

Use Redis for session storage:

```javascript
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis').default;

const redisClient = redis.createClient();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true }
}));
```

---

## Rollback Procedure

### If Deployment Fails

```bash
# Check status
sudo systemctl status registration-app

# View logs
sudo journalctl -u registration-app -n 50

# Rollback to previous version
git revert HEAD

# Reinstall and restart
npm ci --production
sudo systemctl restart registration-app
```

---

## Troubleshooting

### Common Issues

#### Application won't start

```bash
# Check logs
sudo journalctl -u registration-app -f

# Check Node.js version
node --version

# Check if port is in use
sudo lsof -i :3000

# Manually test
npm start
```

#### Database connection errors

```bash
# Test database connection
psql -U user -h localhost -d registration_db

# Check environment variables
printenv | grep DATABASE

# Verify database is running
sudo systemctl status postgresql
```

#### HTTPS/SSL issues

```bash
# Check certificate
sudo certbot certificates

# Verify Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Performance Optimization

### Frontend

- Minify CSS and JavaScript
- Compress images
- Use CDN for static assets
- Enable browser caching

### Backend

- Enable gzip compression
- Use connection pooling
- Implement caching
- Optimize database queries
- Use indexes on frequently queried columns

### Database

```sql
-- Add indexes
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_created_at ON users(created_at);

-- Monitor slow queries
SET log_min_duration_statement = 1000; -- Log queries > 1s
```

---

## Resources

- [Heroku Deployment Guide](https://devcenter.heroku.com/)
- [AWS EC2 Getting Started](https://docs.aws.amazon.com/ec2/index.html)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)

---

**Last Updated:** 2026-09-20  
**Version:** 1.0  
**Status:** Ready for Production
