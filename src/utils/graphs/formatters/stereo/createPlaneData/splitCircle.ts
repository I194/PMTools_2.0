import Direction from "../../../classes/Direction";


const splitCircle = (
  ellipse: Array<Direction> 
) => {

  const negative: Array<Direction> = [];
  const positive: Array<Direction> = [];
  let sign = 0;

  // Находим точку, наклонение (inclination) которой ближе всех приближено к 0 
  // Чтобы потом начать отсчёт с этой точки и не получить в любом из список (neg/pos)
  // "Наложение" точек. Вот пример списка с наложением, который некорректно отобразится на svg:
  // [[0, 270], [1, 272], [1.5, 276], ..., [6.7, 293], [-6.7, 242], ..., [0, 270]] - выдуманный примен
  // из-за резкого скачка в центре произойдет наложение при отрисовке. 
  // избежать этого простой сортировкой нельзя из-за специфики координат
  // ибо отрисовку круга, координаты которого заданы как полярные, сортировать по склонению (declination)
  // можно только из центра этого круга, иначе может произойти многократное переналожение как в примере
  const IncNearestToZero = Math.min(...ellipse.map(point => Math.abs(point.inclination)));
  const zeroIncIndex = ellipse.findIndex(point => Math.abs(point.inclination) === IncNearestToZero);

  // От точки с Inc: 0 и до неё же
  for (let i = zeroIncIndex; i < ellipse.length + zeroIncIndex; i++) {
    const point = ellipse[i % ellipse.length];

    let pointSign = Math.sign(point.inclination);

    if ((sign !== pointSign) && ellipse[i - 1]) {
      (pointSign < 0 ? positive : negative).push(ellipse[i - 1]);
    };

    ((point.inclination < 0) ? positive : negative).push(point);

    sign = pointSign;
  };

  console.log(negative)
  
  return { negative, positive };
};

export default splitCircle;
