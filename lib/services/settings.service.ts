import { prisma } from "@/lib/db/prisma";
import { formatDbDateTime } from "@/lib/db/mappers";
import type { BusinessSetting, UpsertSettingInput } from "@/types/settings";

function mapSetting(row: {
  key: string;
  value: string;
  label: string | null;
  updatedAt: Date;
}): BusinessSetting {
  return {
    key: row.key,
    value: row.value,
    label: row.label ?? undefined,
    updatedAt: formatDbDateTime(row.updatedAt)
  };
}

export async function listSettings(): Promise<BusinessSetting[]> {
  const rows = await prisma.businessSetting.findMany({
    orderBy: { key: "asc" }
  });

  return rows.map(mapSetting);
}

export async function upsertSetting(input: UpsertSettingInput): Promise<BusinessSetting> {
  const row = await prisma.businessSetting.upsert({
    where: { key: input.key.trim() },
    create: {
      key: input.key.trim(),
      value: input.value,
      label: input.label?.trim() || null
    },
    update: {
      value: input.value,
      label: input.label?.trim() || null
    }
  });

  return mapSetting(row);
}
