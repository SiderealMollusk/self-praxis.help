#!/bin/bash
set -e

# Ops/VPS Hardening Script
# targeted at Ubuntu/Debian VPS
# Run this from your dev machine via `just harden-vps` or ssh pipe.

echo "🔒 Starting Infrastructure Hardening on $(hostname)..."

# 1. Update & Install Critical Packages
echo "📦 Installing security packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ufw fail2ban unattended-upgrades

# 2. Configure Unattended Upgrades
echo "🔄 Enabling Unattended Upgrades..."
echo 'Unattended-Upgrade::Allowed-Origins {
        "${distro_id}:${distro_codename}";
        "${distro_id}:${distro_codename}-security";
        "${distro_id}ESMApps:${distro_codename}-apps-security";
        "${distro_id}ESM:${distro_codename}-infra-security";
};' > /etc/apt/apt.conf.d/51unattended-upgrades-local
service unattended-upgrades restart

# 3. Firewall (UFW) Configuration
echo "🛡️  Configuring Firewall (UFW)..."
# Reset to default
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow HTTP/HTTPS (Public)
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH specific to Tailscale Interface (Security by Obscurity + VPN)
# Assuming 'tailscale0' is the interface. Check it.
TS_IFACE=$(ip -o link show | awk -F': ' '{print $2}' | grep -E '^tailscale|^tun' | head -n 1)

if [ -z "$TS_IFACE" ]; then
    echo "⚠️  WARNING: No Tailscale interface found. Falling back to allowing global SSH on port 22."
    ufw allow 22/tcp
else
    echo "✅ Found Tailscale interface: $TS_IFACE"
    echo "   Allowing SSH ONLY on $TS_IFACE..."
    ufw allow in on "$TS_IFACE" to any port 22
    
    # Optional: Allow global SSH for safety until verified, but goal is specialized hardnening
    # ufw allow 22/tcp # Uncomment to generic allow
    
    # We will ALLOW standard SSH for now to prevent lockout if user is not actually on tailscale IP routing
    # BUT user requested "specifically tailscale ssh". 
    # Current Ops/.env uses 100.x.x.x IP so we are good.
fi

# Enable UFW
echo "🔥 Enabling UFW..."
ufw --force enable
ufw status verbose

# 4. Fail2Ban Setup
echo "🚫 Configuring Fail2Ban..."
# Create a local jail config to protect SSH
cat <<EOF > /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF
systemctl restart fail2ban
systemctl enable fail2ban

# 5. SSH Configuration (SSHD)
echo "🔑 Hardening SSH Configuration..."
SSHD_CONFIG="/etc/ssh/sshd_config"

# Backup config
cp $SSHD_CONFIG "$SSHD_CONFIG.bak.$(date +%F_%T)"

# Disable Password Authentication (Key-only)
sed -i 's/^#*PasswordAuthentication .*/PasswordAuthentication no/' $SSHD_CONFIG
sed -i 's/^#*ChallengeResponseAuthentication .*/ChallengeResponseAuthentication no/' $SSHD_CONFIG
sed -i 's/^#*UsePAM .*/UsePAM yes/' $SSHD_CONFIG # PAM needed for some sessions but Auth is handled by keys

# Disable Root Login?
# DANGER: We are currently logging in as root in .env. 
# We cannot disable root login until we create a deploy user.
# Skipping PermitRootLogin modification for now. user must do this manually after creating sudo user.

echo "   - PasswordAuthentication set to NO"
echo "   - Root login LEFT ENABLED (manual step required after user creation)"

# Check syntax and restart
sshd -t && systemctl restart sshd

echo "✅ Hardening Complete!"
echo "   - Firewall is active (80, 443, SSH on Tailscale)"
echo "   - Fail2Ban is monitoring SSH"
echo "   - Unattended Upgrades are on"
echo "   - SSH Password Auth is disabled"
echo "⚠️  Next Step: Create a non-root sudo user and set 'PermitRootLogin no' in /etc/ssh/sshd_config"
