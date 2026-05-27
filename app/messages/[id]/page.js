import ThreadClient from './ThreadClient'

export default async function ThreadPage({ params }) {
  const { id } = await params
  return <ThreadClient id={id} />
}
