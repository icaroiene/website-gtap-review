const paths = {
  'calendar': 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z',
  'location-dot': 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  'camera': 'M3 7h4l2-3h6l2 3h4v14H3ZM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  'chevron-left': 'm15 5-7 7 7 7',
  'chevron-right': 'm9 5 7 7-7 7',
  'user': 'M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 22v-4a8 8 0 0 1 16 0v4',
  'instagram': 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM18 6h.01',
  'linkedin-in': 'M4 9v12M4 3v.01M10 21V9m0 5c0-6 10-6 10 0v7',
  'youtube': 'M5 4h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm5 4 6 4-6 4Z',
};

export function Icon({ name, style, ...props }) {
  return <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }} aria-hidden="true" focusable="false" {...props}><path d={paths[name]} /></svg>;
}
