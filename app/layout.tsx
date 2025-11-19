import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "ワードウルフ with あさひくん",
  description: "楽しいワードウルフゲームアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ワードウルフ",
  },
};

export const viewport: Viewport = {
  themeColor: "#FB923C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {children}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            // Service Worker disabled in development to avoid caching issues
            if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js');
              });
            } else if ('serviceWorker' in navigator) {
              // Unregister existing service workers in development
              navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                  registration.unregister();
                  console.log('Unregistered service worker in development mode');
                }
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
