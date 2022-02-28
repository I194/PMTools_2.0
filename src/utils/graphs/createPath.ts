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
  console.log(dots);
  return dots.map((dot, index) => {
    if (index === 0) return `${nodes.start}${dot[0]},${dot[1]}`;
    if (index === dots.length - 1) return `${nodes.lineTo}${dot[0]},${dot[1]}${close ? nodes.close : ''}`;
    return `${nodes.lineTo}${dot[0]},${dot[1]}`;
  }).join(' ');
};

const createCurvePath = (dots: Array<[number, number]>) => {
  // Cubic bezier line looks like this: 
  // M x1, y1 - start coodinates
  // C ... - initializition of cubic bezier line
  // ... (x_c1, y_c1) - first control point of cubic bezier line
  // ... (x_c2, y_c2) - second control point fo cubic bezier line
  // ... (x2, y2) - end coordinates 
  // full example: d="M 200, 300 C 100, 100 500, 100, 400, 300" 
  // and to smooth line which consists of many cobic bezier segments you must use 'S':
  // comparison (when using S [x3, y3] and [xc3, yc3] not using):
  // d="M x1 , y1  C xc1, yc1 xc2, yc2, x2 , y2 , S xc4, yc4 x4 , y4 "
  // d="M 200, 300 C 100, 100 500, 100, 400, 300, S 400, 300 400, 200" 
  return dots.map((dot, index) => {
    if (index === 0) return `${nodes.start}${dot[0]},${dot[1]}`;
    if (index === dots.length - 1) return (
      `
        ${nodes.bezierCubic}${dot[0]},${dot[1]}
        ${dot[0]},${dot[1]}
        ${dot[0]},${dot[1]}
      `
    );
    return `${nodes.lineTo}${dot[0]},${dot[1]}`;
  }).join(' ');
}

export { createStraightPath, createCurvePath };