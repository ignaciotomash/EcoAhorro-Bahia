import { unstable_cache } from 'next/cache';
import { auth, currentUser } from '@clerk/nextjs/server';
import { upsertUsuarioFromClerk } from '@/features/auth/services/usuarioService';

const cachedUpsert = unstable_cache(
  async (userId: string) => {
    const user = await currentUser();
    if (!user) return null;
    return upsertUsuarioFromClerk(user);
  },
  ['clerk-user-sync'],
  { revalidate: 3600, tags: ['usuarios'] }
);

export default async function ClerkUserSync() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  await cachedUpsert(userId);

  return null;
}
