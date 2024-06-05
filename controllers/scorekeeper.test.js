const t = require('tap')
const { ipcRenderer } = require('electron')
const { JSDOM } = require('jsdom')

t.beforeEach(t => {
  const dom = new JSDOM(JSDOM.fromFile('../index.html'))
  const document = dom.window.document
})

const scorekeeper = require('./scorekeeper')

t.test('getTotalPoints()', t => {
  console.log(document)
  t.end()
})