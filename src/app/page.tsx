'use client';
import { useAppStore } from '@/lib/store';
import { Hero } from '@/components/Hero';
import { AppShell } from '@/components/AppShell';

export default function Home() {
  const { data } = useAppStore();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {data.length === 0 ? <Hero /> : <AppShell />}
    </div>
  );
}
