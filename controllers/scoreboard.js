const { ipcRenderer } = require("electron")

// tracker for current round
let roundNum = 1

// tracker for currently mining team
let miningTeam = 1

const received = {
  players: [],
  score: [],
  totalMined: 0,
  declared: []
}

// scoreboard will receive data that includes player names and scores
ipcRenderer.on('toScoreboard', (e, args) => {
  received.players = args.players
  roundNum = args.round
  miningTeam = args.mining
  received.totalMined = args.totalMined
  received.declared = args.declared
  received.score = args.score

  if (args.showEndPhase) {
    document.getElementById('team1totals').hidden = false
    document.getElementById('team2totals').hidden = false
    document.getElementById('team3totals').hidden = false
  } else {
    document.getElementById('team1totals').hidden = true
    document.getElementById('team2totals').hidden = true
    document.getElementById('team3totals').hidden = true
  }

  if (args.showFinalPoints) {
    getScores()
        .map((s, i) => s.innerText = args.finalPoints[i])
  } else {
    updateNames()
    updateScores()
  }
})

// updates the names displayed
const updateNames = () => {
  getPlayers()
    .map((p, i) => received.players[i] ? p.innerText = received.players[i] : p.innerText = 'Player')
}

// updates the scores displayed
const updateScores = () => {
  pointTypes()

  setDeclaredPoints()

  setMiningPoints()
}

// Sets the point type labels for each team
const pointTypes = () => {
  let teamArray = Array.from(
      document.getElementById("playerTable1")
          .getElementsByTagName('tr')[1]
          .getElementsByTagName('td'))

  teamArray.splice(1, 3)

  teamArray = teamArray.concat(Array.from(
      document.getElementById("playerTable2")
          .getElementsByTagName('tr')[1]
          .getElementsByTagName('td')))

  teamArray.splice(2, 3)

  teamArray = teamArray.concat(Array.from(
      document.getElementById("playerTable3")
          .getElementsByTagName('tr')[1]
          .getElementsByTagName('td')))

  teamArray.splice(3, 3)

  switch (miningTeam) {
    case 1:
      teamArray[0].innerText = 'Total Mined:'
      teamArray[1].innerText = 'Declared:'
      teamArray[2].innerText = 'Declared:'
      break
    case 2:
      teamArray[0].innerText = 'Declared'
      teamArray[1].innerText = 'Total Mined:'
      teamArray[2].innerText = 'Declared:'
      break
    case 3:
      teamArray[0].innerText = 'Declared:'
      teamArray[1].innerText = 'Declared:'
      teamArray[2].innerText = 'Total Mined:'
  }
}

const setMiningPoints = () => {
  let tempScores = getScores()

  switch (miningTeam) {
    case 1:
      tempScores[0].innerText = received.totalMined
      tempScores[1].innerText = ''
      tempScores[2].innerText = ''
      break
    case 2:
      tempScores[3].innerText = received.totalMined
      tempScores[4].innerText = ''
      tempScores[5].innerText = ''
      break
    case 3:
      tempScores[6].innerText = received.totalMined
      tempScores[7].innerText = ''
      tempScores[8].innerText = ''
  }
}

const setDeclaredPoints = () => {
  getScores()
      .map((s, i) => s.innerText = received.declared[i])
}

const showPointTotals = () => {
  getScores()
      .map((s, i) => s.innerText = received.score[i])
}

// get the players from scoreboard.html
const getPlayers = () => {
  let playerArray = Array.from(
      document.getElementById("playerTable1")
      .getElementsByTagName('tr')[0]
      .getElementsByTagName('th'))

  playerArray.shift()

  playerArray = playerArray.concat(Array.from(
      document.getElementById("playerTable2")
          .getElementsByTagName('tr')[0]
          .getElementsByTagName('th')))

  playerArray.splice(3, 1)

  playerArray = playerArray.concat(Array.from(
      document.getElementById("playerTable3")
          .getElementsByTagName('tr')[0]
          .getElementsByTagName('th')))

  playerArray.splice(6, 1)

  return playerArray
}

// get the scores for the current round from scoreboard.html
const getScores = () => {
  let scoresArray = Array.from(
      document.getElementById("playerTable1")
          .getElementsByTagName('tr')[1]
          .getElementsByTagName('td'))

  scoresArray.shift()

  scoresArray = scoresArray.concat(Array.from(
      document.getElementById("playerTable2")
          .getElementsByTagName('tr')[1]
          .getElementsByTagName('td')))

  scoresArray.splice(3, 1)

  scoresArray = scoresArray.concat(Array.from(
      document.getElementById("playerTable3")
          .getElementsByTagName('tr')[1]
          .getElementsByTagName('td')))

  scoresArray.splice(6, 1)

  return scoresArray
}

const calculateTotals = () => {
  let scoresArray = Array.from(
      document.getElementById("playerTable1")
          .getElementsByTagName('tr')[1]
          .getElementsByTagName('td'))

  scoresArray.shift()

  scoresArray = scoresArray.concat(Array.from(
      document.getElementById("playerTable2")
          .getElementsByTagName('tr')[1]
          .getElementsByTagName('td')))

  scoresArray.splice(3, 1)

  scoresArray = scoresArray.concat(Array.from(
      document.getElementById("playerTable3")
          .getElementsByTagName('tr')[1]
          .getElementsByTagName('td')))

  scoresArray.splice(6, 1)

  scoresArray.map((s, i) => {
    s.innerText = (received.score1[i] ? received.score1[i] : 0)
        + (received.score2[i] ? received.score2[i] : 0)
        + (received.score3[i] ? received.score3[i] : 0)
  })
}