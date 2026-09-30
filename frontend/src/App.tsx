import { useEffect, useMemo, useState } from "react";

type Device = {
  id: string | number;
  brand: string;
  model_name: string;
  price_usd: number;
  image_url?: string;
};

type IconName =
  | "search"
  | "sun"
  | "moon"
  | "phone"
  | "laptop"
  | "tablet"
  | "game"
  | "camera"
  | "spark"
  | "battery"
  | "plus"
  | "arrow"
  | "chevron"
  | "database"
  | "check";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></>,
    moon: <path d="M20.3 15.5A8.5 8.5 0 0 1 8.5 3.7a8.5 8.5 0 1 0 11.8 11.8Z" />,
    phone: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M10.5 5h3M11 18.5h2" /></>,
    laptop: <><rect x="4" y="4" width="16" height="12" rx="2" /><path d="M2 19h20" /></>,
    tablet: <><rect x="5" y="2.5" width="14" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
    game: <><path d="M8 9H6.5a4.5 4.5 0 0 0-4.3 5.8l.7 2.2a2.5 2.5 0 0 0 4.2 1l2.2-2h5.4l2.2 2a2.5 2.5 0 0 0 4.2-1l.7-2.2A4.5 4.5 0 0 0 17.5 9H16" /><path d="M8 13H5m1.5-1.5v3M17 12.5h.01M19 14.5h.01M9 5h6M10 2.5h4" /></>,
    camera: <><path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="4" /></>,
    spark: <path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Zm7 13 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />,
    battery: <><rect x="2" y="7" width="18" height="10" rx="2" /><path d="M22 10v4M5 10h7" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    chevron: <path d="m7 10 5 5 5-5" />,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const profileAxes = {
  Overall: ["Performance", "Camera", "Battery", "Display", "Design", "Value"],
  Gaming: ["CPU", "GPU", "Memory", "Cooling", "Refresh rate", "Touch"],
  Photography: ["Sensor", "Aperture", "Pixel size", "Stability", "Zoom", "Video"],
  "Daily use": ["Battery", "Charging", "Display", "Refresh rate", "Weight", "Storage"],
};

