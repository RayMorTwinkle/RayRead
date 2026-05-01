'use client';

import { Cursor, Footer } from 'animal-island-ui';
import { useAutoPlay } from '@/hooks/useAutoPlay';
import { useHydrateConfigStore } from '@/hooks/useHydrateConfigStore';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { ControlPanel } from '@/components/ControlPanel/ControlPanel';
import { ReaderBoard } from '@/components/ReaderBoard/ReaderBoard';

export function RayReadApp() {
  useHydrateConfigStore();
  useAutoPlay();
  useKeyboardNavigation();

  return (
    <Cursor>
      <div className="relative min-h-screen w-full">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-80">
          <Footer 
            type="sea" 
            className="w-full" 
            style={{ 
              backgroundSize: 'contain',
              backgroundRepeat: 'repeat-x',
              backgroundPosition: 'bottom center'
            }} 
          />
        </div>
        <main className="relative flex min-h-screen w-full justify-center overflow-x-hidden p-4 pb-28 text-bark sm:p-8 sm:pb-32 lg:items-start">
          <section className="relative z-10 flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
            <ReaderBoard />
            <ControlPanel />
          </section>
        </main>
      </div>
    </Cursor>
  );
}
