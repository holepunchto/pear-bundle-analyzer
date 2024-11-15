const test = require('brittle')
const Corestore = require('corestore')
const RAM = require('random-access-memory')
const Localdrive = require('localdrive')
const Mirrordrive = require('mirror-drive')
const PearBundleAnalyzer = require('../index.js')
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

  const analyzer = new PearBundleAnalyzer(drive)
  analyzer.ready()

  const deflated = await analyzer.generate('app.js')
  const inflated = PearBundleAnalyzer.inflate(deflated.meta, deflated.data)

  t.ok(inflated.data.length !== 0)
  t.ok(inflated.meta.length !== 0)
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

  const analyzer = new PearBundleAnalyzer(drive)
  analyzer.ready()

  const deflated = await analyzer.generate('app.js')
  const inflated = PearBundleAnalyzer.inflate(deflated.meta, deflated.data)

  t.ok(inflated.data.length !== 0)
  t.ok(inflated.meta.length !== 0)
})

// TODO add assets preload test
