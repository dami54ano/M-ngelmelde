import { offices, type Office } from '../../shared/offices'
import { createElement, useEffect, useMemo, useState } from 'react'
import {
  issueCategories,
  issuePriorities,
  issueStatuses,
  type CreateIssueInput,
  type Issue,
  type IssuePriority,
  type IssueStatus,
} from '../../shared/issues'

/** Swisscom SDX Web Component. */
function SdxButton({ label, theme = 'primary', onClick }: {
  label: string
  theme?: 'primary' | 'secondary'
  onClick?: () => void
}) {
  return createElement('sdx-button', { label, theme, onClick })
}

type Filter = 'Alle' | IssueStatus

const filters: Filter[] = ['Alle', ...issueStatuses]
const dateFormatter = new Intl.DateTimeFormat('de-CH', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export default function App() {
  const [office, setOffice] = useState<Office | null>(null)
  const [query, setQuery] = useState('')
  if (office) return <OfficeDashboard key={office.id} office={office} onChangeOffice={() => setOffice(null)} />
  const matches = offices.filter((item) => item.label.toLocaleLowerCase('de-CH').includes(query.trim().toLocaleLowerCase('de-CH')))
  return (
    <div className="app-shell">
      <header className="site-header"><div className="header-inner"><span className="brand"><span className="brand-mark" aria-hidden="true">M</span>Mängelmelde</span><span className="environment-tag">Demo</span></div></header>
      <main className="main-content office-selection">
        <section className="page-intro"><div className="intro-copy"><div className="eyebrow">DEIN STANDORT</div><h1>In welchem Büro bist du?</h1><p>Wähle dein Büro, um Meldungen anzusehen oder einen Mangel zu melden.</p></div></section>
        <label className="search-box office-search"><span className="sr-only">Büro suchen</span><input type="search" placeholder="Stadt oder Adresse suchen …" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="office-grid">
          {matches.map((item) => <button type="button" className="office-card" key={item.id} onClick={() => setOffice(item)}><span className="office-city">{item.city}{item.category === 'headquarter' && <small>Hauptsitz</small>}</span><strong>{item.address}</strong><span className="office-card-action">Büro auswählen <span aria-hidden="true">›</span></span></button>)}
        </div>
        {matches.length === 0 && <div className="empty-state" role="status"><strong>Kein Büro gefunden</strong><span>Suche nach einer anderen Stadt oder Adresse.</span><SdxButton label="Suche zurücksetzen" theme="secondary" onClick={() => setQuery('')} /></div>}
      </main>
    </div>
  )
}

function OfficeDashboard({ office, onChangeOffice }: { office: Office; onChangeOffice: () => void }) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [filter, setFilter] = useState<Filter>('Alle')
  const [search, setSearch] = useState('')
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadIssues() {
    setError('')
    try {
      const response = await fetch(`/api/issues?officeId=${encodeURIComponent(office.id)}`)
      if (!response.ok) throw new Error('Die Meldungen konnten nicht geladen werden.')
      setIssues((await response.json()) as Issue[])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Verbindung zur API fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadIssues()
  }, [])

  const visibleIssues = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('de-CH')
    return issues
      .filter((issue) => filter === 'Alle' || issue.status === filter)
      .filter((issue) =>
        [issue.id, issue.title, issue.location, issue.category, issue.reporter]
          .join(' ')
          .toLocaleLowerCase('de-CH')
          .includes(query),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [filter, issues, search])

  const counts = useMemo(
    () => ({
      open: issues.filter((issue) => issue.status !== 'Erledigt').length,
      new: issues.filter((issue) => issue.status === 'Neu').length,
      progress: issues.filter((issue) => issue.status === 'In Bearbeitung').length,
      done: issues.filter((issue) => issue.status === 'Erledigt').length,
      urgent: issues.filter(
        (issue) => issue.priority === 'Dringend' && issue.status !== 'Erledigt',
      ).length,
    }),
    [issues],
  )

  async function submitIssue(input: CreateIssueInput) {
    const response = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      const result = (await response.json()) as { message?: string }
      throw new Error(result.message ?? 'Die Meldung konnte nicht gespeichert werden.')
    }
    const created = (await response.json()) as Issue
    setIssues((current) => [created, ...current])
    setShowForm(false)
    setFilter('Alle')
    setSearch('')
  }

  async function updateStatus(issue: Issue, status: IssueStatus) {
    setError('')
    try {
      const response = await fetch(`/api/issues/${encodeURIComponent(issue.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, officeId: office.id }),
      })
      if (!response.ok) {
        const result = (await response.json()) as { message?: string }
        throw new Error(result.message ?? 'Der Status konnte nicht geändert werden.')
      }
      const updated = (await response.json()) as Issue
      setIssues((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setSelectedIssue(updated)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Änderung fehlgeschlagen.')
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#" aria-label="Mängelmelde Startseite">
            <span className="brand-mark" aria-hidden="true">M</span>
            <span>Mängelmelde<small>Gebäudemängel zentral erfassen</small></span>
          </a>
          <span className="environment-tag">Demo</span>
        </div>
      </header>
      <main className="main-content">
        <div className="office-context"><div><span className="eyebrow">AUSGEWÄHLTES BÜRO</span><strong>{office.label}</strong></div><div className="office-context-actions">{office.sitePlanUrl && <a href={office.sitePlanUrl} target="_blank" rel="noreferrer">Situationsplan ↗</a>}<SdxButton label="Büro wechseln" theme="secondary" onClick={onChangeOffice} /></div></div>
        <section className="page-intro">
          <div className="intro-copy">
            <div className="eyebrow">GEBÄUDE · MELDUNGEN</div>
            <h1>Alles im Blick.</h1>
            <p>Melde Mängel im Gebäude und verfolge ihre Bearbeitung an einem Ort.</p>
          </div>
          <SdxButton label="Mangel melden" onClick={() => setShowForm(true)} />
        </section>

        <section className="metric-grid" aria-label="Zusammenfassung">
          <Metric label="Offen" value={counts.open} detail="noch nicht abgeschlossen" accent="blue" />
          <Metric label="Neu" value={counts.new} detail="neu gemeldet" accent="amber" />
          <Metric label="In Bearbeitung" value={counts.progress} detail="in Bearbeitung" accent="violet" />
          <Metric label="Dringend" value={counts.urgent} detail="offen und prioritär" accent="red" />
        </section>

        <section className="worklist" aria-labelledby="worklist-title">
          <div className="worklist-heading">
            <div>
              <div className="section-kicker">ÜBERSICHT</div>
              <h2 id="worklist-title">Meldungen <span>{visibleIssues.length}</span></h2>
            </div>
            <label className="search-box">
              <span className="search-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg></span>
              <span className="sr-only">Meldungen suchen</span>
              <input
                type="search"
                placeholder="Suchen …"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="filter-row" aria-label="Nach Status filtern">
            {filters.map((item) => (
              <button
                className={`filter-tab ${filter === item ? 'selected' : ''}`}
                key={item}
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                type="button"
              >
                {item}
                {item === 'Alle' && <span>{issues.length}</span>}
              </button>
            ))}
          </div>

          {error && <div className="error-banner" role="alert">{error}</div>}
          {loading ? (
            <div className="empty-state">Meldungen werden geladen …</div>
          ) : visibleIssues.length === 0 ? (
            <div className="empty-state">
              <span className="empty-mark">✓</span>
              <strong>Keine passenden Meldungen</strong>
              <span>Ändere den Filter oder erfasse einen neuen Mangel.</span>
            </div>
          ) : (
            <div className="issue-list">
              <div className="list-columns" aria-hidden="true"><span>Mangel / Standort</span><span>Status</span><span>Gemeldet von</span><span>Erfasst</span><span /></div>
              {visibleIssues.map((issue) => (
                <button
                  type="button"
                  className="issue-row"
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                >
                  <span className={`priority-stripe priority-${priorityClass(issue.priority)}`} />
                  <span className="issue-main">
                    <span className="issue-title-line">
                      <strong>{issue.title}</strong>
                      {issue.priority !== 'Normal' && (
                        <span className={`priority-label priority-text-${priorityClass(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      )}
                    </span>
                    <span className="issue-meta">
                      <span>{issue.location}</span><b>·</b><span>{issue.category}</span>
                    </span>
                  </span>
                  <span className="issue-status-cell">
                    <StatusBadge status={issue.status} />
                  </span>
                  <span className="issue-owner">
                    <span className="owner-dot">{issue.reporter.slice(0, 1)}</span>
                    <span>{issue.reporter}</span>
                  </span>
                  <span className="issue-date">{dateFormatter.format(new Date(issue.createdAt))}</span>
                  <span className="row-chevron" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          )}
          <div className="list-footer">
            <span>Demo-Meldungen</span>
            <span>{counts.done} erledigt <i /> {counts.open} offen</span>
          </div>
        </section>

        <footer className="page-footer">
          <span>Mängelmelde</span>
          <span>Eine zentrale Übersicht für Gebäudemängel</span>
        </footer>
      </main>

      {showForm && <IssueForm office={office} onClose={() => setShowForm(false)} onSubmit={submitIssue} />}
      {selectedIssue && (
        <IssueDetails
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onStatusChange={(status) => void updateStatus(selectedIssue, status)}
        />
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: number
  detail: string
  accent: string
}) {
  return (
    <article className={`metric-card metric-${accent}`}>
      <div className="metric-top"><span>{label}</span><i /></div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function StatusBadge({ status }: { status: IssueStatus }) {
  const classes: Record<IssueStatus, string> = {
    Neu: 'status-new',
    'In Bearbeitung': 'status-progress',
    Erledigt: 'status-done',
  }
  return <span className={`status-badge ${classes[status]}`}><i />{status}</span>
}

function IssueForm({
  office,
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (input: CreateIssueInput) => Promise<void>
  office: Office
}) {
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setSaving(true)
    const formData = new FormData(event.currentTarget)
    const input: CreateIssueInput = {
      officeId: office.id,
      title: String(formData.get('title') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim(),
      location: String(formData.get('location') ?? '').trim(),
      category: String(formData.get('category')) as CreateIssueInput['category'],
      priority: String(formData.get('priority')) as IssuePriority,
      reporter: String(formData.get('reporter') ?? '').trim(),
    }
    try {
      await onSubmit(input)
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Schliessen">×</button>
        <div className="dialog-kicker">NEUE MELDUNG</div>
        <h2 id="form-title">Was ist passiert?</h2>
        <p className="dialog-intro">Büro: {office.label}</p>
        <form onSubmit={(event) => void handleSubmit(event)}>
          <label>Titel<input name="title" required maxLength={120} placeholder="z. B. Bildschirm bleibt schwarz" /></label>
          <div className="form-grid">
            <label>Raum / Arbeitsplatz<input name="location" required maxLength={120} placeholder="z. B. 2. Stock, Sitzungszimmer 2.14" /></label>
            <label>Kategorie
              <select name="category" defaultValue={issueCategories[0]}>
                {issueCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
          </div>
          <label>Beschreibung<textarea name="description" required maxLength={2000} rows={3} placeholder="Was funktioniert nicht? Seit wann?" /></label>
          <div className="form-grid">
            <label>Priorität
              <select name="priority" defaultValue={issuePriorities[0]}>
                {issuePriorities.map((priority) => <option key={priority}>{priority}</option>)}
              </select>
            </label>
            <label>Gemeldet von<input name="reporter" required maxLength={80} placeholder="Vorname oder Kürzel" /></label>
          </div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Abbrechen</button>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Wird gespeichert …' : 'Meldung erfassen'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function IssueDetails({
  issue,
  onClose,
  onStatusChange,
}: {
  issue: Issue
  onClose: () => void
  onStatusChange: (status: IssueStatus) => void
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Schliessen">×</button>
        <div className="dialog-kicker">{issue.id} <span>·</span> {issue.category}</div>
        <h2 id="detail-title">{issue.title}</h2>
        <p className="detail-description">{issue.description}</p>
        <dl className="detail-grid">
          <div><dt>Ort</dt><dd>{issue.location}</dd></div>
          <div><dt>Priorität</dt><dd>{issue.priority}</dd></div>
          <div><dt>Gemeldet von</dt><dd>{issue.reporter}</dd></div>
          <div><dt>Zuständig</dt><dd>{issue.assignee ?? 'Noch nicht zugewiesen'}</dd></div>
          <div><dt>Erfasst</dt><dd>{dateFormatter.format(new Date(issue.createdAt))}</dd></div>
          <div><dt>Status</dt><dd><StatusBadge status={issue.status} /></dd></div>
        </dl>
        <label className="status-control">Bearbeitungsstatus
          <select value={issue.status} onChange={(event) => onStatusChange(event.target.value as IssueStatus)}>
            {issueStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <div className="dialog-actions">
          <SdxButton label="Schliessen" theme="secondary" onClick={onClose} />
        </div>
      </section>
    </div>
  )
}

function priorityClass(priority: IssuePriority) {
  if (priority === 'Dringend') return 'urgent'
  if (priority === 'Hoch') return 'high'
  return 'normal'
}

