import Clarity from '@microsoft/clarity'

let initialized = false
export function initializeClarity() {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID
  if (initialized || !projectId) return
  Clarity.init(projectId)
  initialized = true
}
export function identifyClarityEvent(event: string, properties?: Record<string, string | number | boolean>) {
  if (!initialized) return
  Clarity.event(event)
  if (properties) Object.entries(properties).forEach(([key, value]) => Clarity.setTag(key, String(value)))
}
