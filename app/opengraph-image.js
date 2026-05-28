import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Zweitakthoden — Die Community für Zweitakt-Schrauber'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const font = await readFile(join(process.cwd(), 'public/fonts/Boogaloo-Regular.ttf'))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1a1108',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 80px',
          position: 'relative',
        }}
      >
        {/* Accent bar top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: '#9bc3d6', display: 'flex' }} />

        {/* Label */}
        <div style={{
          fontFamily: 'monospace',
          fontSize: 14,
          letterSpacing: 6,
          textTransform: 'uppercase',
          color: '#9bc3d6',
          marginBottom: 32,
          display: 'flex',
        }}>
          zweitakthoden.de
        </div>

        {/* Stacked title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.82 }}>
          <div style={{ fontFamily: 'Boogaloo', fontSize: 196, color: '#d2e6ee', display: 'flex', lineHeight: 0.82 }}>
            ZWEITAKT
          </div>
          <div style={{ fontFamily: 'Boogaloo', fontSize: 168, color: '#afd2e1', display: 'flex', lineHeight: 0.82 }}>
            HODEN
          </div>
          <div style={{ fontFamily: 'Boogaloo', fontSize: 132, color: '#9bc3d6', display: 'flex', lineHeight: 0.82 }}>
            COMMUNITY.
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: 'monospace',
          fontSize: 18,
          color: '#5e5248',
          marginTop: 40,
          letterSpacing: 2,
          display: 'flex',
        }}>
          Die Community für Zweitakt-Schrauber
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Boogaloo', data: font, style: 'normal', weight: 400 }],
    }
  )
}
