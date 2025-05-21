import { ConfigService } from './Config.service.js'
import { describe, it, beforeEach, expect } from 'vitest'

describe(ConfigService.name, () => {

  beforeEach(() => {
    process.env = {}
  })

  it('validate env variable is a number', () => {
    setAllRequiredEnvVars()

    process.env.PORT = '2'
    const config = new ConfigService()
    expect(config.getPort()).toBe(2)
    expect(typeof config.getPort()).toBe('number')
  })

  // TODO: more tests needed here
})

function setAllRequiredEnvVars() {
  process.env.PORT = '1'
  process.env.SOURCE_FOLDER = './src'
  process.env.GIT_BASE_URLS = 'git'
  process.env.KUBERNETES_NAMESPACE = 'ns'
  process.env.RABBIT_USER = 'guest'
  process.env.RABBIT_PASSWORD = 'guest'
  process.env.RABBIT_URL = 'http'
}
