import styles from "./styles.css?url";

export const Document: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <html lang="nb">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* Starterens ikoner til appen har fått egen logo (issue #41). */}
      <link rel="icon" type="image/svg+xml" href="/favicon-light.svg" media="(prefers-color-scheme: light)" />
      <link rel="icon" type="image/svg+xml" href="/favicon-dark.svg" media="(prefers-color-scheme: dark)" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400..700&display=swap"
        precedence="first"
      />
      <link rel="stylesheet" href={styles} precedence="default" />
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body>
      {children}
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);
