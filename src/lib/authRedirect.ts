const PRODUCTION_APP_URL = 'https://pugoni930112-coder.github.io/deokjil-expedition-app/'

/** Always return email-auth links to the deployed app, even when signup starts locally. */
export function getAuthRedirectUrl(path = ''): string {
  return new URL(path.replace(/^\/+/, ''), PRODUCTION_APP_URL).toString()
}
