import { useEffect, useMemo, useState } from 'react'
import { supabase, TABLES } from './supabase'
import { fallbackReleases } from './data'

const initialAuth = {
  mode: 'signin',
  email: '',
  password: '',
  loading: false,
  message: '',
  error: ''
}

function formatReleaseDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value))
}

function getCountdownParts(releaseDate) {
  const diff = new Date(releaseDate).getTime() - Date.now()
  if (diff <= 0) {
    return { label: 'Available now', complete: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return {
    label: `${days}d ${hours}h ${minutes}m`,
    complete: false
  }
}

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-6.716-4.35-9.193-8.145C.92 9.94 2.053 5.75 5.86 4.6c2.119-.64 4.366.08 5.64 1.886C12.774 4.68 15.02 3.96 17.14 4.6c3.807 1.15 4.94 5.34 3.053 8.255C18.716 16.65 12 21 12 21Z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

function AuthScreen({ authState, setAuthState, onSubmit, onSwitchMode }) {
  const isSignUp = authState.mode === 'signup'

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[32px] border border-white/10 bg-slate-950/60 p-8 shadow-glow backdrop-blur-xl">
          <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
            Sneaker Drop Hub
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Upcoming sneaker releases
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Discover the next big drops, sort by release date, and save your favorite pairs before launch day.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Live countdowns', 'Track every release down to the minute.'],
              ['Favorite pairs', 'Save the drops you do not want to miss.'],
              ['Clean dark UI', 'Built for quick browsing on mobile and desktop.']
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-glow backdrop-blur-xl sm:p-8">
          {authState.mode === 'check-email' ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Check your inbox</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Confirm your email</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  We sent a confirmation link to <span className="font-semibold text-white">{authState.email}</span>. Click the link, then come back here and sign in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSwitchMode('signin')}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:opacity-95"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
                  {isSignUp ? 'Create account' : 'Welcome back'}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  {isSignUp ? 'Sign up to save favorites' : 'Sign in to your account'}
                </h2>
              </div>

              <label className="block text-sm text-slate-300">
                Email
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                  type="email"
                  value={authState.email}
                  onChange={(event) => setAuthState((prev) => ({ ...prev, email: event.target.value, error: '', message: '' }))}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="block text-sm text-slate-300">
                Password
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
                  type="password"
                  value={authState.password}
                  onChange={(event) => setAuthState((prev) => ({ ...prev, password: event.target.value, error: '', message: '' }))}
                  placeholder="********"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                />
              </label>

              {authState.error ? <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{authState.error}</p> : null}
              {authState.message ? <p className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{authState.message}</p> : null}

              <button
                type="submit"
                disabled={authState.loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
              >
                {authState.loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
              </button>

              <p className="text-sm text-slate-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button type="button" onClick={() => onSwitchMode(isSignUp ? 'signin' : 'signup')} className="font-semibold text-cyan-300">
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

function ReleaseCard({ release, isFavorite, onToggleFavorite }) {
  const [countdown, setCountdown] = useState(() => getCountdownParts(release.release_date))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdownParts(release.release_date))
    }, 60000)
    setCountdown(getCountdownParts(release.release_date))
    return () => window.clearInterval(timer)
  }, [release.release_date])

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 shadow-glow backdrop-blur-xl">
      <div className="aspect-[4/3] overflow-hidden bg-slate-900">
        <img src={release.image_url} alt={release.name} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">{release.brand}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{release.name}</h3>
          </div>
          <button
            type="button"
            onClick={() => onToggleFavorite(release.id)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
              isFavorite
                ? 'border-rose-400/50 bg-rose-500 text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-rose-400/50 hover:text-rose-300'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon filled={isFavorite} />
          </button>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</p>
            <p className="mt-1 text-lg font-semibold text-white">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(release.price)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Release date</p>
            <p className="mt-1 text-sm font-medium text-slate-200">{formatReleaseDate(release.release_date)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Countdown</p>
          <p className="mt-2 text-2xl font-bold text-white">{countdown.label}</p>
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const [authState, setAuthState] = useState(initialAuth)
  const [session, setSession] = useState(null)
  const [releases, setReleases] = useState([])
  const [favorites, setFavorites] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data.session ?? null)
      } catch (error) {
        console.error('Init error:', error)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setReleases([])
      setFavorites([])
      setLoadingData(false)
      return
    }

    let active = true

    async function loadData() {
      setLoadingData(true)
      setDataError('')
      try {
        await ensureAppUser(session.user)
        const [releaseResult, favoriteResult] = await Promise.all([
          supabase.from(TABLES.releases).select('*').order('release_date', { ascending: true }),
          supabase.from(TABLES.favorites).select('release_id').order('created_at', { ascending: false })
        ])

        if (releaseResult.error) throw releaseResult.error
        if (favoriteResult.error) throw favoriteResult.error

        if (!active) return

        const releaseRows = Array.isArray(releaseResult.data) ? releaseResult.data : []
        setReleases(releaseRows.length ? releaseRows : fallbackReleases)
        setFavorites((favoriteResult.data ?? []).map((item) => item.release_id))
      } catch (error) {
        console.error('Load data error:', error)
        if (!active) return
        setDataError('We could not load live releases, so sample drops are shown instead.')
        setReleases(fallbackReleases)
        setFavorites([])
      } finally {
        if (active) setLoadingData(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [session])

  async function ensureAppUser(user) {
    const existing = await supabase
      .from(TABLES.appUsers)
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing.error && existing.error.code !== 'PGRST116') {
      throw existing.error
    }

    if (!existing.data) {
      const inserted = await supabase.from(TABLES.appUsers).insert({
        user_id: user.id,
        email: user.email
      })
      if (inserted.error) throw inserted.error
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthState((prev) => ({ ...prev, loading: true, error: '', message: '' }))

    try {
      const email = authState.email.trim()
      const password = authState.password

      if (!email || !password) {
        throw new Error('Please enter both email and password.')
      }

      if (authState.mode === 'signup') {
        const signUpResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://sling-gogiapp.web.app/email-confirmed.html'
          }
        })

        if (signUpResult.error) {
          const message = signUpResult.error.message || ''
          if (message.includes('already been registered') || message.includes('User already registered')) {
            const signInResult = await supabase.auth.signInWithPassword({ email, password })
            if (signInResult.error) {
              throw new Error('Incorrect password.')
            }
            await ensureAppUser(signInResult.data.user)
            setAuthState((prev) => ({ ...prev, loading: false, password: '', error: '', message: '' }))
            return
          }
          throw signUpResult.error
        }

        setAuthState((prev) => ({
          ...prev,
          loading: false,
          mode: 'check-email',
          message: 'Check your email to confirm your account.',
          error: ''
        }))
        return
      }

      const signInResult = await supabase.auth.signInWithPassword({ email, password })
      if (signInResult.error) {
        if ((signInResult.error.message || '').includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link first.')
        }
        throw signInResult.error
      }
      await ensureAppUser(signInResult.data.user)
      setAuthState((prev) => ({ ...prev, loading: false, password: '', error: '', message: '' }))
    } catch (error) {
      console.error('Auth error:', error)
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      }))
    }
  }

  function handleSwitchMode(mode) {
    setAuthState((prev) => ({
      ...prev,
      mode,
      loading: false,
      error: '',
      message: mode === 'signin' ? '' : prev.message
    }))
  }

  async function handleToggleFavorite(releaseId) {
    try {
      const isFavorite = favorites.includes(releaseId)
      if (isFavorite) {
        const result = await supabase.from(TABLES.favorites).delete().eq('release_id', releaseId)
        if (result.error) throw result.error
        setFavorites((prev) => prev.filter((item) => item !== releaseId))
      } else {
        const result = await supabase.from(TABLES.favorites).insert({ release_id: releaseId })
        if (result.error) throw result.error
        setFavorites((prev) => [...prev, releaseId])
      }
    } catch (error) {
      console.error('Favorite toggle error:', error)
      setDataError('We could not update favorites right now. Please try again.')
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      setAuthState(initialAuth)
      setActiveTab('all')
      setSearch('')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const filteredReleases = useMemo(() => {
    const searchValue = search.trim().toLowerCase()
    return releases
      .filter((release) => {
        if (activeTab === 'favorites' && !favorites.includes(release.id)) return false
        if (!searchValue) return true
        return `${release.name} ${release.brand}`.toLowerCase().includes(searchValue)
      })
      .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
  }, [activeTab, favorites, releases, search])

  if (!session?.user) {
    return (
      <AuthScreen
        authState={authState}
        setAuthState={setAuthState}
        onSubmit={handleAuthSubmit}
        onSwitchMode={handleSwitchMode}
      />
    )
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] border border-white/10 bg-slate-950/60 p-6 shadow-glow backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
                Sneaker Drop Hub
              </div>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Upcoming sneaker releases</h1>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                Discover the next big drops, sort by release date, and save your favorite pairs before launch day.
              </p>
            </div>

            <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <div className="rounded-2xl bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                Signed in as <span className="font-semibold text-white">{session.user.email}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                <SignOutIcon />
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <label className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by sneaker or brand"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-4 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400/60"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`rounded-2xl px-6 py-3 font-semibold transition ${
                  activeTab === 'all' ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                All Releases
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`rounded-2xl px-6 py-3 font-semibold transition ${
                  activeTab === 'favorites' ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                Favorites ({favorites.length})
              </button>
            </div>
          </div>
        </section>

        {dataError ? (
          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm text-cyan-100">
            {dataError}
          </div>
        ) : null}

        {loadingData ? (
          <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-[32px] border border-white/10 bg-slate-950/50 p-8 text-slate-300">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-cyan-300" />
              Loading releases...
            </div>
          </div>
        ) : filteredReleases.length ? (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredReleases.map((release) => (
              <ReleaseCard
                key={release.id}
                release={release}
                isFavorite={favorites.includes(release.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </section>
        ) : (
          <div className="mt-8 rounded-[32px] border border-white/10 bg-slate-950/50 p-8 text-center">
            <h2 className="text-3xl font-bold text-white">No releases found</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Try a different search or switch back to the All Releases tab.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
