'use client'

import { useState } from 'react'

const items = [
  {
    label: "Worum geht's hier?",
    title: <>Schrauben.<br />Fahren.<br />Bock haben.</>,
    body: (
      <>
        <p className="lede">Kurz gesagt: Zweitakt, Schrauben und gemeinsam Spaß haben. Bei Zweitakt Hoden treffen sich Zweitakt-Fans, die —</p>
        <ul>
          <li>gerne an Zweitakt-Motorrädern schrauben (oder es lernen wollen)</li>
          <li>lieber selbst anpacken als endlos diskutieren</li>
          <li>keine Angst vor Fehlern haben</li>
        </ul>
        <p className="kicker">Marke, Hubraum, Erfahrung? Zweitrangig. Hauptsache Zweitakt.</p>
      </>
    ),
  },
  {
    label: 'Keine Szene. Keine Show.',
    title: 'Garage statt Gallery.',
    body: (
      <>
        <p className="lede">Bei Zweitakt Hoden geht&rsquo;s <strong>nicht</strong> um —</p>
        <ul>
          <li>perfekte Builds &amp; Showbikes</li>
          <li>PS-Vergleiche &amp; Spec-Wars</li>
          <li>Instagram-Tuning &amp; Social-Media-Auftritte</li>
        </ul>
        <p className="kicker">Sondern um echte Zweitakt-Community, Wissen rund ums Schrauben und ehrlichen Austausch unter Gleichgesinnten.</p>
      </>
    ),
  },
  {
    label: 'Mitmachen ist einfach.',
    title: <>Dein Platz in<br />der Garage.</>,
    body: (
      <>
        <p className="lede">Du musst kein Experte sein. Kein teures Bike haben. Kein perfektes Setup vorweisen.</p>
        <p className="lede">Du brauchst nur Bock auf Zweitakt — und Lust, dich mit Leuten auszutauschen, die genauso ticken wie du.</p>
        <p className="kicker">Kostenlos anmelden. Einfach loslegen.</p>
      </>
    ),
  },
]

export default function CredoAccordion() {
  const [open, setOpen] = useState(new Set([0, 1, 2]))

  const toggle = (i) => setOpen(prev => {
    const next = new Set(prev)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })

  return (
    <section className="zh-credo-accordion">
      {items.map((item, i) => (
        <div key={i} className={`zh-credo-acc-item idx-${i}${open.has(i) ? ' open' : ''}`}>
          <button
            className="zh-credo-acc-trigger"
            onClick={() => toggle(i)}
            aria-expanded={open.has(i)}
          >
            <span className="acc-num">{item.label}</span>
            <h3 className="acc-title">{item.title}</h3>
            <span className="zh-credo-acc-icon" aria-hidden="true">{open === i ? '−' : '+'}</span>
          </button>
          <div className="zh-credo-acc-body">
            <div className="zh-credo-acc-inner">
              {item.body}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
