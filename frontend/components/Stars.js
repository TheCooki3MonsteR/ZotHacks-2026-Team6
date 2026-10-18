// Star widgets shared by the homepage, the fountain pop-up and the profile page.

const GOLD = "#f6c445";
const EMPTY = "#d7e2ea";

// Read-only stars. `value` can be a decimal: 4.4 fills 88% of the row.
export function Stars({ value, size = 16 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span
      role="img"
      aria-label={`${v} out of 5 stars`}
      style={{
        position: "relative",
        display: "inline-block",
        color: EMPTY,
        letterSpacing: 1,
        lineHeight: 1,
        fontSize: size,
        whiteSpace: "nowrap",
      }}
    >
      ★★★★★
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${(v / 5) * 100}%`,
          overflow: "hidden",
          whiteSpace: "nowrap",
          color: GOLD,
        }}
      >
        ★★★★★
      </span>
    </span>
  );
}

// Click-to-choose 1-5 stars (a radio group, so it also works with the keyboard and screen readers).
export function StarPicker({ value, onChange, size = 28 }) {
  return (
    <div role="radiogroup" aria-label="Star rating" style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          onClick={() => onChange(n)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontSize: size,
            lineHeight: 1,
            cursor: "pointer",
            color: n <= value ? GOLD : EMPTY,
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
