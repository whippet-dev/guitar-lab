import { Activity, ArrowDownToLine, ArrowRight, AudioLines, BookOpen, ChartNoAxesColumn, Clock3, Guitar, House, Laptop, Play, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { findExercise, findTopic, TOPICS } from '../learning/content'
import { advanceSession, planSession, recordAttempt, markLesson, saveSessionResponse, SESSION_MINUTES, type Progress } from '../learning/progress'
import { newId, useProgress } from '../learning/useProgress'
import { DailyPractice, ExerciseView, Lesson, Library, ProgressView } from './Learning'
import { Explorer } from './Explorer'
import { SoundSettings } from './SoundSettings'
import { stopAudio } from '../music/audio'
import heroImage from '../assets/fretboard-hero.webp'

const NAVIGATION = [
  { route: 'today', label: 'Today', icon: House },
  { route: 'learn', label: 'Learn', icon: BookOpen },
  { route: 'fretboard', label: 'Fretboard', icon: Guitar },
] as const

function currentRoute() {
  const route = window.location.hash.slice(1)
  return /^(today|learn|practice|fretboard|progress|sound|learn\/[a-z-]+|exercise\/[a-z-]+)$/.test(route) ? route : 'today'
}

function Header({ area }: { area: string }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#today" className="brand" aria-label="Guitar Lab home"><span className="brand-icon"><AudioLines size={24} strokeWidth={2.3} /></span>Guitar Lab</a>
        <nav className="main-nav" aria-label="Main navigation">
          {NAVIGATION.map(({ route, label, icon: Icon }) => <a key={route} href={`#${route}`} aria-current={area === route ? 'page' : undefined}><Icon size={17} />{label}</a>)}
        </nav>
        <div className="header-actions">
          <a href="#sound" className="progress-link sound-link" aria-label="Sound settings" aria-current={area === 'sound' ? 'page' : undefined}><Volume2 size={18} /><span>Sound</span></a>
          <a href="#progress" className="progress-link" aria-current={area === 'progress' ? 'page' : undefined}><ChartNoAxesColumn size={18} />Progress</a>
        </div>
      </div>
    </header>
  )
}

function Today({ progress, onStart }: { progress: Progress; onStart: () => void }) {
  const active = !!progress.session && progress.session.completedAt === null
  const finishedToday = !!progress.session?.completedAt && new Date(progress.session.completedAt).toDateString() === new Date().toDateString()
  const focus = active && progress.session ? progress.session.topic : planSession(progress, '', Date.now()).topic
  const topic = findTopic(focus) ?? TOPICS[0]

  return (
    <div className="today">
      <section className="hero" aria-labelledby="hero-title">
        <img src={heroImage} className="hero-image" alt="" fetchPriority="high" />
        <div className="hero-content">
          <div className="eyebrow"><Activity size={17} /> Daily practice</div>
          <h1 id="hero-title" tabIndex={-1}>Make sense of<br /> the <span>fretboard.</span></h1>
          <p>Get to know the neck, one idea at a time. Start with a short, guided session you can do anywhere.</p>
          <div className="hero-actions">
            <a className="button button-primary hero-button" href="#practice" onClick={onStart}><Play size={17} fill="currentColor" />{active ? 'Resume daily practice' : finishedToday ? 'Practise again' : 'Start daily practice'}<ArrowRight size={19} /></a>
            <span className="hero-time"><Clock3 size={16} /> About {SESSION_MINUTES} min <span aria-hidden="true">·</span> No guitar needed</span>
          </div>
        </div>
      </section>

      <section className="home-learning" aria-labelledby="learn-heading">
        <div className="section-heading"><h2 id="learn-heading">Explore at your own pace</h2></div>
        <div className="home-cards">
          <a className="home-card lesson-card" href={`#learn/${topic.id}`}>
            <span className="card-icon"><BookOpen size={23} /></span>
            <div className="home-card-copy"><div className="card-kicker">Suggested lesson</div><h3>{topic.title}</h3><p>{topic.description}</p></div>
            <span className="card-arrow"><ArrowRight size={19} /></span>
          </a>
          <a className="home-card fretboard-card" href="#fretboard">
            <span className="card-icon"><Guitar size={23} /></span>
            <div className="home-card-copy"><div className="card-kicker">Interactive tool</div><h3>Fretboard explorer</h3><p>See and hear notes, scales and intervals anywhere on the neck.</p></div>
            <span className="card-arrow"><ArrowRight size={19} /></span>
          </a>
        </div>
      </section>
    </div>
  )
}

function Footer({ storageAvailable }: { storageAvailable: boolean }) {
  const [offlineReady, setOfflineReady] = useState(() => !!navigator.serviceWorker?.controller)

  useEffect(() => {
    const serviceWorker = navigator.serviceWorker
    if (!serviceWorker) return
    const sync = () => setOfflineReady(!!serviceWorker.controller)
    serviceWorker.addEventListener('controllerchange', sync)
    sync()
    return () => serviceWorker.removeEventListener('controllerchange', sync)
  }, [])

  return <footer className="site-footer">
    <span role="status"><Laptop size={16} /> {storageAvailable ? 'Progress stays on this device' : 'Progress could not be saved on this device'}</span>
    {offlineReady && <span><ArrowDownToLine size={15} /> Ready to use offline</span>}
  </footer>
}

export function App() {
  const [route, setRoute] = useState(currentRoute)
  const { progress, update, storageAvailable } = useProgress()
  const [page, id] = route.split('/')
  const topic = id && page === 'learn' ? findTopic(id) : undefined
  const exercise = id && page === 'exercise' ? findExercise(id) : undefined
  const area = page === 'practice' ? 'today' : page === 'exercise' ? 'learn' : page

  useEffect(() => {
    const navigate = () => { stopAudio(); setRoute(currentRoute()) }
    const onVisibility = () => { if (document.hidden) stopAudio() }
    window.addEventListener('hashchange', navigate)
    window.addEventListener('pagehide', stopAudio)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('hashchange', navigate)
      window.removeEventListener('pagehide', stopAudio)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (!window.location.hash) return
    window.scrollTo(0, 0)
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
  }, [route])

  function startDaily() {
    update((latest) => {
      if (latest.session && latest.session.completedAt === null) return latest
      return { ...latest, session: planSession(latest, newId(), Date.now()) }
    })
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Skip to content</a>
      <Header area={area} />
      <main className="main-content" id="main-content" tabIndex={-1}>
        {page === 'today' && <Today progress={progress} onStart={startDaily} />}
        {page === 'practice' && <DailyPractice session={progress.session} onStart={startDaily}
          onAdvance={(session) => update((latest) => advanceSession(latest, session.id, session.step, Date.now()))}
          onResponse={(session, exerciseId, response) => update((latest) => saveSessionResponse(latest, session.id, exerciseId, response, Date.now()))} />}
        {page === 'learn' && (topic ? <Lesson topic={topic} onRead={() => update((latest) => markLesson(latest, topic.id))} /> : <Library progress={progress} />)}
        {page === 'exercise' && (exercise ? <ExerciseView key={exercise.id} exercise={exercise} onAttempt={(response) => update((latest) => recordAttempt(latest, { id: newId(), exercise: exercise.id, result: response.result, at: Date.now() }))} /> : <Library progress={progress} />)}
        {page === 'fretboard' && <Explorer />}
        {page === 'progress' && <ProgressView progress={progress} />}
        {page === 'sound' && <SoundSettings />}
      </main>
      <Footer storageAvailable={storageAvailable} />
    </div>
  )
}
