#!/bin/bash

# Project Edoras VPS Setup Script
# Run this script on your Hostinger VPS (46.202.93.22) to prepare for deployment

set -e

echo "🚀 Setting up Project Edoras deployment environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_success "Docker installed successfully"
else
    print_success "Docker is already installed"
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully"
else
    print_success "Docker Compose is already installed"
fi

# Create deployment directory
print_status "Creating deployment directory..."
sudo mkdir -p /opt/project-edoras
sudo chown $USER:$USER /opt/project-edoras
print_success "Deployment directory created at /opt/project-edoras"

# Create SSL directory for certificates
print_status "Creating SSL directory..."
mkdir -p /opt/project-edoras/ssl
sudo mkdir -p /etc/nginx/ssl
print_success "SSL directories created"

# Create log directories
print_status "Creating log directories..."
sudo mkdir -p /var/log/project-edoras
sudo chown $USER:$USER /var/log/project-edoras
print_success "Log directories created"

# Configure firewall (UFW)
print_status "Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    print_success "Firewall configured"
else
    print_warning "UFW not found. Please configure firewall manually to allow ports 22, 80, and 443"
fi

# Create docker network
print_status "Creating Docker network..."
docker network create project-edoras-network 2>/dev/null || print_warning "Network already exists"

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/project-edoras > /dev/null <<EOF
/var/log/project-edoras/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker kill -s USR1 \$(docker ps -q --filter name=project-edoras) 2>/dev/null || true
    endscript
}
EOF
print_success "Log rotation configured"

# Create systemd service for auto-start
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/project-edoras.service > /dev/null <<EOF
[Unit]
Description=Project Edoras Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/project-edoras
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable project-edoras
print_success "Systemd service created and enabled"

# Create backup script
print_status "Creating backup script..."
tee /opt/project-edoras/backup.sh > /dev/null <<'EOF'
#!/bin/bash
# Project Edoras Backup Script

BACKUP_DIR="/opt/project-edoras/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="project-edoras-backup-${DATE}.tar.gz"

mkdir -p $BACKUP_DIR

# Create backup
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" \
    --exclude='node_modules' \
    --exclude='backups' \
    --exclude='*.log' \
    /opt/project-edoras

# Keep only last 7 backups
cd $BACKUP_DIR && ls -t | tail -n +8 | xargs rm -f

echo "Backup created: ${BACKUP_FILE}"
EOF

chmod +x /opt/project-edoras/backup.sh
print_success "Backup script created"

# Set up cron job for backups
print_status "Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/project-edoras/backup.sh >> /var/log/project-edoras/backup.log 2>&1") | crontab -
print_success "Daily backups scheduled at 2 AM"

# Create health check script
print_status "Creating health check script..."
tee /opt/project-edoras/health-check.sh > /dev/null <<'EOF'
#!/bin/bash
# Project Edoras Health Check Script

HEALTH_URL="http://localhost/health"
MAX_RETRIES=3
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s $HEALTH_URL > /dev/null; then
        echo "$(date): Health check passed"
        exit 0
    fi
    echo "$(date): Health check failed (attempt $i/$MAX_RETRIES)"
    sleep $RETRY_DELAY
done

echo "$(date): Health check failed after $MAX_RETRIES attempts"
# Restart containers if health check fails
cd /opt/project-edoras && docker-compose restart
exit 1
EOF

chmod +x /opt/project-edoras/health-check.sh
print_success "Health check script created"

# Set up monitoring cron job
print_status "Setting up health monitoring..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/project-edoras/health-check.sh >> /var/log/project-edoras/health.log 2>&1") | crontab -
print_success "Health monitoring scheduled every 5 minutes"

# Install nginx (for SSL certificate management if not using Traefik)
print_status "Installing nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
print_success "Nginx installed and enabled"

# Create deployment user (if not exists)
if ! id "deploy" &>/dev/null; then
    print_status "Creating deployment user..."
    sudo useradd -m -s /bin/bash deploy
    sudo usermod -aG docker deploy
    sudo usermod -aG sudo deploy
    print_success "Deployment user created"
fi

# Set up SSH key directory for deployment user
print_status "Setting up SSH access for deployment..."
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh
print_warning "Don't forget to add your GitHub Actions SSH public key to /home/deploy/.ssh/authorized_keys"

# Display system information
print_status "System Information:"
echo "  OS: $(lsb_release -d | cut -f2)"
echo "  Docker: $(docker --version)"
echo "  Docker Compose: $(docker-compose --version)"
echo "  Available Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "  Available Disk: $(df -h / | awk 'NR==2 {print $4}')"

print_success "VPS setup completed successfully!"
print_warning "Next steps:"
echo "  1. Configure your domain DNS to point to this server (46.202.93.22)"
echo "  2. Copy .env.production to /opt/project-edoras/ and configure it"
echo "  3. Add GitHub Actions SSH key to /home/deploy/.ssh/authorized_keys"
echo "  4. Configure GitHub repository secrets (VPS_HOST, VPS_USERNAME, VPS_SSH_KEY)"
echo "  5. Push to main branch to trigger first deployment"

print_status "Important files and directories:"
echo "  - Deployment directory: /opt/project-edoras"
echo "  - Log directory: /var/log/project-edoras"
echo "  - Backup script: /opt/project-edoras/backup.sh"
echo "  - Health check script: /opt/project-edoras/health-check.sh"
echo "  - Systemd service: /etc/systemd/system/project-edoras.service"

echo ""
print_success "Setup complete! You may need to log out and back in for Docker group membership to take effect."
EOF