# Infrastructure Hardening Checklist

## Immediate (Critical)
- [x] **SSH hardening** (key-only auth, non-standard port/Tailscale-only)
    - *Pending: Disable root login (holding until scripts stabilize)*
- [x] **Firewall rules** (UFW/iptables - close all ports except 22, 80, 443)
- [x] **Fail2ban** (auto-ban brute force SSH attempts)
- [ ] **Log monitoring** (check for intrusion attempts)
- [x] **Disable password auth entirely on VPS**

## High Priority
- [x] **VPS automatic updates enabled**
- [x] **Nginx rate limiting** (prevent DDoS, API abuse)
- [ ] **Nginx access/error logging + log rotation**
- [ ] **Monitor failed login attempts**
- [ ] **Backup strategy** (encrypted, off-site)
- [ ] **Verify Tailscale is properly securing your on-prem → VPS tunnel**
- [ ] **Run Express apps as unprivileged user** (Docker non-root)
- [ ] **Read-Only Containers** (App can't modify its own code)

## Application Security (Shift Signups)
- [x] **Rate Limiting** (Nginx `api_limit` zone enforced)
- [x] **Input Validation** (Zod Schema for all writes)
- [x] **Immutable Logging** (Append-only JSONL storage)
- [ ] **CSRF Protection** (Pending)

## Medium Priority
- [ ] **File integrity monitoring** (detect if files change unexpectedly)
- [ ] **Port knocking** (hide SSH until you "knock")
- [ ] **VPS provider 2FA enabled on account**
- [ ] **Check VPS provider's DDoS protection**
- [ ] **Regular security audits of your Express app**

## Nice to Have
- [ ] **IDS/IPS** (Suricata/Snort)
- [ ] **SELinux/AppArmor hardening**
- [ ] **Nginx ModSecurity WAF**
- [ ] **VPN to VPS** (encrypts traffic further)

## Operational
- [ ] **Document your security setup**
- [ ] **Test failover/recovery procedures**
- [ ] **Set up alerts for:** high CPU, disk full, failed logins, certificate renewal
