export const swap = (
  array: string[],
  currentIndex: number,
  swapToPosition: number
) => {
  if (
    currentIndex === -1 ||
    swapToPosition < 0 ||
    swapToPosition >= array.length
  ) {
    return array;
  }
  const itemToSwap = array[currentIndex];
  const newArray = [...array];
  newArray.splice(currentIndex, 1);
  newArray.splice(swapToPosition, 0, itemToSwap);

  return newArray;
};
