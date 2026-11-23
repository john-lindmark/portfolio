import type { Metadata } from 'next';
import { HoldUntilLoaded } from '@/components/HoldUntilLoaded';

export const metadata: Metadata = { title: 'About' };

// Long edge scaled to 1280px and 2560px (never up), as in the galleries.
function photo(name: string, width: number, height: number) {
  const long = Math.max(width, height);
  const srcSet = [1280, 2560]
    .map((size) => `/images/about/${name}-${size}.jpg ${Math.round(width * Math.min(1, size / long))}w`)
    .join(', ');
  return { src: `/images/about/${name}-1280.jpg`, srcSet, width, height };
}

const LINES = [
  'I’m John Lindmark.',
  'I spend my time at work building and leading talent-dense teams to achieve ambitious ends through ambiguity.',
  'When hiring, if your resume or portfolio tells me what I want to hear then I’m more likely than not to reject it. My respect goes to those who build their portfolio for themselves.',
  'I’ve found my best work is done before I understand the rules and usually in a brief, energetic flourish of expression.',
  'I feel like we’re violently tearing ourselves away from our heritage as we race towards the frontier of AI.',
  'I’ve started to cherish quiet, prolonged time in nature.',
];

export default function AboutPage() {
  return (
    <HoldUntilLoaded className="about">
      <h1 className="visually-hidden">About</h1>

      {/* The first photo sits centred in the screen on arrival. */}
      <figure className="about-photo" data-first>
        <img {...photo('IMG_1544', 3130, 2075)} sizes="(max-width: 767px) 66vw, 50vw" alt="" fetchPriority="high" />
      </figure>

      <div className="about-text">
        {LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <figure className="about-photo">
        <img {...photo('IMG_0593', 2296, 1536)} sizes="(max-width: 767px) 66vw, 50vw" alt="" loading="lazy" />
      </figure>
    </HoldUntilLoaded>
  );
}
