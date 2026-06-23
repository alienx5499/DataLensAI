'use client';
import { useSessionStore } from '@/lib/store/session';
import { Hero } from '@/components/Hero';
import { AppShell } from '@/components/AppShell';

export default function Home() {
  const currentSession = useSessionStore((s) => s.currentSession);

  return (
    <div className="h-screen flex flex-col bg-black">
      {!currentSession ? <Hero /> : <AppShell />}
    </div>
  );
}
