export type CourseLesson = {
  number: string;
  title: string;
  module: 'Foundation' | 'Networks' | 'Classification';
  status: 'available' | 'planned';
  href?: string;
};

export const courseLessons: CourseLesson[] = [
  { number: '01', title: 'What Is a Neuron?', module: 'Foundation', status: 'available', href: '/#lesson-01/slide-1' },
  { number: '02', title: 'How Wrong Is the Prediction?', module: 'Foundation', status: 'available', href: '/lesson-02#lesson-02/slide-1' },
  { number: '03', title: 'Which Direction Should the Weight Move?', module: 'Foundation', status: 'available', href: '/lesson-03#lesson-03/slide-1' },
  { number: '04', title: 'How Far Should the Weight Move?', module: 'Foundation', status: 'available', href: '/lesson-04#lesson-04/slide-1' },
  { number: '05', title: 'Make the Neuron Learn Repeatedly', module: 'Foundation', status: 'available', href: '/lesson-05#lesson-05/slide-1' },
  { number: '06', title: 'Calculate the Gradient Directly', module: 'Foundation', status: 'available', href: '/lesson-06#lesson-06/slide-1' },
  { number: '07', title: 'Learn Both Weight and Bias', module: 'Foundation', status: 'available', href: '/lesson-07#lesson-07/slide-1' },
  { number: '08', title: 'A Neuron with Multiple Inputs', module: 'Networks', status: 'available', href: '/lesson-08#lesson-08/slide-1' },
  { number: '09', title: 'Why One Neuron Is Not Enough', module: 'Networks', status: 'available', href: '/lesson-09#lesson-09/slide-1' },
  { number: '10', title: 'Your First Hidden Layer', module: 'Networks', status: 'available', href: '/lesson-10#lesson-10/slide-1' },
  { number: '11', title: 'Backpropagation', module: 'Networks', status: 'available', href: '/lesson-11#lesson-11/slide-1' },
  { number: '12', title: 'Sigmoid and BCE', module: 'Classification', status: 'available', href: '/lesson-12#lesson-12/slide-1' },
  { number: '13', title: 'Build a Classifier', module: 'Classification', status: 'available', href: '/lesson-13#lesson-13/slide-1' },
  { number: '14', title: 'Introduction to PyTorch', module: 'Classification', status: 'available', href: '/lesson-14#lesson-14/slide-1' },
];
