import { auth, currentUser } from '@clerk/nextjs/server';
import { upsertUsuarioFromClerk } from '@/features/auth/services/usuarioService';

export default async function ClerkUserSync() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  await upsertUsuarioFromClerk(user);
  return null;
}
