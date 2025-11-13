#!/bin/bash

# ================================================================
# Git History Cleanup Script
# Menghapus credentials dan sensitive data dari git history
# ================================================================
#
# WARNING: Script ini akan MENGUBAH git history!
# Pastikan semua developer sudah commit dan push perubahan mereka
# sebelum menjalankan script ini.
#
# ================================================================

set -e  # Exit on error

echo "================================================================"
echo "Git History Cleanup - Bank Sultra Absensi"
echo "================================================================"
echo ""
echo "⚠️  WARNING: Script ini akan MENGUBAH git history!"
echo "    Pastikan:"
echo "    1. Semua developer sudah commit & push"
echo "    2. Anda sudah backup repository"
echo "    3. Koordinasi dengan tim development"
echo ""
read -p "Apakah Anda yakin ingin melanjutkan? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Dibatalkan oleh user"
    exit 1
fi

echo ""
echo "📋 Langkah 1: Backup current repository..."
BACKUP_DIR="absensi-backup-$(date +%Y%m%d-%H%M%S)"
cp -r . "../$BACKUP_DIR"
echo "✅ Backup dibuat di: ../$BACKUP_DIR"

echo ""
echo "📋 Langkah 2: Memeriksa instalasi git-filter-repo..."
if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo tidak ditemukan!"
    echo ""
    echo "Install dengan salah satu cara berikut:"
    echo ""
    echo "macOS:"
    echo "  brew install git-filter-repo"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt-get install git-filter-repo"
    echo ""
    echo "Windows (Git Bash):"
    echo "  pip install git-filter-repo"
    echo ""
    echo "Manual install:"
    echo "  wget https://raw.githubusercontent.com/newren/git-filter-repo/main/git-filter-repo"
    echo "  chmod +x git-filter-repo"
    echo "  sudo mv git-filter-repo /usr/local/bin/"
    exit 1
fi
echo "✅ git-filter-repo ditemukan"

echo ""
echo "📋 Langkah 3: Menghapus file sensitif dari history..."

# List file yang akan dihapus dari history
FILES_TO_REMOVE=(
    ".env"
    "src/configs/aes.config.js"  # Versi lama dengan hardcoded secrets
    "src/files/databases/*.enc"
)

echo "File yang akan dihapus dari history:"
for file in "${FILES_TO_REMOVE[@]}"; do
    echo "  - $file"
done

echo ""
read -p "Lanjutkan penghapusan? (yes/no): " confirm2

if [ "$confirm2" != "yes" ]; then
    echo "❌ Dibatalkan"
    exit 1
fi

# Hapus file dari history
for file in "${FILES_TO_REMOVE[@]}"; do
    echo "Menghapus: $file"
    git filter-repo --path "$file" --invert-paths --force || true
done

echo "✅ File sensitif dihapus dari history"

echo ""
echo "📋 Langkah 4: Membersihkan reflog..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Reflog dibersihkan"

echo ""
echo "================================================================"
echo "✅ Git history berhasil dibersihkan!"
echo "================================================================"
echo ""
echo "📌 LANGKAH SELANJUTNYA:"
echo ""
echo "1. Verifikasi perubahan:"
echo "   git log --all --oneline | head -20"
echo ""
echo "2. Force push ke remote (HATI-HATI!):"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. Informasikan ke SEMUA developer untuk re-clone:"
echo "   git clone <repository-url>"
echo ""
echo "   JANGAN gunakan 'git pull' di repository lama!"
echo "   Developer HARUS re-clone dari remote!"
echo ""
echo "4. Verifikasi tidak ada credentials di history:"
echo "   git log -S 'password' --all"
echo "   git log -S 'secret' --all"
echo ""
echo "⚠️  PENTING: Semua developer harus re-clone repository!"
echo ""
