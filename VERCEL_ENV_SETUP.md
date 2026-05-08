# Vercel Environment Variables Setup

## Frontend Project (predator-bots)
No environment variables required. The frontend communicates with the API via Vite proxy during development and will be configured to use the production API URL after deployment.

## API Server Project (predator-bot-market-api)

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://predator_bot:predator_bot@db.example.com:5432/predator_bots` |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key for auth | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key for auth | `sk_test_...` |
| `NODE_ENV` | Environment | `production` |

### Optional Variables (Google Cloud Storage)

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | `/vercel/path0/gcs-key.json` |
| `GCS_PROJECT_ID` | GCP project ID | `my-project-123` |
| `GCS_CLIENT_EMAIL` | Service account email | `svc@my-project.iam.gserviceaccount.com` |
| `GCS_PRIVATE_KEY` | Service account private key | `-----BEGIN RSA PRIVATE KEY-----...` |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Public bucket paths | `my-bucket/public,my-bucket/assets` |
| `PRIVATE_OBJECT_DIR` | Private bucket directory | `my-bucket/private` |

### Setup Steps

1. Go to Vercel Dashboard → Your API Project → Settings → Environment Variables
2. Add each variable from the table above
3. Select **Production**, **Preview**, and **Development** environments
4. Click **Save**
5. Redeploy the project for changes to take effect

### Quick Setup via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your API project
cd artifacts/api-server
vercel link

# Add environment variables
vercel env add DATABASE_URL production
vercel env add CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NODE_ENV production

# Repeat for preview and development environments
```
