import { z } from "zod";

export const ZONES = ["Zona A", "Zona B", "Zona C"] as const;
export const SHIFTS = ["Matutino", "Vespertino", "Nocturno"] as const;

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
  .refine((data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(), {
    message: "La ventana debe terminar después de empezar",
    path: ["endsAt"],
  })
  .refine((data) => new Date(data.endsAt).getTime() > Date.now(), {
    message: "La ventana no puede estar en el pasado",
    path: ["endsAt"],
  });

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
