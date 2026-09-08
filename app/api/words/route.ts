import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { Translate } from '@google-cloud/translate/build/src/v2';

const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

async function translateToMacedonian(word: string): Promise<string> {
  try {
    const [translations] = await translate.translate(word, 'mk');
    return Array.isArray(translations) ? translations[0] : translations;
  } catch (err) {
    console.error('Translation error:', err);
    return word;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { word } = await req.json();

    if (!word || word.trim() === '') {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    // Translate to Macedonian
    const translation = await translateToMacedonian(word.trim());

    const { data, error } = await supabase
      .from('words')
      .insert([{ word: word.trim(), translation }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}