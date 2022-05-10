export const numericSort = (a: number, b: number) => {
  // Function numericSort
  // Sort function to sort an array numerically

  // No sorting if one is null
  if (a === null || b === null) return 0;

  return a > b ? 1 : a < b ? -1 : 0;
};

const getCDF = (data: Array<number>) => {
  // Functiom getCDF
  // Returns the cumulative distribution function of an array

  // Calculate the cumulative distribution function of the sorted input
  return data.sort(numericSort).map(function(value, index) {
    return {
      x: value,
      y: index / (data.length - 1)
    }
  });
};

export default getCDF;