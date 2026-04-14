import { EventModel } from "../models/Event";

interface SeedEventTemplate {
  name: string;
  location: string;
  startOffsetDays: number;
  durationDays: number;
}

const seedEvents: SeedEventTemplate[] = [
  {
    name: "Mumbai Monsoon Sprint",
    location: "Mumbai",
    startOffsetDays: -2,
    durationDays: 30,
  },
  {
    name: "Marine Drive Night Dash",
    location: "Mumbai",
    startOffsetDays: 2,
    durationDays: 7,
  },
  {
    name: "Bandra Pulse Run",
    location: "Mumbai",
    startOffsetDays: 8,
    durationDays: 6,
  },
  {
    name: "City Limits Relay",
    location: "Mumbai",
    startOffsetDays: 15,
    durationDays: 10,
  },
];

function withDayOffset(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

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
    location: "Mumbai",
    startDate,
    endDate,
    isActive: true,
  });
}

export async function getEventsFeed() {
  const now = new Date();
  const active = await getOrCreateActiveEvent();

  await Promise.all(
    seedEvents.map(async (template) => {
      const existing = await EventModel.findOne({ name: template.name });
      if (existing) {
        return;
      }

      const startDate = withDayOffset(now, template.startOffsetDays);
      const endDate = withDayOffset(startDate, template.durationDays);

      await EventModel.create({
        name: template.name,
        location: template.location,
        startDate,
        endDate,
        isActive: template.name === active.name,
      });
    }),
  );

  return EventModel.find().sort({ startDate: 1, createdAt: 1 });
}
