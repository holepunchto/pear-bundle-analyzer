const test = require('brittle')
const Corestore = require('corestore')
const RAM = require('random-access-memory')
const Localdrive = require('localdrive')
const Mirrordrive = require('mirror-drive')
const DriveAnalyzer = require('../index.js')
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

  const analyzer = new DriveAnalyzer(drive)
  analyzer.ready()

  const encoded = await analyzer.analyze(['app.js'])
  const decoded = DriveAnalyzer.decode(encoded.meta, encoded.data)

  t.ok(decoded.data.length !== 0)
  t.ok(decoded.meta.length !== 0)
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

  const analyzer = new DriveAnalyzer(drive)
  analyzer.ready()

  const encoded = await analyzer.analyze(['app.js'])
  const decoded = DriveAnalyzer.decode(encoded.meta, encoded.data)

  t.ok(decoded.data.length !== 0)
  t.ok(decoded.meta.length !== 0)
})

test('preload asset', async (t) => {
  const store = new Corestore(RAM)

  const app = path.join(__dirname, 'fixtures', 'preload-app')
  const localdrive = new Localdrive(app)
  const drive = new Hyperdrive(store)
  await localdrive.ready()
  await drive.ready()

  const mirror = new Mirrordrive(localdrive, drive)
  await mirror.done()

  const analyzer = new DriveAnalyzer(drive)
  analyzer.ready()

  const encoded = await analyzer.analyze(['app.js'], ['/assets/asset.txt'])
  const decoded = DriveAnalyzer.decode(encoded.meta, encoded.data)

  t.ok(decoded.data.length !== 0)
  t.ok(decoded.meta.length !== 0)
})

test('html entrypoint', async (t) => {
  const store = new Corestore(RAM)

  const app = path.join(__dirname, 'fixtures', 'pear-desktop-app')
  const localdrive = new Localdrive(app)
  const drive = new Hyperdrive(store)
  await localdrive.ready()
  await drive.ready()

  const mirror = new Mirrordrive(localdrive, drive)
  await mirror.done()

  const analyzer = new DriveAnalyzer(drive)
  analyzer.ready()

  const encoded = await analyzer.analyze(['index.html'])
  const decoded = DriveAnalyzer.decode(encoded.meta, encoded.data)

  t.ok(decoded.data.length !== 0)
  t.ok(decoded.meta.length !== 0)
})

test('preload folder', async (t) => {
  const store = new Corestore(RAM)

  const app = path.join(__dirname, 'fixtures', 'preload-app')
  const localdrive = new Localdrive(app)
  const drive = new Hyperdrive(store)
  await localdrive.ready()
  await drive.ready()

  const mirror = new Mirrordrive(localdrive, drive)
  await mirror.done()

  const analyzer = new DriveAnalyzer(drive)
  analyzer.ready()

  const encoded = await analyzer.analyze([], ['/assets'])
  const decoded = DriveAnalyzer.decode(encoded.meta, encoded.data)

  t.ok(decoded.data.length !== 0)
  t.ok(decoded.meta.length !== 0)
})
