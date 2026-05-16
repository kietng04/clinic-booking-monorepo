import { cloneElement, isValidElement } from 'react'
import { repairMojibakeString } from './encoding'

const isPlainObject = (value) => {
  if (!value || typeof value !== 'object') return false
  return Object.getPrototypeOf(value) === Object.prototype
}

const repairReactValue = (value) => {
  if (typeof value === 'string') return repairMojibakeString(value)

  if (Array.isArray(value)) {
    return value.map((item) => repairReactValue(item))
  }

  if (isValidElement(value)) {
    return repairReactNode(value)
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, repairReactValue(nestedValue)])
    )
  }

  return value
}

export const repairReactNode = (node) => {
  if (typeof node === 'string') return repairMojibakeString(node)

  if (Array.isArray(node)) {
    return node.map((child) => repairReactNode(child))
  }

  if (!isValidElement(node)) return node

  const nextProps = Object.fromEntries(
    Object.entries(node.props || {}).map(([key, value]) => [key, repairReactValue(value)])
  )

  return cloneElement(node, nextProps)
}
