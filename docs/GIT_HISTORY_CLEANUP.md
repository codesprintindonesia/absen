# Panduan Membersihkan Git History dari Credentials

## Mengapa Perlu Dibersihkan?

Credentials (password, secret keys, API keys) yang pernah ter-commit di git history adalah **risiko keamanan besar**, karena:

1. **Permanent Record**: Git menyimpan semua history, termasuk file yang sudah dihapus
2. **Public Repository Risk**: Jika repository menjadi public, semua credentials terbuka
3. **Developer Access**: Siapapun dengan akses repository bisa lihat history lengkap
4. **Compliance Issues**: Melanggar security compliance (ISO 27001, PCI DSS, dll)

## File yang Berpotensi Berisi Credentials

- `.env` - Environment variables dengan passwords
- `src/configs/aes.config.js` - Hardcoded AES secrets (versi lama)
- `src/files/databases/*.enc` - Encrypted database configs
- `ecosystem.config.cjs` - Mungkin berisi environment variables
- File backup dengan ekstensi `.bak`, `.backup`

## Cara Membersihkan Git History

### Opsi 1: Menggunakan Script Otomatis (Recommended)

```bash
# Jalankan script yang sudah disediakan
cd /path/to/ABSENSI
chmod +x scripts/clean-git-history.sh
./scripts/clean-git-history.sh
```

Script akan:
1. ✅ Backup repository otomatis
2. ✅ Install dependency checker
3. ✅ Hapus file sensitif dari history
4. ✅ Clean reflog dan garbage collection
5. ✅ Panduan langkah selanjutnya

### Opsi 2: Manual Menggunakan git-filter-repo

#### Langkah 1: Install git-filter-repo

**macOS:**
```bash
brew install git-filter-repo
```

**Ubuntu/Debian:**
```bash
sudo apt-get install git-filter-repo
```

**Windows (Git Bash):**
```bash
pip install git-filter-repo
```

**Manual Install:**
```bash
wget https://raw.githubusercontent.com/newren/git-filter-repo/main/git-filter-repo
chmod +x git-filter-repo
sudo mv git-filter-repo /usr/local/bin/
```

#### Langkah 2: Backup Repository

```bash
cp -r /path/to/ABSENSI /path/to/ABSENSI-backup-$(date +%Y%m%d)
cd /path/to/ABSENSI
```

#### Langkah 3: Hapus File dari History

```bash
# Hapus .env dari semua commits
git filter-repo --path .env --invert-paths --force

# Hapus aes.config.js versi lama (dengan hardcoded secrets)
git filter-repo --path src/configs/aes.config.js --invert-paths --force

# Hapus semua .enc files
git filter-repo --path 'src/files/databases/*.enc' --invert-paths --force
```

#### Langkah 4: Clean Up

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

#### Langkah 5: Verifikasi

```bash
# Cari kata 'password' di history
git log -S 'password' --all

# Cari kata 'secret' di history
git log -S 'secret' --all

# Cari kata 'rahasiaabsen' (AES key lama)
git log -S 'rahasiaabsen' --all

# Jika masih ada hasil, ulangi langkah 3
```

#### Langkah 6: Force Push ke Remote

⚠️ **PERINGATAN**: Langkah ini akan mengubah history di remote!

```bash
# Backup remote terlebih dahulu (clone ke tempat lain)
git clone <repository-url> /backup/location

# Force push
git push origin --force --all
git push origin --force --tags
```

### Opsi 3: Menggunakan BFG Repo-Cleaner (Alternatif)

```bash
# Install BFG
brew install bfg  # macOS
# atau download dari: https://rtyley.github.io/bfg-repo-cleaner/

# Backup
cp -r /path/to/ABSENSI /path/to/ABSENSI-backup

# Hapus credentials
bfg --delete-files .env
bfg --replace-text passwords.txt  # File berisi list passwords

# Clean up
cd /path/to/ABSENSI
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Push
git push origin --force --all
```

## Setelah Membersihkan History

### 1. Rotate Semua Credentials

Credentials lama harus diganti, karena mungkin sudah dicopy oleh orang lain:

```bash
# Generate AES keys baru (32 chars untuk key, 16 chars untuk IV)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"  # 32 chars
node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"   # 16 chars

# Update .env dengan keys baru
# Update database passwords
# Update API keys
```

### 2. Informasikan ke Semua Developer

**Template Email/Slack:**

