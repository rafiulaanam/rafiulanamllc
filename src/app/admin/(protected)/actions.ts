'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/db';
import { AdminInputError } from '@/lib/uploads';
import { mutateNeonAdminContent } from '@/lib/neon-admin-mutations';

type Result = {message?: string; ok?: boolean};

export async function updateContent(_previous: Result, form: FormData): Promise<Result> {
  const session = await requireAdmin();
  let destination: string | undefined;
  try {
    ({destination} = await mutateNeonAdminContent(session.db,session.user.id,form));
  } catch (error) {
    if (error instanceof AdminInputError) return {ok:false,message:error.message};
    console.error('Administration update failed', error instanceof Error ? error.name : 'Database error');
    return {ok:false,message:'The change could not be saved. Please try again.'};
  }
  revalidatePath('/', 'layout');
  if (destination) redirect(destination);
  return {ok:true,message:'Saved.'};
}
