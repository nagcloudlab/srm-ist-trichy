import { Bridge, Cards, Cover, Recap, Steps, Table, Timeline } from '../components/kit';
import { PixelDigit, Player } from '../components/art';
import type { Part } from '../types';

export const openPart: Part = {
  id: 'day',
  code: 'D1',
  label: 'Open',
  title: 'Day 1 overview',
  when: 'Start',
  minutes: 10,
  slides: [
    {
      id: 'day-cover',
      section: 'Welcome',
      kicker: 'GAN Mastery · Day 1',
      title: 'From an idea to your first GAN',
      layout: 'cover',
      notes: {
        time: '1 min',
        say: 'Welcome everyone. Today is about one idea — two networks that learn by competing — and by the end of the day you will have trained one yourself.',
        ask: 'Who has seen an AI-generated face or image this week?',
      },
      render: () => (
        <Cover
          eyebrow="GAN Mastery · Day 1 of 4"
          title="From an idea to your first GAN"
          subtitle="Generative AI → the adversarial idea → neural network building blocks → GANs you build and train today, from the number 7 to handwritten digits."
          meta={<><span className="pill tone-blue">5 sessions</span><span className="pill tone-yellow">+ activation companion</span><span className="pill tone-mint">live labs</span></>}
          art={
            <div className="day-cover-art">
              <PixelDigit digit="7" noise={1} seed={3} px={150} label="Random noise" />
              <span className="day-cover-arrow">→</span>
              <Player who="G" size={110} label={false} />
              <span className="day-cover-arrow">→</span>
              <PixelDigit digit="7" seed={3} wobble={0.04} px={150} label="A generated 7" />
            </div>
          }
        />
      ),
    },
    {
      id: 'day-promise',
      section: 'Welcome',
      kicker: 'The Day 1 promise',
      title: 'You will build a working GAN before you leave today',
      lede: 'Everything this morning and afternoon exists to make that one build feel obvious.',
      notes: {
        time: '2 min',
        say: 'State the promise plainly. The morning gives the idea; the afternoon gives the parts, the first build, and then image GANs. Nothing is magic — every piece will be explained before it is used.',
        ask: 'What would you need to know to build a network that creates something rather than classifies it?',
      },
      render: () => (
        <>
          <Steps items={[
            { title: 'See the landscape', body: 'Where GANs sit among VAEs, Transformers and Diffusion models.', tone: 'blue' },
            { title: 'Understand the game', body: 'A forger (Generator) and a detective (Discriminator) improve by competing.', tone: 'coral' },
            { title: 'Learn the parts', body: 'Neuron → ReLU → hidden layers → backprop → Sigmoid + BCE → PyTorch.', tone: 'violet' },
            { title: 'Build and train', body: 'A Generator that learns 7 without being told — then GANs that draw handwritten digits.', tone: 'mint' },
          ]} />
        </>
      ),
    },
    {
      id: 'day-agenda',
      section: 'Agenda',
      kicker: 'Today at a glance',
      title: 'Five sessions, one storyline',
      notes: {
        time: '2 min',
        say: 'Walk the schedule. Each session ends with an unanswered question that the next session answers.',
        ask: 'Which session are you most curious about — and which feels most unfamiliar?',
      },
      render: () => (
        <Table
          headers={['Session', 'What you will do', 'Ends with']}
          rows={[
            ['S1 · The World of Generative AI', 'See the big picture — what, why and how', 'Why GANs?'],
            ['S2 · What Is a GAN?', 'Forger vs detective, the training loop, BCE, .detach()', 'What is inside G and D?'],
            ['S3 · Neural Networks Fast-Track', 'Neuron → layers → backprop → PyTorch', 'Can we build G and D now?'],
            ['S4 · Build Your First GAN', 'Generate the number 7 from noise', 'How do we scale to images?'],
            ['S5 · GANs for Images', 'MNIST GAN, convolutions, DCGAN, when GANs break', 'Why is BCE the real problem?'],
            ['A · Activations in GANs', 'ReLU, Leaky ReLU, Tanh, Sigmoid — where and why', 'Ready for Day 2'],
          ]}
          highlight={[3]}
        />
      ),
    },
    {
      id: 'day-how',
      section: 'Agenda',
      kicker: 'How we will work',
      title: 'Predict first, then see — every slide asks something of you',
      notes: {
        time: '2 min',
        say: 'Explain the rhythm: predictions, reveals, live labs. Commit to an answer before the reveal — being wrong first is how this sticks. Code lives in the notebooks in the labs folder.',
        ask: 'Can everyone open the labs folder and see the notebooks?',
      },
      render: () => (
        <Cards cols={4} items={[
          { tag: 'Predict', title: 'Commit before reveal', body: 'Slides marked PRESS R hide the answer until you have guessed.', tone: 'yellow', icon: '?' },
          { tag: 'Live', title: 'Move the sliders', body: 'Labs marked LIVE compute in the browser — including a real GAN.', tone: 'coral', icon: '◉' },
          { tag: 'Trace', title: 'Follow one number', body: 'Every formula is walked through with a concrete value first.', tone: 'blue', icon: '→' },
          { tag: 'Build', title: 'Run the notebooks', body: 'The labs folder has the runnable code for every session.', tone: 'mint', icon: '▶' },
        ]} />
      ),
    },
  ],
};

