import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Experience } from '@/components/Experience';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://lindmark.design'),
  title: { default: 'Lindmark Design', template: '%s · Lindmark Design' },
  description: 'The work of John Lindmark, a Denver-based Product Design Manager.',
  icons: {
    icon: [16, 32, 96].map((size) => ({ url: `/images/favicons/favicon${size}.png`, sizes: `${size}x${size}`, type: 'image/png' })),
    apple: [
      { url: '/images/favicons/favicon120.png' },
      ...[180, 152, 167].map((size) => ({ url: `/images/favicons/favicon${size}.png`, sizes: `${size}x${size}` })),
    ],
  },
};

export const viewport: Viewport = { themeColor: '#000000' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* MyFonts webfont license page-view counter for DIN. */}
        <link rel="stylesheet" href="https://hello.myfonts.net/count/2d7cd4" />
      </head>
      <body>
        <Experience>{children}</Experience>
      </body>
    </html>
  );
}
