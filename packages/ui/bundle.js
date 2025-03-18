import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
import { sassPlugin } from 'esbuild-sass-plugin'
import { commonjs } from '@hyrious/esbuild-plugin-commonjs'

const removeCSSImports = {
  name: 'remove-css-imports',
  setup(build) {
    build.onLoad({ filter: /.*/ }, async (args) => {
      if (args.path.includes('node_modules') || !args.path.includes(dirname)) return
      const contents = await fs.promises.readFile(args.path, 'utf8')
      const withRemovedImports = contents.replace(/import\s+.*\.scss';?[\r\n\s]*/g, '')
      return { contents: withRemovedImports, loader: 'default' }
    })
  },
}

const useClientPlugin = {
  name: 'use-client',
  setup(build) {
    const originalWrite = build.initialOptions.write
    build.initialOptions.write = false

    build.onEnd((result) => {
      if (result.outputFiles && result.outputFiles.length > 0) {
        const directive = `"use client";`
        const directiveRegex = /"use client";/g

        result.outputFiles.forEach((file) => {
          let contents = file.text

          if (!file.path.endsWith('.map')) {
            contents = contents.replace(directiveRegex, '')
            contents = directive + '\n' + contents
          }

          if (originalWrite) {
            const filePath = path.join(build.initialOptions.outdir, path.basename(file.path))

            const dirPath = path.dirname(filePath)
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, { recursive: true })
            }

            fs.writeFileSync(filePath, contents, 'utf8')
          }
        })
      } else {
        console.error('No output files are available to process in useClientPlugin.')
      }
    })
  },
}

async function build() {
  await esbuild.build({
    entryPoints: ['src/exports/client/index.ts'],
    bundle: true,
    minify: true,
    outdir: 'dist-styles',
    packages: 'external',
    plugins: [sassPlugin({ css: 'external' })],
  })

  try {
    fs.renameSync('dist-styles/index.css', 'dist/styles.css')
    fs.rmdirSync('dist-styles', { recursive: true })
  } catch (err) {
    console.error(`Error while renaming index.css and dist-styles: ${err}`)
    throw err
  }

  console.log('styles.css bundled successfully')
  const resultClient = await esbuild.build({
    entryPoints: ['dist/exports/client/index.js'],
    bundle: true,
    platform: 'browser',
    format: 'esm',
    outdir: 'dist/exports/client_optimized',
    splitting: true,
    write: true,
    banner: {
      js: `// Workaround for react-datepicker and other cjs dependencies potentially inserting require("react") statements
import * as requireReact from 'react';
import * as requireReactDom from 'react-dom';

function require(m) {
 if (m === 'react') return requireReact;
 if (m === 'react-dom') return requireReactDom;
 throw new Error(\`Unknown module \${m}\`);
}
// Workaround end
`,
    },
    external: [
      '*.scss',
      '*.css',
      'qs-esm',
      '@dnd-kit/core',
      '@payloadcms/graphql',
      '@payloadcms/translations',
      'dequal',
      'payload',
      'payload/*',
      'react',
      'react-dom',
      'next',
      'crypto',
    ],
    minify: true,
    metafile: true,
    treeShaking: true,

    tsconfig: path.resolve(dirname, './tsconfig.json'),
    plugins: [removeCSSImports, useClientPlugin],
    sourcemap: true,
  })
  console.log('client.ts bundled successfully')

  const resultShared = await esbuild.build({
    entryPoints: ['src/exports/shared/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outdir: 'dist/exports/shared',
    splitting: false,
    treeShaking: true,
    external: [
      '*.scss',
      '*.css',
      'qs-esm',
      '@dnd-kit/core',
      '@payloadcms/graphql',
      '@payloadcms/translations',
      'dequal',
      'payload',
      'payload/*',
      'react',
      'react-dom',
      'next',
      'crypto',
      '@floating-ui/react',
      'date-fns',
      'react-datepicker',
    ],
    minify: true,
    metafile: true,
    tsconfig: path.resolve(dirname, './tsconfig.json'),
    plugins: [removeCSSImports, commonjs()],
    sourcemap: true,
  })
  console.log('shared.ts bundled successfully')

  fs.writeFileSync('meta_client.json', JSON.stringify(resultClient.metafile))
  fs.writeFileSync('meta_shared.json', JSON.stringify(resultShared.metafile))
}

await build()
