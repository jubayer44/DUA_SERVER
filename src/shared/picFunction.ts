const pickFunction = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
) => {
  const picked: Partial<T> = {};
  keys.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      picked[key] = obj[key];
    }
  });
  return picked;
};

export default pickFunction;
