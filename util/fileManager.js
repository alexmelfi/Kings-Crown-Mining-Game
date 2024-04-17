const fs = require('fs')

module.exports = {
  // save game data to a JSON file.
  // saveName: name to be prefixed to save file.
  // dataArray: expects an array of size 4 with the first element being the list of players followed by three team objects.
  save: (saveName, dataArray) => {
    const data = dataArray.map(d => JSON.stringify(d))

    fs.writeFileSync(saveName + ".json", JSON.stringify(data), err => {
      if (err) {
        console.log(err)

        throw err
      }

      console.log('Successfully wrote file')
    })
  },

  // load game data from JSON file.
  // saveName: save name which is prefixed to the name of the save file.
  // cb: function to call after file has been loaded
  // returns an array of size 4 with the first element being the list of players followed by three team objects.
  load: saveName => {
    try {
      const data = JSON.parse(fs.readFileSync(saveName + '.json').toString())

      return data.map(d => JSON.parse(d))
    }
    catch (e) {
      return undefined
    }
  }
}