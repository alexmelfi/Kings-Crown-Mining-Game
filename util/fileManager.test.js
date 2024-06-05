const t = require('tap')
const FS = require('fs')

const fileManager = t.mockRequire('./fileManager.js', {
  fs: t.createMock(FS, {
    writeFileSync: (file, data, options) => { options() },
    readFileSync: () => JSON.stringify(['\"a\"', '\"b\"', '\"c\"'])
  }),
})

t.test('save()', t => {
  t.test('should run fs.writeFileSync() and write a success message to the console', t => {
    // arranging test data
    const saveName = 'test'
    const dataArray = ['a', 'b', 'c']

    // run function with test data
    const results = t.capture(console, 'log', console.log)
    fileManager.save(saveName, dataArray)

    t.match(results(), [{ args: ['Successfully wrote file'] }])

    t.end()
  })

  t.end()
})

t.test('load()', t => {
  t.test('should call readFileSync() to read an array of JSON objects from a JSON file and return it', t => {
    // arranging test data
    const saveName = 'test'

    // run function with test data
    const results = fileManager.load(saveName)

    t.match(results, ['a', 'b', 'c'])

    t.end()
  })

  t.end()
})