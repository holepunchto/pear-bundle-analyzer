# Drive Analyzer

Static analysis of a Hyperdrive bundle. Performs static analysis on a Hyperdrive bundle to generate a delta-encoded warm-up map for a specified entrypoint and preloads.

```
npm i drive-analyzer
```

## Usage

```
const analyzer = new DriveAnalyzer(drive)
analyzer.ready()
const deflated = await analyzer.generate(['app.js']) // delta encoded warm-up map
const inflated = DriveAnalyzer.inflate(deflated)// delta decoded warm-up map
```

## API
### analyzer.analyze(entrypoint, [assets])

Generates a delta-encoded warm-up map for the specified entrypoint.

- entrypoints (Array) (string): The starting points for the dependency-stream analysis.
- assets (Array) (optional): Additional assets to include in the warm-up map. If a folder is specified, all files and subfolders within that folder will be included.

### DriveAnalyzer.decode(map)

Decodes a delta-encoded warm-up map.

- map (object): A delta-encoded warm-up map generated.

## License

Apache-2.0
