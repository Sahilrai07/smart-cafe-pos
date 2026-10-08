import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { DEFAULT_HERO_LAYOUT, HeroLayoutConfig } from '@/lib/heroLayout';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'config', 'heroLayout.json');

export async function GET() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (error) {
    // If not found or error, return default layout
    return NextResponse.json(DEFAULT_HERO_LAYOUT);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: HeroLayoutConfig = await req.json();

    // Basic validation
    if (!body || !body.heroText || !body.card1 || !body.card2 || !body.card3) {
      return NextResponse.json({ error: 'Invalid layout configuration' }, { status: 400 });
    }

    const dir = path.dirname(CONFIG_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8');

    return NextResponse.json({ success: true, layout: body });
  } catch (error) {
    console.error('Failed to save hero layout:', error);
    return NextResponse.json(
      { error: 'Failed to write layout configuration' },
      { status: 500 }
    );
  }
}
