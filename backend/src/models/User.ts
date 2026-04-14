import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    clerkUserId: { type: String, unique: true, sparse: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, default: null },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    streak: { type: Number, default: 0, min: 0 },
    lastActivityDate: { type: Date, default: null },
    badges: { type: [String], default: ["Rookie"] },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

userSchema.index({ xp: -1 });
userSchema.index({ clerkUserId: 1 });

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };

export const UserModel = model("User", userSchema);
