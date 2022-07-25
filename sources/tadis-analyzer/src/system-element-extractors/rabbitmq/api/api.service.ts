import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'

import { ConfigService } from '../../../config/Config.service'

@Injectable()
export class RabbitMqManagementApiService {
  private readonly logger = new Logger(RabbitMqManagementApiService.name)

  constructor(
    private config: ConfigService,
    private httpService: HttpService
  ) {}

  public async getQueues(): Promise<any> {
    const url = this.config.getRabbitUrl() + '/api/queues/'
    this.logger.log('get queues from url ' + url)
    return this.getData(url)
  }

  public async getBindings(queueName: string): Promise<any[]> {
    const vhost = '/'

    const url =
      this.config.getRabbitUrl() +
      '/api/queues/' +
      encodeURIComponent(vhost) +
      '/' +
      encodeURIComponent(queueName) +
      '/bindings/'

    this.logger.log('get bindings for ' + queueName + ' from url ' + url)
    return this.getData(url)
  }

  private async getData(url): Promise<any> {
    const axiosConfig = {
      auth: {
        username: this.config.getRabbitUser(),
        password: this.config.getRabbitPassword()
      }
    }

    try {
      const response = await this.httpService.axiosRef.get(url, axiosConfig)
      return response.data
    } catch (error) {
      this.logger.error(
        'sending request failed, using options: ' + JSON.stringify(axiosConfig)
      )
      throw error
    }
  }
}
