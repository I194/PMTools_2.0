const parseSimplifiedInput = (enteredIDs: string, maxIndex: number) => {
  const trimmedText = enteredIDs.trim();

  if (trimmedText[trimmedText.length - 1] !== '-') {
    return;
  }

  const startNumber = Number(trimmedText.split('-')[0]);

  if (typeof startNumber !== 'number') {
    return;
  }

  return Array.from({ length: maxIndex - startNumber + 1 }, (_, index) => startNumber + index);;
}

const parseDotsIndexesInput = (
  enteredIDs: string,
  maxIndex: number,
) => {
  const simplifiedResult = parseSimplifiedInput(enteredIDs, maxIndex);
  if (simplifiedResult?.length) {
    return simplifiedResult;
  }

  // parse id's input (like steps to select)
  // example of valid enteredIDs: 
  // 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14
  const segments = enteredIDs.split(';');

  const commaSegements = segments.filter(segment => segment.includes(','));
  const dashSegments = segments.filter(segment => segment.includes('-'));

  const commaIDs: Array<number> = [];
  const dashIDs: Array<number> = [];

  commaSegements.forEach(segment => {
    const IDs = segment.split(',').map(id => +id);
    commaIDs.push(...IDs);
  });

  dashSegments.forEach(segment => {
    const edges = segment.split('-').map(id => +id);
    if (edges.length !== 2) return [];
    const IDs = [];
    for (let id = edges[0]; id <= edges[1]; id++) {
      IDs.push(id);
    };
    dashIDs.push(...IDs);
  });

  const uniqueIndexes = [...new Set([
    ...commaIDs, 
    ...dashIDs
  ])];

  return uniqueIndexes;
};

export default parseDotsIndexesInput;