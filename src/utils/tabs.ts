export const VALID_TABS = [
  "",
  "api",
  "create-action",
  "profile",
  "contracts",
] as const;

export type TabType = (typeof VALID_TABS)[number];

export const TAB = VALID_TABS.reduce((acc, tab, index) => {
  acc[tab] = index;
  return acc;
}, {} as Record<TabType, number>);

export const getTabValue = (key: keyof typeof TAB): TabType =>
  VALID_TABS[TAB[key]];
