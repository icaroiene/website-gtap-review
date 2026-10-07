import manifest from './generated-media.json';

export function getMedia(src) {
  return manifest[src];
}

export function withMedia(items, field = 'mediaUrl') {
  return items.map((item) => ({ ...item, image: getMedia(item[field]) }));
}
