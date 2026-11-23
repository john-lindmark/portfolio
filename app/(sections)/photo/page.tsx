import type { Metadata } from 'next';
import { Gallery } from '@/components/Gallery';
import { PARIS } from '@/components/galleries';

export const metadata: Metadata = { title: 'Photo' };

export default function PhotoPage() {
  return (
    <>
      <h1 className="visually-hidden">Photo: Paris</h1>
      <Gallery set={PARIS} />
    </>
  );
}
