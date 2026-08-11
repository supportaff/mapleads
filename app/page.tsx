"use client";

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('../components/Globe'), { ssr: false });

const sampleLeads = [
  { name: 'Apollo Dental', phone: '+91 44 4012 1200', reviews: 421, rating: 4.8, category: 'Dentist', city: 'Chennai', state: 'Tamil Nadu', website: 'apollodental.in', email: 'info@apollodental.in', status: 'OPERATIONAL', zip: '600006' },
  { name: 'Chennai Smiles', phone: '+91 44 2815 3300', reviews: 287, rating: 4.7, category: 'Dental clinic', city: 'Chennai', state: 'Tamil Nadu', website: 'chennaismiles.com', email: 'hello@chennaismiles.com', status: 'OPERATIONAL', zip: '600018' },
  { name: 'City Dental Care', phone: '+91 44 4555 1822', reviews: 193, rating: 4.6, category: 'Dentist', city: 'Chennai', state: 'Tamil Nadu', website: 'citydentalcare.in', email: 'contact@citydentalcare.in', status: 'OPERATIONAL', zip: '600040' },
];

export default function Home() {
  const [location, setLocation] = useState('India');
  const [query, setQuery] = useState('Dentist');
  const [limit, setLimit] = useState('500');
  const [reviews, setReviews] = useState('5');
  const [active, setActive] = useState('new');
  const [running, setRunning] = useState(false);
  const [showLeads, setShowLeads] = useState(false);
  const [progress, setProgress] = useState(0);

  const displayed = useMemo(() => showLeads ? sampleLeads : [], [showLeads]);

  const runSearch = () => {
    setRunning(true); setShowLeads(false); setProgress(8);
    let p = 8;
    const timer = setInterval(() => {
      p += Math.floor(Math.random() * 18) + 8;
      if (p >= 100) { p = 100; clearInterval(timer); setTimeout(() => { setRunning(false); setShowLeads(true); }, 350); }
      setProgress(p);
    }, 350);
  };

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">M</div><div><b>MapLeads</b><span>Location intelligence</span></div></div>
      <div className="workspace"><span>WORKSPACE</span><button>MAIN <i>⌄</i></button></div>
      <nav>
        <button className={active === 'new' ? 'nav active' : 'nav'} onClick={() => setActive('new')}><span>＋</span> New Search</button>
        <button className={active === 'leads' ? 'nav active' : 'nav'} onClick={() => { setActive('leads'); setShowLeads(true); }}><span>◫</span> Leads <em>{showLeads ? displayed.length : 0}</em></button>
        <button className="nav"><span>◷</span> Searches</button>
        <button className="nav"><span>⇩</span> Exports</button>
        <button className="nav"><span>⚙</span> Settings</button>
      </nav>
      <div className="credits"><div><span>Credits</span><b>500</b></div><div className="bar"><i /></div><small>500 remaining</small></div>
      <div className="profile"><div className="avatar">P</div><div><b>Prakash</b><span>Free workspace</span></div><span>•••</span></div>
    </aside>

    <section className="workspace-main">
      <header className="topbar"><div><span className="crumb">MAIN</span><strong>/ New Search</strong></div><div className="top-actions"><button>⌘ K</button><button>Help</button><div className="online"><i/> System operational</div></div></header>

      <div className="content">
        <div className="map-stage">
          <Globe location={location} onLocation={(name) => setLocation(name)} />
          <div className="map-hint"><span className="pulse"/> Click a region to select it <span>•</span> Drag to rotate <span>•</span> Scroll to zoom</div>
          {running && <div className="search-progress"><div className="progress-head"><span>Finding places</span><b>{progress}%</b></div><div className="progress-bar"><i style={{ width: `${progress}%` }}/></div><div className="progress-stats"><span>Google Maps source</span><span>{Math.floor(progress * 3.6)} places discovered</span></div></div>}
        </div>

        <aside className="search-panel">
          <div className="panel-title"><div><span>NEW SEARCH</span><h1>Find businesses</h1></div><button>×</button></div>
          <label>WHAT ARE WE LOOKING FOR?</label>
          <div className="input-wrap"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. dentists, restaurants"/><kbd>⌘</kbd></div>
          <div className="suggestions"><button onClick={() => setQuery('Dentist')}>Dentist</button><button onClick={() => setQuery('Manufacturing company')}>Manufacturing</button><button onClick={() => setQuery('Law firm')}>Law firm</button></div>

          <label>SELECTED LOCATION</label>
          <div className="location-card"><div className="globe-icon">◎</div><div><b>{location}</b><span>Region selected on globe</span></div><button onClick={() => setLocation('India')}>Change</button></div>

          <label>LIST NAME</label>
          <input className="field" defaultValue="new_leads_search" />

          <label>PARAMETERS</label>
          <div className="two-col"><div><span>Lead limit</span><input className="field" value={limit} onChange={e => setLimit(e.target.value)} /></div><div><span>Min. reviews</span><input className="field" value={reviews} onChange={e => setReviews(e.target.value)} /></div></div>
          <div className="toggle-row"><div><b>Include similar queries</b><span>Expand results with related categories</span></div><button className="toggle on"><i/></button></div>
          <div className="source-note"><span>◉</span><div><b>Maps data connector</b><small>Provider adapter ready for authorized data sources</small></div></div>
          <button className="find" onClick={runSearch} disabled={running}>{running ? `SEARCHING ${progress}%` : 'FIND PLACES'} <span>→</span></button>
          <small className="policy">Results are normalized into your lead schema. Data-provider credentials are configured server-side.</small>
        </aside>
      </div>

      {showLeads && <section className="leads-panel"><div className="leads-header"><div><span>SEARCH RESULTS</span><h2>{displayed.length} leads found</h2></div><div><button className="outline">Export CSV</button><button className="dark">Export XLSX</button></div></div><div className="table-wrap"><table><thead><tr><th>Business</th><th>Phone</th><th>Rating</th><th>Reviews</th><th>Category</th><th>Location</th><th>Website</th><th>Email</th><th>Status</th></tr></thead><tbody>{displayed.map((l) => <tr key={l.name}><td><b>{l.name}</b></td><td>{l.phone}</td><td><strong>★ {l.rating}</strong></td><td>{l.reviews}</td><td>{l.category}</td><td>{l.city}, {l.state}</td><td className="link">{l.website}</td><td className="email">✓ {l.email}</td><td><span className="status">● {l.status}</span></td></tr>)}</tbody></table></div></section>}
    </section>
  </main>;
}