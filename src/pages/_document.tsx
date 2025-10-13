import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="Browse and inquire about dental chairs and equipment" />
        <meta name="theme-color" content="#0284c7" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 