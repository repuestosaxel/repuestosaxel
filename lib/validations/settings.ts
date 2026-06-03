import { z } from "zod";

export const upsertSettingSchema = z.object({
  key: z.string().trim().min(1, "La clave es obligatoria."),
  value: z.string(),
  label: z.string().trim().optional()
});

export const patchSettingsSchema = z.object({
  settings: z.array(upsertSettingSchema).min(1, "Enviá al menos una configuración.")
});

export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>;
export type PatchSettingsInput = z.infer<typeof patchSettingsSchema>;
