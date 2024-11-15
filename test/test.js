const test = require('brittle')
const Corestore = require('corestore')
const RAM = require('random-access-memory')
const Localdrive = require('localdrive')
const Mirrordrive = require('mirror-drive')
const PearWarmup = require('../index.js')
const Hyperdrive = require('hyperdrive')
const path = require('bare-path')

test('should generate map of esm app', async (t) => {
  const store = new Corestore(RAM)

  const app = path.join(__dirname, 'fixtures', 'esm-app')
  const localdrive = new Localdrive(app)
  const drive = new Hyperdrive(store)
  await localdrive.ready()
  await drive.ready()

  const mirror = new Mirrordrive(localdrive, drive)
  await mirror.done()

  const warmup = new PearWarmup(drive)
  warmup.ready()

  const deflated = await warmup.generate('app.js')
  const inflated = PearWarmup.inflate(deflated.meta, deflated.data)

  t.is(inflated.data.length, 2)

  // app.js
  t.is(inflated.data[0].start, 0)
  t.is(inflated.data[0].end, 1)

  // dep.js and sub-dep.js
  t.is(inflated.data[1].start, 2)
  t.is(inflated.data[1].end, 4)

  t.is(inflated.meta.length, 2)
})

test('should generate map of cjs app', async (t) => {
  const store = new Corestore(RAM)

  const app = path.join(__dirname, 'fixtures', 'cjs-app')
  const localdrive = new Localdrive(app)
  const drive = new Hyperdrive(store)
  await localdrive.ready()
  await drive.ready()

  const mirror = new Mirrordrive(localdrive, drive)
  await mirror.done()

  const warmup = new PearWarmup(drive)
  warmup.ready()

  const deflated = await warmup.generate('app.js')
  const inflated = PearWarmup.inflate(deflated.meta, deflated.data)

  t.is(inflated.data.length, 2)

  // app.js
  t.is(inflated.data[0].start, 0)
  t.is(inflated.data[0].end, 1)

  // dep.js and sub-dep.js
  t.is(inflated.data[1].start, 2)
  t.is(inflated.data[1].end, 4)

  t.is(inflated.meta.length, 2)
})
