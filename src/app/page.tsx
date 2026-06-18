'use client';
import { useSessionStore } from '@/lib/store/session';
import { Hero } from '@/components/Hero';
import { AppShell } from '@/components/AppShell';

export default function Home() {
  const data = useSessionStore((s) => s.data);

  return (
    <div className="h-screen flex flex-col bg-black">
      {data.length === 0 ? <Hero /> : <AppShell />}
    </div>
  );
}
