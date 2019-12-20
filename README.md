# Microservice Visualization with TADIS - a Tool for Architecture Discovery

![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)

This repository contains software for analyzing and visualizing the topology of a microservice system.

## Architecture

TADIS consists of two microservices: an analyzer backend and a UI frontend (see the architecture picture below).

* [tadis-analyzer](sources/tadis-analyzer) collects information about a system from different sources by executing a number of transformers. The result is provided as a system model in JSON. The analyzer is a microservice and also a NPM package. The microservice can be started directly, while the NPM package can be used in custom analyzers.
* [tadis-analyzer-custom-example](sources/tadis-analyzer-custom-example) is an example custom-analyzer microservice that imports the tadis-analyzer as a NPM package. It implements a custom collector which uses only certain transformers.
* [tadis-ui](sources/tadis-ui) is based on webpack, D3, and graphviz. It visualizes systems provided by the tadis-analyzer endpoint `/collect/system`. The UI is specific to certain visualizations in microservice systems.

![target architecture](docs/target-architecture.png "target architecture")

## Requirements

- [Node.js v10](https://nodejs.org)
- [Yarn](https://yarnpkg.com)

## License

[Apache License, Version 2.0](LICENSE)

Copyright 2017-2019 Andreas Blunk, MaibornWolff GmbH