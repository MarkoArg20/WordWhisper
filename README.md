# Word Whisper

A voice-activated English learning app that helps you capture and master vocabulary while reading books. Automatically translates words to Macedonian.

## Features

- 🎤 **Voice capture** — Say a word out loud and the app transcribes it
- ⌨️ **Text input** — Type a word if voice doesn't work
- 💾 **Auto-save** — Words are automatically saved to your personal list
- 🌐 **Auto-translate** — Every word is automatically translated to Macedonian using Google Translate
- 🔍 **Search** — Find words in your list instantly
- 📚 **Word list** — View all your captured words with translations and dates
- ☁️ **Cloud sync** — Access your words across devices
- 🎯 **Spaced repetition** — Practice words through AI conversations (coming soon)

## Prerequisites

Before you start, make sure you have:
- **Node.js** (v18 or higher) — Download from [nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)
- **Git**
- A **Supabase account** (free) — Sign up at [supabase.com](https://supabase.com)
- A **Google Cloud account** (free tier) — Sign up at [console.cloud.google.com](https://console.cloud.google.com)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/MarkoArg20/WordWhisper.git
cd WordWhisper
```

### 2. Install dependencies

```bash
npm install
npm install @google-cloud/translate
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or use an existing one
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon key**
5. In your Supabase dashboard, go to **SQL Editor** and run:

```sql
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  translation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  pronunciation TEXT
);
```

### 4. Set up Google Cloud Translation

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Cloud Translation API** (search for it in the marketplace)
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **Service Account**
6. Fill in name and create
7. Go to **Keys** tab → **Add Key** → **Create new key** → **JSON**
8. Save the downloaded JSON file as `google-credentials.json` in your project root
9. (Optional) Set daily quotas in **APIs & Services** → **Quotas** to stay within free tier

### 5. Create `.env.local` file

In your project root, create a file named `.env.local` and add:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key

**Important:** Add `google-credentials.json` to `.gitignore` to protect your API key.

### 6. Start the development server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## How to Use

1. **Capture a word:**
   - Click the **"Tap to speak"** button and say a word clearly
   - Or type a word in the text input field
2. **Save the word:**
   - Click **"Save this word"** or press Enter
   - The word is automatically translated to Macedonian
3. **View your words:**
   - Scroll down to see all your captured words
   - Each word shows the English term and Macedonian translation
4. **Search words:**
   - Use the search bar to find words in your list
5. **Delete words:**
   - Hover over a word and click the **X** button to remove it

## Tech Stack

- **Frontend** — Next.js, React, TypeScript, Tailwind CSS
- **Backend** — Next.js API Routes
- **Database** — Supabase (PostgreSQL)
- **Speech Recognition** — Web Speech API (browser built-in)
- **Translation** — Google Cloud Translation API
- **Hosting** — Vercel (optional)

## Deployment (Optional)

To deploy to Vercel:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repo
5. Add your environment variables in Vercel's dashboard (same as `.env.local`)
6. Click "Deploy"

## Cost Information

- **Supabase:** Free tier (plenty for personal use)
- **Google Translate:** Free tier (500,000 characters/month)
- **Vercel:** Free tier (optional for deployment)

For your daily usage (capturing a few words), you'll stay well within all free tiers.

## Troubleshooting

**"Invalid API key" error:**
- Make sure your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are from the **same Supabase project**
- Restart `npm run dev` after updating `.env.local`

**Mic not working:**
- Make sure you're using a modern browser (Chrome, Safari, Edge)
- Check that the browser has permission to access your microphone

**Translation not showing:**
- Verify Google Cloud Translation API is enabled
- Check that your `google-credentials.json` is in the project root
- Restart the dev server

**No words showing:**
- Verify the `words` table exists in your Supabase dashboard
- Check that your Supabase credentials are correct

## Future Features

- 🤖 AI-powered explanations for words (etymology, context)
- 💬 Practice conversations using saved words
- 📊 Spaced repetition tracking and statistics
- 🎯 Progress dashboard and learning milestones
- 🔊 Pronunciation guide for each word

## License

MIT

## Support

For issues or questions, open an issue on [GitHub](https://github.com/MarkoArg20/WordWhisper/issues).