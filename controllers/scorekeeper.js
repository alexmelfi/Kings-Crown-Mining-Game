const fs = require('fs')
const { ipcRenderer } = require('electron')

const team = require(__dirname + '/models/team')
const fileManager = require(__dirname + '/util/fileManager')

const save = fileManager.save
const load = fileManager.load

// player list
let playerList = Array.from(document.querySelectorAll("input[name=player]"))
  .map(p => p.value)

let currentRound = 1

let totalScore = []

// object that holds team data
// mineralCounts: holds counts of each mineral
// score: mining score for the team
// declared: list of points declared by each player
// pointsAwarded: list of points awarded to each player

// data when team one is mining
let teamOneData = { ...team }

// data when team two is mining
let teamTwoData = { ...team }

// data when team three is mining
let teamThreeData = { ...team }

let finalPoints = {
  roundOne: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  roundTwo: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  roundThree: [0, 0, 0, 0, 0, 0, 0, 0, 0]
}

// receiver for data sent from the scoreboard
ipcRenderer.on('toMain', (e, args) => {
  console.log(args)
})

// sender for sending data to the scoreboard
const sendToScoreboard = () => {
  ipcRenderer.send('toScoreboard', {
    players: playerList,
    round: checkRound(),
    score: checkTeam().pointsAwarded,
    mining: checkRadios(),
    totalMined: checkTeam().score,
    declared: checkTeam().declared,
    finalPoints: document.getElementById('showFinalPoints').checked
      ? finalPoints.roundOne
        .map((s, i) => s += finalPoints.roundTwo[i])
        .map((s, i) => s += finalPoints.roundThree[i])
        : [],
    showEndPhase: document.getElementById('showEndPhase').checked,
    showFinalPoints: document.getElementById('showFinalPoints').checked,
    totalScore: totalScore
  })
}

// calculate the final points from each round
const getTotalPoints = () => {
  const saveName = getSaveName()

  const roundOneData = JSON.parse(fs.readFileSync(saveName + 1 + '.json').toString())
  const roundTwoData = JSON.parse(fs.readFileSync(saveName + 2 + '.json').toString())
  const roundThreeData = JSON.parse(fs.readFileSync(saveName + 3 + '.json').toString())

  const roundOnePoints = JSON.parse(roundOneData[1]).pointsAwarded
      .map((p, i) => p + JSON.parse(roundOneData[2]).pointsAwarded[i] + JSON.parse(roundOneData[3]).pointsAwarded[i])

  const roundTwoPoints = JSON.parse(roundTwoData[1]).pointsAwarded
      .map((p, i) => p + JSON.parse(roundTwoData[2]).pointsAwarded[i] + JSON.parse(roundTwoData[3]).pointsAwarded[i])

  const roundThreePoints = JSON.parse(roundThreeData[1]).pointsAwarded
      .map((p, i) => p + JSON.parse(roundThreeData[2]).pointsAwarded[i] + JSON.parse(roundThreeData[3]).pointsAwarded[i])

  totalScore = roundOnePoints
      .map((p, i) => p + roundTwoPoints[i] + roundThreePoints[i])

  sendToScoreboard()
}

// gets the name of the save from the form
const getSaveName = () => (document.getElementById('saveName').value ? document.getElementById('saveName').value : 'round')  + "-round-"

// updates the form to reflect the backend values
const updateForm = () => {
  let teamObj = checkTeam()

  updateScore(checkRadios())

  // updated displayed players
  if (playerList.length) {
    Array.from(document.querySelectorAll("input[name=player]"))
      .forEach((p, i) => {
        if (playerList[i]) {
          p.value = playerList[i]
        }
      })
  }

  // update displayed point declarations
  if (teamObj.declared.length) {
    Array.from(document.querySelectorAll("input[name=declaration]"))
      .forEach((d, i) => {
        teamObj.declared[i] ? d.value = teamObj.declared[i] : d.value = ''
      })
  }
}

