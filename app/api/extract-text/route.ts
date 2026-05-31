import { NextRequest, NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()

    if (!result.text || result.text.length < 50) {
      return NextResponse.json({ error: 'Could not extract enough text' }, { status: 400 })
    }

    return NextResponse.json({ text: result.text })
  } catch (err) {
    console.error('Extract text error:', err)
    return NextResponse.json({ error: 'Failed to extract text' }, { status: 500 })
  }
}
