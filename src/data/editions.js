export const editions = [
  ['I', 'gtapi', 'i-gtap'],
  ['II', 'iigtap', 'ii-gtap'],
  ['III', 'iiigtap', 'iii-gtap'],
  ['IV', 'ivgtap', 'iv-gtap'],
  ['V', 'vgtap', 'v-gtap'],
  ['VI', 'vigtap', 'vi-gtap'],
  ['VII', 'viigtap', 'vii-gtap'],
  ['VIII', 'viiigtap', 'viii-gtap'],
  ['IX', 'ixgtap', 'ix-gtap'],
].map(([number, logo, folder]) => ({
  editionText: `${number} GTAP`, logo: `/assets/logos/${logo}.svg`, folder,
}));
