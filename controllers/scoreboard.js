const { ipcRenderer } = require("electron")

// tracker for currently mining team
let miningTeam = 1

let received = {}

// scoreboard will receive data that includes player names and scores
ipcRenderer.on('toScoreboard', (e, args) => {
  received = { ...args }

  showFinalPoints(received.showEndPhase)

  if (received.showFinalPoints) {
    getScores()
        .map((s, i) =>
          s.innerText = received.totalScore[i])
    pointTypes()
  } else {
    updateNames()
    updateScores()
  }
})

// hide or show total point values
const showFinalPoints = hide => {
  if (hide) {
    document.getElementById('team1totals').hidden = false
    document.getElementById('team2totals').hidden = false
    document.getElementById('team3totals').hidden = false
  } else {
    document.getElementById('team1totals').hidden = true
    document.getElementById('team2totals').hidden = true
    document.getElementById('team3totals').hidden = true
  }
}

// updates the names displayed
const updateNames = () => {
  getPlayers()
    .map((p, i) =>
      received.players[i] ? p.innerText = received.players[i] : p.innerText = 'Player')
}

// updates the scores displayed
const updateScores = () => {
  // set labels to reflect which team mined during the round
  pointTypes()

  // set declared points for all players
  setDeclaredPoints()

  // change display for the mining team and update scoreboard
  setMiningPoints()
}

// get the point type labels from DOM
const getPointLabels = () => {
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

  return teamArray
}

// sets the point type labels for each team
const pointTypes = () => {
  const teamArray = getPointLabels()

  if (received.showFinalScore) {
    teamArray[0].innerText = ''
    teamArray[1].innerText = ''
    teamArray[2].innerText = ''
  } else {
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
}

// change the display to reflect who mined during a round
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

// change the display to show the points declared by each player
const setDeclaredPoints = () => {
  getScores()
      .map((s, i) => s.innerText = received.declared[i])
}

// change the display to show the total amount of points each player received during a round
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

// calculate total amount of points earned by players at the end of a round
const calculateTotals = () => {
  getScores().map((s, i) => {
    s.innerText = (received.score[0][i] ? received.score[0][i] : 0)
      + (received.score[1][i] ? received.score[1][i] : 0)
      + (received.score[2][i] ? received.score[2][i] : 0)
  })
}

module.exports.showFinalPoints = showFinalPoints
module.exports.updateNames = updateNames
module.exports.updateScores = updateScores
module.exports.getPointLabels = getPointLabels
module.exports.pointTypes = pointTypes
module.exports.setMiningPoints = setMiningPoints
module.exports.setDeclaredPoints = setDeclaredPoints
module.exports.showPointTotals = showPointTotals
module.exports.getPlayers = getPlayers
module.exports.getScores = getScores
//module.exports.calculateTotals = calculateTotals