import type { User } from '@clerk/nextjs/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function upsertUsuarioFromClerk(user: User) {
  const email = user.primaryEmailAddress?.emailAddress;

  if (!email) {
    return null;
  }

  const nombreUsuario =
    user.fullName ??
    user.username ??
    user.firstName ??
    email.split('@')[0];

  const telefono =
    user.primaryPhoneNumber?.phoneNumber ??
    '';

  return prisma.usuario.upsert({
    where: {
      id: user.id,
    },
    create: {
      id: user.id,
      email,
      nombreUsuario,
      telefono,
    },
    update: {
      email,
      nombreUsuario,
      telefono,
    },
  });
}

export async function getCurrentUsuario() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: userId,
    },
  });

  if (usuario) {
    return usuario;
  }

  const user = await currentUser();

  if (!user) {
    return null;
  }

  return upsertUsuarioFromClerk(user);
}