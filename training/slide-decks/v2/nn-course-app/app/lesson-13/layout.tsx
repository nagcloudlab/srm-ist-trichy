import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 13 — Build a Classifier',
  description: 'An interactive visual lesson on build a classifier.',
  openGraph: { title: 'Lesson 13 — Build a Classifier', description: 'An interactive visual lesson on build a classifier.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 13 — Build a Classifier', description: 'An interactive visual lesson on build a classifier.', images: [] },
};

export default function Lesson13Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
