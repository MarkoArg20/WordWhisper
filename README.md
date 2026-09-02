# WordWhisper

A voice-activated English learning app that helps you capture and master vocabulary while reading books.

## Features

- 🎤 **Voice capture** — Say a word out loud and the app transcribes it
- 💾 **Auto-save** — Words are automatically saved to your personal list
- 📚 **Word list** — View all the words you've learned
- 🔄 **Spaced repetition** — Practice words through AI conversations (coming soon)
- ☁️ **Cloud sync** — Access your words across devices

## Prerequisites

Before you start, make sure you have:
- **Node.js** (v18 or higher) — Download from [nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)
- **Git**
- A **Supabase account** (free) — Sign up at [supabase.com](https://supabase.com)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/MarkoArg20/WordWhisper.git
cd WordWhisper
```

### 2. Install dependencies

```bash
npm install
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
  created_at TIMESTAMP DEFAULT NOW(),
  pronunciation TEXT
);
```

### 4. Create `.env.local` file

In your project root, create a file named `.env.local` and add:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here


Replace the values with your actual Supabase URL and anon key.

### 5. Start the development server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## How to Use

1. **Click the mic button** — "Click to say a word"
2. **Say a word clearly** — The app will transcribe it
3. **Confirm the word** — Click "Save this word"
4. **View your words** — Scroll down to see your complete word list
5. **Delete words** — Click the ✕ button to remove a word

## Tech Stack

- **Frontend** — Next.js, React, TypeScript, Tailwind CSS
- **Backend** — Next.js API Routes
- **Database** — Supabase (PostgreSQL)
- **Speech Recognition** — Web Speech API (browser built-in)
- **Hosting** — Vercel (optional)

## Deployment (Optional)

To deploy to Vercel:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repo
5. Add your `.env.local` variables in Vercel's dashboard
6. Click "Deploy"

## Troubleshooting

**"Invalid API key" error:**
- Make sure your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are from the **same Supabase project**
- Restart `npm run dev` after updating `.env.local`

**Mic not working:**
- Make sure you're using a modern browser (Chrome, Safari, Edge)
- Check that the browser has permission to access your microphone

**No words showing:**
- Verify the `words` table exists in your Supabase dashboard
- Check that your anon key is correct

## Future Features

- 🤖 AI-powered explanations for words
- 💬 Practice conversations using saved words
- 📊 Spaced repetition tracking
- 🎯 Progress dashboard

## License

MIT

## Support

For issues or questions, open an issue on [GitHub](https://github.com/MarkoArg20/WordWhisper/issues).
