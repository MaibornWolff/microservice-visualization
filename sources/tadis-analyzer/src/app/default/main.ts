import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'

import { KubernetesRabbitMqAssemblerModule } from '../../system-assemblers/kubernetes-rabbitmq/KubernetesRabbitMqAssembler.module'
import { ConfigService } from '../../config/Config.service'

async function bootstrap() {
  const app = await NestFactory.create(KubernetesRabbitMqAssemblerModule)
  const config = app.get(ConfigService)

  await app.listen(config.getPort())
  Logger.log('running at http://localhost:' + config.getPort())
}

// tslint:disable-next-line: no-floating-promises
bootstrap()
