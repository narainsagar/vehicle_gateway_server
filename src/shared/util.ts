export const extractVariables = (template: string, str: string): string[] => {
  const data = new RegExp(template).exec(str);
  return (data || []).map((s) => s.toString());
};
