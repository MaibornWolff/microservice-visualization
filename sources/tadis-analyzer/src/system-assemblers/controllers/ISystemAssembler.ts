import { System, MicroService } from '../../model/ms.js'

export interface ISystemAssembler {
  getAllMicroservices(): Promise<MicroService[]>
  getSystem(): Promise<System>
}
