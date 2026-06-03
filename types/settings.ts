export type BusinessSetting = {
  key: string;
  value: string;
  label?: string;
  updatedAt?: string;
};

export type UpsertSettingInput = {
  key: string;
  value: string;
  label?: string;
};
