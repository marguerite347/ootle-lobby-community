// Isolated playtest layout. Multipliers apply to the banked first-wheel payout.
export const superWedges = [2,1,1,5,1,1,10,1,1,20,1,1];
export const superOutcomes = [1,2,5,10,20].map(factor => ({
  factor, total:5*factor,
  percent:superWedges.filter(value=>value===factor).length/12*100,
  index:superWedges.indexOf(factor),
}));
export function superLanding(index) {
  return superOutcomes[index].index*Math.PI/6-Math.PI/60;
}