// updates the player names
const updateNames = () => {
  playerList = Array.from(document.querySelectorAll("input[name=player]"))
    .map(p => p.value)

  minerUpdate(checkRadios(), "minerList")
  sendToScoreboard()
}

// executes when a radio is changed
const changeRadio = () => {
  updateForm()
  minerUpdate(checkRadios())
  updateScore(checkRadios())
  updateDeclared(checkRadios())
  sendToScoreboard()
}

const checkRound = () => {
  const radios = document.querySelectorAll('input[name=roundRadio]')

  let n = 1
  for (const r of radios) {
    if (r.checked) {
      currentRound = n
      return n
    }
    n++
  }
}

// changes to another round
const changeRound = () => {
  save(getSaveName() + currentRound, [playerList, teamOneData, teamTwoData, teamThreeData])

  checkRound()

  const data = load(getSaveName() + currentRound)
  changeRadio()

  if (data) {
    playerList = data[0]
    teamOneData = data[1]
    teamTwoData = data[2]
    teamThreeData = data[3]
  }
  else {
    teamOneData = { ...team }
    teamTwoData = { ...team }
    teamThreeData = { ...team }
  }

  updateForm()
}

// returns a number that corresponds to the mining radio which is checked
const checkRadios = () => {
  const radios = document.querySelectorAll('input[name=miningRadio]')

  let n = 1
  for (const r of radios) {
    if (r.checked) {
      return n
    }
    n++
  }
}

// returns the team that is currently mining
const checkTeam = () => {
  switch (checkRadios()) {
    case 1:
      return teamOneData
    case 2:
      return teamTwoData
    case 3:
      return teamThreeData
  }
}

// updates the display which shows who are the current miners
const minerUpdate = () => {
  let playerString = "Team " + checkRadios() + " Mining: "

  switch (checkRadios()) {
    case 1:
      playerString = playerString.concat(playerList.slice(0, 3).join(', '))
      break
    case 2:
      playerString = playerString.concat(playerList.slice(3, 6).join(', '))
      break
    case 3:
      playerString = playerString.concat(playerList.slice(6).join(', '))
  }

  document.getElementById('minerList').innerText = playerString
}

// updates the displayed score/mineral counts
const updateScore = (mineral, isIncrement) => {
  const teamObj = checkTeam()

  switch (mineral) {
    case "bronze":
      isIncrement ? teamObj.mineralCounts.nBronze++
        : teamObj.mineralCounts.nBronze === 0
          ? teamObj.mineralCounts.nBronze = 0
          : teamObj.mineralCounts.nBronze--
      break
    case "silver":
      isIncrement ? teamObj.mineralCounts.nSilver++
        : teamObj.mineralCounts.nSilver === 0
          ? teamObj.mineralCounts.nSilver = 0
          : teamObj.mineralCounts.nSilver--
      break
    case "gold":
      isIncrement ? teamObj.mineralCounts.nGold++
        : teamObj.mineralCounts.nGold === 0
          ? teamObj.mineralCounts.nGold = 0
          : teamObj.mineralCounts.nGold--
      break
    case "diamond":
      isIncrement ? teamObj.mineralCounts.nDiamond++
        : teamObj.mineralCounts.nDiamond === 0
          ? teamObj.mineralCounts.nDiamond = 0
          : teamObj.mineralCounts.nDiamond--
      break
    case "bomb":
      isIncrement ? teamObj.mineralCounts.nBomb++
        : teamObj.mineralCounts.nBomb === 0
          ? teamObj.mineralCounts.nBomb = 0
          : teamObj.mineralCounts.nBomb--
  }

  teamObj.score = teamObj.mineralCounts.nBomb >= 3 ? 0
    : teamObj.mineralCounts.nBronze + (teamObj.mineralCounts.nSilver * 2) + (teamObj.mineralCounts.nGold * 3)

  for (let i = 0; i < teamObj.mineralCounts.nDiamond; i++) {
    teamObj.score += teamObj.score
  }

  updateMineralCountDisplay()
}

