export function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'}).format(new Date(value)) + ' UTC';
}
