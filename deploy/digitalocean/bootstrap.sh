#!/usr/bin/env bash
# Run as root after copying this directory onto an Ubuntu 24.04 Droplet.
set -euo pipefail
domain="${1:?Supply the HTTPS hostname}"
[[ "$domain" =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$ ]] ||
  { echo "Invalid hostname" >&2; exit 1; }
source_dir="$(cd "$(dirname "$0")" && pwd)"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y caddy curl ca-certificates ufw
id bluesky >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin bluesky
id deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash deploy
install -d -m 0755 -o deploy -g deploy /opt/bluesky /opt/bluesky/releases
install -d -m 0755 /etc/bluesky
install -m 0644 "$source_dir/web.env" /etc/bluesky/web.env
printf 'CORS_ALLOWED_ORIGINS=https://%s\n' "$domain" >> /etc/bluesky/web.env
install -m 0644 "$source_dir/bskyweb.service" /etc/systemd/system/bskyweb.service
printf 'deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart bskyweb.service\n' \
  > /etc/sudoers.d/bluesky-deploy
chmod 0440 /etc/sudoers.d/bluesky-deploy
visudo -cf /etc/sudoers.d/bluesky-deploy
printf 'PasswordAuthentication no\nKbdInteractiveAuthentication no\nPermitRootLogin prohibit-password\n' \
  > /etc/ssh/sshd_config.d/00-bluesky.conf
sshd -t
systemctl reload ssh
install -d /etc/systemd/system/caddy.service.d
printf '[Service]\nEnvironment=APP_DOMAIN=%s\n' "$domain" \
  > /etc/systemd/system/caddy.service.d/domain.conf
install -m 0644 "$source_dir/Caddyfile" /etc/caddy/Caddyfile
APP_DOMAIN="$domain" caddy validate --config /etc/caddy/Caddyfile
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
systemctl daemon-reload
systemctl enable bskyweb.service caddy.service
systemctl restart caddy.service
