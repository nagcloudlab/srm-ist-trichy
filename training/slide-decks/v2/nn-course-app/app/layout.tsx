import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gan-deep-lesson-1-neuron.nagtraininglab.chatgpt.site'),
  title: 'Lesson 1 — What Is a Neuron?',
  description: 'An interactive beginner lesson on neurons, weights, bias, and the forward pass.',
  openGraph: {
    title: 'Lesson 1 — What Is a Neuron?',
    description: 'The smallest building block of every neural network.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lesson 1 — What Is a Neuron?',
    description: 'The smallest building block of every neural network.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
