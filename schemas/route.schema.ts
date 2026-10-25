import { z } from 'zod';

export const routePointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const routeSchema = z.object({
  points: z.array(routePointSchema).min(2, 'Rute minimal 2 titik'),
  distanceKm: z.coerce.number().positive('Jarak harus lebih dari 0'),
  startLabel: z.string().optional().nullable(),
  finishLabel: z.string().optional().nullable(),
});

export type RouteInput = z.infer<typeof routeSchema>;
