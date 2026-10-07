import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson 3 — Which Direction Should the Weight Move?',
  description: 'An interactive lesson on gradients, loss slopes, and gradient descent direction.',
  openGraph: { title: 'Lesson 3 — Which Direction Should the Weight Move?', description: 'Use the gradient to find the direction of lower loss.', images: [] },
  twitter: { card: 'summary_large_image', title: 'Lesson 3 — Which Direction Should the Weight Move?', description: 'Use the gradient to find the direction of lower loss.', images: [] },
};

export default function LessonThreeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
