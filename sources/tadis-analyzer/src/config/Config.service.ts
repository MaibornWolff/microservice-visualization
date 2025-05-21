import * as dotenv from 'dotenv'
import Joi from 'joi'
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
    } else {
      this.envConfig = {}
    }
    this.logger.log('using SOURCE_FOLDER: ' + this.getSourceFolder())
  }

  get(key: string): string {
    const value = this.envConfig[key]
    if (value && typeof value === 'string') {
      if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        this.logger.warn(
          'env variable ' + key + ' is surrounded by quotes: ' + value
        )
      }
    }
    if (!value) {
      this.logger.warn('access to undefined env variable ' + key)
    }
    return value
  }

  getSourceFolder(): string {
    return this.get('SOURCE_FOLDER')
  }

  getKubernetesNamespace(): string {
    return this.get('KUBERNETES_NAMESPACE')
  }

  getRabbitUrl(): string {
    return this.get('RABBIT_URL')
  }

  getRabbitUser(): string {
    return this.get('RABBIT_USER')
  }

  getRabbitPassword(): string {
    return this.get('RABBIT_PASSWORD')
  }

  getGitBaseUrls(): string[] {
    return this.stringToStringList(this.get('GIT_BASE_URLS'))
  }

  getExcludedNodeNames(): string[] {
    return this.stringToStringList(this.get('EXCLUDED_NODE_NAMES'))
  }

  private stringToStringList(input: string): string[] {
    if (input && input.length > 0) {
      return input.split(',').map((item) => item.trim())
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
      GIT_BASE_URLS: Joi.any().optional(),
      KUBERNETES_NAMESPACE: Joi.string().optional(),
      RABBIT_USER: Joi.string().optional(),
      RABBIT_PASSWORD: Joi.string().optional(),
      RABBIT_URL: Joi.string().optional()
    })

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(
      envConfig,
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
