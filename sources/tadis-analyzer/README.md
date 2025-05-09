# tadis-analyzer

tadis-analyzer can discover the architecture of a microservice system by collecting information about the system from different sources. These sources include infrastructure services, e.g. Kubernetes and RabbitMQ, which provide real-time information, and Git repositories, which add information from static source code analysis.

TADIS is designed as a DEV tool that a gives a team an overview of the services and their dependencies when planning further development of the system. It allows to customize the analysis in order to visualize system-specific architecture aspects. TADIS is not intended for system performance analysis.

The analyzer is provided as a stand-alone microservice as well as a NPM package which can be integrated into a self-made microservice. Either way, it provides a generic REST controller with the following endpoints:
* `/collect/system` uses a CollectorService to create a graph of a microservice system by using different transformers. A small example is given in [here for Kubernetes and RabbitMQ](src/system-assemblers/kubernetes-rabbitmq/KubernetesRabbitMqAssembler.service.ts). A larger example is given in the [customized-analyzer-example](../customized-analyzer-example/README.md). The available transformers are described in the next section.
* `/collect/source` triggers a source code import for all microservices. The CollectorService provides a list of available microservices. For each microservice, an import of its Git repository is triggered by using the [GitStorage service](src/git/GitStorage.service.ts).
* `/source/store/repository/:repositoryName` allows to trigger the import of a specific microservice repository.
* `/source/status` gives a info object of the imported repositories.

## Configuration

Environment Variables:
- PORT: defines the PORT of the REST endpoints
- SOURCE_FOLDER: defines the folder where source code is stored on import
- GIT_BASE_URLS: is a comma-separated list of base URLs that are inspected for microservice repository locations.

## Usage

* install: `npm install`
* run: `npm run start`
* build Docker image: `npm run docker-build`
* run Docker image: `npm run docker-run`

## Getting Started

Please see [custom-example-analyzer](../custom-example-analyzer/README.md).

## Transformers

Transformers are used by a collector to assemble a system by collecting information from different sources. Each transformer gets an input system and transforms the system into an output system.

A system uses concepts of microservice systems which are [defined by this model](src/model/ms.ts). The system model is a typed extension of a [generic model](src/model/core.ts).

The following transformers are available out-of-the-box:

- Kubernetes Transformers
  - MicroservicesFromKubernetesCreator
  - EnvDefinitionFromPodDecorator
  - LabelsFromDeploymentDecorator
- Java Transformers
  - FeignClientAnnotationAnalyzer
  - JavaAnnotationAnalyzer
- RabbitMQ Transformers
  - RabbitMqBindingsFromApiAnalyzer
  - ExchangesFromEnvPayloadCreator
  - OutgoingExchangesFromSourceCreator
  - MicroserviceWithOutgoingExchangeMerger
- Common Transformers
  - SourceLocationDecorator
  - StaticNodeFilter
  - SubSystemFromPayloadTransformer
- Source Pattern Analyzer

The transformers and their configuration options are described in next sections.

### Kubernetes Transformers

Environment Variables:
- KUBERNETES_NAMESPACE: All Kubernetes transformers use this fixed namespace.

Assumptions in each transformer:
- `pod.metadata.name` starts with a microservice name which is followed by minus character, e.g. `microservicename-8648fc44bb-5qnm8`
- this assumption is violated if you use minus in your microservice names and if you have multiple microservices beginning with the same name

#### MicroservicesFromKubernetesCreator

- gets all services and pods from the Kubernetes namespace
- creates a microservice for each service that also has a pod
- assumptions:
  - `service.metadata.name` is a microservice name

#### EnvDefinitionFromPodDecorator

- gets all pods from the Kubernetes namespace
- adds attribute `env` of each `container` in `pod.spec.containers` to the payload of the microservice

#### LabelsFromDeploymentDecorator

- gets all deployments from the Kubernetes namespace
- adds attribute `labels` from `deployment.metadata.labels` to the payload of the microservice

### Java Transformers

#### FeignClientAnnotationAnalyzer

- searches in the source code of each microservice for `*.java` files for the pattern `/@FeignClient\s*\(\s*(value\s*=)?\s*"([\w-]+)"/`
- for each value creates a SyncDataFlow between the current microservice and the target microservice referred to in value

#### JavaAnnotationAnalyzer (non-MSA)

- an attempt to generalize analyzers for Java annotations
- the transform method is passed an annotation to search for and actions defined as mapping of annotation elements to graph extensions
- [see source code](sources/tadis-analyzer/src/java/JavaAnnotationAnalyzer.ts) for details

````typescript
transform(system: System, annotation: string, elementMappings: ElementMapping[]): Promise<System> { ... }
````

### RabbitMQ Transformers

#### RabbitMqBindingsFromApiAnalyzer

- uses the [RabbitMQ Management Plugin](https://www.rabbitmq.com/management.html)
- gets all queue to exchange bindings for each queue via `/api/queues/<vhost>/<queueName>/bindings/` (only supports vhost `/`)
- if queue name equals `<microservice-name>.<text>` for any existing microservice
  - then an AsyncEventFlow is created between the exchange and microservice
  - else a MessageQueue is created and used instead of the microservice

Environment Variables:
- RABBIT_USER and RABBIT_PASSWORD for use in basic auth
- RABBIT_URL: base URL to RabbitMQ Management API

#### ExchangesFromEnvPayloadCreator

- searches in each node payload for an `env` attribute
- the `env` attribute must be of type EnvEntry[]

````typescript
type EnvEntry = {
  name: string,
  value: string
}
````

- for each `env.name` that contains the string `EXCHANGE`
  - if the `env.name` also contains the string `OUTGOING` then an AsyncEventFlow is added between the current microservice and the exchange defined in `env.value`
  - if instead the `env.name` also contains the string `INCOMING`then an AsyncEventFlow is added from the exchange towards the current microservice

#### OutgoingExchangesFromSourceCreator

- searches in the source code of each microservice for `.java` files that also have `send` in their filename
- searches for variable assignments matching the pattern `/exchange[\w]*[\s]*=\s*"(\w+)"/ig` where the expression identifies the exchange that is used for sending messages.
- for each sending exchange found, creates an AsyncEventFlow between the current microservice and the exchange

#### MicroserviceWithOutgoingExchangeMerger

- searches for microservice nodes having just one outgoing exchange whose name equals the name of the microservice node
- merges each such exchange into the microservice node, including payload and metadata, and adds the payload `reduced=true` to the node

### Common Transformers (not microservice system specific)

#### SourceLocationDecorator

Adds payload `sourceLocation` to each microservice where source code was fetched via Git.

#### StaticNodeFilter

Filters nodes from a flat system.

Environment Variables:
- EXCLUDED_NODE_NAMES
  - comma-separated list of names
  - regular expressions may be used
  - example: dummy.*, foo

#### SubSystemFromPayloadTransformer

Use this transformer when you have a flat system where some nodes have a payload defining their association to a sub-system and you want the system to be transformed to a system of sub-systems. This transformer creates new sub-system nodes and moves each node to its sub-system node.

How sub-system information is to be extracted from a nodes payload must be specified when calling the transformer.

[see SubSystemTransformer.ts](sources/tadis-analyzer/src/msa/common/SubSystemTransformer.ts)

## License

[Apache License, Version 2.0](LICENSE)

Copyright 2017-2022 Andreas Blunk, MaibornWolff GmbH
