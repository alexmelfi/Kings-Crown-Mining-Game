// players who are not mining receive their declared points
const receiveDeclared = (pointArray, team) => {
  for (let i = 0; i < 9; i++) {
    pointArray[i] = team.declared[i]
  }
}

// splits points between mining players
const splitPoints = (pointArray, toSplit, teamNum) => {
  switch (teamNum) {
    case 1:
      pointArray[0] += Math.trunc(toSplit / 3)
      pointArray[1] += Math.trunc(toSplit / 3)
      pointArray[2] += Math.trunc(toSplit / 3)
      break;
    case 2:
      pointArray[3] += Math.trunc(toSplit / 3)
      pointArray[4] += Math.trunc(toSplit / 3)
      pointArray[5] += Math.trunc(toSplit / 3)
      break;
    case 3:
      pointArray[6] += Math.trunc(toSplit / 3)
      pointArray[7] += Math.trunc(toSplit / 3)
      pointArray[8] += Math.trunc(toSplit / 3)
  }
}

// gives the highest declared point value to the player with the lowest declared point value.
// if multiple players have the highest declared point value, the lowest player receives all of those points
// if multiple players have the lowest declared point value, they will split the points
const highToLow = (pointsArray, team) => {
  let teamObj = team

  const highest = Math.max(...teamObj.declared)
  const lowest = Math.min(...teamObj.declared.filter(n => n !== 0))
  const toAdd = []
  let toDistribute = 0

  teamObj.declared.forEach((d, i) => {
    if (d === highest) {
      toDistribute += highest
      pointsArray[i] -= highest
    }
    else if (d === lowest) {
      toAdd.push(i)
    }
  })

  toAdd.forEach(i => pointsArray[i] += Math.trunc(toDistribute / toAdd.length))
}

const finalString = (pointsArray, playerList) => {
  let str = "";

  for (let i = 0; i < 9; i++) {
    str += "\n" + playerList[i] + ": " + pointsArray[i]
  }

  return str
}

// calculates the points to award to each player and updates values
const calculateFinal = (team, teamNum, finalPoints) => {
  // array keeps track of awarded points
  const points = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]

  const teamObj = team

  const declaredPoints = teamObj.declared.reduce((m, n) => m + n)

  // case if miners mined at least 3 bombs
  if (teamObj.mineralCounts.nBomb >= 3) {
    // players receive their declared points
    receiveDeclared(points, team)
  }
  // case if miners found more mineral points than the points declared
  else if (teamObj.score >= declaredPoints) {
    // players receive their declared points
    receiveDeclared(points, team)

    //miners split the remainder
    splitPoints(points, teamObj.score - declaredPoints, teamNum)
  }
  // case if miners found less mineral points than points declared
  else if (teamObj.score < declaredPoints) {
    // points are split between miners
    splitPoints(points, teamObj.score, teamNum)
    // highest declared goes to the lowest declared
    highToLow(points, team)
  }

  teamObj.pointsAwarded = [...points]

  switch (teamNum) {
    case 1:
      finalPoints.roundOne.map((s, i) => s += teamObj.pointsAwarded[i])
      break
    case 2:
      finalPoints.roundTwo.map((s, i) => s += teamObj.pointsAwarded[i])
      break
    case 3:
      finalPoints.roundThree.map((s, i) => s += teamObj.pointsAwarded[i])
  }

  return points
}

module.exports.receiveDeclared = receiveDeclared
module.exports.splitPoints = splitPoints
module.exports.highToLow = highToLow
module.exports.finalString = finalString
module.exports.calculateFinal = calculateFinal
