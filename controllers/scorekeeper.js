const fs = require('fs')
const { ipcRenderer } = require('electron')

const Team = require(__dirname + '/models/team')
const fileManager = require(__dirname + '/util/fileManager')
const calculator = require(__dirname + '/util/calculator')

const save = fileManager.save
const load = fileManager.load

// player list
let playerList = Array.from(document.querySelectorAll("input[name=player]"))
  .map(p => p.value)

let currentRound = 1

let totalScore = []

// data when team one is mining
let teamOneData = new Team

// data when team two is mining
let teamTwoData = new Team

// data when team three is mining
let teamThreeData = new Team

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
    // finalPoints: document.getElementById('showFinalPoints').checked
    //   ? finalPoints.roundOne
    //     .map((s, i) => s += finalPoints.roundTwo[i])
    //     .map((s, i) => s += finalPoints.roundThree[i])
    //     : [],
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
}

// calculate and update the final scores for the round
const calculateFinal = () => {
  const points = calculator.calculateFinal(checkTeam(), checkRadios())

  document.getElementById("finalPoints").innerText = "FINAL POINTS: " + calculator.finalString(points, playerList)
  sendToScoreboard()
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

module.exports.sendToScoreboard = sendToScoreboard
module.exports.getTotalPoints = getTotalPoints
module.exports.getSaveName = getSaveName
module.exports.updateForm = updateForm
module.exports.updateNames = updateNames
module.exports.changeRadio = changeRadio
module.exports.checkRound = checkRound
module.exports.changeRound = changeRound
module.exports.checkRadios = checkRadios
module.exports.checkTeam = checkTeam
module.exports.minerUpdate = minerUpdate
module.exports.updateScore = updateScore
module.exports.updateMineralCountDisplay = updateMineralCountDisplay
module.exports.updateDeclared = updateDeclared
module.exports.calculateFinal = calculateFinal
