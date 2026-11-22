'use client';
import { Button } from '@/components/ui/button';
export default function AdminError({reset}: {reset:()=>void}) {
  return <section className="admin-panel"><h1>Administration is temporarily unavailable.</h1><p className="muted">Check the Neon and Clerk configuration or retry.</p><Button onClick={reset} type="button">Try again</Button></section>;
}
