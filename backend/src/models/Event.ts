import { Schema, model, type InferSchemaType } from "mongoose";

const eventSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

eventSchema.index({ isActive: 1 });

export type EventDocument = InferSchemaType<typeof eventSchema> & {
  _id: string;
};

export const EventModel = model("Event", eventSchema);
