import Image from 'next/image';
import { mediaUrl } from '@/lib/media';

export function Field({name,label,value,optional = false,type = 'text',max,step,min}: {
  name:string;label:string;value?:string | number | null;optional?:boolean;type?:string;max?:number;step?:string;min?:number;
}) {
  return <label>{label}<input name={name} type={type} defaultValue={value ?? ''} required={!optional} maxLength={max} step={step} min={min} /></label>;
}
export function LongField({name,label,value,max}: {name:string;label:string;value?:string;max:number}) {
  return <label>{label}<textarea name={name} defaultValue={value} rows={4} maxLength={max} required /></label>;
}
export function ImageField({name,label,path,required = false}: {name:string;label:string;path?:string | null;required?:boolean}) {
  const image = mediaUrl(path);
  return <label>{label}
    {image && <Image className="admin-thumbnail" src={image} width={100} height={72} alt="Current image" />}
    <input type="file" name={name} accept="image/jpeg,image/png,image/webp" required={required} />
    <span className="muted image-help">JPG, PNG or WebP, up to 3 MB. Upload only media intended for public use.</span>
  </label>;
}
export function Flag({name,label,checked}: {name:string;label:string;checked?:boolean}) {
  return <label className="checkbox"><input type="checkbox" name={name} defaultChecked={checked} />{label}</label>;
}