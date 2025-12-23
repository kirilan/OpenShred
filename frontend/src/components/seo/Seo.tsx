import { useEffect } from 'react'

type SeoProps = {
  title: string
  description: string
  path?: string
  image?: string
}

const DEFAULT_BASE_URL = 'https://app.dimitroff.work'
const DEFAULT_IMAGE_PATH = '/logo-open-shred.png'

function setMetaName(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setMetaProperty(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

export function Seo({ title, description, path, image }: SeoProps) {
  useEffect(() => {
    const baseUrl = typeof window === 'undefined' ? DEFAULT_BASE_URL : window.location.origin
    const resolvedUrl = path ? new URL(path, baseUrl).toString() : window.location.href
    const resolvedImage = image
      ? new URL(image, baseUrl).toString()
      : new URL(DEFAULT_IMAGE_PATH, baseUrl).toString()

    document.title = title
    setMetaName('description', description)
    setMetaProperty('og:title', title)
    setMetaProperty('og:description', description)
    setMetaProperty('og:type', 'website')
    setMetaProperty('og:url', resolvedUrl)
    setMetaProperty('og:image', resolvedImage)
    setMetaName('twitter:card', 'summary_large_image')
    setMetaName('twitter:title', title)
    setMetaName('twitter:description', description)
    setMetaName('twitter:image', resolvedImage)
    setCanonical(resolvedUrl)
  }, [title, description, path, image])

  return null
}
