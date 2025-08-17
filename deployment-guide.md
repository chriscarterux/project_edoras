# Project Edoras - Deployment Guide

This guide provides a comprehensive workflow for deploying the Project Edoras React application from local development to production on your Hostinger VPS.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Local Dev      │    │  GitHub Actions  │    │  Hostinger VPS      │
│  Environment    │───▶│  CI/CD Pipeline  │───▶│  (46.202.93.22)     │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                                │  ┌─────────────────┐ │
                                                │  │ Docker          │ │
                                                │  │ Containers      │ │
                                                │  │ ┌─────────────┐ │ │
                                                │  │ │ React App   │ │ │
                                                │  │ │ Nginx       │ │ │
                                                │  │ │ PostHog     │ │ │
                                                │  │ │ n8n         │ │ │
                                                │  │ └─────────────┘ │ │
                                                │  └─────────────────┘ │
                                                └─────────────────────┘
```

## Prerequisites

### 1. GitHub Repository Setup

Your repository should be at: `https://github.com/chriscarterux/project_edoras`

### 2. Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

```bash
# Navigate to: Repository Settings > Secrets and variables > Actions

VPS_HOST=46.202.93.22
VPS_USERNAME=your-vps-username
VPS_SSH_KEY=your-private-ssh-key-content
```

### 3. VPS Prerequisites

Ensure your Hostinger VPS has:
- Docker and Docker Compose installed
- SSH access configured
- User with sudo privileges
- Firewall configured (ports 80, 443, 22)

## Quick Start

### 1. Initial VPS Setup

```bash
# SSH into your VPS
ssh your-username@46.202.93.22

# Create deployment directory
sudo mkdir -p /opt/project-edoras
sudo chown $USER:$USER /opt/project-edoras

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose (if not already installed)
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Environment Configuration

```bash
# On your VPS, create production environment file
cd /opt/project-edoras
cp .env.example .env.production

# Edit with your production values
nano .env.production
```

Required production values:
```env
DOMAIN_NAME=your-domain.com
ACME_EMAIL=admin@your-domain.com
POSTHOG_API_KEY=your-posthog-key
NODE_ENV=production
```

### 3. Deploy from GitHub

Simply push to the main branch:

```bash
# From your local development environment
git add .
git commit -m "Initial deployment setup"
git push origin main
```

The GitHub Actions workflow will automatically:
1. Run tests and linting
2. Build the React application
3. Create Docker image
4. Deploy to your VPS
5. Run health checks

## Deployment Workflow Details

### GitHub Actions Pipeline

The pipeline consists of three main jobs:

#### 1. Test Job
- Runs on every push and PR
- Executes linting with `npm run lint`
- Builds application with `npm run build`
- Uploads build artifacts

#### 2. Build and Deploy Job
- Only runs on main branch
- Downloads build artifacts
- Creates Docker image
- Deploys to VPS via SSH
- Implements automatic rollback on failure

#### 3. Health Check Job
- Verifies deployment success
- Tests application endpoints
- Provides deployment status

### Deployment Strategies

#### Blue-Green Deployment (Default)
- Zero-downtime deployments
- Automatic rollback on failure
- Container health checks
- Traffic switching

#### Manual Deployment
You can also trigger deployments manually:

```bash
# From GitHub repository
# Go to Actions tab > Deploy to Production > Run workflow
```

### Docker Configuration

#### Application Container
- Multi-stage build for optimization
- Nginx serving static React build
- Health checks enabled
- Resource limits configured

#### Reverse Proxy Options

**Option 1: Traefik (Recommended)**
```bash
# Start with Traefik
docker-compose --profile traefik-proxy up -d
```

**Option 2: Nginx**
```bash
# Start with Nginx
docker-compose --profile nginx-proxy up -d
```

### Environment Management

#### Development Environment
```bash
# Local development
npm install
npm run dev
```

#### Production Environment
- Environment variables via `.env.production`
- Docker containers with health checks
- SSL termination at reverse proxy
- Logging and monitoring enabled

## Monitoring and Maintenance

### Health Checks

The deployment includes multiple health check layers:

1. **Docker Health Checks**
   ```bash
   # Check container health
   docker-compose ps
   ```

2. **Application Health Endpoint**
   ```bash
   # Test application health
   curl http://your-domain.com/health
   ```

3. **Automated Monitoring**
   - GitHub Actions post-deployment checks
   - Container restart policies
   - Log aggregation with Fluent Bit

### Log Management

```bash
# View application logs
docker-compose logs -f app

