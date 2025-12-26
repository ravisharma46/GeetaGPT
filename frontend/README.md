# GeetaGPT Frontend (Vercel Deployment)

This is the Next.js frontend for GeetaGPT, configured for serverless deployment on Vercel.

## Setup for Vercel Deployment

### 1. Create Upstash Vector Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Vector database
3. **Important:** Select dimension `1536` (for OpenAI embeddings)
4. Copy the `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN`

### 2. Get API Keys

- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **OpenRouter API Key**: Get from [OpenRouter](https://openrouter.ai/keys)

### 3. Set Environment Variables

Create a `.env.local` file (for local development):

```bash
cp .env.example .env.local
# Then edit .env.local with your actual keys
```

### 4. Index the Bhagavad Gita PDF

Run this once to upload the PDF content to Upstash Vector:

```bash
npm run index
```

### 5. Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo to Vercel and set these environment variables in the Vercel dashboard:

- `UPSTASH_VECTOR_REST_URL`
- `UPSTASH_VECTOR_REST_TOKEN`
- `OPENAI_API_KEY`
- `OPENROUTER_API_KEY`

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
