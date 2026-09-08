import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// SM-2 Algorithm implementation
function calculateNextReview(
  easeFactor: number,
  interval: number,
  quality: number // 0=again, 1=hard, 2=easy
): { newEaseFactor: number; newInterval: number } {
  let newEaseFactor = easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  let newInterval: number;
  if (quality < 2) {
    newInterval = 1;
  } else if (interval === 1) {
    newInterval = 3;
  } else {
    newInterval = Math.round(interval * newEaseFactor);
  }

  return { newEaseFactor, newInterval };
}

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('words')
      .select('*')
      .lte('next_review_date', new Date().toISOString())
      .order('next_review_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, quality } = await req.json();

    if (!id || quality === undefined) {
      return NextResponse.json({ error: 'ID and quality are required' }, { status: 400 });
    }

    // Get current word data
    const { data: wordData, error: fetchError } = await supabase
      .from('words')
      .select('ease_factor, interval_days, review_count')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Calculate next review using SM-2
    const { newEaseFactor, newInterval } = calculateNextReview(
      wordData.ease_factor || 2.5,
      wordData.interval_days || 1,
      quality
    );

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Update word
    const { error: updateError } = await supabase
      .from('words')
      .update({
        ease_factor: newEaseFactor,
        interval_days: newInterval,
        next_review_date: nextReviewDate.toISOString(),
        review_count: (wordData.review_count || 0) + 1,
        last_reviewed: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}