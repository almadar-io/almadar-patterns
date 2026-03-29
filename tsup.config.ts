import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  async onSuccess() {
    // Copy JSON files to dist
    const jsonFiles = [
      'component-mapping.json',
      'event-contracts.json',
      'integrators-registry.json',
      'patterns-registry.json',
      'services-registry.json'
    ];
    for (const file of jsonFiles) {
      fs.copyFileSync(
        path.join('src', file),
        path.join('dist', file)
      );
    }
    // Also copy patterns-registry.json as registry.json for backwards compatibility
    fs.copyFileSync(
      path.join('src', 'patterns-registry.json'),
      path.join('dist', 'registry.json')
    );
    console.log('✓ Copied JSON files to dist');
  },
});
