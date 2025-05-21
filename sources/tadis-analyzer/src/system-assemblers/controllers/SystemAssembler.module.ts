import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/Config.module.js'
import { SystemAssemblerController } from './SystemAssembler.controller.js'
import { SystemAssembler } from './SystemAssembler.service.js'
import { ISystemAssembler } from './ISystemAssembler.js'
import { GitModule } from '../../git/Git.module.js'

@Module({
  imports: [ConfigModule, GitModule],
  controllers: [SystemAssemblerController],
  providers: [SystemAssembler],
  exports: [SystemAssembler]
})
class SystemAssemblerModule {}

export {
  SystemAssemblerModule,
  SystemAssembler,
  SystemAssemblerController,
  ISystemAssembler
}
