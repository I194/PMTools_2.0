import Direction from "../../../classes/Direction";


const flipGreatCircle = (
  ellipse: Array<Direction> 
) => {

  const negative: Array<Direction | null> = [];
  const positive: Array<Direction | null> = [];
  let sign = 0;

  ellipse.forEach((point, index) => {
    let pointSign = Math.sign(point.inclination);

    if (sign !== pointSign) {
      (pointSign < 0 ? positive : negative).push(ellipse[index - 1]);
      (pointSign < 0 ? negative : positive).push(null);
    };

    ((point.inclination < 0) ? positive : negative).push(point);

    sign = pointSign;
  });

  return { negative, positive };
};

export default flipGreatCircle;
