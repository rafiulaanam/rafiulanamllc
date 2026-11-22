import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
type Props = ComponentProps<'button'> & { asChild?: boolean; variant?: 'primary' | 'outline' | 'light' };
export function Button({ asChild, variant = 'primary', className, ...props }: Props) {
  const Component = asChild ? Slot : 'button';
  return <Component className={cn('button', 'button-' + variant, className)} {...props} />;
}