export const wrapPart: Part = {
  id: 'wrap',
  code: 'W',
  label: 'Wrap',
  title: 'Day 1 wrap-up',
  when: 'End of day',
  minutes: 10,
  slides: [
    {
      id: 'wrap-day',
      section: 'Day summary',
      kicker: 'What you learned today',
      title: 'One idea, built from the ground up',
      notes: {
        time: '3 min',
        say: 'Rebuild the day as a chain. Each session made the next one possible.',
        ask: 'If you had to explain a GAN to a colleague in two sentences, what would you say?',
      },
      render: () => (
        <Timeline items={[
          { when: 'S1', title: 'The landscape', body: 'VAE, GAN, Transformer, Diffusion — GANs are fast and sharp but tricky to train.', tone: 'blue' },
          { when: 'S2', title: 'The adversarial game', body: 'G turns noise into fakes, D judges real vs fake; BCE, two steps, .detach().', tone: 'coral' },
          { when: 'S3', title: 'The building blocks', body: 'Neuron, ReLU, hidden layers, backprop, Sigmoid + BCE, PyTorch autograd.', tone: 'violet' },
          { when: 'S4', title: 'The build', body: 'A Generator learned to output ≈ 7 using only feedback from the Discriminator.', tone: 'mint' },
          { when: 'S5', title: 'Images', body: 'MNIST GAN, convolutions, DCGAN — and how GANs break (mode collapse, a too-strong D).', tone: 'coral' },
          { when: 'A', title: 'The activation recipe', body: 'G: ReLU then Tanh. D: LeakyReLU then a logit with BCEWithLogitsLoss.', tone: 'yellow' },
        ]} />
      ),
    },
    {
      id: 'wrap-check',
      section: 'Day summary',
      kicker: 'Exit ticket',
      title: 'Five sentences you should now be able to finish',
      notes: {
        time: '3 min',
        say: 'Ask learners to complete each sentence out loud or on paper. Listen for confusion between what G sees and what D sees.',
        ask: 'Which of these sentences was hardest to finish?',
      },
      render: () => (
        <Recap items={[
          <>A GAN trains two networks: the Generator <b>creates</b>, the Discriminator <b>judges</b>.</>,
          <>The Generator <b>never sees real data</b> — it learns only through D's gradients.</>,
          <>Step A trains D on real (→1) and detached fakes (→0); Step B trains G to make D say 1.</>,
          <>At equilibrium D outputs ≈ <b>0.5</b>; after training, <b>throw D away</b> — noise → G generates.</>,
          <>For images, <b>convolutions</b> (DCGAN) beat flattened pixels — and diverse samples matter as much as sharp ones.</>,
        ]} />
      ),
    },
    {
      id: 'wrap-tomorrow',
      section: 'Tomorrow',
      kicker: 'Day 2 preview',
      title: 'Tomorrow we fix the loss and take control',
      notes: {
        time: '2 min',
        say: 'Today’s tricks — label smoothing, balanced learning rates — were band-aids. Tomorrow fixes the loss itself and adds control over what gets generated.',
        ask: 'Which of today’s failure modes would you most like a better loss to fix?',
      },
      render: () => (
        <Cards cols={4} items={[
          { tag: 'L07', title: 'Why BCE fails', body: 'Why a near-perfect D gives G a weak, useless signal.', tone: 'coral' },
          { tag: 'L08–L09', title: 'WGAN & WGAN-GP', body: 'A critic and a distance that tracks image quality.', tone: 'blue' },
          { tag: 'L10', title: 'Conditional GAN', body: '“Generate a 7” — the label controls what.', tone: 'mint' },
          { tag: 'L11', title: 'Controllable generation', body: 'Latent interpolation, arithmetic, truncation.', tone: 'violet' },
        ]} />
      ),
    },
    {
      id: 'wrap-bridge',
      section: 'Tomorrow',
      kicker: 'See you tomorrow',
      title: 'You built GANs today. Tomorrow you make them stable and controllable.',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'Close on the achievement. Remind them to rerun the Session 4 and 5 notebooks tonight with different seeds.',
        ask: 'What surprised you most today?',
      },
      render: () => <Bridge done="Day 1 · complete" question="You built GANs today. Tomorrow you make them stable and controllable." next="Day 2 · Better loss, stable training, control" />,
    },
  ],
};
