(function(){
  "use strict";
  var $ = function(s,c){return (c||document).querySelector(s)};
  var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var PRICE = 150, PHONE_WA = "27723931854";

  /* ---------- safe storage ---------- */
  var mem = {};
  function load(k, fallback){
    try{ var v = localStorage.getItem(k); if(v) return JSON.parse(v); }catch(e){}
    return mem[k] !== undefined ? mem[k] : fallback;
  }
  function save(k, v){
    mem[k] = v;
    try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
  }
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}

  var toastT;
  function toast(msg){
    var t=$("#toast"); t.textContent=msg; t.classList.add("on");
    clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("on")},2800);
  }

  $("#yr").textContent = new Date().getFullYear();

  /* ---------- nav ---------- */
  var burger=$("#burger"), menu=$("#menu");
  burger.addEventListener("click",function(){
    var o=menu.classList.toggle("open"); burger.setAttribute("aria-expanded",o);
  });
  $$("#menu a").forEach(function(a){a.addEventListener("click",function(){menu.classList.remove("open");burger.setAttribute("aria-expanded","false")})});

  /* ---------- booking ---------- */
  var DAYN = {6:"Saturday",0:"Sunday"};
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var book = {day:null,date:null,count:1};
  var step = 0;

  function go(n){
    step=n;
    $$(".panel").forEach(function(p){p.classList.toggle("show",+p.dataset.step===n)});
    $$(".step-dot").forEach(function(d,i){d.classList.toggle("on",i<=n)});
    $("#stepFill").style.width = (n/3*100)+"%";
    var box=$("#bookBox"); var y=box.getBoundingClientRect().top+window.scrollY-100;
    if(window.scrollY>y+200||window.scrollY<y-400) window.scrollTo({top:y,behavior:"smooth"});
  }
  function fmt(d){return DAYN[d.getDay()]+" "+d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear()}

  $$(".choice").forEach(function(b){
    b.addEventListener("click",function(){
      $$(".choice").forEach(function(c){c.setAttribute("aria-pressed","false")});
      b.setAttribute("aria-pressed","true");
      book.day=+b.dataset.day; book.date=null;
      buildDates();
      setTimeout(function(){go(1)},380);
    });
  });

  function buildDates(){
    var wrap=$("#dates"); wrap.innerHTML="";
    var d=new Date(); d.setHours(12,0,0,0);
    var out=[];
    while(out.length<8){
      d=new Date(d.getTime()+86400000);
      if(d.getDay()===book.day) out.push(new Date(d));
    }
    out.forEach(function(dt){
      var b=document.createElement("button");
      b.type="button"; b.className="date"; b.setAttribute("aria-pressed","false");
      b.innerHTML="<b>"+dt.getDate()+"</b>"+MON[dt.getMonth()]+" "+dt.getFullYear();
      b.addEventListener("click",function(){
        $$(".date").forEach(function(x){x.setAttribute("aria-pressed","false")});
        b.setAttribute("aria-pressed","true"); book.date=dt;
        setTimeout(function(){go(2)},380);
      });
      wrap.appendChild(b);
    });
  }

  $$("[data-back]").forEach(function(b){b.addEventListener("click",function(){go(step-1)})});

  var totalEl=$("#total"), shown=PRICE;
  function tick(to){
    var from=shown, t0=performance.now();
    function f(t){
      var p=Math.min(1,(t-t0)/350); shown=Math.round(from+(to-from)*p);
      totalEl.textContent="R"+shown; if(p<1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  function setCount(n){
    book.count=Math.max(1,Math.min(30,n)); $("#count").textContent=book.count; tick(book.count*PRICE);
  }
  $("#minus").addEventListener("click",function(){setCount(book.count-1)});
  $("#plus").addEventListener("click",function(){setCount(book.count+1)});

  function bad(el){el.classList.add("bad");el.focus();setTimeout(function(){el.classList.remove("bad")},500)}

  $("#confirm").addEventListener("click",function(){
    var n=$("#bName"), p=$("#bPhone"), pl=$("#bPlayers");
    if(!n.value.trim()){bad(n);toast("Enter your name to continue.");return}
    if(p.value.replace(/\D/g,"").length<9){bad(p);toast("Enter a phone number we can reach you on.");return}
    var rec={
      day:DAYN[book.day], date:fmt(book.date), name:n.value.trim(), phone:p.value.trim(),
      players:pl.value.trim()||n.value.trim(), count:book.count, total:book.count*PRICE, made:Date.now()
    };
    var list=load("dha-bookings",[]); list.unshift(rec); save("dha-bookings",list.slice(0,20));
    showSummary(rec); renderBookings(); go(3); confetti();
  });

  function showSummary(r){
    $("#summary").innerHTML=
      "<li><span>Session</span><b>"+esc(r.date)+"</b></li>"+
      "<li><span>Name</span><b>"+esc(r.name)+"</b></li>"+
      "<li><span>Players</span><b>"+esc(r.players)+" ("+r.count+")</b></li>"+
      "<li><span>Place</span><b>Secunda, 2302</b></li>"+
      "<li><span>Total to pay</span><b>R"+r.total+"</b></li>";
    var msg="Hi Dragon Hockey Academy! I'd like to book a group session.\n"+
      "Date: "+r.date+"\nName: "+r.name+"\nPlayers: "+r.players+" ("+r.count+")\nTotal: R"+r.total+"\nPhone: "+r.phone;
    $("#waBtn").href="https://wa.me/"+PHONE_WA+"?text="+encodeURIComponent(msg);
  }

  function confetti(){
    var c=$("#confetti"); c.innerHTML="";
    if(matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    for(var i=0;i<34;i++){
      var e=document.createElement("i");
      e.style.left=(60+Math.random()*30)+"%";
      e.style.background=["#e10b17","#fff","#8e0510"][i%3];
      e.style.setProperty("--x",(Math.random()*240-120)+"px");
      e.style.setProperty("--y",(Math.random()*180-110)+"px");
      e.style.animationDelay=(1.5+Math.random()*.2)+"s";
      c.appendChild(e);
    }
  }

  $("#again").addEventListener("click",function(){
    book={day:null,date:null,count:1};
    $$(".choice").forEach(function(c){c.setAttribute("aria-pressed","false")});
    ["#bName","#bPhone","#bPlayers"].forEach(function(s){$(s).value=""});
    setCount(1); go(0);
  });

  function renderBookings(){
    var list=load("dha-bookings",[]), box=$("#myBookings");
    box.hidden=!list.length;
    $("#bookingList").innerHTML=list.map(function(r){
      return '<span class="chip"><b>'+esc(r.date)+'</b> '+r.count+' player'+(r.count>1?'s':'')+' &middot; R'+r.total+'</span>';
    }).join("");
  }
  renderBookings();

  /* ---------- progress tracker ---------- */
  var SKILLS=["Passing","Dribbling","Stick control","Shooting","Fitness","Game awareness"];
  var data=load("dha-progress",{current:null,players:{}});
  var mode="auto"; // auto | update

  function avg(v){var s=0;SKILLS.forEach(function(k){s+=+v[k]||0});return +(s/SKILLS.length).toFixed(1)}
  function persist(){save("dha-progress",data)}

  function sliderHTML(vals,prefix){
    return SKILLS.map(function(k,i){
      var v=vals?vals[k]:5;
      return '<div class="slider-row"><label for="'+prefix+i+'">'+k+'</label>'+
        '<input type="range" min="1" max="10" step="1" value="'+v+'" id="'+prefix+i+'" data-skill="'+k+'" style="--p:'+((v-1)/9*100)+'%">'+
        '<output>'+v+'</output></div>';
    }).join("");
  }
  function bindSliders(root){
    $$("input[type=range]",root).forEach(function(r){
      r.addEventListener("input",function(){
        r.nextElementSibling.textContent=r.value;
        r.style.setProperty("--p",((r.value-1)/9*100)+"%");
      });
    });
  }
  function readSliders(root){
    var o={}; $$("input[type=range]",root).forEach(function(r){o[r.dataset.skill]=+r.value}); return o;
  }

  function renderTabs(){
    var names=Object.keys(data.players);
    var t=$("#playerTabs"); t.innerHTML="";
    names.forEach(function(n){
      var b=document.createElement("button");
      b.className="tab"; b.type="button"; b.textContent=n;
      b.setAttribute("aria-pressed",String(n===data.current));
      b.addEventListener("click",function(){data.current=n;mode="auto";persist();renderAll()});
      t.appendChild(b);
    });
    var add=document.createElement("button");
    add.className="tab"; add.type="button"; add.textContent="+ New player";
    add.setAttribute("aria-pressed",String(!data.current));
    add.addEventListener("click",function(){data.current=null;persist();renderAll()});
    t.appendChild(add);
  }

  function renderForm(){
    var area=$("#formArea"), p=data.current&&data.players[data.current];
    if(!p){
      area.innerHTML='<h3>Where are you starting?</h3>'+
        '<div style="margin-bottom:1rem"><label for="pName">Player name</label><input type="text" id="pName" placeholder="e.g. Lerato"></div>'+
        '<div id="sl">'+sliderHTML(null,"s")+'</div>'+
        '<button class="btn" id="startBtn" style="margin-top:.8rem"><span>Save my starting point</span></button>';
      bindSliders(area);
      $("#startBtn").addEventListener("click",function(){
        var n=$("#pName"), name=n.value.trim();
        if(!name){bad(n);toast("Enter a player name first.");return}
        if(data.players[name]){bad(n);toast("That player already exists. Pick their tab to add an update.");return}
        var vals=readSliders(area);
        data.players[name]={start:{date:Date.now(),vals:vals,note:"Starting point"},entries:[]};
        data.current=name; persist(); renderAll(true); toast("Starting point saved for "+name+".");
      });
      return;
    }
    var latest=p.entries.length?p.entries[p.entries.length-1].vals:p.start.vals;
    area.innerHTML='<h3>Add an update for '+esc(data.current)+'</h3>'+
      '<div id="sl">'+sliderHTML(latest,"u")+'</div>'+
      '<div style="margin:.8rem 0"><label for="uNote">What changed? (optional)</label><textarea id="uNote" rows="2" placeholder="e.g. Finished the term, scored in a match"></textarea></div>'+
      '<button class="btn" id="updBtn"><span>Save update</span></button> '+
      '<div><button class="link-btn" id="delBtn">Delete this player</button></div>';
    bindSliders(area);
    $("#updBtn").addEventListener("click",function(){
      p.entries.push({date:Date.now(),vals:readSliders(area),note:$("#uNote").value.trim()});
      persist(); renderAll(true); toast("Progress updated.");
    });
    $("#delBtn").addEventListener("click",function(){
      if(!confirm("Delete "+data.current+" and all their progress on this device?")) return;
      delete data.players[data.current];
      var rest=Object.keys(data.players); data.current=rest[0]||null;
      persist(); renderAll();
    });
  }

  function dateStr(ts){var d=new Date(ts);return d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear()}

  function renderResults(animate){
    var box=$("#results"), p=data.current&&data.players[data.current];
    if(!p){
      box.innerHTML='<div class="empty"><b>No progress yet</b>Add a player and rate your skills to set your starting point. Your results will appear here.</div>';
      return;
    }
    var latest=p.entries.length?p.entries[p.entries.length-1]:p.start;
    var a0=avg(p.start.vals), a1=avg(latest.vals), d=+(a1-a0).toFixed(1);
    var deltaTxt=(d>0?"+":"")+d;
    var h='<h3>'+esc(data.current)+'</h3>'+
      '<div class="compare"><div><div class="n">'+a0+'</div><small>Where I began<br>'+dateStr(p.start.date)+'</small></div>'+
      '<svg class="arrow" viewBox="0 0 60 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M2 12h54M44 3l12 9-12 9"/></svg>'+
      '<div><div class="n now">'+a1+'</div><small>Where I am now<br>'+dateStr(latest.date)+'</small></div></div>'+
      '<div style="text-align:center;margin:-.6rem 0 1.4rem">'+(p.entries.length?'<span class="delta'+(d<0?' neg':'')+'">'+deltaTxt+' overall</span>':'<span class="pill">Add an update to see your growth</span>')+'</div>'+
      '<div class="legend"><span><b style="background:#fff;opacity:.75"></b>Start</span><span><b style="background:var(--red)"></b>Now</span></div>';
    SKILLS.forEach(function(k){
      var s=p.start.vals[k], n=latest.vals[k], dd=n-s;
      h+='<div class="bar-row"><div class="top"><span>'+k+'</span><span>'+s+' &rarr; <b>'+n+'</b> '+(p.entries.length?'('+(dd>0?'+':'')+dd+')':'')+'</span></div>'+
        '<div class="bar start"><i data-w="'+s*10+'"></i></div><div class="bar now"><i data-w="'+n*10+'"></i></div></div>';
    });
    // chart
    var pts=[p.start].concat(p.entries), W=420,H=170,pad=28;
    if(pts.length>1){
      var xy=pts.map(function(e,i){
        return [pad+(W-pad*2)*(i/(pts.length-1)), H-pad-(avg(e.vals)-1)/9*(H-pad*2)];
      });
      h+='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Average skill rating over time">'+
        '<line class="axis" x1="'+pad+'" y1="'+(H-pad)+'" x2="'+(W-pad)+'" y2="'+(H-pad)+'"/><line class="axis" x1="'+pad+'" y1="'+pad+'" x2="'+pad+'" y2="'+(H-pad)+'"/>'+
        '<text x="4" y="'+(pad+4)+'">10</text><text x="10" y="'+(H-pad+4)+'">1</text>'+
        '<polyline class="ln" points="'+xy.map(function(q){return q[0].toFixed(1)+","+q[1].toFixed(1)}).join(" ")+'"/>'+
        xy.map(function(q,i){return '<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="5" fill="#fff" stroke="#e10b17" stroke-width="3"/><text x="'+q[0].toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+(i===0?"Start":"#"+i)+'</text>'}).join("")+
        '</svg>';
    }
    h+='<ul class="hist">';
    p.entries.slice().reverse().forEach(function(e,i){
      h+='<li><b>Update '+(p.entries.length-i)+' &middot; avg '+avg(e.vals)+'</b><span>'+dateStr(e.date)+(e.note?' &mdash; '+esc(e.note):'')+'</span></li>';
    });
    h+='<li><b>Start &middot; avg '+a0+'</b><span>'+dateStr(p.start.date)+'</span></li></ul>';
    box.innerHTML=h;
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      $$(".bar i",box).forEach(function(i){i.style.width=i.dataset.w+"%"});
    })});
  }

  function renderAll(){renderTabs();renderForm();renderResults()}
  if(!data.current){var ks=Object.keys(data.players); if(ks.length) data.current=ks[0]}
  renderAll();
})();
