import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 2 — How Wrong Is the Prediction?',
  description: 'An interactive lesson on prediction error, squared error, and mean squared error.',
  openGraph: {
    title: 'Lesson 2 — How Wrong Is the Prediction?',
    description: 'Learn how loss turns many prediction mistakes into one useful score.',
    images: [],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lesson 2 — How Wrong Is the Prediction?',
    description: 'Learn how loss turns many prediction mistakes into one useful score.',
    images: [],
  },
};

export default function LessonTwoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
