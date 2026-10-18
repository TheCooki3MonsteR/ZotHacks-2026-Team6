export const metadata = {
  title: "ZotWater",
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
      </head>
      <body style={{ margin: 0, fontFamily: "Epilogue, -apple-system, Roboto, Helvetica, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
