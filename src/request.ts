import got, { Got } from 'got'
import { CookieJar } from 'tough-cookie'
import { HttpsProxyAgent } from 'hpagent'

import config from './config.js'
import { getProxy, removeProxy } from './service/proxy.js'
import logger from './service/log.js'

type RequestMethod = 'get' | 'post' | 'put' | 'patch' | 'head' | 'delete'

class Client {
  private client: Got
  private proxy: string

  constructor() {
    this.proxy = getProxy()

    const agent = this.configureProxy()

    this.client = got.extend({
      prefixUrl: config.baseURL,
      timeout: {
        request: config.timeout,
      },
      retry: {
        limit: config.retryCount,
      },
      cookieJar: new CookieJar(),
      agent: {
        https: agent,
      },
      throwHttpErrors: false,
    })
  }

  async request(method: RequestMethod, url: string, ...args: any[]): Promise<any> {
    const response = await this.client[method](url, ...args)

    if (response.statusCode === 503) {
      logger.warn('Proxy %s is blocked', this.proxy)

      // remove proxy from queue
      removeProxy(this.proxy)
      return
    }

    return response
  }

  private configureProxy(): HttpsProxyAgent {
    logger.debug('Using proxy %s', this.proxy)

    const proxyConfig = {
      proxy: `http://${config.proxy.username}:${config.proxy.password}@${this.proxy}`,
    }

    const agent = new HttpsProxyAgent(proxyConfig)

    return agent
  }
}

export default Client
