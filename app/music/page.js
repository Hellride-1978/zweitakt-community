import DesktopLayout from '@/components/DesktopLayout'
import PosterGenerator from './PosterGenerator'

export const metadata = {
  title: 'Poster-Generator',
  description:
    'Album-Poster selbst bauen: Interpret suchen, Cover und Tracklist übernehmen, Format wählen und als PNG oder PDF für den Druck laden.',
  // Testphase: Die Seite ist über die URL erreichbar, soll aber noch nicht in
  // Suchmaschinen auftauchen. Zum Live-Gang entfernen und /music wieder in
  // app/sitemap.js aufnehmen.
  robots: { index: false, follow: false },
}

export default function MusicPage() {
  return (
    <DesktopLayout crumb="Poster-Generator">
      <PosterGenerator />
    </DesktopLayout>
  )
}
