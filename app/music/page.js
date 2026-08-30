import DesktopLayout from '@/components/DesktopLayout'
import PosterGenerator from './PosterGenerator'

export const metadata = {
  title: 'Poster-Generator',
  description:
    'Album-Poster selbst bauen: Interpret suchen, Cover und Tracklist übernehmen, Format wählen und als PNG oder PDF für den Druck laden.',
}

export default function MusicPage() {
  return (
    <DesktopLayout crumb="Poster-Generator">
      <PosterGenerator />
    </DesktopLayout>
  )
}
