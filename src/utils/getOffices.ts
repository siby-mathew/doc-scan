export type Office = {
  name: string;
  email: string;
};

export type OfficeNames = string[];
export const getOffices = (): Office[] => {
  return (JSON.parse(process.env.OFFICES ?? "[]") ?? []) as Office[];
};
