# Security Setup - Bank Sultra Absensi

## 🔒 Langkah-langkah Keamanan Wajib

### 1. Setup Git Hooks (Mencegah Credentials Ter-commit)

**Langkah:**
```bash
# Jalankan script setup
cd /path/to/ABSENSI
chmod +x scripts/setup-git-hooks.sh
./scripts/setup-git-hooks.sh
```

**Apa yang dilakukan:**
- ✅ Install pre-commit hook → Blokir commit file `.env`
- ✅ Install pre-commit hook → Deteksi hardcoded passwords
- ✅ Install pre-commit hook → Deteksi connection strings
- ✅ Install commit-msg hook → Warning jika commit message berisi 'password'

**Test:**
```bash
# Test 1: Coba commit .env (should fail)
git add .env
git commit -m "test"
# Expected: ❌ Error: Attempting to commit .env file!

# Test 2: Coba commit hardcoded password (should fail)
echo 'const password = "secret123";' >> test.js
git add test.js
git commit -m "test"
# Expected: ❌ Error: Possible hardcoded credentials detected!

# Clean up
git reset HEAD test.js
rm test.js
```

---

### 2. Bersihkan Git History (One-time Setup)

⚠️ **CRITICAL**: Ini akan mengubah git history!

**Persiapan:**
1. Koordinasi dengan SEMUA developer
2. Pastikan semua sudah push perubahan
3. Backup repository

**Langkah:**
```bash
cd /path/to/ABSENSI
chmod +x scripts/clean-git-history.sh
./scripts/clean-git-history.sh
```

Script akan:
1. Backup repository otomatis
2. Hapus `.env` dari semua commits
3. Hapus hardcoded secrets dari history
4. Clean reflog dan garbage collection

**Setelah cleanup:**
```bash
# Force push ke remote
git push origin --force --all
git push origin --force --tags

# Informasikan ke developer untuk re-clone
```

**Dokumentasi lengkap:** `docs/GIT_HISTORY_CLEANUP.md`

---

### 3. Rotate Semua Credentials

Setelah membersihkan history, **WAJIB** rotate credentials:

#### 3.1. Generate AES Keys Baru

```bash
# Generate AES_SECRET_KEY (32 chars)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate AES_SECRET_IV (16 chars)
node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"
```

#### 3.2. Update .env

```bash
# Edit .env
nano .env

# Update values:
AES_SECRET_KEY=<output-dari-langkah-3.1>
AES_SECRET_IV=<output-dari-langkah-3.1>
CONFIG_ENC_KEY=<generate-new-32-chars>

# Save dan restart
pm2 restart ABSENSI
```

#### 3.3. Update Database Passwords

```sql
-- Login ke PostgreSQL
psql -U postgres

-- Change password untuk user aplikasi
ALTER USER absensi_user WITH PASSWORD 'new_secure_password_here';

-- Update .env dengan password baru
-- Restart aplikasi
```

#### 3.4. Re-encrypt Database Configs

```bash
# Hapus config lama
rm src/files/databases/*.enc

# Buat config baru dengan credentials baru via API
curl -X POST http://localhost:5000/api/databases/setup \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "production",
    "dbName": "absensi_db",
    "dbUser": "absensi_user",
    "dbPassword": "new_secure_password_here",
    "dbHost": "localhost",
    "dbPort": 5432,
    "dbDialect": "postgres"
  }'

# Set di .env
DATABASE=production
```

---

### 4. Enable GitHub Secret Scanning (Recommended)

#### 4.1. Setup GitHub Actions

File sudah dibuat di: `.github/workflows/secret-scanning.yml`

**Enable di GitHub:**
1. Go to repository di GitHub
2. Settings → Secrets and variables → Actions
3. (Optional) Add `GITLEAKS_LICENSE` jika punya Gitleaks Pro

**Test workflow:**
```bash
git add .github/workflows/secret-scanning.yml
git commit -m "ci: add secret scanning workflow"
git push
```

#### 4.2. Enable GitHub Secret Scanning

1. Settings → Code security and analysis
2. Enable "Secret scanning"
3. Enable "Push protection" (mencegah push jika ada secrets)

---

### 5. Install Gitleaks (Local Development)

**macOS:**
```bash
brew install gitleaks
```

**Ubuntu/Linux:**
```bash
# Download latest release
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

**Windows:**
```powershell
# Via Chocolatey
choco install gitleaks

# Via Scoop
scoop install gitleaks
```

**Scan repository:**
```bash
cd /path/to/ABSENSI
gitleaks detect --source . --verbose
```

---

### 6. Setup Periodic Security Scan (Cronjob)

#### 6.1. Buat Script Scan

```bash
# File: scripts/security-scan.sh
chmod +x scripts/security-scan.sh
```

#### 6.2. Setup Cronjob (Server)

```bash
# Edit crontab
crontab -e

# Tambahkan (scan setiap hari jam 2 pagi)
0 2 * * * cd /var/www/absensi && /usr/local/bin/gitleaks detect --source . --report-path /var/log/gitleaks-scan.log
```

---

### 7. Production Environment Setup

#### 7.1. Production .env

```bash
# JANGAN copy .env dari development!
# Buat .env production dengan credentials berbeda

