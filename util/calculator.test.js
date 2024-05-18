const t = require('tap')

const calculator = require('./calculator.js')
const Team = require('../models/team.js')

t.test('receiveDeclared()', t => {
  // arranging test data
  const pointArray = [1, 1, 1, 1, 1, 1, 1, 1, 1]
  const testTeam = new Team

  // run function with test data
  calculator.receiveDeclared(pointArray, testTeam)

  // assertions
  t.same(testTeam.declared, pointArray, 'received points should be equal to the points declared')

  t.end()
})

t.test('splitPoints()', t => {
  t.test('should split points to team one if specified', t => {
    // arranging test data
    const pointArray = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    const toSplit = 30
    const teamNum = 1

    // run function with test data
    calculator.splitPoints(pointArray, toSplit, teamNum)

    // assertions
    t.same(pointArray, [10, 10, 10, 0, 0, 0, 0, 0, 0])

    t.end()
  })

  t.test('should split points to team two if specified', t => {
    // arranging test data
    const pointArray = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    const toSplit = 30
    const teamNum = 2

    // run function with test data
    calculator.splitPoints(pointArray, toSplit, teamNum)

    // assertions
    t.same(pointArray, [0, 0, 0, 10, 10, 10, 0, 0, 0])

    t.end()
  })

  t.test('should split points to team three if specified', t => {
    // arranging test data
    const pointArray = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    const toSplit = 30
    const teamNum = 3

    // run function with test data
    calculator.splitPoints(pointArray, toSplit, teamNum)

    // assertions
    t.same(pointArray, [0, 0, 0, 0, 0, 0, 10, 10, 10])

    t.end()
  })

  t.end()
})

t.test('highToLow()', t => {
  // arranging test data
  const pointArray = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  const testTeam = new Team

  testTeam.declared = [0, 0, 0, 4, 5, 6, 7, 8, 9]

  // run function with test data
  calculator.highToLow(pointArray, testTeam)

  // assertions
  t.equal(pointArray[8], -testTeam.declared[testTeam.declared.length - 1],
    'lowest declared player loses the points they declared')
  t.equal(pointArray[3], 9,
    'lowest declared player should receive the points of the highest declared')

  t.end()
})

t.test('finalString()', t => {
  // arranging test data
  const pointArray = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const playerList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

  // run function with test data
  const str = calculator.finalString(pointArray, playerList)

  // assertions
  t.equal(str, '\nA: 1\nB: 2\nC: 3\nD: 4\nE: 5\nF: 6\nG: 7\nH: 8\nI: 9',
    'final string should be formatted correctly')

  t.end()
})

t.test('calculateFinal()', t => {
  t.test('case when miners mined three or more bombs', t => {
    // arranging test data
    const testTeam = new Team
    const teamNum = 1

    testTeam.mineralCounts.nBomb = 3
    testTeam.declared = [0, 0, 0, 4, 5, 6, 7, 8, 9]

    // run function with test data
    const points = calculator.calculateFinal(testTeam, teamNum)

    // assertions
    t.same(points, testTeam.declared,
      'non-mining players should receive their declared points')

    t.end()
  })

  t.test('case when miners mined more than the total declared points', t => {
    // arranging test data
    const testTeam = new Team
    const teamNum = 1

    testTeam.score = 100
    testTeam.declared = [0, 0, 0, 5, 5, 5, 5, 5, 5]

    // run function with test data
    const points = calculator.calculateFinal(testTeam, teamNum)

    // assertions
    t.same(points, [23, 23, 23, 5, 5, 5, 5, 5, 5],
      'non-mining players should receive their declared points and remainder should be split amongst miners.')

    t.end()
  })

  t.test('case when miners mined less than the total declared points', t => {
    // arranging test data
    const testTeam = new Team
    const teamNum = 1

    testTeam.score = 30
    testTeam.declared = [0, 0, 0, 4, 5, 6, 7, 8, 9]

    // run function with test data
    const points = calculator.calculateFinal(testTeam, teamNum)

    // assertions
    t.same(points, [10, 10, 10, 9, 0, 0, 0, 0, -9],
      'points should be split amongst miners and the highest declared goes to lowest')

    t.end()
  })

  t.end()
})