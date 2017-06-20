export default class Animation{

  //Check for animating numbers
  animateNumbers(scores: any): boolean{
    var found = false;
    for (var scoreId in scores) {
      var s = scores[scoreId];
      if (s.weightedPercentage != s.animatedWeightedPercentage) {
        found = true;
        var difference = s.weightedPercentage - s.animatedWeightedPercentage
        if (Math.abs(difference) < .01)
          s.animatedWeightedPercentage = s.weightedPercentage
        else
          s.animatedWeightedPercentage += difference / 100;
      }
    }
    return found;
    // if (found) setTimeout(() => this.update(), 100);
    }
}
