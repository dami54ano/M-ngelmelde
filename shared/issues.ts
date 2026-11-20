export const issueStatuses = ['Neu', 'In Bearbeitung', 'Erledigt'] as const
export type IssueStatus = (typeof issueStatuses)[number]

export const issuePriorities = ['Normal', 'Hoch', 'Dringend'] as const
export type IssuePriority = (typeof issuePriorities)[number]

export const issueCategories = [
  'Arbeitsplatz',
  'Infrastruktur',
  'Sicherheit',
  'IT & Geräte',
  'Sonstiges',
] as const
export type IssueCategory = (typeof issueCategories)[number]

export interface Issue {
  /** Older records may not have an assigned office. */
  officeId?: string
  id: string
  title: string
  description: string
  location: string
  category: IssueCategory
  priority: IssuePriority
  status: IssueStatus
  reporter: string
  assignee: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateIssueInput {
  officeId: string
  title: string
  description: string
  location: string
  category: IssueCategory
  priority: IssuePriority
  reporter: string
}
