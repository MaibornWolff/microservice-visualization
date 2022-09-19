export const appBaseUrl = '/tadis'

export function getBaseUrlInCurrentEnvironment() {
  const appBaseUrlStart = window.location.href.lastIndexOf(appBaseUrl)
  if (appBaseUrlStart === -1) {
    return appBaseUrlStart
  } else {
    return window.location.href.substring(0, appBaseUrlStart) + appBaseUrl
  }
}
