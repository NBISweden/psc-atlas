export const toggleArray = (prev: string[], value: string) => {
  let newArray;
  if (prev.includes(value)) {
    newArray = prev.filter((v) => v !== value);
  } else {
    newArray = [...prev, value];
  }
  return newArray;
};
