"use client";

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('../components/Globe'), { ssr: false });

type Lead = { query:string; name:string; phone:string; review_count:number; rating:number|null; categories:string[]; city:string; state:string; website:string; domain:string; email:string; address:string; business_status:string; claimed:boolean|null; working_hours:string[]; google_maps_url:string; zip_code:string; place_id:string };

const csvValue = (value: unknown) => `"${String(Array.isArray(value) ? value.join('; ') : value ?? '').replaceAll('"','""')}"`;

export default function Home() {
  const [location, setLocation] = useState('India'); const [query, setQuery] = useState('Dentist');
  const [limit, setLimit] = useState('20'); const [reviews, setReviews] = useState('5');
  const [active, setActive] = useState('new'); const [running, setRunning] = useState(false);
  const [showLeads, setShowLeads] = useState(false); const [progress, setProgress] = useState(0);
  const [leads, setLeads] = useState<Lead[]>([]); const [error, setError] = useState('');
  const displayed = useMemo(() => showLeads ? leads : [], [showLeads, leads]);

  const runSearch = async () => {
    setRunning(true); setShowLeads(false); setError(''); setProgress(10);
    const timer = window.setInterval(() => setProgress(p => Math.min(p + 8, 88)), 300);
    try {
      const response = await fetch('/api/search', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query, location, limit:Number(limit), minReviews:Number(reviews)}) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Search failed');
      setLeads(data.leads || []); setProgress(100); setShowLeads(true); setActive('leads');
    } catch (e) { setError(e instanceof Error ? e.message : 'Search failed'); setProgress(0); }
    finally { window.clearInterval(timer); setRunning(false); }
  };

  const exportCsv = () => {
    const fields = ['query','name','phone','review_count','rating','categories','city','state','website','domain','email','address','business_status','claimed','working_hours','google_maps_url','zip_code'];
    const csv = [fields.join(','), ...leads.map(l => fields.map(f => csvValue((l as any)[f])).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'})); const a=document.createElement('a'); a.href=url; a.download=`${query}-${location}-leads.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return <main className="shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">M</div><div><b>MapLeads</b><span>Location intelligence</span></div></div>
      <div className="workspace"><span>WORKSPACE</span><button>MAIN <i>⌄</i></button></div><nav>
        <button className={active==='new'?'nav active':'nav'} onClick={()=>{setActive('new');setShowLeads(false)}}><span>＋</span> New Search</button>
        <button className={active==='leads'?'nav active':'nav'} onClick={()=>{setActive('leads');setShowLeads(true)}}><span>◫</span> Leads <em>{leads.length}</em></button>
        <button className="nav"><span>◷</span> Searches</button><button className="nav"><span>⇩</span> Exports</button><button className="nav"><span>⚙</span> Settings</button></nav>
      <div className="credits"><div><span>Credits</span><b>500</b></div><div className="bar"><i/></div><small>500 remaining</small></div>
      <div className="profile"><div className="avatar">P</div><div><b>Prakash</b><span>Free workspace</span></div><span>•••</span></div></aside>
    <section className="workspace-main"><header className="topbar"><div><span className="crumb">MAIN</span><strong>/ {showLeads?'Leads':'New Search'}</strong></div><div className="top-actions"><button>⌘ K</button><button>Help</button><div className="online"><i/> System operational</div></div></header>
      <div className="content"><div className="map-stage"><Globe location={location} onLocation={name=>{setLocation(name);setShowLeads(false);setError('')}}/><div className="map-hint"><span className="pulse"/> Click a bordered region to select it <span>•</span> Drag to rotate <span>•</span> Scroll to zoom</div>
        {running&&<div className="search-progress"><div className="progress-head"><span>Extracting places in {location}</span><b>{progress}%</b></div><div className="progress-bar"><i style={{width:`${progress}%`}}/></div><div className="progress-stats"><span>Google Places API</span><span>{query}</span></div></div>}</div>
        <aside className="search-panel"><div className="panel-title"><div><span>NEW SEARCH</span><h1>Find businesses</h1></div><button onClick={()=>setShowLeads(false)}>×</button></div>
          <label>WHAT ARE WE LOOKING FOR?</label><div className="input-wrap"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. dentists, restaurants"/><kbd>⌘</kbd></div>
          <div className="suggestions"><button onClick={()=>setQuery('Dentist')}>Dentist</button><button onClick={()=>setQuery('Manufacturing company')}>Manufacturing</button><button onClick={()=>setQuery('Law firm')}>Law firm</button></div>
          <label>SELECTED REGION</label><div className="location-card"><div className="globe-icon">◎</div><div><b>{location}</b><span>Selected geographic region</span></div><button onClick={()=>setLocation('India')}>Reset</button></div>
          <div className="region-lock"><span>✓</span><div><b>Search area selected</b><small>The selected region is passed to the live Places search.</small></div></div>
          <label>LIST NAME</label><input className="field" defaultValue="new_leads_search"/><label>PARAMETERS</label>
          <div className="two-col"><div><span>Lead limit</span><input className="field" type="number" min="1" max="20" value={limit} onChange={e=>setLimit(e.target.value)}/></div><div><span>Min. reviews</span><input className="field" type="number" min="0" value={reviews} onChange={e=>setReviews(e.target.value)}/></div></div>
          <div className="toggle-row"><div><b>Include similar queries</b><span>Expand results with related categories</span></div><button className="toggle on"><i/></button></div>
          <div className="source-note"><span>◎</span><div><b>Live Places connector</b><small>Server-side Google Places API integration.</small></div></div>
          {error&&<div className="error-box">{error}</div>}<button className="find" onClick={runSearch} disabled={running}>{running?`SEARCHING ${progress}%`:`FIND PLACES IN ${location.toUpperCase()}`}<span>→</span></button>
          <small className="policy">Set GOOGLE_MAPS_API_KEY in Vercel Environment Variables for live extraction.</small></aside></div>
      {showLeads&&<section className="leads-panel"><div className="leads-header"><div><span>LIVE SEARCH RESULTS · {location.toUpperCase()}</span><h2>{displayed.length} leads found</h2></div><div><button className="outline" onClick={exportCsv}>Export CSV</button><button className="dark" onClick={exportCsv}>Export XLSX</button></div></div>
        <div className="table-wrap"><table><thead><tr><th>Business</th><th>Phone</th><th>Rating</th><th>Reviews</th><th>Category</th><th>Location</th><th>Website</th><th>Email</th><th>Status</th></tr></thead><tbody>{displayed.map(l=><tr key={l.place_id||l.name}><td><b>{l.name}</b></td><td>{l.phone}</td><td><strong>{l.rating?`★ ${l.rating}`:'—'}</strong></td><td>{l.review_count}</td><td>{l.categories?.slice(0,2).join(', ')}</td><td>{l.city}{l.state?`, ${l.state}`:''}</td><td className="link">{l.domain||'—'}</td><td className="email">{l.email||'—'}</td><td><span className="status">● {l.business_status||'UNKNOWN'}</span></td></tr>)}</tbody></table></div></section>}</section></main>;
}