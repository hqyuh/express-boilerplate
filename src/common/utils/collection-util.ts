/* eslint-disable unicorn/no-array-reduce */
export const groupBy = <T>(array: T[], property: string): Record<string, T[]> =>
  array.reduce(
    (grouped, element) => ({
      ...grouped,
      [element[property]]: [...(grouped[element[property]] || []), element],
    }),
    {}
  );
