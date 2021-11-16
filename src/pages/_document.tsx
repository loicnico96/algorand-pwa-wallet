import Document, { Html, Head, Main, NextScript } from "next/document"

class PWADocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta name="application-name" content="Algorand Wallet" />
          <meta name="apple-mobile-web-app-title" content="Algorand Wallet" />
          <meta name="description" content="Algorand Wallet" />
          <meta name="theme-color" content="#FFFFFF" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/images/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="images/png"
            sizes="48x48"
            href="/images/favicon-48x48.png"
          />
          <link
            rel="icon"
            type="images/png"
            sizes="32x32"
            href="/images/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="images/png"
            sizes="16x16"
            href="/images/favicon-16x16.png"
          />
          <link rel="shortcut icon" href="/images/favicon.ico" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default PWADocument
