// taken from https://github.com/piranna/env-yaml/blob/patch-1/lib/index.js

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { load } from 'js-yaml'

function loadIntoEnv (parsed) {
  const {env} = process
  for (const key in parsed) {
    if (!env.hasOwnProperty(key)) {
      const value = parsed[key]

      env[key] = typeof value === 'string' ? value : JSON.stringify(value)
    }
  }
}

function config ({encoding = 'utf8', intoEnv = true, path} = {}) {
  if (!path) path = resolve(process.cwd(), '.env.yml')

  try {
    const parsed = load(readFileSync(path, { encoding }))

    intoEnv !== false && loadIntoEnv(parsed)

    return { parsed }
  } catch (error) {
    return { error }
  }
}

const _config = config
export { _config as config }
const _load = config
export { _load as load }
