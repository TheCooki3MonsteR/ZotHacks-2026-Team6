export const metadata = {
  title: "UCI Water Station Test",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* One font for the whole site: buttons, inputs and text areas don't
            inherit the page font by default, so tell them to. */}
        <style>{"button,input,textarea,select,body .leaflet-container,body .leaflet-bar a{font-family:inherit}"}</style>
        {/* Mobile: keep 16px form controls (prevents iOS zoom-on-focus) and
            make sure padded forms/cards never overflow the viewport width. */}
        <style>{`
          @media (max-width: 768px) {
            input, textarea, select { font-size: 16px !important; }
            form { box-sizing: border-box; }
          }
        `}</style>
      </head>
      <body
        style={{
          margin: 0,
          maxWidth: "100%",
          overflowX: "hidden",
          fontFamily: "Epilogue, -apple-system, Roboto, Helvetica, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
