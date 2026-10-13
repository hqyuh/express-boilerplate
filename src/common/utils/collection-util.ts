export const groupBy = <T>(array: T[], property: keyof T & string): Record<string, T[]> =>
  array.reduce<Record<string, T[]>>((grouped, element) => {
    const key = String(element[property]);
    const bucket = grouped[key] ?? [];
    bucket.push(element);
    grouped[key] = bucket;

    return grouped;
  }, {});
