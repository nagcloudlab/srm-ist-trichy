import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 4 — How Far Should the Weight Move?',
  description: 'An interactive lesson on learning rates, gradient-descent updates, and overshooting.',
  openGraph: { title: 'Lesson 4 — How Far Should the Weight Move?', description: 'Use the learning rate to control gradient-descent step size.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 4 — How Far Should the Weight Move?', description: 'Use the learning rate to control gradient-descent step size.', images: [] },
};

export default function LessonFourLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
