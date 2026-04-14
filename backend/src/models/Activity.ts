import { Schema, model, type InferSchemaType } from "mongoose";

const coordinateSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false },
);

const activitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    coordinates: { type: [coordinateSchema], default: [] },
    distance: { type: Number, required: true, min: 0 },
    areaCaptured: { type: Number, required: true, min: 0 },
    xpEarned: { type: Number, required: true, min: 0 },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

activitySchema.index({ eventId: 1, createdAt: -1 });

export type ActivityDocument = InferSchemaType<typeof activitySchema> & {
  _id: string;
};

export const ActivityModel = model("Activity", activitySchema);
