# Pear Bundle Analyzer

Static analysis of a Pear app bundle. Performs static analysis on a Pear app bundle to generate a delta-encoded warm-up map for a specified entrypoint and preloads.

```
npm i pear-bundle analyzer
```

## Usage

```
const analyzer = new PearBundleAnalyzer(drive)
analyzer.ready()
const deflated = await analyzer.generate('app.js') // delta encoded warm-up map
const inflated = PearBundleAnalyzer.inflate(deflated)// delta decoded warm-up map
```

## API
### analyzer.generate(entrypoint, [assets])

Generates a delta-encoded warm-up map for the specified entrypoint.

- entrypoint (string): The starting point for the dependency-stream analysis.
- assets (Array) (optional): Additional assets to include in the warm-up map.

### PearBundleAnalyzer.inflate(map)

Decodes a delta-encoded warm-up map.

- map (object): A delta-encoded warm-up map generated by generate.

## License

Apache-2.0
