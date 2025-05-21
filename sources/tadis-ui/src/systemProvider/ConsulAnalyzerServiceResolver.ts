import * as axios from 'axios'

export class ConsulAnalyzerServiceResolver {

  constructor(private consulBaseUrl: string,
    private systemProviderServiceName: string,
    private systemProviderServiceEndpoint: string) {}

  async resolveAnalyzerServiceUrl(): Promise<string> {
    const urlToService = await this.getUrlToServiceProvidingSystem()
    if (!urlToService) return null

    return urlToService + this.systemProviderServiceEndpoint
  }

  async getUrlToServiceProvidingSystem(): Promise<string> {
    try {
      const consulResolveServiceUrl = this.getConsulUrlForSystemProviderService()

      console.log('resolving system provider service via consul ' + consulResolveServiceUrl)
      const response = await axios.default.get(consulResolveServiceUrl)
      if (response.data) {
        return 'http://' + response.data[0].ServiceAddress + ':' + response.data[0].ServicePort
      }
    } catch (error) {
      console.log('error: ' + error)
    }
    return null
  }

  getConsulUrlForSystemProviderService() {
    return this.consulBaseUrl + '/v1/catalog/service/' + this.systemProviderServiceName
  }
}
