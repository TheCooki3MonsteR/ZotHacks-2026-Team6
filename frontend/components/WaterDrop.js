// Reusable water-droplet icon (transparent SVG asset).
// Used everywhere decorative emojis previously appeared.
export default function WaterDrop({ height = 20, alt = "", style, ...rest }) {
  return (
    <img
      src="/images/water-drop.svg"
      alt={alt}
      width={Math.round((height * 3) / 4)}
      height={height}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
      {...rest}
    />
  );
}