# View nginx logs
docker-compose logs -f nginx

# View all service logs
docker-compose logs -f
```

### Backup Strategy

```bash
# Manual backup
docker-compose exec app npm run backup

# Automated backups (configured in cron)
0 2 * * * cd /opt/project-edoras && docker-compose exec -T app npm run backup
```

## Integration with Existing Services

### PostHog Integration

```nginx
# Already configured in nginx/conf.d/project-edoras.conf
location /posthog/ {
    proxy_pass http://posthog:8000/;
    # ... proxy settings
}
```

### n8n Integration

```nginx
# Webhook endpoint configuration
location /webhook/ {
    proxy_pass http://n8n:5678/webhook/;
    # ... proxy settings
}
```

## Troubleshooting

### Common Issues

#### 1. Deployment Fails
```bash
# Check GitHub Actions logs
# SSH to VPS and check:
cd /opt/project-edoras
docker-compose logs -f

# Manual rollback if needed
docker-compose down
mv docker-compose.yml.backup docker-compose.yml
docker-compose up -d
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
docker-compose exec traefik cat /letsencrypt/acme.json

# Force certificate renewal
docker-compose restart traefik
```

#### 3. Container Health Check Failures
```bash
# Check container status
docker-compose ps

# Inspect health check logs
docker inspect project-edoras-app | grep -A 10 Health
```

### Performance Optimization

#### 1. Enable Caching
```bash
# Start with Redis
docker-compose --profile with-redis up -d
```

#### 2. Enable Log Aggregation
```bash
# Start with logging
docker-compose --profile with-logging up -d
```

#### 3. Resource Monitoring
```bash
# Monitor resource usage
docker stats

# Check disk usage
df -h
```

## Security Best Practices

### 1. SSH Security
- Use SSH keys instead of passwords
- Disable root login
- Change default SSH port (optional)

### 2. Docker Security
- Regular image updates
- Non-root container users
- Resource limits
- Network isolation

### 3. Application Security
- Environment variable encryption
- Security headers via nginx
- Rate limiting configured
- HTTPS enforced

## Scaling Considerations

### Horizontal Scaling
```yaml
# In docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Load Balancing
```yaml
# Traefik load balancing
labels:
  - "traefik.http.services.edoras.loadbalancer.sticky.cookie=true"
```

## Maintenance Windows

### Planned Maintenance
```bash
# Put application in maintenance mode
echo "MAINTENANCE_MODE=true" >> .env.production
docker-compose restart app

# Perform maintenance
# ...

# Remove maintenance mode
sed -i '/MAINTENANCE_MODE=true/d' .env.production
docker-compose restart app
```

### Emergency Procedures
```bash
# Quick rollback
cd /opt/project-edoras
docker-compose down
mv docker-compose.yml.backup docker-compose.yml
docker-compose up -d

# Scale down for emergency
docker-compose stop app
```

## Support and Resources

### Useful Commands
```bash
# Full deployment status
docker-compose ps && docker-compose logs --tail=10 app

# Resource usage
docker system df && docker system prune -f

# Network troubleshooting
docker network ls && docker network inspect project-edoras_app-network
```

### Documentation Links
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## Quick Reference

### Deployment Commands
```bash
# Manual deployment
git push origin main

# Emergency rollback
ssh user@46.202.93.22 "cd /opt/project-edoras && docker-compose down && mv docker-compose.yml.backup docker-compose.yml && docker-compose up -d"

# Check deployment status
curl -f http://46.202.93.22/health
```

### Environment Files
- `.env.example` - Template for environment variables
- `.env.production` - Production environment (create on VPS)
- `docker-compose.yml` - Main deployment configuration

### Important Ports
- 80/443 - HTTP/HTTPS traffic
- 8080 - Traefik dashboard (optional)
- 3000 - Application port (internal)
- 5678 - n8n (if integrated)
- 8000 - PostHog (if integrated)

This deployment workflow provides a robust, scalable, and maintainable solution for your React application with comprehensive monitoring, security, and automation features.