```
🔴 URGENT: Git History Cleaned - Action Required

Hi Team,

Git history untuk repository ABSENSI sudah dibersihkan untuk menghapus
credentials yang ter-commit sebelumnya.

ACTION REQUIRED:
1. JANGAN git pull di repository lokal Anda
2. Backup pekerjaan Anda yang belum di-push
3. Hapus folder repository lokal
4. Re-clone dari remote: git clone <url>
5. Apply kembali perubahan yang belum di-push

DEADLINE: [Date]

Questions? Contact: [Your Contact]
```

### 3. Update Credentials di Production

```bash
# Login ke server production
ssh user@production-server

# Update .env dengan credentials baru
cd /var/www/absensi
nano .env

# Restart aplikasi
pm2 restart ABSENSI
```

### 4. Verifikasi di GitHub/GitLab

- Cek "Settings" → "Security" → "Secret scanning"
- Pastikan tidak ada alerts
- Enable branch protection jika belum

## Mencegah Credentials Ter-commit Lagi

### 1. Update .gitignore

Pastikan `.gitignore` sudah benar:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# JANGAN ignore .env.example (ini template, harus di-commit)

# Encrypted configs
src/files/databases/*.enc

# Certificates
*.pem
*.key
*.crt
```

### 2. Setup Pre-commit Hook

Buat file `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Cegah commit file .env
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "❌ Error: Attempting to commit .env file!"
    echo "   Remove it with: git reset HEAD .env"
    exit 1
fi

# Cegah commit credentials di code
if git diff --cached | grep -iE "(password|secret|api_key|private_key)\s*=\s*['\"]"; then
    echo "❌ Error: Possible hardcoded credentials detected!"
    echo "   Move credentials to .env file"
    exit 1
fi

exit 0
```

```bash
chmod +x .git/hooks/pre-commit
```

### 3. Setup git-secrets (AWS Tool)

```bash
# Install
brew install git-secrets  # macOS
apt-get install git-secrets  # Linux

# Setup untuk repository
cd /path/to/ABSENSI
git secrets --install
git secrets --register-aws

# Tambah custom patterns
git secrets --add 'password\s*=\s*["\'][^"\']+["\']'
git secrets --add 'secret\s*=\s*["\'][^"\']+["\']'
git secrets --add '[A-Za-z0-9]{32,}'  # Potential API keys
```

### 4. Enable GitHub Secret Scanning

Di GitHub repository:
1. Settings → Security → Code security and analysis
2. Enable "Secret scanning"
3. Enable "Push protection"

### 5. Code Review Checklist

Setiap pull request harus dicek:
- [ ] Tidak ada hardcoded passwords
- [ ] Tidak ada hardcoded API keys
- [ ] Tidak ada commit file .env
- [ ] Credentials di-load dari environment variables
- [ ] Tidak ada sensitive data di comments

## Verifikasi Berkala

Jalankan secara periodik (monthly):

```bash
# Cek apakah ada credentials di history
git log -S 'password' --all
git log -S 'secret' --all
git log -S 'api_key' --all

# Cek apakah .env ter-commit
git log --all --full-history -- .env

# Scan dengan truffleHog (tool untuk detect secrets)
truffleHog git file://. --json
```

## Tools untuk Secret Detection

### 1. TruffleHog

```bash
# Install
pip install truffleHog

# Scan repository
truffleHog git file://. --json | jq

# Scan specific branch
truffleHog git file://. --branch main
```

### 2. Gitleaks

```bash
# Install
brew install gitleaks

# Scan
gitleaks detect --source . --verbose

# Generate report
gitleaks detect --source . --report-format json --report-path gitleaks-report.json
```

### 3. GitGuardian

- Signup di: https://www.gitguardian.com/
- Connect GitHub/GitLab repository
- Automatic monitoring untuk leaked secrets

## Checklist Keamanan

- [ ] Git history sudah dibersihkan dari credentials
- [ ] Semua credentials sudah di-rotate
- [ ] `.gitignore` sudah diupdate
- [ ] Pre-commit hooks sudah diinstall
- [ ] GitHub secret scanning enabled
- [ ] Developer sudah diedukasi
- [ ] Monitoring setup (GitGuardian/Gitleaks)
- [ ] Documentation diupdate
- [ ] Production credentials diupdate

## Contacts

**Security Issues:**
- Email: security@banksultra.co.id
- Emergency: [Phone Number]

**Development Lead:**
- [Name]
- [Contact]

## References

- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
