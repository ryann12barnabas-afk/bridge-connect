/** Converts a normal Spotify share link into the embeddable player URL. */
export function getSpotifyEmbedUrl(url: string): string | null {
  try {
    const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/)
    if (!match) return null
    const [, type, id] = match
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
  } catch {
    return null
  }
}
