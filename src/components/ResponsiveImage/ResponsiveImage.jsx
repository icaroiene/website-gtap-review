export default function ResponsiveImage({
  image,
  src,
  alt,
  sizes = '100vw',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  ...props
}) {
  return (
    <picture style={{ display: 'contents' }}>
      {image?.avifSrcSet && <source type="image/avif" srcSet={image.avifSrcSet} sizes={sizes} />}
      <img
        {...props}
        src={image?.src || src}
        srcSet={image?.srcSet}
        sizes={image?.srcSet ? sizes : undefined}
        alt={alt}
        width={width || image?.width}
        height={height || image?.height}
        loading={loading}
        decoding={decoding}
      />
    </picture>
  );
}
