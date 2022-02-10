const nodes = {
  start: 'M',
  lineTo: 'L',
  lineHorizontalTo: 'H',
  lineVerticalTo: 'v',
  close: 'Z',
  bezierCubic: 'C',
  bezierCubicReflected: 'S',
  bezierQuadratic: 'Q',
  bezierQuadraticReflected: 'T',
  arc: 'A',
}

const createStraightPath = (dots: Array<[number, number]>, close?: boolean) => {
  // Straight path looks like this:
  // d="M20,20 L25,70 L50,40 L39,72, L110,119, L118,129, L134,141, L150,150"
  return dots.map((dot, iter) => {
    if (iter === 0) return `${nodes.start}${dot[0]},${dot[1]}`;
    if (iter === dots.length - 1) return `${nodes.lineTo}${dot[0]},${dot[1]}${close ? nodes.close : ''}`;
    return `${nodes.lineTo}${dot[0]},${dot[1]}`;
  }).join(' ');
  
}

const createArcPath = (dots: Array<[number, number]>) => {

 
}

export { createStraightPath, createArcPath };