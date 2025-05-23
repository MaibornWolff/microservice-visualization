# Microservice Visualization

![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)

This repository contains tools for analyzing and visualizing the topology of microservice systems.

The main tool is the **Tool for Architecture Discovery (TADIS)**.

## TADIS Architecture

TADIS consists of two microservices: an analyzer backend and a UI frontend (see the architecture picture below).

* [tadis-analyzer](sources/tadis-analyzer) collects information about a system from different sources by executing a number of transformers. The result is provided as a system model in JSON. The analyzer is a microservice and also a NPM package. The microservice can be started directly, while the NPM package can be used in custom analyzers.
* [tadis-ui](sources/tadis-ui) is based on vite, D3, and graphviz. It visualizes systems provided by the tadis-analyzer endpoint `/collect/system`. The UI is specific to certain visualizations in microservice systems.

![target architecture](docs/target-architecture.png "target architecture")

## Getting Started Example

An example of a customized analyzer is provided in [custom-example-analyzer](sources/custom-example-analyzer).

- The customized analyzer is implemented by a NPM package that depends on the tadis-analyzer NPM package.
- It implements a custom collector which uses certain transformers for source code analysis.
- It contains source code of a dummy system for analysis.

Please follow the instructions [provided here](sources/custom-example-analyzer/README.md) to setup the example.

## Requirements

- [Node.js](https://nodejs.org)

## License

[Apache License, Version 2.0](LICENSE)

Copyright 2017-2022 Andreas Blunk, MaibornWolff GmbH
