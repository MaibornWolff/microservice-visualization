import * as fs from 'fs'

import * as dotenv from 'dotenv'
import * as Joi from 'joi'
import { Logger } from '@nestjs/common'

export interface EnvConfig {
  [key: string]: string
}

export class ConfigService {
  private readonly envConfig: { [key: string]: string }
  private readonly logger = new Logger(ConfigService.name)

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      dotenv.config()
      this.envConfig = this.validateEnvVariables(process.env)
      if (!fs.existsSync(this.getSourceFolder())) {
        throw new Error('SOURCE_FOLDER does not exist: ' + this.getSourceFolder())
      }
    } else {
      this.envConfig = {}
    }
    this.logger.log('using SOURCE_FOLDER: ' + this.getSourceFolder())
  }

  get(key: string): string {
    return this.envConfig[key]
  }

  getSourceFolder(): string {
    return this.get('SOURCE_FOLDER')
  }

  getKubernetesNamespace(): string {
    return this.get('KUBERNETES_NAMESPACE')
  }

  getRabbitMqApiBaseUrl(): string {
    return this.get('RABBITMQ_API_BASE_URL')
  }

  getGitBaseUrls(): string[] {
    return this.stringToStringList(this.get('GIT_BASE_URLS'))
  }

  getExcludedNodeNames(): string[] {
    return this.stringToStringList(this.get('EXCLUDED_NODE_NAMES'))
  }

  private stringToStringList(input: string): string[] {
    if (input && input.length > 0) {
      return input.split(',').map(item => item.trim())
    }
    return []
  }

  getPort(): number {
    return Number(this.get('PORT'))
  }

  private validateEnvVariables(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      PORT: Joi.number().default(3000),
      SOURCE_FOLDER: Joi.string().required(),
      GIT_BASE_URLS: Joi.string().required().min(1),
      // TODO: should only be required when the corresponding steps are active
      KUBERNETES_NAMESPACE: Joi.string().required(),
      RABBITMQ_API_BASE_URL: Joi.string().required()
    })

    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema,
      {
        allowUnknown: true
      }
    )
    if (error) {
      throw new Error(`Config validation error: ${error.message}`)
    }

    return validatedEnvConfig
  }
}
