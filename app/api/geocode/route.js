export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  if (!q?.trim()) return Response.json([], { status: 200 })

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=de,at,ch&limit=5&accept-language=de&addressdetails=1`,
    {
      headers: { 'User-Agent': 'zweitakthoden/1.0' },
      next: { revalidate: 300 },
    }
  )
  if (!res.ok) return Response.json([], { status: 200 })
  const data = await res.json()
  return Response.json(data)
}
