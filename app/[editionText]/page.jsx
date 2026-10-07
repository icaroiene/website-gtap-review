import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { notFound } from 'next/navigation';
import { editions } from '../../src/data/editions';
import { GaleriaEdition } from '../../src/views/galeria/galeriaEdition/GaleriaEdition';
import { sharedOpenGraph } from '../../src/data/metadata';

export const dynamicParams = false;
export function generateStaticParams() {
  return editions.map(({ editionText }) => ({ editionText }));
}
export async function generateMetadata({ params }) {
  const { editionText: encodedEdition } = await params;
  const editionText = decodeURIComponent(encodedEdition);
  const path = `/${encodeURIComponent(editionText)}/`;
  return { title: `${editionText} — Galeria | GTAP`, alternates: { canonical: path }, openGraph: { ...sharedOpenGraph, url: path } };
}
export default async function Edition({ params }) {
  const { editionText: encodedEdition } = await params;
  const editionText = decodeURIComponent(encodedEdition);
  const edition = editions.find((item) => item.editionText === editionText);
  if (!edition) notFound();
  const images = JSON.parse(await readFile(join(process.cwd(), 'public/api/galerias', `${edition.folder}.json`), 'utf8'));
  return <GaleriaEdition editionText={editionText} logo={edition.logo} images={images} />;
}
