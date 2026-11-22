'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inquirySchema, type InquiryInput } from '@/lib/validation';
import { inquiryKinds } from '@/lib/content';
import { useHydrated } from '@/lib/hydration';
import { submitInquiry } from '@/app/(site)/contact/actions';
import { Button } from './ui/button';

export function ContactForm() {
  const hydrated = useHydrated();
  const [status, setStatus] = useState<{ok: boolean; message: string}>();
  const {register, handleSubmit, reset, formState: { errors, isSubmitting }} = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema), defaultValues: {name:'', email:'', company:'', message:'', kind:'General inquiry', website:''},
  });
  const fields = (['name','email','company'] as const).map(name => {
    const labels = {name:'Full name',email:'Email address',company:'Company (optional)'};
    return <label key={name}>{labels[name]}<input {...register(name)} type={name === 'email' ? 'email' : 'text'} autoComplete={name === 'company' ? 'organization' : name} maxLength={name === 'email' ? 254 : name === 'company' ? 160 : 120} required={name !== 'company'} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? name + '-error' : undefined} />
      {errors[name] && <span className="form-error" id={name + '-error'}>{name === 'email' ? 'Enter a valid email address.' : 'Check the length of this field.'}</span>}
    </label>;
  });
  return <form className="form-grid" method="post" noValidate onSubmit={handleSubmit(async input => {
    setStatus(undefined);
    try {
      const result = await submitInquiry(input);
      setStatus(result);
      if (result.ok) reset();
    } catch {
      setStatus({ok:false,message:'Your inquiry could not be sent. Please try again later.'});
    }
  }, () => setStatus({ok:false,message:'Check the highlighted fields and try again.'}))}>
    <div className="form-pair">{fields.slice(0,2)}</div>
    <div className="form-pair">{fields[2]}<label>Inquiry type<select {...register('kind')}>{inquiryKinds.map(kind => <option key={kind}>{kind}</option>)}</select></label></div>
    <label>Message<textarea {...register('message')} rows={6} minLength={15} maxLength={4000} required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} />{errors.message && <span className="form-error" id="message-error">Enter a message between 15 and 4,000 characters.</span>}</label>
    <div className="honeypot" aria-hidden="true"><label>Leave blank<input {...register('website')} tabIndex={-1} autoComplete="off" /></label></div>
    <p className="muted">We use the information you provide to respond to your inquiry. <Link className="text-link" href="/privacy-policy">Privacy Policy</Link></p>
    {status && <p role={status.ok ? 'status' : 'alert'} className={'form-notice ' + (status.ok ? 'form-success' : 'form-error')}>{status.message}</p>}
    <Button type="submit" disabled={!hydrated || isSubmitting}>{isSubmitting ? 'Sending…' : 'Send inquiry'}</Button>
  </form>;
}
