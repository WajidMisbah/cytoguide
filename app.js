"use strict";
const $=s=>document.querySelector(s),main=$("#main");
let D=null,S={view:"home",sys:"",q:""};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ul=a=>a&&a.length?"<ul>"+a.map(x=>`<li>${esc(x)}</li>`).join("")+"</ul>":"";
function hl(t,q){t=esc(t);if(!q)return t;const w=q.trim().split(/\s+/).filter(Boolean).map(x=>esc(x).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));return w.length?t.replace(new RegExp("("+w.join("|")+")","gi"),"<mark>$1</mark>"):t}
const romTxt=r=>(r||[]).map(x=>`<div>${esc(x.value)} <span class="src">[${esc(x.source)}]</span></div>`).join("");
const repText=d=>`${d.cat}\nFinal diagnosis: ${d.final}${d.comment?"\nComment: "+d.comment:""}`;
function go(v,sys,anchor){S.view=v;if(sys!==undefined)S.sys=sys;const h=v==="sys"?"#/"+S.sys+(anchor?"/"+anchor:""):v==="search"?"#/search":"#/";if(location.hash!==h)history.pushState(null,"",h);render(anchor)}
function render(anchor){document.querySelectorAll("nav button[data-v]").forEach(b=>b.classList.toggle("on",b.dataset.v===S.view));
 if(S.view==="sys")sysView(anchor);else if(S.view==="search")searchView();else home();}
function home(){const r=D.systems.filter(s=>s.status==="ready");
 const nd=r.reduce((a,s)=>a+s.categories.reduce((b,c)=>b+c.diagnoses.length,0),0);
 let h=`<h2>Cytology reporting systems</h2><div class="mut">${r.length} systems ready · ${nd} diagnoses with suggested report wording · ${D.systems.length-r.length} coming soon</div>
 <input id="hq" placeholder="Search systems, categories, diagnoses… (e.g. Warthin, AUS, koilocyte)" style="margin-top:10px">`;
 for(const g of D.groups){const ss=D.systems.filter(s=>s.group===g);if(!ss.length)continue;
  h+=`<div class="grp">${esc(g)}</div><div class="grid">`+ss.map(s=>`<button class="sys ${s.status==="ready"?"":"soon"}" data-s="${s.id}"><b>${esc(s.short)}${s.legacy?'<span class="badge leg">legacy</span>':""}${s.status!=="ready"?'<span class="badge soon">coming soon</span>':""}</b><span class="mut">${esc(s.edition)}${s.year?" · "+s.year:""}</span></button>`).join("")+"</div>"}
 main.innerHTML=h;
 main.querySelectorAll(".sys:not(.soon)").forEach(b=>b.onclick=()=>go("sys",b.dataset.s));
 $("#hq").onkeydown=e=>{if(e.key==="Enter"){S.q=e.target.value;go("search")}};}
function sysView(anchor){const s=D.systems.find(x=>x.id===S.sys);if(!s||s.status!=="ready"){go("home");return}
 let h=`<button class="back" id="bk">← All systems</button><h2>${esc(s.name)}</h2><div class="mut">${esc(s.edition)} · ${s.year}${s.legacy?' <span class="badge leg">legacy</span>':""} · ${esc(s.specimen||"")}</div>
 <div class="toc"><a href="#s-use">When to use</a><a href="#s-adeq">Adequacy</a><a href="#s-tab">Summary table</a><a href="#s-crit">Criteria</a><a href="#s-dx">Diagnoses &amp; wording</a><a href="#s-ref">References</a></div>
 <h3 id="s-use">1. When to use / when not to use</h3><div class="card"><b>Use for</b>${ul(s.use)}<b>Do not use for</b>${ul(s.not_use)}${s.report_structure?"<b>Report structure</b>"+ul(s.report_structure):""}${s.terminology?"<b>Terminology</b>"+ul(s.terminology):""}</div>
 <h3 id="s-adeq">2. Adequacy criteria</h3>`+s.adequacy.map(a=>`<div class="card"><b>${esc(a.title)}</b>${ul(a.items)}</div>`).join("")+
 `<h3 id="s-tab">3. Category summary</h3><div class="tw"><table><tr><th>Category</th><th>Definition</th><th>Risk of malignancy</th><th>Recommended management</th></tr>`+
 s.categories.map((c,i)=>`<tr><td><a href="#c-${i}"><b>${esc(c.code)}</b></a><br>${esc(c.name)}</td><td>${esc(c.definition)}</td><td class="rom">${romTxt(c.rom)}</td><td>${esc(c.management)}</td></tr>`).join("")+`</table></div>
 <h3 id="s-crit">4. Detailed criteria by category</h3>`+s.categories.map((c,i)=>`<div class="card cat" id="c-${i}"><h4>${esc(c.code)} – ${esc(c.name)}</h4>${ul(c.criteria)}${c.notes?ul(c.notes):""}<div class="mut">${c.diagnoses.length} diagnoses · <a href="#d-${i}">see diagnoses &amp; wording ↓</a></div></div>`).join("")+
 `<h3 id="s-dx">5–6. Diagnoses and suggested report wording</h3><div class="mut">Wording is a <b>suggested template</b> – edit to the case. <span class="badge con">consensus</span> = expert consensus / not a formal system term.</div>`+
 s.categories.map((c,i)=>`<div class="card cat" id="d-${i}"><h4>${esc(c.code)} – ${esc(c.name)}</h4>`+c.diagnoses.map((d,j)=>`<details class="dx" id="x-${i}-${j}"><summary>${esc(d.name)}${d.consensus?'<span class="badge con">consensus</span>':""}</summary><div class="rep"><div class="tmpl">SUGGESTED TEMPLATE</div>
 <div class="lbl">Category line</div><div class="txt">${esc(d.cat)}</div><div class="lbl">Final diagnosis</div><div class="txt">${esc(d.final)}</div><div class="lbl">Comment / note</div><div class="txt">${esc(d.comment||"—")}</div>${d.note?`<div class="mut" style="margin-top:4px">ⓘ ${esc(d.note)}</div>`:""}<button class="copy" data-c="${i}-${j}">Copy wording</button></div></details>`).join("")+"</div>").join("")+
 (s.extra?s.extra.map(e=>`<h3>${esc(e.title)}</h3><div class="card">${ul(e.items)}</div>`).join(""):"")+
 `<h3 id="s-ref">References</h3><div class="card">${ul(s.references)}<div class="mut">Content written in our own words from these sources; ROM values are as labelled. Always check against the current edition.</div></div>`;
 main.innerHTML=h;$("#bk").onclick=()=>go("home");
 main.querySelectorAll(".toc a,.card a").forEach(a=>a.onclick=e=>{e.preventDefault();const t=document.getElementById(a.getAttribute("href").slice(1));t&&t.scrollIntoView({behavior:"smooth"})});
 main.querySelectorAll(".copy").forEach(b=>b.onclick=()=>{const[i,j]=b.dataset.c.split("-").map(Number);copy(repText(s.categories[i].diagnoses[j]))});
 if(anchor){const t=document.getElementById(anchor);if(t){if(t.tagName==="DETAILS")t.open=true;setTimeout(()=>t.scrollIntoView(),30)}}else scrollTo(0,0);}
