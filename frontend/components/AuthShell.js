// Shared shell for the auth pages (login + signup): the wave artwork down the
// left, the "Zot Water" logo top-left, the heading + form centered, and the
// Peter the anteater mascot bottom-right. Pages render the same chrome and only
// own their own fields + submit handler.

const WAVE_PATH =
  "M609.589 5.82227C607.155 45.865 618.532 76.0485 639.179 122.958C659.875 169.979 687.599 229.373 704.728 318.555L705.045 320.209L705.246 321.881C716.773 417.795 711.071 478.141 687.31 534.777C675.999 561.736 661.2 586.38 645.317 611.6C629.06 637.416 611.397 664.25 591.191 699.025C576.584 724.165 567.145 749.365 562 774.459V872.487C576.941 951.413 624.506 1026.99 675.688 1093.69L599.526 1152.13C577.672 1123.65 553.693 1090.2 531.908 1052.91H0V28.9111H513.591C513.13 19.6208 513.158 10.0016 513.766 0L609.589 5.82227Z";

const DARK_STRIPES = [
  "M554.79 765.677C666.875 636.769 799.388 600.838 865.546 602.898C897.837 603.903 923.096 627.943 921.963 656.592C920.83 685.241 893.735 707.65 861.444 706.645C837.777 705.909 739.582 723.108 647.435 829.085C583.868 902.193 537.38 948.776 475.574 977.203C415.602 1004.79 345.427 1012.89 247.499 1024.96C182.662 1032.95 146.931 1062.92 125.646 1093.1C103.102 1125.06 97.2431 1157.19 96.6735 1161.73C93.1053 1190.22 64.1792 1210.75 32.0659 1207.59C-0.0469971 1204.42 -23.1871 1178.76 -19.6192 1150.27C-17.8247 1135.94 -8.31863 1087.33 26.4588 1038.02C62.4961 986.934 126.046 935.116 231.402 922.133C336.761 909.15 383.595 902.575 421.721 885.039C458.012 868.347 490.712 839.373 554.79 765.677Z",
  "M424.781 591.61C536.866 462.702 669.379 426.771 735.537 428.831C767.828 429.836 793.087 453.876 791.954 482.525C790.821 511.174 763.725 533.583 731.435 532.578C707.768 531.841 609.573 549.041 517.426 655.018C453.859 728.126 407.371 774.709 345.564 803.136C285.593 830.719 215.418 838.823 117.49 850.89C52.6526 858.879 16.9221 888.852 -4.36298 919.028C-26.9069 950.989 -32.7661 983.119 -33.3357 987.666C-36.904 1016.16 -65.8301 1036.69 -97.9433 1033.52C-130.056 1030.36 -153.196 1004.69 -149.628 976.202C-147.834 961.874 -138.328 913.262 -103.55 863.957C-67.5132 812.867 -3.96362 761.048 101.393 748.066C206.752 735.083 253.585 728.507 291.712 710.972C328.003 694.28 360.703 665.305 424.781 591.61Z",
  "M368.398 382.246C493.627 233.712 641.443 192.665 714.327 195.005C746.617 196.041 771.846 220.106 770.678 248.753C769.509 277.401 742.385 299.785 710.096 298.748C681.316 297.824 568.016 318.792 462.094 444.426C390.192 529.709 338.566 582.82 270.269 615.217C203.64 646.821 125.479 656.204 14.2105 670.344C-61.2198 679.93 -103.606 716.158 -129.004 753.293C-155.573 792.14 -162.558 831.188 -163.324 837.494C-166.786 865.995 -195.634 886.61 -227.759 883.54C-259.883 880.469 -283.12 854.874 -279.658 826.373C-277.749 810.646 -267.344 755.448 -229.036 699.439C-189.557 641.717 -119.576 582.475 -2.38004 567.581C116.431 552.482 170.702 544.729 215.1 523.669C257.83 503.401 295.831 468.318 368.398 382.246Z",
];

