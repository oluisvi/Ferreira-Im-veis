import { PublicShell } from '../components/PublicShell'
import { PropertyDetailPage } from './PropertyDetailPage'

export function PropertyRoute({ code }: { code: string }) {
  return <PublicShell><PropertyDetailPage code={code} /></PublicShell>
}
