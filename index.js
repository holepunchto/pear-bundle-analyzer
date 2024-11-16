const DependencyStream = require('dependency-stream')
const ReadyResource = require('ready-resource')
const { extname } = require('bare-path')

class PearBundleAnalyzer extends ReadyResource {
  static META = 0
  static DATA = 1

  constructor (drive) {
    super()
    this._drive = drive
    this._meta = new Set()
    this._data = new Set()
  }

  async _open () {
    await this._drive.ready()
  }

  async _close () {
  }

  async _isJS (path) {
    return extname(path) === '.js' || extname(path) === '.mjs'
  }

  async _analyzeJS (entrypoint) {
    const dependencyStream = new DependencyStream(this._drive, { entrypoint })
    for await (const dep of dependencyStream) {
      const entry = await this._drive.entry(dep.key, { onseq: (seq) => this.capture(seq, this.constructor.META) })
      const blob = entry.value.blob
      const range = [blob.blockLength, blob.blockOffset]
      this.capture(range)
    }
  }

  async _analyzeAsset (asset) {
    const entry = await this._drive.entry(asset, { onseq: (seq) => this.capture(seq, this.constructor.META) })
    const blob = entry.value.blob
    const range = [blob.blockLength, blob.blockOffset]
    this.capture(range)
  }

  async generate (entrypoint, assets = []) {
    this._meta.clear() // reset state
    this._data.clear()

    if (entrypoint && this._isJS(entrypoint)) {
      await this._analyzeJS(entrypoint)
    }

    for (const asset of assets) {
      await this._analyzeAsset(asset)
    }

    return this.deflate()
  }

  capture (seq, core = this.constructor.DATA) {
    if (Array.isArray(seq)) {
      const [blockLength, blockOffset] = seq
      for (let i = 0; i < blockLength; i++) this.capture(i + blockOffset)
    } else {
      if (core === this.constructor.META) this._meta.add(seq)
      if (core === this.constructor.DATA) this._data.add(seq)
    }
  }

  deflate () { return { meta: deflate(this._meta), data: deflate(this._data) } }

  static inflate (meta, data) { return { meta: inflate(meta), data: inflate(data) } }
}

// delta encoding

function deflate (set) {
  const array = [...set]
  array.sort((a, b) => a - b)
  return array.map((n, i) => {
    if (i === 0) return n
    return n - array[i - 1]
  }).filter((n, i) => {
    return i === 0 || n > 0
  })
}

// delta decoding

function inflate (array) {
  const { ranges } = array.reduce(({ ranges, sum }, n, i) => {
    if (i === 0) {
      ranges.push({ start: n, end: n + 1 })
      return { ranges, sum: n }
    }

    sum += n

    if (n === 1) ranges[ranges.length - 1].end += 1
    else ranges.push({ start: sum, end: sum + 1 })

    return { ranges, sum }
  }, { ranges: [], sum: 0 })

  return ranges
}

module.exports = PearBundleAnalyzer
