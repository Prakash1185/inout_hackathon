import { EventModel } from "../models/Event";

export async function getOrCreateActiveEvent() {
  const now = new Date();

  const active = await EventModel.findOne({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (active) {
    return active;
  }

  const startDate = new Date(now);
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 30);

  await EventModel.updateMany(
    { isActive: true },
    { $set: { isActive: false } },
  );

  return EventModel.create({
    name: "Mumbai Monsoon Sprint",
    location: "India",
    startDate,
    endDate,
    isActive: true,
  });
}
