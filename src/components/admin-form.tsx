'use client';
import { startTransition, useActionState, useEffect, useRef, useState, type ReactNode } from 'react';
import { updateContent } from '@/app/admin/(protected)/actions';
import { useHydrated } from '@/lib/hydration';
import { Button } from './ui/button';

export function AdminForm({operation,id,children,label = 'Save changes',remove = false,clear = false}: {
  operation:string;id?:string;children?:ReactNode;label?:string;remove?:boolean;clear?:boolean;
}) {
  const [status, dispatch, pending] = useActionState(updateContent, {});
  const hydrated = useHydrated();
  const [fileError, setFileError] = useState('');
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (clear && status.ok) form.current?.reset(); }, [clear,status]);
  return <form ref={form} method="post" className={remove ? 'admin-delete' : 'form-grid'} onSubmit={event => {
    event.preventDefault();
    if (pending || (remove && !window.confirm('Permanently delete this item?'))) return;
    const data = new FormData(event.currentTarget);
    const files = Array.from(data.values()).filter(value => value instanceof File);
    const megabyte = 1024 * 1024;
    if (files.some(file => file.size > 3 * megabyte)) {
      setFileError('Choose images smaller than 3 MB.');
      return;
    }
    if (files.reduce((bytes, file) => bytes + file.size, 0) > 3.5 * megabyte) {
      setFileError('Save these images in separate updates to stay within the upload limit.');
      return;
    }
    setFileError('');
    startTransition(() => dispatch(data));
  }}>
    <input type="hidden" name="operation" value={operation} />
    {id && <input type="hidden" name="id" value={id} />}
    {children}
    <Button variant={remove ? 'outline' : 'primary'} className={remove ? 'danger' : undefined} type="submit" disabled={!hydrated || pending}>{pending ? 'Saving…' : label}</Button>
    {fileError ? <p role="alert" className="form-error">{fileError}</p> : status.message &&
      <p role={status.ok ? 'status' : 'alert'} className={status.ok ? 'form-success' : 'form-error'}>{status.message}</p>}
  </form>;
}
