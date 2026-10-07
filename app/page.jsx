import { LandingPage } from '../src/views/landingPage/LandingPage';
import data from '../public/api/landing_page.json';
import { sharedOpenGraph } from '../src/data/metadata';
import { withMedia, getMedia } from '../src/data/media';
import video from '../src/data/generated-video.json';

export const metadata = { alternates: { canonical: '/' }, openGraph: { ...sharedOpenGraph, url: '/' } };
export default function Home() {
  const background = getMedia('src/assets/bgsection.webp');
  const backgroundAvif = background.avifSrcSet.split(', ').at(-1).split(' ')[0];
  const prepared = withMedia(data).map((item) => item.type === 6 && video.src ? { ...item, mediaUrl: video.src } : item);
  return <><link rel="preload" as="image" href={backgroundAvif} type="image/avif" fetchPriority="high" media="(max-width: 768px)" /><LandingPage data={prepared} poster={getMedia('/preloadBanner.webp')} /></>;
}
