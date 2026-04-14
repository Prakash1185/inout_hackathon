import { UserModel } from "../models/User";
import type { AuthTokenPayload } from "../types/auth";

export async function getOrCreateUserFromAuth(authUser: AuthTokenPayload) {
  const safeEmail =
    authUser.email?.trim() || `${authUser.clerkUserId}@clerk.local`;
  const safeName = authUser.name?.trim() || "BitBox Athlete";

  const byClerkId = await UserModel.findOne({
    clerkUserId: authUser.clerkUserId,
  });
  if (byClerkId) {
    if (byClerkId.email !== safeEmail || byClerkId.name !== safeName) {
      byClerkId.email = safeEmail;
      byClerkId.name = safeName;
      await byClerkId.save();
    }
    return byClerkId;
  }

  const byEmail = await UserModel.findOne({ email: safeEmail });
  if (byEmail) {
    byEmail.clerkUserId = authUser.clerkUserId;
    byEmail.name = safeName;
    await byEmail.save();
    return byEmail;
  }

  return UserModel.create({
    clerkUserId: authUser.clerkUserId,
    name: safeName,
    email: safeEmail,
  });
}
