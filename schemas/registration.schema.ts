import { z } from 'zod';

export const registrationSchema = z.object({
  eventId: z.string().min(1, 'Event wajib dipilih'),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
