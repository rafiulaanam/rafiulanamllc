import Link from 'next/link';
import { Button } from './ui/button';

export function NotFoundMessage() {
  return <section className="shell section status-content">
    <h1>Page not found.</h1>
    <p className="lede">The page may have moved or be unavailable.</p>
    <Button asChild><Link href="/">Return home</Link></Button>
  </section>;
}
