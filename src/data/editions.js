export const editions = [
  ['I', 'gtapi', 'i-gtap', 351, 114],
  ['II', 'iigtap', 'ii-gtap', 351, 114],
  ['III', 'iiigtap', 'iii-gtap', 351, 113],
  ['IV', 'ivgtap', 'iv-gtap', 349, 106],
  ['V', 'vgtap', 'v-gtap', 351, 117],
  ['VI', 'vigtap', 'vi-gtap', 351, 107],
  ['VII', 'viigtap', 'vii-gtap', 349, 100],
  ['VIII', 'viiigtap', 'viii-gtap', 360, 99],
  ['IX', 'ixgtap', 'ix-gtap', 151, 49],
].map(([number, logo, folder, logoWidth, logoHeight]) => ({
  // Dimensões do SVG: reservam o espaço do logo antes de carregar (sem layout shift).
  editionText: `${number} GTAP`, logo: `/assets/logos/${logo}.svg`, logoWidth, logoHeight, folder,
}));
