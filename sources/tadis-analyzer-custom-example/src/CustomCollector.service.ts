import { Injectable } from '@nestjs/common'

import {
  System, MicroService, Metadata, ElementMapping,
  SourceLocationDecorator,
  GitStorageService, ConfigService, SubSystemFromPayloadTransformer, MicroserviceWithOutgoingExchangeMerger,
  StaticNodeFilter, JavaAnnotationAnalyzer, FeignClientAnnotationAnalyzer, MicroservicesFromKubernetesCreator,
  RabbitMqBindingsFromApiAnalyzer, OutgoingExchangesFromSourceCreator, ExchangesFromEnvPayloadCreator,
  EnvDefinitionFromPodDecorator, LabelsFromDeploymentDecorator
} from 'tadis-analyzer'

@Injectable()
export class CustomCollectorService {

  constructor(
    private readonly microservicesCreator: MicroservicesFromKubernetesCreator,
    private readonly envDefinitionFromPodDecorator: EnvDefinitionFromPodDecorator,
    private readonly labelsFromDeploymentDecorator: LabelsFromDeploymentDecorator,
    private readonly rabbitMqBindingsAnalyzer: RabbitMqBindingsFromApiAnalyzer,
    private readonly outgoingExchangesCreator: OutgoingExchangesFromSourceCreator,
    private readonly exchangesFromEnvPayloadCreator: ExchangesFromEnvPayloadCreator,
    private readonly feignClientAnnotationAnalyzer: FeignClientAnnotationAnalyzer,
    private readonly javaAnnotationAnalyzer: JavaAnnotationAnalyzer,
    private readonly sourceLocationDecorator: SourceLocationDecorator,
    private readonly nodeFilter: StaticNodeFilter,
    private readonly microserviceWithOutgoingExchangeMerger: MicroserviceWithOutgoingExchangeMerger,
    private readonly subSystemTransformer: SubSystemFromPayloadTransformer,
    private readonly gitStorage: GitStorageService,
    private readonly configService: ConfigService
  ) { }

  public async getAllMicroservices(): Promise<MicroService[]> {
    // const system = await this.microservicesCreator.transform(new System(''))
    const system = await this.getAllMicroservicesFromSourceFolder()
    return system.getMicroServices()
  }

  public async getSystem(): Promise<System> {
    return this.getSystemFromSourceCodeOnly()
  }

  private async getSystemFromKubernetesRabbitMqSourceCode(): Promise<System> {
    let system = new System('')

    system = await this.microservicesCreator.transform(system)
    system = await this.envDefinitionFromPodDecorator.transform(system)
    system = await this.labelsFromDeploymentDecorator.transform(system)

    system = await this.rabbitMqBindingsAnalyzer.transform(system)
    system = await this.exchangesFromEnvPayloadCreator.transform(system)
    system = await this.outgoingExchangesCreator.transform(system)

    system = await this.feignClientAnnotationAnalyzer.transform(system)

    const elementMappings: ElementMapping[] = [
      {
        elementToDeriveNodeFrom: 'sendToExchange',
        nodeTypeToCreate: 'MessageExchange',
        nodeTypeDirection: 'target',
        edgeType: 'AsyncEventFlow'
      },
      {
        elementToDeriveNodeFrom: 'receiveFromExchange',
        nodeTypeToCreate: 'MessageExchange',
        nodeTypeDirection: 'source',
        edgeType: 'AsyncEventFlow'
      }
    ]
    system = await this.javaAnnotationAnalyzer.transform(system, 'EventProcessor', elementMappings)
    system = await this.sourceLocationDecorator.transform(system)

    system = await this.nodeFilter.transform(system)
    system = await this.microserviceWithOutgoingExchangeMerger.transform(system)

    system = await this.subSystemTransformer.transform(system, SubSystemFromPayloadTransformer.getSubSystemNameFromCabinetLabel)

    return system
  }

  private async getSystemFromSourceCodeOnly(): Promise<System> {
    let system = new System('')

    system = await this.getAllMicroservicesFromSourceFolder()

    system = await this.outgoingExchangesCreator.transform(system)

    system = await this.feignClientAnnotationAnalyzer.transform(system)

    const elementMappings: ElementMapping[] = [
      {
        elementToDeriveNodeFrom: 'sendToExchange',
        nodeTypeToCreate: 'MessageExchange',
        nodeTypeDirection: 'target',
        edgeType: 'AsyncEventFlow'
      },
      {
        elementToDeriveNodeFrom: 'receiveFromExchange',
        nodeTypeToCreate: 'MessageExchange',
        nodeTypeDirection: 'source',
        edgeType: 'AsyncEventFlow'
      }
    ]
    system = await this.javaAnnotationAnalyzer.transform(system, 'EventProcessor', elementMappings)
    system = await this.sourceLocationDecorator.transform(system)

    system = await this.nodeFilter.transform(system)
    system = await this.microserviceWithOutgoingExchangeMerger.transform(system)

    system = await this.subSystemTransformer.transform(system, SubSystemFromPayloadTransformer.getSubSystemNameFromCabinetLabel)

    return system
  }

  private async getAllMicroservicesFromSourceFolder(): Promise<System> {
    const storageStatus = await this.gitStorage.getStorageStatus()
    const metadata: Metadata = {
      transformer: 'custom git sources to microservices',
      context: this.configService.getSourceFolder()
    }
    const system = new System('System')
    storageStatus.forEach(status => {
      system.addMicroService(status.name, undefined, metadata)
    })
    return system
  }
}
