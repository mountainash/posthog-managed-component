const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  minify: true,
  format: 'esm',
  target: 'node',
  outdir: './components/posthog',
})

if (!result.success) {
  console.error('Build failed')
  for (const message of result.logs) {
    console.error(message)
  }
}
