// Source: https://github.com/managed-components/mixpanel/blob/3fff278131e62ed2e81eab54880753958a07fcc4/src/utils.ts

export const isValidHttpUrl = (str: string) => {
  let url: URL
  try {
    url = new URL(str)
  } catch {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}
