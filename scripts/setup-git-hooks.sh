#!/bin/bash

# ================================================================
# Setup Git Hooks untuk Mencegah Commit Credentials
# ================================================================

set -e

echo "================================================================"
echo "Setup Git Hooks - Bank Sultra Absensi"
echo "================================================================"
echo ""

# Pastikan di dalam git repository
if [ ! -d .git ]; then
    echo "❌ Error: Bukan git repository!"
    echo "   Jalankan script ini dari root directory project"
    exit 1
fi

echo "📋 Installing pre-commit hook..."

# Buat pre-commit hook
cat > .git/hooks/pre-commit << 'HOOK_EOF'
#!/bin/bash

# ================================================================
# Pre-commit Hook: Prevent Credentials Commit
# ================================================================

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Cegah commit file .env
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo -e "${RED}❌ Error: Attempting to commit .env file!${NC}"
    echo ""
    echo "   .env berisi credentials dan tidak boleh di-commit"
    echo ""
    echo "   Remove dengan:"
    echo "   git reset HEAD .env"
    echo ""
    exit 1
fi

# Check 2: Cegah commit .enc files
if git diff --cached --name-only | grep -q "\.enc$"; then
    echo -e "${RED}❌ Error: Attempting to commit encrypted database config!${NC}"
    echo ""
    echo "   File .enc tidak boleh di-commit (runtime generated)"
    echo ""
    echo "   Remove dengan:"
    echo "   git reset HEAD src/files/databases/*.enc"
    echo ""
    exit 1
fi

# Check 3: Detect hardcoded passwords
if git diff --cached | grep -iE "(password|secret|api_key|private_key|secret_key)\s*=\s*['\"][^'\"]{8,}['\"]" | grep -v "placeholder\|example\|your-"; then
    echo -e "${RED}❌ Error: Possible hardcoded credentials detected!${NC}"
    echo ""
    echo "   Ditemukan potential credentials di code:"
    echo ""
    git diff --cached | grep -iE "(password|secret|api_key|private_key|secret_key)\s*=\s*['\"][^'\"]{8,}['\"]" | grep -v "placeholder\|example\|your-" | head -5
    echo ""
    echo "   Action required:"
    echo "   1. Move credentials ke .env file"
    echo "   2. Load dari process.env.VARIABLE_NAME"
    echo "   3. Add placeholder ke .env.example"
    echo ""
    exit 1
fi

# Check 4: Detect potential AES keys (32+ alphanumeric chars)
if git diff --cached | grep -E "['\"][a-zA-Z0-9]{32,}['\"]" | grep -v "placeholder\|example\|your-\|test"; then
    echo -e "${YELLOW}⚠️  Warning: Detected potential secret keys${NC}"
    echo ""
    echo "   Pastikan ini bukan AES key atau API key yang sebenarnya"
    echo ""
    read -p "   Continue commit? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "   Commit cancelled"
        exit 1
    fi
fi

# Check 5: Detect connection strings
if git diff --cached | grep -iE "(mongodb://|postgresql://|mysql://|redis://).+:[^@]*@"; then
    echo -e "${RED}❌ Error: Database connection string detected!${NC}"
    echo ""
    echo "   Connection string dengan credentials tidak boleh hardcoded"
    echo ""
    echo "   Action required:"
    echo "   1. Move connection string ke .env"
    echo "   2. Build connection string dari individual env vars"
    echo ""
    exit 1
fi

echo "✅ Pre-commit checks passed"
exit 0
HOOK_EOF

# Make executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully!"
echo ""

echo "📋 Installing commit-msg hook..."

# Buat commit-msg hook (enforce commit message format)
cat > .git/hooks/commit-msg << 'HOOK_EOF'
#!/bin/bash

# ================================================================
# Commit-msg Hook: Enforce Commit Message Format
# ================================================================

YELLOW='\033[1;33m'
NC='\033[0m' # No Color

commit_msg=$(cat "$1")

# Check: Commit message tidak boleh mengandung kata 'password' atau 'secret'
if echo "$commit_msg" | grep -iqE "(password|secret|api.?key|credentials)"; then
    echo -e "${YELLOW}⚠️  Warning: Commit message contains sensitive keywords${NC}"
    echo ""
    echo "   Hindari menyebutkan 'password' atau 'secret' di commit message"
    echo ""
    read -p "   Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "   Commit cancelled"
        exit 1
    fi
fi

exit 0
HOOK_EOF

chmod +x .git/hooks/commit-msg

echo "✅ Commit-msg hook installed successfully!"
echo ""

echo "================================================================"
echo "✅ Git hooks berhasil di-setup!"
echo "================================================================"
echo ""
echo "Hooks yang terinstall:"
echo "  1. pre-commit  - Cegah commit credentials"
echo "  2. commit-msg  - Validasi commit message"
echo ""
echo "Test hooks dengan:"
echo "  echo 'password = \"secret123\"' >> test.js"
echo "  git add test.js"
echo "  git commit -m 'test'"
echo "  (Should be blocked)"
echo ""
