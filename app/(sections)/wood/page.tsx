import type { Metadata } from 'next';
import { Gallery } from '@/components/Gallery';
import { WOOD } from '@/components/galleries';

export const metadata: Metadata = { title: 'Wood' };

export default function WoodPage() {
  return (
    <>
      <h1 className="visually-hidden">Wood</h1>
      <Gallery set={WOOD} />
    </>
  );
}
