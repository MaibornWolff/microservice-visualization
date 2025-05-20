import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { ConfigService } from 'tadis-analyzer'

import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  await app.listen(config.getPort())
  Logger.log('running at http://localhost:' + config.getPort())
}
bootstrap()
