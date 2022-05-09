import Direction from "../graphs/classes/Direction";
import { fisherMean } from "./calculation/calculateFisherMean";

export const drawBootstrap = (data: Array<any>) => {
  // Function drawBootstrap
  // Draws a random new distribution from a distribution of the same size

  const randomSample = () => {
    // Function drawBootstrap::randomSample
    // Returns a random sample from an array
    return data[Math.floor(Math.random() * data.length)];
  };

  return data.map(randomSample);
};

export const generateDirectionsBootstrap = (
  directions: Array<Direction>,
  numberOfSimulations = 1000,
) => {
  // returns bootstrap means  for Directional data
  const bootstrappedDirections: Array<Direction> = [];

  for (let i = 0; i < numberOfSimulations; i++) {
    const pseudoDirections: Array<Direction> = drawBootstrap(directions);
    const pseudoMean = fisherMean(pseudoDirections); // get bootstrap mean bootstrap sample
    bootstrappedDirections.push(pseudoMean.direction);
  };

  return bootstrappedDirections;
};
