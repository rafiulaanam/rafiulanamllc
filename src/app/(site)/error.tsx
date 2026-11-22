'use client';
import { Button } from '@/components/ui/button';
export default function SiteError({reset}: {reset:()=>void}) {
  return <section className="shell section status-content"><h1>This page is temporarily unavailable.</h1><p className="lede">Please try again in a moment.</p><Button onClick={reset} type="button">Try again</Button></section>;
}
