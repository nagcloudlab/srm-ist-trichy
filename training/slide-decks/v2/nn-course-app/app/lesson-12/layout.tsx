import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 12 — Sigmoid and BCE',
  description: 'An interactive visual lesson on sigmoid and bce.',
  openGraph: { title: 'Lesson 12 — Sigmoid and BCE', description: 'An interactive visual lesson on sigmoid and bce.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 12 — Sigmoid and BCE', description: 'An interactive visual lesson on sigmoid and bce.', images: [] },
};

export default function Lesson12Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
