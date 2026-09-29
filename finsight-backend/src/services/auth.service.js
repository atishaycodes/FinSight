import bcrypt from "bcryptjs";
import prisma from "../utils/prisma.js";
import { signToken } from "../utils/jwt.js";

const USER_SELECT = {
  id:        true,
  email:     true,
  name:      true,
  currency:  true,
  googleId:  true,
  createdAt: true,
};

export async function registerUser(email, name, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data:   { email, name, passwordHash },
    select: USER_SELECT,
  });

  const token = signToken({ userId: user.id, email: user.email });
  return { user, token };
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new Error("INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  const token = signToken({ userId: user.id, email: user.email });
  return {
    user: {
      id:        user.id,
      email:     user.email,
      name:      user.name,
      currency:  user.currency,
      googleId:  user.googleId,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function googleUpsertUser(googleId, email, name) {
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data:  { googleId },
      });
    } else {
      user = await prisma.user.create({
        data: { email, name, googleId },
      });
    }
  }

  const token = signToken({ userId: user.id, email: user.email });
  return {
    user: {
      id:        user.id,
      email:     user.email,
      name:      user.name,
      currency:  user.currency,
      googleId:  user.googleId,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function getUser(userId) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: USER_SELECT,
  });
  if (!user) throw new Error("NOT_FOUND");
  return user;
}

export async function updateProfile(userId, data) {
  const user = await prisma.user.update({
    where:  { id: userId },
    data:   { ...(data.name && { name: data.name }), ...(data.currency && { currency: data.currency }) },
    select: USER_SELECT,
  });
  return user;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("NOT_FOUND");
  if (!user.passwordHash) throw new Error("NO_PASSWORD");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function deleteAccount(userId) {
  await prisma.user.delete({ where: { id: userId } });
}
