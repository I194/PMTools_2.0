import { ConglomeratesTestResult, IDirData } from "../../../GlobalTypes";
import Direction from "../../../graphs/classes/Direction";
import { fisherMean } from "../../calculation/calculateFisherMean";

const conglomeratesTest = (dataToAnalyze: IDirData) => {
  // The Watson (1956) test of a directional data set for randomness. 
  // Test compares the resultant vector (R) of a group of directions to values of Ro.
  // If R exceeds Ro, the null-hypothesis of randomness is rejected. 
  // If R is less than Ro, the null-hypothesis is considered to not be rejected, but still not proved.

  // Calculate a fisherain mean from data

  const directions = dataToAnalyze.interpretations.map(dir => new Direction(dir.Dgeo, dir.Igeo, 1));

  const mean = fisherMean(directions);
  const R = mean.R!;
  const N = mean.N!;

  // Test

  const Ro_values: { [key in number]: {95: number, 99: number} } = {
    5: {95: 3.50, 99: 4.02}, 6: {95: 3.85, 99: 4.48},
    7: {95: 4.18, 99: 4.89}, 8: {95: 4.48, 99: 5.26},
    9: {95: 4.76, 99: 5.61}, 10: {95: 5.03, 99: 5.94},
    11: {95: 5.29, 99: 6.25}, 12: {95: 5.52, 99: 6.55},
    13: {95: 5.75, 99: 6.84}, 14: {95: 5.98, 99: 7.11},
    15: {95: 6.19, 99: 7.36}, 16: {95: 6.40, 99: 7.60},
    17: {95: 6.60, 99: 7.84}, 18: {95: 6.79, 99: 8.08},
    19: {95: 6.98, 99: 8.33}, 20: {95: 7.17, 99: 8.55},
  };

  let Ro_95: number;
  let Ro_99: number;

  if (N < 5) {
    alert('Слишком мало направлений (менее 5), тест конгломератов провести нельзя.');
    return null;
  } else if (N < 21) {
    Ro_95 = Ro_values[N][95];
     Ro_99 = Ro_values[N][99];
  } else {
    Ro_95 = Math.sqrt(7.815 * (N / 3));
    Ro_99 = Math.sqrt(11.345 * (N / 3));
  };

  let resultDescriptionEN = '';
  let resultDescriptionRU = '';

  if (R < Ro_95) {
    resultDescriptionEN = 'This population "passes" a conglomerate test as the null hypothesis of randomness cannot be rejected at the 95% confidence level';
    resultDescriptionRU = 'Этот набор направлений "проходит" тест конгломератов, то есть гипотеза о случайности распределения не может быть отклонена c 95% уровнем доверия';
  };
  if (R > Ro_95) {
    resultDescriptionEN = 'The null hypothesis of randomness can be rejected at the 95% confidence level';
    resultDescriptionRU = 'Гипотеза о случайности может быть отклонена с 95% уровнем доверия';
  }
  if (R > Ro_99) {
    resultDescriptionEN = 'The null hypothesis of randomness can be rejected at the 99% confidence level';
    resultDescriptionRU = 'Гипотеза о случайности может быть отклонена с 99% уровнем доверия';
  };

  const result: ConglomeratesTestResult = {
    N, R, Ro_95, Ro_99, resultDescription: { ru: resultDescriptionRU, en: resultDescriptionEN }
  };
  return result;
}

export default conglomeratesTest;
