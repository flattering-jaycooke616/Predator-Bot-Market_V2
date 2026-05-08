#!/bin/bash
# setup-vercel-env.sh - Sets up Vercel environment variables for Predator Bot Market
# Usage: ./scripts/setup-vercel-env.sh <vercel-project-id> <database-url> <clerk-pub-key> <clerk-secret-key>

set -e

if [ $# -lt 4 ]; then
  echo "Usage: $0 <vercel-project-id> <database-url> <clerk-pub-key> <clerk-secret-key>"
  echo ""
  echo "Example:"
  echo "  $0 prj_xxxxxxxx postgresql://user:pass@host:5432/db pk_test_xxx sk_test_xxx"
  exit 1
fi

PROJECT_ID=$1
DATABASE_URL=$2
CLERK_PUBLISHABLE_KEY=$3
CLERK_SECRET_KEY=$4

# Check for VERCEL_TOKEN
if [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: VERCEL_TOKEN environment variable is required"
  echo "Get your token at: https://vercel.com/account/tokens"
  exit 1
fi

API_BASE="https://api.vercel.com"
HEADERS="Authorization: Bearer $VERCEL_TOKEN"

echo "Setting up environment variables for project: $PROJECT_ID"

# Function to add env var
add_env() {
  local key=$1
  local value=$2
  local target=${3:-production,preview,development}
  
  echo "Adding $key..."
  curl -s -X POST "$API_BASE/v9/projects/$PROJECT_ID/env" \
    -H "$HEADERS" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"$key\",
      \"value\": \"$value\",
      \"target\": [$(echo $target | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')],
      \"type\": \"encrypted\"
    }" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  Added: {d.get(\"key\", \"unknown\")}')" 2>/dev/null || echo "  Failed to add $key"
}

add_env "DATABASE_URL" "$DATABASE_URL"
add_env "CLERK_PUBLISHABLE_KEY" "$CLERK_PUBLISHABLE_KEY"
add_env "CLERK_SECRET_KEY" "$CLERK_SECRET_KEY"
add_env "NODE_ENV" "production"

echo ""
echo "Environment variables configured successfully!"
echo "Redeploy your project for changes to take effect."