const LIGHT_STRIPES = [
  "M556.79 745.677C668.875 616.769 801.388 580.838 867.546 582.898C899.837 583.903 925.096 607.943 923.963 636.592C922.83 665.241 895.735 687.65 863.444 686.645C839.777 685.909 741.582 703.108 649.435 809.085C585.868 882.193 539.38 928.776 477.574 957.203C417.602 984.786 347.427 992.89 249.499 1004.96C184.662 1012.95 148.931 1042.92 127.646 1073.1C105.102 1105.06 99.2431 1137.19 98.6735 1141.73C95.1053 1170.22 66.1792 1190.75 34.0659 1187.59C1.953 1184.42 -21.1871 1158.76 -17.6192 1130.27C-15.8247 1115.94 -6.31863 1067.33 28.4588 1018.02C64.4961 966.934 128.046 915.116 233.402 902.133C338.761 889.15 385.595 882.575 423.721 865.039C460.012 848.347 492.712 819.373 556.79 745.677Z",
  "M426.781 571.61C538.866 442.702 671.379 406.771 737.537 408.831C769.828 409.836 795.087 433.876 793.954 462.525C792.821 491.174 765.725 513.583 733.435 512.578C709.768 511.841 611.573 529.041 519.426 635.018C455.859 708.126 409.371 754.709 347.564 783.136C287.593 810.719 217.418 818.823 119.49 830.89C54.6526 838.879 18.9221 868.852 -2.36298 899.028C-24.9069 930.989 -30.7661 963.119 -31.3357 967.666C-34.904 996.158 -63.8301 1016.69 -95.9433 1013.52C-128.056 1010.36 -151.196 984.693 -147.628 956.202C-145.834 941.874 -136.328 893.262 -101.55 843.957C-65.5132 792.867 -1.96362 741.048 103.393 728.066C208.752 715.083 255.585 708.507 293.712 690.972C330.003 674.28 362.703 645.305 426.781 571.61Z",
  "M370.398 362.246C495.627 213.712 643.443 172.665 716.327 175.005C748.617 176.041 773.846 200.106 772.678 228.753C771.509 257.401 744.385 279.785 712.096 278.748C683.316 277.824 570.016 298.792 464.094 424.426C392.192 509.709 340.566 562.82 270.269 615.217C205.64 626.821 127.479 656.204 16.2105 650.344C-59.2198 659.93 -101.606 696.158 -127.004 733.293C-153.573 772.14 -160.558 811.188 -161.324 817.494C-164.786 845.995 -193.634 866.61 -225.759 863.54C-257.883 860.469 -281.12 834.874 -277.658 806.373C-275.749 790.646 -265.344 735.448 -227.036 679.439C-189.557 621.717 -117.576 562.475 -0.380035 547.581C118.431 532.482 172.702 524.729 217.1 503.669C259.83 483.401 297.831 448.318 370.398 362.246Z",
];

export default function AuthShell({ title, children }) {
  return (
    <main style={page}>
      {/* Decorative background: wave artwork down the left side */}
      <aside style={waves} aria-hidden="true">
        <svg
          viewBox="0 28.9111 711 1024"
          fill="none"
          preserveAspectRatio="xMinYMax slice"
          style={waveArt}
        >
          <path d={WAVE_PATH} fill="#FFFDF7" />
          <mask
            id="auth-wave-mask"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="711"
            height="1153"
          >
            <path d={WAVE_PATH} fill="#FFFDF7" />
          </mask>
          <g mask="url(#auth-wave-mask)">
            {DARK_STRIPES.map((d) => (
              <path key={d} d={d} fill="#6798C0" />
            ))}
            {LIGHT_STRIPES.map((d) => (
              <path key={d} d={d} fill="#99D6EB" />
            ))}
          </g>
        </svg>
      </aside>

      {/* Logo, top-left over the waves */}
      <svg
        viewBox="0 0 315 73"
        fill="none"
        role="img"
        aria-label="Zot Water"
        style={logo}
      >
        <text fill="#6798C0" style={{ whiteSpace: "pre" }} xmlSpace="preserve" fontFamily="Wittgenstein, serif" fontSize="34" fontWeight="bold" letterSpacing="-0.02em">
          <tspan x="81.3958" y="47.21">Zot Water</tspan>
        </text>
        <path d="M273 11C271.44 20.02 260 28.63 260 37.24C260 45.85 265.824 52 273 52C280.176 52 286 45.85 286 37.24C286 28.63 274.56 20.02 273 11Z" fill="#6798C0" />
        <path d="M273 17C271.8 23.82 263 30.33 263 36.84C263 43.35 267.48 48 273 48C278.52 48 283 43.35 283 36.84C283 30.33 274.2 23.82 273 17Z" fill="#99D6EB" />
        <ellipse cx="3.22639" cy="3.84235" rx="3.22639" ry="3.84235" transform="matrix(0.836572 0.547858 -0.533721 0.845661 271.113 23.7871)" fill="#FFFDF8" />
      </svg>

      {/* Center column: heading + form */}
      <section style={centerColumn}>
        <h1 style={heading}>{title}</h1>
        {children}
      </section>

      {/* Decorative mascot, bottom-right; pointer events pass through */}
      <div style={mascotWrap}>
        <svg viewBox="0 0 266 88" fill="none" aria-hidden="true" style={mascotShadow}>
          <ellipse cx="133" cy="44" rx="133" ry="44" fill="#AFAFAF" fillOpacity="0.69" />
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/petr-water.png"
          alt="Peter the anteater drinking water"
          style={mascotImg}
        />
      </div>
    </main>
  );
}

