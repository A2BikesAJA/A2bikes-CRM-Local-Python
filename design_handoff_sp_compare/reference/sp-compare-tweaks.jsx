/* Tweaks app for "Compare the SP" — React controls only the panel.
   Effects write CSS variables / call page hooks the vanilla page exposes. */
const { useEffect } = React;

const SP_ACCENTS = {
  'Lava Red':      { a: '#E5322B', deep: '#C32219' },
  'Carbon':        { a: '#1A1B1D', deep: '#000000' },
  'Electric Blue': { a: '#1E6BFF', deep: '#1450C4' },
};

const SP_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "Lava Red",
  "headline": "Which SP is right for you?",
  "subhead": "Same race-tested carbon frame. Same SAGS adjustability. Four ways to ride it.",
  "defaultRec": "none",
  "motion": true
}/*EDITMODE-END*/;

const REC_LABELS = {
  none: 'No default',
  price: 'SP 105',
  performance: 'SP Force AXS',
  premium: 'SP Red AXS',
};

function App() {
  const [t, setTweak] = useTweaks(SP_TWEAK_DEFAULTS);

  // Accent
  useEffect(() => {
    const c = SP_ACCENTS[t.accent] || SP_ACCENTS['Lava Red'];
    const r = document.documentElement.style;
    r.setProperty('--accent', c.a);
    r.setProperty('--accent-deep', c.deep);
  }, [t.accent]);

  // Hero headline / subhead
  useEffect(() => {
    const h = document.querySelector('.sp-hero .display');
    if (h) h.innerHTML = (t.headline || '').replace(/\s+for\s+/i, ' for<br>').trim();
  }, [t.headline]);
  useEffect(() => {
    const s = document.querySelector('.sp-hero__sub');
    if (s) s.textContent = t.subhead || '';
  }, [t.subhead]);

  // Default recommended build (highlights a column on load, no scroll)
  useEffect(() => {
    if (typeof window.__spApplyFilter !== 'function') return;
    window.__spApplyFilter(t.defaultRec === 'none' ? null : t.defaultRec);
  }, [t.defaultRec]);

  // Motion
  useEffect(() => {
    document.body.classList.toggle('no-motion', !t.motion);
  }, [t.motion]);

  return (
    <TweaksPanel>
      <TweakSection label="Brand" />
      <TweakColor label="Accent" value={(SP_ACCENTS[t.accent]||SP_ACCENTS['Lava Red']).a}
        options={Object.values(SP_ACCENTS).map(c => c.a)}
        onChange={(hex) => {
          const name = Object.keys(SP_ACCENTS).find(k => SP_ACCENTS[k].a === hex) || 'Lava Red';
          setTweak('accent', name);
        }} />

      <TweakSection label="Comparison" />
      <TweakSelect label="Pre-highlight build" value={t.defaultRec}
        options={Object.keys(REC_LABELS).map(k => ({ value: k, label: REC_LABELS[k] }))}
        onChange={(v) => setTweak('defaultRec', v)} />

      <TweakSection label="Hero" />
      <TweakText label="Headline" value={t.headline} onChange={(v) => setTweak('headline', v)} />
      <TweakText label="Subhead" value={t.subhead} onChange={(v) => setTweak('subhead', v)} />

      <TweakSection label="Motion" />
      <TweakToggle label="Scroll reveals" value={t.motion} onChange={(v) => setTweak('motion', v)} />
    </TweaksPanel>
  );
}

const spMount = document.createElement('div');
document.body.appendChild(spMount);
ReactDOM.createRoot(spMount).render(<App />);
