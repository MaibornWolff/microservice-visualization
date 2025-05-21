import * as axios from 'axios'
import NodeCache from 'node-cache'
import { ConsulAnalyzerServiceResolver } from './ConsulAnalyzerServiceResolver.js'
import { INode } from '../domain/model.js'

export class SystemFetcher {

  private readonly cache
  private readonly SYSTEM_CACHE_KEY = 'system'

  constructor(private directSystemUrl: string, private alternativeResolver?: ConsulAnalyzerServiceResolver) {
    if (process.env.CACHE_TTL_SECONDS) {
      const cacheTTLSeconds = Number(process.env.CACHE_TTL_SECONDS)
      this.cache = new NodeCache({ stdTTL: cacheTTLSeconds })
    } else {
      this.cache = new NodeCache()
    }
  }

  invalidateCache() {
    this.cache.flushAll()
    console.log('flushed cache')
  }

  async fetchSystem(): Promise<INode> {
    if (this.isProduction()) {
      const cachedResponse = this.cache.get(this.SYSTEM_CACHE_KEY)
      if (cachedResponse) {
        console.log('using cached system')
        return cachedResponse
      }
    }

    const systemUrl = await this.getSystemUrl()
    if (!systemUrl) return null

    console.log('fetching system via url ' + systemUrl)
    try {
      const response = await axios.default.get(systemUrl)
      const system = response.data
      if (this.isProduction()) {
        console.log('caching system')
        this.cache.set(this.SYSTEM_CACHE_KEY, system)
      }
      return system
    } catch (error) {
      console.log('error: ' + error)
    }

    return null
  }

  private isProduction() {
    return process.env.NODE_ENV && process.env.NODE_ENV === 'production'
  }

  private async getSystemUrl(): Promise<string> {
    if (this.directSystemUrl) {
      return this.directSystemUrl
    } else if (this.alternativeResolver) {
      return this.alternativeResolver.resolveAnalyzerServiceUrl()
    }
  }
}
