import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'

import { CodePatternModule } from '../../system-element-extractors/experimental/code-pattern/CodePattern.module.js'

async function bootstrap() {
  const app = await NestFactory.create(CodePatternModule)
  const config = app.get('ConfigService')

  await app.listen(config.getPort())
  Logger.log('running at http://localhost:' + config.getPort())
}
// tslint:disable-next-line: no-floating-promises
bootstrap()
