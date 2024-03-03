const { ipcRenderer } = require("electron")

// player list
let playerList = Array.from(document.querySelectorAll("div[name=players] > h2"))

const toSend = {
  data: 'coming from scoreboard'
}

const received = {
  players: [],
  score: []
}

// scoreboard will receive data that includes player names and scores
ipcRenderer.on('toScoreboard', (e, args) => {
  console.log(args)
  args.players ? received.players = args.players : received.score = args.score
  updateNames()
})

// updates the names displayed
const updateNames = () => {
  Array.from(document.querySelectorAll("div[name=players] > h2"))
    .map((p, i) => received.players[i] ? p.innerText = received.players[i] : p.innerText = 'Player')
}