function copy(t){(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{const a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();document.execCommand("copy");a.remove()}).finally(()=>{const x=$("#toast");x.classList.remove("hidden");setTimeout(()=>x.classList.add("hidden"),1200)})}
function searchIdx(){const out=[];for(const s of D.systems){if(s.status!=="ready"){out.push({t:s.short+" – "+s.name,sub:"Coming soon",s,k:"soon"});continue}
 out.push({t:s.short,sub:s.name,s,k:"sys"});
 s.categories.forEach((c,i)=>{out.push({t:`${s.short} ${c.code} – ${c.name}`,sub:c.definition,s,a:"c-"+i,k:"cat",x:c.criteria.join(" ")});
  c.diagnoses.forEach((d,j)=>out.push({t:d.name,sub:`${s.short} → ${c.code} – ${c.name}`,s,a:`x-${i}-${j}`,k:"dx",x:d.final+" "+d.comment+" "+(d.aka||"")}))})}return out}
let IDX=null;
function searchView(){IDX=IDX||searchIdx();main.innerHTML=`<h2>Search</h2><input id="q" placeholder="Diagnosis, category, criterion…" value="${esc(S.q)}"><div id="res"></div>`;
 const q=$("#q");q.oninput=()=>{S.q=q.value;res()};q.focus();res();}
function res(){const q=S.q.trim().toLowerCase(),r=$("#res");if(q.length<2){r.innerHTML='<p class="mut">Type at least 2 letters. Searches all systems, categories, criteria and diagnoses.</p>';return}
 const w=q.split(/\s+/),score=e=>{const a=(e.t+" "+e.sub).toLowerCase(),b=(e.x||"").toLowerCase();if(!w.every(x=>a.includes(x)||b.includes(x)))return-1;return(w.every(x=>e.t.toLowerCase().includes(x))?10:0)+(e.k==="dx"?3:e.k==="cat"?2:1)};
 const hits=IDX.map(e=>[score(e),e]).filter(x=>x[0]>=0).sort((a,b)=>b[0]-a[0]).slice(0,80);
 r.innerHTML=`<p class="mut">${hits.length} result(s)</p>`+hits.map(([_,e],n)=>`<button class="hit" data-n="${n}"><b>${hl(e.t,S.q)}</b>${e.k==="soon"?'<span class="badge soon">coming soon</span>':""}<div class="mut">${hl(e.sub,S.q)}</div></button>`).join("");
 r.querySelectorAll(".hit").forEach(b=>b.onclick=()=>{const e=hits[+b.dataset.n][1];if(e.k!=="soon"){S.sys=e.s.id;go("sys",e.s.id,e.a)}});}
function route(){const h=location.hash.slice(2).split("/");if(h[0]==="search")S.view="search";else if(h[0]){S.view="sys";S.sys=h[0];render(h[1]);return}else S.view="home";render()}
document.querySelectorAll("nav button[data-v]").forEach(b=>b.onclick=()=>go(b.dataset.v));$("#homeBtn").onclick=()=>go("home");
$("#darkBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("cg_dark",document.body.classList.contains("dark"))};
if(localStorage.getItem("cg_dark")==="true")document.body.classList.add("dark");
window.onpopstate=route;
fetch("data.json",{cache:"no-store"}).then(r=>r.json()).then(d=>{D=d;$("#ver").textContent=`Cyto Guide · data ${d.built} · reference aid only – verify against current guideline editions`;route()});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js");
