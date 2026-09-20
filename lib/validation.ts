import { z } from "zod";

export const ZONES = ["Zona A", "Zona B", "Zona C"] as const;
export const SHIFTS = ["Matutino", "Vespertino", "Nocturno"] as const;

// America/Mexico_City has had no DST since 2022 — fixed UTC-6
// year-round, so a hardcoded offset is safe here (it would not be for
// most other timezones).
const SITE_UTC_OFFSET = "-06:00";

// A <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm") has no
// timezone attached. `new Date(value)` parses it as the SERVER's
// local time, not the browser's — and Vercel functions run in UTC,
// not America/Mexico_City, so every window was silently off by six
// hours. This makes the "today, local time" the admin actually typed
// explicit before it ever reaches Date().
export function mxLocalToInstant(datetimeLocal: string): string {
  return new Date(`${datetimeLocal}:00${SITE_UTC_OFFSET}`).toISOString();
}

// The calendar date a given instant falls on in America/Mexico_City —
// not necessarily the same as the server's own local date. Used to
// build "N days from now, 10:00 Mexico City" without going through
// Date's local-timezone setters (setHours et al.), which have the
// exact same server-vs-browser timezone bug mxLocalToInstant exists
// to avoid.
export function mxDateOnly(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
  }).format(instant);
}

export const siteSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  timezone: z.string().trim().min(1, "La zona horaria es obligatoria").max(60),
});

export const drillWindowSchema = z
  .object({
    siteId: z.string().uuid(),
    startsAt: z.string().min(1, "Falta la fecha de inicio"),
    endsAt: z.string().min(1, "Falta la fecha de fin"),
    targetZone: z.enum(ZONES).optional(),
    targetShift: z.enum(SHIFTS).optional(),
    scenarioVariant: z.string().trim().min(1).max(120).optional(),
  })
  .refine(
    (data) =>
      new Date(mxLocalToInstant(data.endsAt)).getTime() >
      new Date(mxLocalToInstant(data.startsAt)).getTime(),
    {
      message: "La ventana debe terminar después de empezar",
      path: ["endsAt"],
    },
  )
  .refine(
    (data) => new Date(mxLocalToInstant(data.endsAt)).getTime() > Date.now(),
    {
      message: "La ventana no puede estar en el pasado",
      path: ["endsAt"],
    },
  );

export const enrollmentSchema = z.object({
  siteId: z.string().uuid(),
  zone: z.enum(ZONES),
  shift: z.enum(SHIFTS),
  consentTiming: z.literal("on"),
  consentIndividualScore: z.literal("on"),
  consentDelete: z.literal("on"),
  traumaPrecheck: z.enum(["yes", "no", "prefer_not_to_say"]),
  optedOutOfImmersion: z.enum(["on"]).optional(),
});

export const responseStartSchema = z.object({
  drillEventId: z.string().uuid(),
  immersionPath: z.enum(["immersive", "non_immersive"]),
});

export const responseProtectSchema = z.object({
  responseId: z.string().uuid(),
  timeToProtectiveActionMs: z.coerce.number().int().min(0),
});

export const checkinSchema = z.object({
  responseId: z.string().uuid(),
  timeToAssemblyMs: z.coerce.number().int().min(0),
  locationZoneEstimate: z.enum(ZONES).nullable(),
  locationVerified: z.coerce.boolean(),
});
