"use client";
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocation } from '@/context/LocationContext';
import { getMoviesForLocation } from '@/lib/data';
import { ArrowUpRight, Search, MapPin, Ticket, ArrowRight } from 'lucide-react';
const languages=['All languages','Telugu','Hindi','Tamil','Malayalam','Kannada','English'];
export default function Home(){
 const {selectedLocation}=useLocation();
 const [search,setSearch]=useState('');const [language,setLanguage]=useState('All languages');
 const movies=useMemo(()=>getMoviesForLocation(selectedLocation.id),[selectedLocation.id]);
 const filtered=movies.filter(m=>m.title.toLowerCase().includes(search.toLowerCase())&&(language==='All languages'||(m.language || '').includes(language)));
 const featured=movies[0];
 return <div className="tx-discovery">
 <section className="tx-editorial-hero">
 <div className="tx-hero-copy"><p className="tx-eyebrow">THE BIG SCREEN. A LITTLE CLOSER.</p><h1>Some stories<br/>deserve a<br/><em>bigger screen.</em></h1><p className="tx-intro">Find your next great cinema moment. Choose your film, find your favourite spot, and settle into the story.</p><div className="tx-hero-actions"><a href="#discover" className="tx-primary">Explore the films <ArrowUpRight size={19}/></a><Link href="/theatres" className="tx-secondary">Find a theatre <ArrowRight size={17}/></Link></div><p className="tx-location"><MapPin size={15}/> Exploring {selectedLocation.name}</p></div>
 <div className="tx-hero-art">{featured&&<><img src={featured.backdrop||featured.poster} alt="" className="tx-backdrop"/><img src={featured.poster} alt={`${featured.title} poster`} className="tx-feature-poster"/><div className="tx-feature-caption"><span>FROM THE DEMO COLLECTION</span><h2>{featured.title}</h2><Link href={`/movies/${featured.id}`}>Explore this film <ArrowUpRight size={18}/></Link></div></>}<span className="tx-frame-label">TICKETX / THE CINEMA EDIT</span></div>
 </section>
 <div className="tx-demo-note"><Ticket size={18}/><span><strong>Explore in demo mode.</strong> Cinema listings and showtimes are demonstrations. No actual admission tickets are issued.</span></div>
 <section id="discover" className="tx-film-section"><div className="tx-section-top"><div><p className="tx-eyebrow">YOUR NEXT GREAT WATCH</p><h2>The cinema edit<span>.</span></h2></div><label className="tx-search"><Search size={18}/><input aria-label="Search movies" placeholder="Find a film…" value={search} onChange={e=>setSearch(e.target.value)}/></label></div><div className="tx-language-list" aria-label="Filter by language">{languages.map(l=><button key={l} aria-pressed={l===language} onClick={()=>setLanguage(l)}>{l}</button>)}</div><p className="tx-catalogue-note">Demonstration catalogue · Current release verification pending</p><div className="tx-poster-grid">{filtered.map(m=><Link className="tx-film" key={m.id} href={`/movies/${m.id}`}><div className="tx-poster-wrap"><img src={m.poster} alt={`${m.title} poster`} loading="lazy"/><span className="tx-film-open"><ArrowUpRight size={20}/></span></div><div className="tx-film-meta"><h3>{m.title}</h3><span>{m.language}</span></div><p>{m.genres?.join(' / ')}</p></Link>)}</div>{!filtered.length&&<div className="tx-empty"><h3>No films match your selection.</h3><p>Try another title or language.</p><button onClick={()=>{setSearch('');setLanguage('All languages')}}>Clear filters</button></div>}</section>
 <section className="tx-experience"><p className="tx-eyebrow">MAKE AN EVENING OF IT</p><h2>The right film.<br/>The perfect seat.</h2><p>Explore theatres and choose your seat with a clear, top-down view of the auditorium.</p><Link className="tx-primary" href="/theatres">Explore theatres <ArrowUpRight size={18}/></Link></section>
 </div>
}

