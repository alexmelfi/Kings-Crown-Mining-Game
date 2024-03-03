const fs = require('fs')
const { ipcRenderer } = require('electron')

// player list
let playerList = Array.from(document.querySelectorAll("input[name=player]"))
  .map(p => p.value)

// object that holds team data
// mineralCounts: holds counts of each mineral
// score: mining score for the team
// declared: list of points declared by each player
// pointsAwarded: list of points awarded to each player

// data when team one is mining
let teamOneData = {
  mineralCounts: {
    nBronze: 0,
    nSilver: 0,
    nGold: 0,
    nDiamond: 0,
    nBomb: 0
  },
  score: 0,
  declared: [],
  pointsAwarded: []
}

// data when team two is mining
let teamTwoData = {
  mineralCounts: {
    nBronze: 0,
    nSilver: 0,
    nGold: 0,
    nDiamond: 0,
    nBomb: 0
  },
  score: 0,
  declared: [],
  pointsAwarded: []
}

// data when team three is mining
let teamThreeData = {
  mineralCounts: {
    nBronze: 0,
    nSilver: 0,
    nGold: 0,
    nDiamond: 0,
    nBomb: 0
  },
  score: 0,
  declared: [],
  pointsAwarded: []
}

// object that holds data to send to the scoreboard
const toSend = {
  data: 'look ma im data'
}

ipcRenderer.on('toMain', (e, args) => {
  console.log(args)
})

const sendPlayersToScoreboard = () => {
  ipcRenderer.send('toScoreboard', { players: playerList })
}

const sendPointsToScoreboard = () => {
  ipcRenderer.send('toScoreboard', { score: checkTeam().pointsAwarded })
}

// save game data to a JSON file
const save = () => {
  const data = [ JSON.stringify(playerList), JSON.stringify(teamOneData), JSON.stringify(teamTwoData), JSON.stringify(teamThreeData) ]
  const saveName = document.getElementById('saveName').value ? document.getElementById('saveName').value : 'round'

  fs.writeFile(saveName + ".json", JSON.stringify(data), err => {
    if (err) {
      console.log(err)

      throw err
    }

    console.log('Successfully wrote file')
  })
}

// load game data from JSON file
const load = () => {
  const saveName = document.getElementById('saveName').value ? document.getElementById('saveName').value : 'round'
  const data = JSON.parse(fs.readFileSync(saveName + '.json').toString())

  console.log(data)

  playerList = JSON.parse(data[0])
  teamOneData = JSON.parse(data[1])
  teamTwoData = JSON.parse(data[2])
  teamThreeData = JSON.parse(data[3])

  changeRadio()
}

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
  sendPlayersToScoreboard()
}

// executes when a radio is changed
const changeRadio = () => {
  updateForm()
  minerUpdate(checkRadios())
  updateScore(checkRadios())
  updateDeclared(checkRadios())
}

// returns a number that corresponds to the radio which is checked
const checkRadios = () => {
  const radios = document.querySelectorAll('input[type=radio]')

  let n = 1;
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

  document.getElementById("declaredPoints").innerText = "Total Declared: "
    + teamObj.declared.reduce((m, n) => n ? m + n : m, 0)
      .toString()
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

  document.getElementById("finalPoints").innerText = "FINAL POINTS: " + finalString(points)
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