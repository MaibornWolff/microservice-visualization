// don't use typescript path alias here. imported types won't be available
// in other typescript projects which depend on this one.
// it's ok to use path alias in tests.

import * as core from './model/core.js'
import * as ms from './model/ms.js'
import * as transport from './model/transport.js'
export { ms, core, transport }

export * from './model/core.js'
export * from './model/ms.js'

export * from './config/Config.module.js'
export * from './git/Git.module.js'

export * from './system-element-extractors/java/Java.module.js'
export * from './system-element-extractors/env-variables/EnvVariables.module.js'
export * from './system-element-extractors/kubernetes/Kubernetes.module.js'
export * from './system-element-extractors/rabbitmq/RabbitMq.module.js'
export * from './system-element-extractors/spring-boot/SpringBoot.module.js'

export * from './system-assemblers/controllers/SystemAssembler.module.js'
export * from './system-assemblers/kubernetes-rabbitmq/KubernetesRabbitMqAssembler.module.js'

export * from './post-processors/PostProcessors.module.js'

import * as fileAnalysis from './utils/files/analysis.js'
export { fileAnalysis }

// deprecated exports
export * from './deprecated-modules/SourceCodeAnalysis.module.js'
export * from './deprecated-modules/CommonTransformers.module.js'
export * from './deprecated-modules/Msa.module.js'
