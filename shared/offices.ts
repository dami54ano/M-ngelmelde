export interface Office {
  id: string
  city: string
  address: string
  label: string
  category: 'office' | 'headquarter'
  sitePlanUrl: string | null
}

const planBase = 'https://www.swisscom.ch/content/dam/swisscom/de/about/unternehmen/standorte/documents/'
export const offices: Office[] = [
  { id: 'st-gallen-durrenmattstrasse-9', city: 'St. Gallen', address: 'Dürrenmattstrasse 9', category: 'office', plan: 'situationsplan-st-gallen.pdf' },
  { id: 'st-gallen-schochengasse-6', city: 'St. Gallen', address: 'Schochengasse 6', category: 'office', plan: 'situationsplan-st-gallen-schochengasse.pdf' },
  { id: 'worblaufen-alte-tiefenaustrasse-6', city: 'Worblaufen', address: 'Alte Tiefenaustrasse 6', category: 'headquarter', plan: 'situationsplan-worblaufen.pdf' },
  { id: 'zurich-binzring-15-17', city: 'Zürich', address: 'Binzring 15/17', category: 'office', plan: 'situationsplan-zuerich-binz.pdf' },
  { id: 'zurich-forrlibuckstrasse-181', city: 'Zürich', address: 'Förrlibuckstrasse 181', category: 'office', plan: 'situationsplan-zuerich-foerrlibuckstrasse-181.pdf' },
  { id: 'zurich-forrlibuckstrasse-60-62', city: 'Zürich', address: 'Förrlibuckstrasse 60/62', category: 'office', plan: null },
  { id: 'zurich-maschinenstrasse-10-prime-2', city: 'Zürich', address: 'Maschinenstrasse 10 / Prime 2', category: 'office', plan: 'situationsplan-zuerich-maschinenstrasse.pdf' },
  { id: 'zurich-neugasse-14-18', city: 'Zürich', address: 'Neugasse 14/18', category: 'office', plan: 'situationsplan-zuerich-neugasse.pdf' },
  { id: 'zurich-pfingstweidstrasse-51', city: 'Zürich', address: 'Pfingstweidstrasse 51', category: 'office', plan: 'situationsplan-zuerich-fifty-one.pdf' },
].map((office) => ({
  id: office.id, city: office.city, address: office.address,
  label: `${office.city} · ${office.address}`,
  category: office.category as Office['category'],
  sitePlanUrl: office.plan ? planBase + office.plan : null,
}))

export function isOfficeId(value: unknown): value is string {
  return typeof value === 'string' && offices.some((office) => office.id === value)
}
