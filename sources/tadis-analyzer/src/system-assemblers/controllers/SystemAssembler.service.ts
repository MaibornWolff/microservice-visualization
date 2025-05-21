import { Injectable } from '@nestjs/common'

import { System, MicroService } from '../../model/ms.js'
import { ISystemAssembler } from './ISystemAssembler.js'

@Injectable()
export class SystemAssembler implements ISystemAssembler {
  public async getAllMicroservices(): Promise<MicroService[]> {
    return []
  }

  public async getSystem(): Promise<System> {
    return new System('')
  }
}
