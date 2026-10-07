import { editions } from '../src/data/editions';
export const dynamic = 'force-static';
export default function sitemap() {
  return ['', 'galeria', 'open-solucoes-tributarias', ...editions.map(({ editionText }) => encodeURIComponent(editionText))]
    .map((path) => ({ url: `https://gtap.com.br/${path ? `${path}/` : ''}` }));
}