// Form field: label (with an optional hint) above its input/control.
export function Field({ label, hint, children }) {
  return (
    <label style={field}>
      <span style={fieldLabel}>
        {label}
        {hint && <span style={fieldHint}>{hint}</span>}
      </span>
      {children}
    </label>
  );
}

// Shared form styles, so the login and signup forms stay visually identical.
export const authCard = {
  width: "100%",
  maxWidth: 380,
  display: "grid",
  gap: 16,
  padding: "28px 28px",
  background: "#FFFFFF",
  borderRadius: 16,
  boxShadow: "0 8px 30px rgba(77, 128, 170, 0.16)",
};

export const authInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  fontSize: 15,
  fontFamily: "inherit",
  color: "#23395d",
  background: "#FFFFFF",
  border: "1px solid #cfe0ee",
  borderRadius: 8,
  outline: "none",
};

export const authButton = {
  width: "100%",
  padding: "11px 0",
  fontFamily: "inherit",
  fontSize: 16,
  fontWeight: 700,
  color: "#FFFFFF",
  background: "#4D80AA",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  marginTop: 2,
};

export const authLink = {
  display: "block",
  textAlign: "center",
  fontSize: 14,
  color: "#4D80AA",
  textDecoration: "underline",
};

export const authError = { margin: 0, fontSize: 13.5, color: "#c0392b" };

const page = {
  position: "relative",
  minHeight: "100vh",
  overflowX: "hidden",
  background: "#FCF8EA",
  fontFamily: "Epilogue, -apple-system, Roboto, Helvetica, sans-serif",
  color: "#33434f",
};

const waves = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: "min(48%, 711px)",
  overflow: "hidden",
  pointerEvents: "none",
};

const waveArt = {
  width: "100%",
  height: "100%",
  display: "block",
};

const logo = {
  position: "absolute",
  left: 16,
  top: 12,
  width: "clamp(170px, 19vw, 250px)",
  height: "auto",
  zIndex: 2,
};

const centerColumn = {
  position: "relative",
  zIndex: 1,
  boxSizing: "border-box",
  minHeight: "100vh",
  // Asymmetric padding lifts the heading + form slightly above center and
  // reserves the bottom-right corner for the mascot, so everything fits in
  // the viewport without scrolling.
  padding: "40px 24px 72px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 22,
};

const heading = {
  margin: 0,
  fontFamily: "inherit",
  fontSize: "clamp(28px, 3vw, 40px)",
  fontWeight: 700,
  letterSpacing: "0.01em",
  color: "#6798C0",
  textShadow: "3px 2px 0 #4D80AA",
  textAlign: "center",
};

const field = { display: "grid", gap: 5 };

const fieldLabel = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  fontSize: 14,
  fontWeight: 600,
  color: "#33434f",
};

const fieldHint = { fontSize: 12, fontWeight: 400, color: "#8a97a3" };

const mascotWrap = {
  position: "absolute",
  right: "2%",
  bottom: 0,
  width: "clamp(230px, 30vw, 450px)",
  pointerEvents: "none",
};

const mascotShadow = {
  position: "absolute",
  left: "10%",
  bottom: "2%",
  width: "90%",
  height: "auto",
  zIndex: 0,
};

const mascotImg = {
  position: "relative",
  zIndex: 1,
  display: "block",
  width: "100%",
  height: "auto",
  transform: "scaleX(-1)",
  objectFit: "contain",
};
