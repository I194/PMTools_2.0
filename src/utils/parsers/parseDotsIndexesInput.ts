const parseDotsIndexesInput = (
  enteredIDs: string
) => {
  // parse id's input (like steps to select)
  // example of valid enteredIDs: 
  // 1-9 || 2,4,8,9 || 2-4;8,9 || 2-4;8,9;12-14
  const segments = enteredIDs.split(';');

  const commaSegements = segments.filter(segment => segment.includes(','));
  const dashSegments = segments.filter(segment => segment.includes('-'));

  if (!commaSegements.length && !dashSegments.length) {
    return [+enteredIDs];
  }

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