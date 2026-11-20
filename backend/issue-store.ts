import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { CreateIssueInput, Issue, IssueStatus } from '../shared/issues.js'

const dataDirectory = path.resolve(process.cwd(), 'data')
const dataFile = path.join(dataDirectory, 'issues.json')

const sampleIssues: Issue[] = [
  {
    id: 'MW-1042',
    title: 'Deckenlicht flackert im Sitzungszimmer',
    description: 'Die Leuchte über dem grossen Tisch flackert seit heute Morgen.',
    location: 'Bern · Sitzungszimmer 2.14',
    category: 'Infrastruktur',
    priority: 'Normal',
    status: 'Neu',
    reporter: 'M. Muster',
    assignee: null,
    createdAt: '2026-10-28T08:42:00.000Z',
    updatedAt: '2026-10-28T08:42:00.000Z',
  },
  {
    id: 'MW-1041',
    title: 'Dockingstation verbindet nicht',
    description: 'Bildschirm und Netzwerk werden nach dem Einstecken nicht erkannt.',
    location: 'Bern · Arbeitsplatz B-216',
    category: 'IT & Geräte',
    priority: 'Hoch',
    status: 'In Bearbeitung',
    reporter: 'A. Beispiel',
    assignee: 'Service Desk',
    createdAt: '2026-10-27T14:10:00.000Z',
    updatedAt: '2026-10-28T07:25:00.000Z',
  },
  {
    id: 'MW-1040',
    title: 'Türschliesser am Seiteneingang defekt',
    description: 'Die Tür fällt nicht mehr selbstständig ins Schloss.',
    location: 'Bern · Eingang West',
    category: 'Sicherheit',
    priority: 'Dringend',
    status: 'In Bearbeitung',
    reporter: 'L. Demo',
    assignee: 'Gebäudetechnik',
    createdAt: '2026-10-27T09:05:00.000Z',
    updatedAt: '2026-10-27T09:30:00.000Z',
  },
  {
    id: 'MW-1039',
    title: 'Höhenverstellung am Tisch blockiert',
    description: 'Der Tisch bleibt beim Hochfahren auf halber Höhe stehen.',
    location: 'Bern · Arbeitsplatz A-108',
    category: 'Arbeitsplatz',
    priority: 'Normal',
    status: 'Neu',
    reporter: 'T. Demo',
    assignee: null,
    createdAt: '2026-10-26T15:22:00.000Z',
    updatedAt: '2026-10-26T15:22:00.000Z',
  },
  {
    id: 'MW-1038',
    title: 'Wasserhahn tropft im Pausenraum',
    description: 'Der Wasserhahn tropft auch bei geschlossenem Griff.',
    location: 'Bern · Pausenraum 1.08',
    category: 'Infrastruktur',
    priority: 'Normal',
    status: 'Erledigt',
    reporter: 'R. Beispiel',
    assignee: 'Gebäudetechnik',
    createdAt: '2026-10-24T11:40:00.000Z',
    updatedAt: '2026-10-25T13:15:00.000Z',
  },
]

export async function listIssues(): Promise<Issue[]> {
  await mkdir(dataDirectory, { recursive: true })
  try {
    const stored = await readFile(dataFile, 'utf8')
    return JSON.parse(stored) as Issue[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
    await writeIssues(sampleIssues)
    return sampleIssues
  }
}

let pendingWrite: Promise<unknown> = Promise.resolve()

function serializeWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = pendingWrite.then(operation)
  pendingWrite = result.catch(() => undefined)
  return result
}

export function createIssue(input: CreateIssueInput): Promise<Issue> {
  return serializeWrite(() => createIssueUnlocked(input))
}

async function createIssueUnlocked(input: CreateIssueInput): Promise<Issue> {
  const issues = await listIssues()
  const now = new Date().toISOString()
  const nextNumber = Math.max(
    1042,
    ...issues.map((issue) => Number(issue.id.split('-')[1]) || 0),
  ) + 1
  const issue: Issue = {
    ...input,
    id: `MW-${nextNumber}`,
    status: 'Neu',
    assignee: null,
    createdAt: now,
    updatedAt: now,
  }
  await writeIssues([issue, ...issues])
  return issue
}

export async function changeIssueStatus(
  id: string,
  status: IssueStatus,
  officeId: string,
): Promise<Issue | null> {
  return serializeWrite(() => changeIssueStatusUnlocked(id, status, officeId))
}

async function changeIssueStatusUnlocked(id: string, status: IssueStatus, officeId: string): Promise<Issue | null> {
  const issues = await listIssues()
  const index = issues.findIndex((issue) => issue.id === id && issue.officeId === officeId)
  if (index === -1) return null

  const updated = { ...issues[index], status, updatedAt: new Date().toISOString() }
  issues[index] = updated
  await writeIssues(issues)
  return updated
}

async function writeIssues(issues: Issue[]): Promise<void> {
  await mkdir(dataDirectory, { recursive: true })
  await writeFile(dataFile, `${JSON.stringify(issues, null, 2)}\n`, 'utf8')
}
