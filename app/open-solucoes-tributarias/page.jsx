import { OpenPage } from '../../src/views/open/openPage';
import data from '../../public/api/landing_page.json';
import { sharedOpenGraph } from '../../src/data/metadata';
import { withMedia } from '../../src/data/media';

export const metadata = { title: 'Open Soluções Tributárias | GTAP', alternates: { canonical: '/open-solucoes-tributarias/' }, openGraph: { ...sharedOpenGraph, url: '/open-solucoes-tributarias/' } };
export default function Open() {
  return <OpenPage data={withMedia(data)} />;
}
