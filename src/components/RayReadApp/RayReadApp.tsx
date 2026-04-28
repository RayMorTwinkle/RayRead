'use client';

import { Cursor, Footer } from 'animal-island-ui';
import { useAutoPlay } from '@/hooks/useAutoPlay';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { ControlPanel } from '@/components/ControlPanel/ControlPanel';
import { ReaderBoard } from '@/components/ReaderBoard/ReaderBoard';

export function RayReadApp() {
  useAutoPlay();
  useKeyboardNavigation();

  return (
    <Cursor>
      <main className="relative flex h-screen w-full items-center justify-center overflow-hidden p-4 text-bark sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-80">
          <Footer type="sea" />
        </div>
        <section className="relative z-10 flex h-[85vh] w-full max-w-6xl flex-col gap-6 lg:flex-row">
          <ReaderBoard />
          <ControlPanel />
        </section>
      </main>
    </Cursor>
  );
}