# Generate production keys
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Setup production .env
nano .env

# Set values production
NODE_ENV=production
AES_SECRET_KEY=<production-key-32-chars>
AES_SECRET_IV=<production-iv-16-chars>
# ... dst
```

#### 7.2. File Permissions

```bash
# Restrict .env permissions
chmod 600 .env
chown www-data:www-data .env  # Sesuaikan user

# Restrict database config directory
chmod 700 src/files/databases/
chown www-data:www-data src/files/databases/
```

#### 7.3. Environment Variables via PM2

**Alternatif lebih aman daripada .env file:**

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: "ABSENSI",
    script: "src/app.js",
    env_production: {
      NODE_ENV: "production",
      PORT: 5000,
      AES_SECRET_KEY: process.env.AES_SECRET_KEY,  // Load dari system env
      AES_SECRET_IV: process.env.AES_SECRET_IV,
      // Jangan hardcode di sini!
    }
  }]
};
```

**Set system environment variables:**
```bash
# Via /etc/environment atau ~/.bashrc
export AES_SECRET_KEY="production-key-here"
export AES_SECRET_IV="production-iv-here"
```

---

### 8. Security Checklist

- [ ] Git hooks terinstall di local development
- [ ] Git history sudah dibersihkan
- [ ] Semua credentials sudah di-rotate
- [ ] `.gitignore` sudah benar (exclude .env, include .env.example)
- [ ] GitHub secret scanning enabled
- [ ] Gitleaks terinstall di development machines
- [ ] GitHub Actions secret scanning workflow aktif
- [ ] Production .env dengan credentials berbeda
- [ ] File permissions production sudah benar (600 untuk .env)
- [ ] Periodic security scan setup (cronjob)
- [ ] Developer sudah diedukasi tentang security practices
- [ ] Documentation diupdate

---

### 9. Developer Onboarding Checklist

Untuk developer baru:

```bash
# 1. Clone repository
git clone <repository-url>
cd ABSENSI

# 2. Install dependencies
npm install

# 3. Setup git hooks
chmod +x scripts/setup-git-hooks.sh
./scripts/setup-git-hooks.sh

# 4. Copy .env.example ke .env
cp .env.example .env

# 5. Generate local AES keys
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
# Update .env dengan output di atas

# 6. Setup database config
# Gunakan API /databases/setup atau copy dari tim

# 7. Test git hooks
echo 'password = "test"' >> test.js
git add test.js
git commit -m "test"
# Should fail dengan error message
rm test.js

# 8. Install gitleaks
brew install gitleaks  # atau sesuai OS

# 9. Baca dokumentasi security
cat docs/SECURITY_SETUP.md
cat docs/GIT_HISTORY_CLEANUP.md
```

---

### 10. Emergency Response

**Jika credentials ter-leak:**

1. **Immediate Actions** (dalam 1 jam):
   ```bash
   # 1. Rotate credentials SECEPATNYA
   # 2. Review access logs
   # 3. Notifikasi tim security
   ```

2. **Short Term** (dalam 24 jam):
   ```bash
   # 1. Clean git history
   ./scripts/clean-git-history.sh

   # 2. Force push
   git push origin --force --all

   # 3. Notifikasi semua developer untuk re-clone
   ```

3. **Long Term** (dalam 1 minggu):
   ```bash
   # 1. Review semua access logs
   # 2. Audit semua credentials
   # 3. Setup monitoring/alerting
   # 4. Post-mortem meeting
   ```

**Contacts:**
- Security Team: security@banksultra.co.id
- Emergency: [Phone Number]

---

### 11. Best Practices

#### DO ✅

- ✅ Selalu load credentials dari environment variables
- ✅ Use `.env.example` untuk template dengan placeholder values
- ✅ Gunakan git hooks untuk pre-commit validation
- ✅ Scan repository dengan gitleaks secara berkala
- ✅ Different credentials per environment (dev/staging/prod)
- ✅ Rotate credentials setelah developer leaving
- ✅ Use strong, random generated secrets (min 32 chars)
- ✅ Review pull requests untuk hardcoded secrets
- ✅ Enable GitHub secret scanning & push protection

#### DON'T ❌

- ❌ NEVER hardcode passwords di source code
- ❌ NEVER commit .env file
- ❌ NEVER share credentials via Slack/Email
- ❌ NEVER use same credentials untuk dev dan production
- ❌ NEVER commit database dumps dengan real data
- ❌ NEVER disable pre-commit hooks
- ❌ NEVER ignore secret scanning alerts
- ❌ NEVER reuse passwords across services

---

### 12. Additional Resources

- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [GitHub Secret Scanning Docs](https://docs.github.com/en/code-security/secret-scanning)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [12 Factor App - Config](https://12factor.net/config)
- [git-filter-repo](https://github.com/newren/git-filter-repo)

---

**Last Updated**: 2025-11-13
**Maintained By**: Development Team - Bank Sultra
