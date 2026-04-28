import type { Metadata } from 'next';
import 'animal-island-ui/style';
import './globals.css';

export const metadata: Metadata = {
  title: 'RayRead',
  description: 'A cozy focus reader for chunked, dopamine-friendly reading.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