function RadarPlaceholder({ profile }: { profile: keyof typeof profileAxes }) {
  const center = 165;
  const radius = 112;
  const points = (scale: number) =>
    Array.from({ length: 6 }, (_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 6;
      return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
    }).join(" ");

  return (
    <div className="radar-wrap">
      <svg viewBox="0 0 330 330" className="radar" aria-label={`${profile} comparison chart`}>
        {[1, 0.75, 0.5, 0.25].map((scale) => <polygon key={scale} points={points(scale)} className="radar-ring" />)}
        {Array.from({ length: 6 }, (_, index) => {
          const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 6;
          return <line key={index} x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} className="radar-line" />;
        })}
      </svg>
      {profileAxes[profile].map((label, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 6;
        return <span key={label} className="axis-label" style={{ left: `${50 + Math.cos(angle) * 43}%`, top: `${50 + Math.sin(angle) * 43}%` }}>{label}</span>;
      })}
      <div className="radar-empty">
        <Icon name="plus" size={18} />
        <span>Add devices to visualize</span>
      </div>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [profile, setProfile] = useState<keyof typeof profileAxes>("Overall");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Device[]>([]);
  const [selected, setSelected] = useState<Device[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("Performance");
  const [weights, setWeights] = useState({ performance: 75, camera: 55, battery: 80, display: 65 });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearchError(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchError(false);
      try {
        const response = await fetch(`/api/devices/search?category=smartphone&q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const body = await response.json();
        setResults(Array.isArray(body) ? body : body.devices ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
          setSearchError(true);
        }
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const availableSlots = useMemo(() => 3 - selected.length, [selected.length]);

  function chooseDevice(device: Device) {
    if (selected.some((item) => item.id === device.id) || selected.length >= 3) return;
    setSelected([...selected, device]);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="nav-inner">
          <a className="brand" href="#" aria-label="TechCompare home">
            <span className="brand-mark"><span /><span /></span>
            <span>Tech<span>Compare</span></span>
          </a>
          <nav className="main-nav" aria-label="Main navigation">
            <a className="active" href="#compare">Compare</a>
            <a href="#explore">Explore</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <div className="header-actions">
            <label className="header-search">
              <Icon name="search" size={17} />
              <input aria-label="Search all smartphones" placeholder="Search smartphones" />
              <kbd>⌘ K</kbd>
            </label>
            <button className="theme-button" onClick={() => setDark(!dark)} aria-label="Toggle color theme">
              <Icon name={dark ? "sun" : "moon"} size={18} />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="compare">
          <div className="eyebrow"><span /> Compare with confidence</div>
          <h1>Find the phone that<br /><em>fits you best.</em></h1>
          <p>Go beyond the spec sheet. Compare performance, cameras, battery life, and more—weighted around what matters to you.</p>
          <div className="category-switcher" aria-label="Device category">
            <button className="selected"><Icon name="phone" /> Smartphones</button>
            <button disabled><Icon name="laptop" /> Laptops <small>Soon</small></button>
            <button disabled><Icon name="tablet" /> Tablets <small>Soon</small></button>
          </div>
        </section>

        <section className="selector-section">
          <div className="section-heading">
            <div><span className="step">01</span><h2>Choose your contenders</h2></div>
            <p>Select up to three smartphones to compare side by side.</p>
          </div>

          <div className="device-grid">
            {[0, 1, 2].map((index) => {
              const device = selected[index];
              return device ? (
                <article className="device-card selected-device" key={device.id}>
                  <button className="remove" onClick={() => setSelected(selected.filter((item) => item.id !== device.id))} aria-label={`Remove ${device.model_name}`}>×</button>
                  <div className="device-image">
                    {device.image_url ? <img src={device.image_url} alt="" /> : <Icon name="phone" size={54} />}
                  </div>
                  <span className="device-brand">{device.brand}</span>
                  <h3>{device.model_name}</h3>
                  <strong>${Number(device.price_usd).toLocaleString("en-US")} <small>USD</small></strong>
                </article>
              ) : (
                <article className={`device-card empty ${index === selected.length ? "next" : ""}`} key={index}>
                  <span className="slot-number">0{index + 1}</span>
                  <div className="phone-outline"><Icon name="plus" size={25} /></div>
                  <h3>{index === 0 ? "Add first phone" : index === 1 ? "Add a contender" : "Add one more"}</h3>
                  <p>{index <= selected.length ? "Search the live smartphone catalog" : "Fill the previous slot first"}</p>
                  {index === selected.length && availableSlots > 0 && (
                    <div className="device-search">
                      <Icon name="search" size={17} />
                      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by brand or model" aria-label="Search device catalog" />
                      {(query.length >= 2 || searching) && (
                        <div className="search-popover">
                          {searching && <div className="search-state"><span className="spinner" /> Searching catalog…</div>}
                          {!searching && searchError && <div className="search-state error"><Icon name="database" /><span><strong>Catalog isn’t connected yet</strong><small>Connect the API to search live devices.</small></span></div>}
                          {!searching && !searchError && results.length === 0 && <div className="search-state">No smartphones found</div>}
                          {results.map((result) => (
                            <button key={result.id} onClick={() => chooseDevice(result)}>
                              <span><strong>{result.model_name}</strong><small>{result.brand}</small></span>
                              <span>${result.price_usd}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="quick-row">
            <span>Quick starts</span>
            <button><Icon name="spark" size={15} /> Flagship showdown</button>
            <button><Icon name="game" size={15} /> Best for gaming</button>
            <button><Icon name="camera" size={15} /> Camera champions</button>
            <small>Presets load from your connected catalog</small>
          </div>
        </section>

        <section className="analysis-section">
          <div className="section-heading">
            <div><span className="step">02</span><h2>See every angle</h2></div>
            <p>Switch profiles to compare the specs that matter for each use case.</p>
          </div>
          <div className="analysis-card">
            <div className="profile-tabs">
              {(Object.keys(profileAxes) as Array<keyof typeof profileAxes>).map((tab) => (
                <button key={tab} className={profile === tab ? "active" : ""} onClick={() => setProfile(tab)}>
                  <Icon name={tab === "Gaming" ? "game" : tab === "Photography" ? "camera" : tab === "Daily use" ? "battery" : "spark"} size={16} />
                  {tab}
                </button>
              ))}
            </div>
            <div className="analysis-content">
              <div className="chart-panel">
                <div className="panel-title"><span>Hardware profile</span><small>Normalized score / 100</small></div>
                <RadarPlaceholder profile={profile} />
              </div>
              <div className="preferences-panel">
                <span className="panel-kicker">PERSONALIZE YOUR MATCH</span>
                <h3>What matters most to you?</h3>
                <p>Adjust your priorities and we’ll calculate a tailored match score for every phone.</p>
                <div className="sliders">
                  {Object.entries(weights).map(([key, value]) => (
                    <label key={key}>
                      <span><span>{key}</span><strong>{value}%</strong></span>
                      <input type="range" min="0" max="100" value={value} onChange={(event) => setWeights({ ...weights, [key]: Number(event.target.value) })} />
                    </label>
                  ))}
                </div>
                <div className="match-note"><Icon name="spark" size={18} /><span><strong>Your scores update instantly</strong><small>Select at least two devices to see personalized matches.</small></span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="details-section">
          <div className="section-heading">
            <div><span className="step">03</span><h2>Dig into the details</h2></div>
            <p>Every specification, clearly organized. Winning values are highlighted automatically.</p>
          </div>
          <div className="spec-list">
            {[
              ["Performance", "CPU, GPU, memory & cooling", "game"],
              ["Camera system", "Sensors, lenses, stabilization & video", "camera"],
              ["Battery & charging", "Capacity, wired & wireless speeds", "battery"],
              ["Display & design", "Panel, resolution, refresh rate & weight", "phone"],
            ].map(([title, description, icon]) => (
              <div className="spec-row" key={title}>
                <button onClick={() => setOpenSection(openSection === title ? null : title)}>
                  <span className="spec-icon"><Icon name={icon as IconName} /></span>
                  <span><strong>{title}</strong><small>{description}</small></span>
                  <Icon name="chevron" />
                </button>
                {openSection === title && (
                  <div className="spec-empty">
                    <span className="mini-device"><Icon name="phone" /></span>
                    <span><strong>Ready for a detailed comparison</strong><small>Choose at least two smartphones above to compare live specifications.</small></span>
                    <a href="#compare">Choose devices <Icon name="arrow" size={15} /></a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="backend-banner">
          <div className="backend-icon"><Icon name="database" size={26} /></div>
          <div><span>BUILT TO GROW</span><h2>Ready for your live catalog.</h2><p>Search, comparison, and personalized scoring are structured around API-driven device data—so every new phone appears without frontend changes.</p></div>
          <div className="backend-points">
            <span><Icon name="check" size={15} /> Category-safe search</span>
            <span><Icon name="check" size={15} /> Server-side scoring</span>
            <span><Icon name="check" size={15} /> Supabase-ready</span>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#"><span className="brand-mark"><span /><span /></span><span>Tech<span>Compare</span></span></a>
        <p>Smarter specs. Better choices.</p>
        <span>© 2026 TechCompare</span>
      </footer>
    </div>
  );
}
