import { isOfficeId } from '../shared/offices.js'
import express from 'express'
import {
  issueCategories,
  issuePriorities,
  issueStatuses,
  type CreateIssueInput,
  type IssueStatus,
} from '../shared/issues.js'
import { changeIssueStatus, createIssue, listIssues } from './issue-store.js'

const app = express()
const port = Number(process.env.PORT ?? 3001)

app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', dataSource: 'local-demo' })
})

app.get('/api/issues', async (request, response, next) => {
  const officeId = request.query.officeId
  if (!isOfficeId(officeId)) {
    response.status(400).json({ message: 'Bitte wähle ein gültiges Büro.' })
    return
  }
  try {
    response.json((await listIssues()).filter((issue) => issue.officeId === officeId))
  } catch (error) {
    next(error)
  }
})

app.post('/api/issues', async (request, response, next) => {
  const input = parseCreateInput(request.body)
  if (!input) {
    response.status(400).json({ message: 'Bitte prüfe alle Pflichtfelder.' })
    return
  }

  try {
    response.status(201).json(await createIssue(input))
  } catch (error) {
    next(error)
  }
})

app.patch('/api/issues/:id/status', async (request, response, next) => {
  const officeId = request.body?.officeId
  if (!isOfficeId(officeId)) {
    response.status(400).json({ message: 'Bitte wähle ein gültiges Büro.' })
    return
  }
  const status = request.body?.status
  if (!issueStatuses.includes(status)) {
    response.status(400).json({ message: 'Der Status ist ungültig.' })
    return
  }

  try {
    const issue = await changeIssueStatus(request.params.id, status as IssueStatus, officeId)
    if (!issue) {
      response.status(404).json({ message: 'Diese Meldung wurde nicht gefunden.' })
      return
    }
    response.json(issue)
  } catch (error) {
    next(error)
  }
})

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('API request failed:', error)
    response.status(500).json({ message: 'Die Anfrage konnte nicht verarbeitet werden.' })
  },
)

app.listen(port, () => {
  console.log(`Mängelmelde API läuft auf http://localhost:${port}`)
})

function parseCreateInput(body: unknown): CreateIssueInput | null {
  if (!body || typeof body !== 'object') return null
  const value = body as Record<string, unknown>
  const title = textField(value.title, 120)
  const description = textField(value.description, 2000)
  const location = textField(value.location, 120)
  const reporter = textField(value.reporter, 80)

  if (
    !isOfficeId(value.officeId) ||
    title === null ||
    description === null ||
    location === null ||
    reporter === null ||
    !isOneOf(value.category, issueCategories) ||
    !isOneOf(value.priority, issuePriorities)
  ) {
    return null
  }

  return {
    officeId: value.officeId,
    title,
    description,
    location,
    reporter,
    category: value.category,
    priority: value.priority,
  }
}

function textField(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text.length > 0 && text.length <= maxLength ? text : null
}

function isOneOf<const T extends readonly string[]>(
  value: unknown,
  values: T,
): value is T[number] {
  return typeof value === 'string' && values.some((item) => item === value)
}

