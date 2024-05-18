// data structure for team data
module.exports = class Team {
  mineralCounts = {
    nBronze: 0,
    nSilver: 0,
    nGold: 0,
    nDiamond: 0,
    nBomb: 0
  }
  score = 0
  declared = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  pointsAwarded = []
}
