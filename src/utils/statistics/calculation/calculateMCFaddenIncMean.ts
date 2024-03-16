
const gausspars = (data: Array<number>) => {
  /*
    calculates gaussian statistics for data
  */
  const N = data.length;
  if (!N || N === 1) return null;

  let mean = 0;
  let d = 0;

  for (let i = 0; i < N; i++) mean += data[i] / N;
  for (let i = 0; i < N; i++) d += Math.pow((data[i] - mean), 2);

  var stdev = Math.sqrt(d * (1 / (N - 1)));
  return {MI: mean, std: stdev};
};


const calculateMCFaddenIncMean = (
  inclinations: Array<number>,
) => {

  /*
    Calculates Fisher mean inclination from inclination-only data.
    Parameters
    ----------
    inc: list of inclination values
    Returns
    -------
    dictionary of
        'n' : number of inclination values supplied
        'ginc' : gaussian mean of inclinations
        'inc' : estimated Fisher mean
        'r' : estimated Fisher R value
        'k' : estimated Fisher kappa
        'alpha95' : estimated fisher alpha_95
        'csd' : estimated circular standard deviation
  */

  const rad = Math.PI / 180;
  let SCOi = 0;
  let SSOi = 0; // some definitions

  const absInclinations = inclinations.map(inc => (
    Math.abs(inc)
  ));
  if (!absInclinations.length) return null;

  const gaussparsRes = gausspars(absInclinations)!; // get mean inc and standard deviation
  let fpars = {};
  const N = inclinations.length;

  if (gaussparsRes.MI < 30) { // mean inc < 30, returning gaussian mean'
    fpars = {
      ginc: gaussparsRes.MI, 
      inc: gaussparsRes.MI, 
      n: N, 
      r: 0, 
      k: 0, 
      a95: 0, 
      csd: 0
    };
    return fpars;
  };

  inclinations.forEach(inc => {
    // sum over all incs (but take only positive inc)
    const coinc = (90 - Math.abs(inc)) * rad;
    SCOi += Math.cos(coinc);
    SSOi += Math.sin(coinc);
  });

  let Oo = (90 - gaussparsRes.MI) * rad; // first guess at mean
  let SCFlag = -1; // sign change flag
  let epsilon = N * Math.cos(Oo); // RHS of zero equations
  epsilon += (Math.pow(Math.sin(Oo), 2) - Math.pow(Math.cos(Oo), 2)) * SCOi;
  epsilon -= 2 * Math.sin(Oo) * Math.cos(Oo) * SSOi;

  while (SCFlag < 0) {
    // loop until cross zero
    if (gaussparsRes.MI > 0) Oo -= (0.01 * rad); // get steeper
    if (gaussparsRes.MI < 0) Oo += (0.01 * rad); // get shallower
    var prev = epsilon;
    epsilon = N * Math.cos(Oo); // RHS of zero equations
    epsilon += (Math.pow(Math.sin(Oo), 2) - Math.pow(Math.cos(Oo), 2)) * SCOi;
    epsilon -= 2 * Math.sin(Oo) * Math.cos(Oo) * SSOi;
    if (Math.abs(epsilon) > Math.abs(prev)) gaussparsRes.MI = -1 * gaussparsRes.MI; // reverse direction
    if (epsilon * prev < 0) SCFlag = 1; // changed sign
  };

  let S = 0;
  let C = 0; // initialize for summation
  inclinations.forEach(inc => {
    const coinc = (90 - Math.abs(inc)) * rad;
    S += Math.sin(Oo - coinc);
    C += Math.cos(Oo - coinc);
  });

  const k = (N - 1) / (2 * (N - C));
  const Imle = 90 - (Oo / rad);
  const R = 2 * C - N;
  const f = 0; // const f = fcalc(2, N - 1);
  let a95 = 1 - (0.5) * Math.pow((S / C), 2) - (f / (2. * C * k));
  a95 = Math.acos(a95) * 180 / Math.PI;
  const csd = 81 / Math.sqrt(k);

  fpars = {ginc: gaussparsRes.MI, inc: Imle, n: N, r: R, k, a95, csd};
  return fpars;

};

export default calculateMCFaddenIncMean;