const updateMineralCountDisplay = () => {
  const teamObj = checkTeam()

  document.getElementById('bronzeDisplay').textContent = "Bronze: " + teamObj.mineralCounts.nBronze.toString()
  document.getElementById('silverDisplay').textContent = "Silver: " + teamObj.mineralCounts.nSilver.toString()
  document.getElementById('goldDisplay').textContent = "Gold: " + teamObj.mineralCounts.nGold.toString()
  document.getElementById('diamondDisplay').textContent = "Diamonds: " + teamObj.mineralCounts.nDiamond.toString()
  document.getElementById('bombDisplay').textContent = "Bombs: " + teamObj.mineralCounts.nBomb.toString()

  document.getElementById('score').textContent = "Score: " + teamObj.score.toString()
}

// updates the list of declared points and the display of declared points
const updateDeclared = () => {
  const teamObj = checkTeam()

  teamObj.declared = Array.from(document.querySelectorAll("input[name=declaration]"))
    .map(d => parseInt(d.value))

  switch (checkRadios()) {
    case 1:
      teamObj.declared.splice(0, 3, 0, 0, 0)
      break
    case 2:
      teamObj.declared.splice(3, 3, 0, 0, 0)
      break
    case 3:
      teamObj.declared.splice(6, 3, 0, 0, 0)
  }

  // document.getElementById("declaredPoints").innerText = "Total Declared: "
  //   + teamObj.declared.reduce((m, n) => n ? m + n : m, 0)
  //     .toString()
}

// calculates the points to award to each player
const calculateFinal = () => {
  // array keeps track of awarded points
  const points = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]

  const teamObj = checkTeam()

  const declaredPoints = teamObj.declared.reduce((m, n) => m + n)

  // case if miners mined at least 3 bombs
  if (teamObj.mineralCounts.nBomb >= 3) {
    // players receive their declared points
    receiveDeclared(points)
  }
  // case if miners found more mineral points than the points declared
  else if (teamObj.score >= declaredPoints) {
    // players receive their declared points
    receiveDeclared(points)

    //miners split the remainder
    splitPoints(points, teamObj.score - declaredPoints)
  }
  // case if miners found less mineral points than points declared
  else if (teamObj.score < declaredPoints) {
    // points are split between miners
    splitPoints(points, teamObj.score)
    // highest declared goes to the lowest declared
    highToLow(points)
  }

  teamObj.pointsAwarded = [...points]

  switch (checkRound()) {
    case 1:
      finalPoints.roundOne.map((s, i) => s += teamObj.pointsAwarded[i])
      break
    case 2:
      finalPoints.roundTwo.map((s, i) => s += teamObj.pointsAwarded[i])
      break
    case 3:
      finalPoints.roundThree.map((s, i) => s += teamObj.pointsAwarded[i])
  }

  document.getElementById("finalPoints").innerText = "FINAL POINTS: " + finalString(points)
  sendToScoreboard()
}

// players who are not mining receive their declared points
const receiveDeclared = (pointArray) => {
  for (let i = 0; i < 9; i++) {
    pointArray[i] = checkTeam().declared[i]
  }
}

// splits points between mining players
const splitPoints = (pointArray, toSplit) => {
  switch (checkRadios()) {
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
const highToLow = (pointsArray) => {
  let teamObj = checkTeam()

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

const finalString = (pointsArray) => {
  let str = "";

  for (let i = 0; i < 9; i++) {
    str += "\n" + playerList[i] + ": " + pointsArray[i]
  }

  return str
}

document.getElementById('saveButton')
  .addEventListener('click', () =>
  save(getSaveName() + currentRound, [playerList, teamOneData, teamTwoData, teamThreeData]))

document.getElementById('loadButton')
  .addEventListener('click', () => {
    const data = load(getSaveName() + currentRound)

    if (data) {
      playerList = data[0]
      teamOneData = data[1]
      teamTwoData = data[2]
      teamThreeData = data[3]
    }
    else {
      teamOneData = { ...team }
      teamTwoData = { ...team }
      teamThreeData = { ...team }
    }

    updateForm()
  })
