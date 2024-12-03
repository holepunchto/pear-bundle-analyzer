const DependencyStream = require('dependency-stream')
const ReadyResource = require('ready-resource')
const { extname } = require('bare-path')
const resolve = require('unix-path-resolve')

class DriveAnalyzer extends ReadyResource {
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

  _isJS (path) {
    return extname(path) === '.js' || extname(path) === '.mjs'
  }

  _isHTML (path) {
    return extname(path) === '.html'
  }

  _isCustomScheme (str) {
    return /^[a-z][a-z0-9]+:/i.test(str)
  }

  _sniffJS (src) {
    const s1 = src.match(/"[^"]+"/ig)
    const s2 = src.match(/'[^']+'/ig)

    const entries = []

    if (s1) {
      for (const s of s1) {
        if (/\.(m|c)?js"$/.test(s)) {
          entries.push(s.slice(1, -1))
        }
      }
    }

    if (s2) {
      for (const s of s2) {
        if (/\.(m|c)?js'$/.test(s)) {
          entries.push(s.slice(1, -1))
        }
      }
    }

    return entries.filter(e => !this._isCustomScheme(e))
  }

  async _analyzeEntrypoint (entrypoint) {
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
    if (entry) {
      const blob = entry.value.blob
      const range = [blob.blockLength, blob.blockOffset]
      this.capture(range)
    } else {
      for await (const e of this._drive.list(asset)) {
        this._analyzeAsset(e)
      }
    }
  }

  async _extractJSFromHTML (entrypoints) {
    const expandedEntrypoints = []
    for (const entrypoint of entrypoints) {
      if (this._isHTML(entrypoint)) {
        const html = await this._drive.get(resolve('/', entrypoint))
        if (html) expandedEntrypoints.push(...this._sniffJS(html.toString()))
      } else {
        expandedEntrypoints.push(entrypoint)
      }
    }
    return expandedEntrypoints
  }

  async analyze (entrypoints = [], assets = []) {
    this._meta.clear()
    this._data.clear()

    entrypoints = await this._extractJSFromHTML(entrypoints)

    for await (const entrypoint of entrypoints.map(e => resolve('/', e))) {
      if (entrypoint && this._isJS(entrypoint)) {
        await this._analyzeEntrypoint(entrypoint)
      }
    }

    for (const asset of assets.map(e => resolve('/', e))) {
      await this._analyzeAsset(asset)
    }

    return this._encode()
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

  _encode () { return { meta: encode(this._meta), data: encode(this._data) } }

  static decode (meta, data) { return { meta: decode(meta), data: decode(data) } }
}

// delta encoding

function encode (set) {
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

function decode (array) {
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

module.exports = DriveAnalyzer
