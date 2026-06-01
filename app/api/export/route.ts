import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  ShadingType,
} from 'docx'

// Template types
type ResumeTemplate = 'modern' | 'professional' | 'simple' | 'creative' | 'elegant'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single()
  if (!profile?.is_pro) return NextResponse.json({ error: 'Pro required' }, { status: 403 })

  const { text, template = 'modern' } = await req.json()
  const lines = (text as string).split('\n')

  // Parse resume into sections
  const sections: { heading?: string; content: string[] }[] = []
  let currentSection: { heading?: string; content: string[] } = { content: [] }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    const isHeading =
      trimmed.length > 0 &&
      trimmed.length < 60 &&
      (trimmed === trimmed.toUpperCase() || /^(Experience|Education|Skills|Projects|Summary|Objective|Certifications|Achievements|Awards|Volunteer|References)/i.test(trimmed))

    if (isHeading) {
      if (currentSection.heading || currentSection.content.length > 0) {
        sections.push(currentSection)
      }
      currentSection = { heading: trimmed, content: [] }
    } else {
      currentSection.content.push(line)
    }
  })
  if (currentSection.heading || currentSection.content.length > 0) {
    sections.push(currentSection)
  }

  // Generate document based on template
  const children: Paragraph[] = []

  if (template === 'modern') {
    // Modern template: bold headings, spacing, accent color
    sections.forEach((section) => {
      if (section.heading) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: section.heading,
                bold: true,
                size: 26,
                color: '2D5A99', // Blue accent
              }),
            ],
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: '2D5A99',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          })
        )
      }
      section.content.forEach((line) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22,
              }),
            ],
            spacing: { line: 276 },
          })
        )
      })
    })
  } else if (template === 'professional') {
    // Professional template: all caps headings, strict formatting
    sections.forEach((section) => {
      if (section.heading) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: section.heading.toUpperCase(),
                bold: true,
                size: 24,
                color: '000000',
              }),
            ],
            spacing: { before: 240, after: 80 },
          })
        )
      }
      section.content.forEach((line) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22,
              }),
            ],
            spacing: { line: 312 },
          })
        )
      })
    })
  } else if (template === 'creative') {
    // Creative template: orange accents, unique borders
    sections.forEach((section) => {
      if (section.heading) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: section.heading,
                bold: true,
                italics: true,
                size: 26,
                color: 'D4622A', // Orange accent
              }),
            ],
            spacing: { before: 200, after: 100 },
            shading: {
              type: ShadingType.SOLID,
              color: 'FFF3E0',
            },
          })
        )
      }
      section.content.forEach((line) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22,
              }),
            ],
            spacing: { line: 276 },
          })
        )
      })
    })
  } else if (template === 'elegant') {
    // Elegant template: serif feel, subtle colors
    sections.forEach((section) => {
      if (section.heading) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: section.heading,
                bold: true,
                size: 26,
                color: '4A148C', // Purple accent
              }),
            ],
            spacing: { before: 240, after: 120 },
            border: {
              left: {
                color: '4A148C',
                space: 4,
                style: BorderStyle.DOUBLE,
                size: 12,
              },
            },
            indent: { left: 100 },
          })
        )
      }
      section.content.forEach((line) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22,
              }),
            ],
            spacing: { line: 360, before: 60 },
            indent: { left: 100 },
          })
        )
      })
    })
  } else {
    // Simple template: minimal, clean
    sections.forEach((section) => {
      if (section.heading) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: section.heading,
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 180, after: 60 },
          })
        )
      }
      section.content.forEach((line) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22,
              }),
            ],
          })
        )
      })
    })
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="tailored-resume-${template}.docx"`,
    },
  })
}
