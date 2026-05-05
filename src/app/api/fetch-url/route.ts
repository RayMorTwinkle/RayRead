import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'RayRead/1.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: response.status });
    }

    const html = await response.text();
    const text = extractText(html);

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
  }
}

function extractText(html: string): string {
  let content = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  if (!content) {
    content = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  }
  const text = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}
