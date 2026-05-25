(function() {
  'use strict';

  var React = window.__HERMES_PLUGIN_SDK__.React;
  var api = window.__HERMES_PLUGIN_SDK__.api;
  var hooks = window.__HERMES_PLUGIN_SDK__.hooks;
  var useState = hooks.useState;
  var useEffect = hooks.useEffect;
  var useCallback = hooks.useCallback;
  var useMemo = hooks.useMemo;

  // ─── Exact design tokens from original HTML ─────────────────────
  var T = {
    bg:"#FAFAF8", surface:"#F3F3F0", surfaceHigh:"#EAEAE6", paper:"#FCFAF5",
    border:"#E2E2DE", borderMid:"#C8C8C3", borderStrong:"#9A9A95",
    accent:"#E07340", accentLight:"#FFF4ED", accentDark:"#B85A28", accentBorder:"#F0A060",
    text:"#111110", textMid:"#4A4A48", textDim:"#8A8A87", textFaint:"#C0C0BC",
    ok:"#16A34A", okLight:"#DCFCE7",
    run:"#0284C7", runLight:"#E0F2FE",
    block:"#DC2626", blockLight:"#FEE2E2",
    pilot:"#7C3AED", pilotLight:"#EDE9FE",
    done:"#71717A", doneLight:"#F4F4F5",
    ink:"#1B1A18", inkSurface:"#262522",
  };
  var F = {
    display:"'Bebas Neue', sans-serif",
    body:"'DM Sans', system-ui, sans-serif",
    mono:"'JetBrains Mono', 'Fira Code', monospace",
  };

  // ─── Keyframes (injected once) ──────────────────────────────────
  var _injected = false;
  function injectStyles() {
    if (_injected || typeof document === 'undefined') return;
    _injected = true;
    if (!document.querySelector('link[href*="Material+Symbols+Outlined"]')) {
      var fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,200,0,0..1&display=block';
      document.head.appendChild(fontLink);
    }
    var s = document.createElement('style');
    s.textContent = '@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}@keyframes fade-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.ms{font-family:"Material Symbols Outlined";font-variation-settings:"FILL" 0,"wght" 200,"GRAD" 0}';
    document.head.appendChild(s);
  }
  injectStyles();

  // ─── Primitives (matching original exactly) ──────────────────────
  function anim(d) {
    return { animation: 'fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: d||'0s' };
  }

  function Dot({ color, size, pulse }) {
    size = size || 8;
    return React.createElement('span', { style: { display:'inline-block', width:size, height:size, borderRadius:'50%', background:color, flexShrink:0, animation: pulse ? 'pulse 1.6s ease-in-out infinite' : 'none' } });
  }

  function Pill({ label, color, bg, mono }) {
    color = color || T.textDim; bg = bg || T.surface;
    return React.createElement('span', { style: { fontFamily: mono ? F.mono : F.body, fontSize:11, fontWeight:500, color:color, background:bg, border:'1px solid '+color+'30', padding:'1px 7px', borderRadius:3, lineHeight:1.7, whiteSpace:'nowrap' } }, label);
  }

  var SC = {
    queued:{label:"QUEUED",c:T.accentDark,bg:T.accentLight},
    running:{label:"RUNNING",c:T.run,bg:T.runLight},
    blocked:{label:"BLOCKED",c:T.block,bg:T.blockLight},
    done:{label:"DONE",c:T.done,bg:T.doneLight},
    ok:{label:"OK",c:T.ok,bg:T.okLight},
    active:{label:"ACTIVE",c:T.ok,bg:T.okLight},
    piloting:{label:"PILOT",c:T.pilot,bg:T.pilotLight},
    override:{label:"OVERRIDE",c:T.accentDark,bg:T.accentLight},
    open:{label:"OPEN",c:T.run,bg:T.runLight},
    closed:{label:"CLOSED",c:T.done,bg:T.doneLight},
  };
  function StatusPill({ status }) {
    var s = SC[status] || {label:String(status||'').toUpperCase(),c:T.textDim,bg:T.surface};
    return React.createElement(Pill, { label:s.label, color:s.c, bg:s.bg });
  }

  function Glyph({ name, size, color, weight }) {
    size = size || 16; color = color || T.textMid; weight = weight || 200;
    return React.createElement('span', { className:'ms', style: { fontFamily:"'Material Symbols Outlined'", fontVariationSettings:"'FILL' 0,'wght' "+weight+",'GRAD' 0,'opsz' "+size, fontSize:size, color:color, lineHeight:1, display:'inline-block' } }, name);
  }

  function SectionTitle({ kicker, title, accent, sub }) {
    return React.createElement('div', { style:{marginBottom:14} },
      kicker && React.createElement('div', { style:{fontFamily:F.body, fontSize:11, fontWeight:700, color:T.accentDark, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:6} }, kicker),
      React.createElement('div', { style:{fontFamily:F.display, fontSize:24, color:T.text, letterSpacing:'0.04em', lineHeight:1} },
        title, accent && React.createElement('span', { style:{color:T.accent} }, ' '+accent)),
      sub && React.createElement('div', { style:{fontFamily:F.body, fontSize:12, color:T.textDim, marginTop:8, lineHeight:1.5, maxWidth:680} }, sub)
    );
  }

  function Card({ children, accent, padding, style }) {
    return React.createElement('div', { style: Object.assign({ background:T.bg, border:'1px solid '+T.border, borderTop: accent ? '2px solid '+T.accent : undefined, padding: padding||'16px' }, style||{}) }, children);
  }

  function Chip({ children, color, bg, mono }) {
    return React.createElement('span', { style:{fontFamily:mono?F.mono:F.body, fontSize:11, color:color||T.textMid, background:bg||T.surface, padding:'3px 7px', border:'1px solid '+T.border, whiteSpace:'nowrap'} }, children);
  }

  // ─── AGENTS roster (from original) ──────────────────────────────
  var AGENTS = [
    { id:"jarvis", name:"JARVIS", status:"active", model:"Sonnet", role:"Orchestrator", glyph:"hub", lastActive:"now" },
    { id:"birgit", name:"Birgit", status:"active", model:"Sonnet", role:"Personal Ops", glyph:"inbox", lastActive:"2m ago" },
    { id:"kenji", name:"Kenji", status:"active", model:"Haiku", role:"Workspace", glyph:"folder_open", lastActive:"5m ago" },
    { id:"kumar", name:"Kumar", status:"active", model:"Sonnet", role:"Build", glyph:"terminal", lastActive:"23m ago" },
    { id:"q", name:"Q", status:"active", model:"Opus", role:"Research", glyph:"experiment", lastActive:"1h ago" },
    { id:"claire", name:"Claire", status:"piloting", model:"Sonnet", role:"ISC / Work", glyph:"work", lastActive:"3h ago" },
    { id:"hans", name:"Hans", status:"piloting", model:"Haiku", role:"Governance", glyph:"shield", lastActive:"14m ago" },
  ];

  // ─── SEED DATA (from original) ──────────────────────────────────
  var SEED_INBOX = [
    { id:1, title:"Telekom invoice — renewal query", source:"Email", status:"queued", priority:"P1", routed:null, classified:null },
    { id:2, title:"ISC team sync — Thursday prep", source:"Calendar", status:"queued", priority:"P1", routed:null, classified:null },
    { id:3, title:"AI OS v3 deploy notes", source:"Manual", status:"running", priority:"P2", routed:"kumar", classified:"Project" },
    { id:4, title:"Dentist — reschedule needed", source:"Manual", status:"blocked", priority:"P2", routed:"birgit", classified:"Task" },
    { id:5, title:"RWTH application — essay draft", source:"Manual", status:"queued", priority:"P1", routed:null, classified:null },
    { id:6, title:"Q4 SIOP review pack", source:"Calendar", status:"running", priority:"P1", routed:"claire", classified:"Project" },
    { id:7, title:"Meta Ads anomaly — 280% CPM spike", source:"Telegram", status:"blocked", priority:"P1", routed:"hans", classified:"Task" },
    { id:8, title:"Weekly review pack", source:"Manual", status:"done", priority:"P2", routed:"jarvis", classified:"Project" },
  ];

  var HIVE_LOG = [
    { time:"07:31", agent:"JARVIS", action:"Routed to Birgit (inbox triage \u00d7 4 items)", channel:"Telegram", dot:T.ok },
    { time:"07:28", agent:"Birgit", action:"Drafted reply to Telekom — awaiting human gate", channel:"Email", dot:T.run },
    { time:"07:02", agent:"Birgit", action:"Triaged SG Inbox — 4 items classified and filed", channel:"Notion", dot:T.run },
    { time:"06:58", agent:"Kenji", action:"AI-OS Context Hub updated — 3 entries added", channel:"Notion", dot:T.run },
    { time:"06:30", agent:"Q", action:"Research brief complete: Hermes + Notion stack", channel:"Notion", dot:T.ok },
    { time:"06:15", agent:"Kumar", action:"Eval harness run — 6/6 skills passed \u226590%", channel:"GitHub", dot:T.ok },
    { time:"06:00", agent:"Hans", action:"Daily cost check: $0.34 spent / $3.00 cap", channel:"System", dot:T.accent },
    { time:"05:30", agent:"JARVIS", action:"Weekly review pack delivered", channel:"Telegram", dot:T.run },
    { time:"05:14", agent:"Claire", action:"SIOP draft — pilot output saved (not yet sent)", channel:"Notion", dot:T.pilot },
    { time:"05:00", agent:"Birgit", action:"Morning briefing /gm dispatched", channel:"Telegram", dot:T.ok },
  ];

  var ALERTS = [
    { id:"al-meta", severity:"red", source:"Meta Ads", title:"CPM anomaly \u00b7 +280% overnight", detail:"EU campaign \u00b7 auto-paused by Hans \u00b7 attribution chase open", raisedBy:"hans", at:"09:14" },
    { id:"al-out", severity:"amber", source:"Kill-switch", title:"Outbound send is OFF", detail:"Every outbound is human-gated. By design today; revisit after cap raise.", raisedBy:"you", at:"yesterday" },
    { id:"al-mail", severity:"amber", source:"Gmail", title:"OAuth refresh in 6 days", detail:"Token expires 24 May. Re-auth via Settings \u2192 Integrations.", raisedBy:"hans", at:"06:00" },
  ];

  var KILL_SWITCHES = [
    { key:"MISSION_AUTO_ASSIGN_ENABLED", label:"Auto-Assign Router", on:true, scope:"Mission Control" },
    { key:"SCHEDULER_ENABLED", label:"Scheduler", on:true, scope:"All agents" },
    { key:"OUTBOUND_SEND_ENABLED", label:"Outbound send", on:false, scope:"Email / Telegram" },
    { key:"PILOT_AGENTS_LIVE", label:"Pilot agents live", on:true, scope:"Claire, Hans" },
    { key:"OPUS_ALLOWED", label:"Allow Opus model", on:true, scope:"Q only" },
  ];

  var APPROVALS = [
    { id:1, who:"Birgit", what:"Reply: Telekom — renewal cancellation", risk:"low" },
    { id:2, who:"Claire", what:"SIOP deck v3 \u2192 upload to ISC team Sharepoint", risk:"medium" },
    { id:3, who:"Q", what:"Decision logged: Caf\u00e9 Platform v3 ship-Monday", risk:"low" },
    { id:4, who:"Kumar", what:"Deploy eval-harness@v0.4.1 to prod", risk:"medium" },
  ];

  var TODAY_KPIS = {
    briefingAt:"05:00", briefingDelivered:true,
    meetingsToday:3, nextMeetingAt:"10:00", nextMeetingTitle:"ISC team sync",
    doneToday:5, totalToday:9,
    costBurnUsed:0.71, costBurnCap:3.00,
    uptimeDays:2, uptimeHours:14,
  };

  // ═══════════════════════════════════════════════════════════════
  // 1 · STATUS TICKER — dark full-width header bar
  // ═══════════════════════════════════════════════════════════════
  function StatusTicker({ systemStatus, kpis, p1 }) {
    var _a = useState(new Date()), time = _a[0], setTime = _a[1];
    useEffect(function() { var t = setInterval(function() { setTime(new Date()); }, 1000); return function() { clearInterval(t); }; }, []);
    var clock = time.toTimeString().slice(0,8);
    var burnPct = Math.round((kpis.costBurnUsed / kpis.costBurnCap) * 100);

    function IndicatorCell(props) {
      return React.createElement('div', { style:{padding:'10px 18px', borderRight:'1px solid #ffffff14', display:'flex', flexDirection:'column', justifyContent:'center'} },
        React.createElement('div', { style:{display:'flex', alignItems:'center', gap:6, fontFamily:F.body, fontSize:9, fontWeight:700, color:'#ffffff88', letterSpacing:'0.16em', marginBottom:6} },
          props.pulse && React.createElement('span', { style:{width:6, height:6, borderRadius:'50%', background:props.color, animation:'pulse 1.4s infinite'} }),
          props.label
        ),
        React.createElement('div', { style:{fontFamily:props.mono?F.mono:F.display, fontSize:props.big?18:16, color:props.color, fontWeight:600, lineHeight:1.05, letterSpacing:props.big?'0.06em':'0.04em'} }, props.value),
        props.sub && React.createElement('div', { style:{fontFamily:F.body, fontSize:10, color:'#ffffff77', marginTop:4} }, props.sub),
        typeof props.gauge === 'number' && React.createElement('div', { style:{height:3, background:'#ffffff14', marginTop:7} },
          React.createElement('div', { style:{height:'100%', width:'100%', background:props.color, transform:'scaleX('+(Math.min(props.gauge,100)/100)+')', transformOrigin:'left', transition:'transform 0.5s'} })
        )
      );
    }

    return React.createElement('div', { style:{background:T.text, color:'#fff', borderBottom:'2px solid '+T.accent} },
      // Top row
      React.createElement('div', { style:{display:'grid', gridTemplateColumns:'minmax(0,1fr) auto', alignItems:'center', padding:'10px 24px', borderBottom:'1px solid #ffffff14'} },
        React.createElement('div', { style:{display:'flex', alignItems:'center', gap:14} },
          React.createElement('span', { style:{display:'flex', alignItems:'center', gap:6, background:T.block, color:'#fff', padding:'3px 9px', fontFamily:F.mono, fontSize:10, fontWeight:700, letterSpacing:'0.1em'} },
            React.createElement('span', { style:{width:6, height:6, borderRadius:'50%', background:'#fff', animation:'pulse 1.2s infinite'} }),
            'LIVE'
          ),
          React.createElement('span', { style:{fontFamily:F.display, fontSize:22, letterSpacing:'0.1em'} }, 'MISSION COCKPIT'),
          React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:'#ffffff77', letterSpacing:'0.06em'} }, '\u00b7 REAL-TIME TELEMETRY \u00b7 ATC STRIPS')
        ),
        React.createElement('div', { style:{display:'flex', alignItems:'center', gap:18} },
          React.createElement('span', { style:{fontFamily:F.mono, fontSize:11, color:'#ffffff99', letterSpacing:'0.06em'} }, kpis.uptimeDays+'d '+kpis.uptimeHours+'h UPTIME'),
          React.createElement('span', { style:{fontFamily:F.mono, fontSize:18, color:'#fff', fontWeight:600, letterSpacing:'0.08em'} }, clock),
          React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:'#ffffff77', letterSpacing:'0.08em'} }, 'LCL')
        )
      ),
      // Indicator strip
      React.createElement('div', { style:{display:'grid', gridTemplateColumns:'minmax(0,1.8fr) 1fr 1fr 1fr'} },
        React.createElement(IndicatorCell, { label:'SYSTEMS', value:systemStatus.label, color:systemStatus.color, pulse:true, big:true }),
        React.createElement(IndicatorCell, { label:'P1 QUEUE', value:String(p1).padStart(2,'0'), color:p1>0?T.accent:T.ok, mono:true }),
        React.createElement(IndicatorCell, { label:'BURN \u00b7 TODAY', value:'$'+kpis.costBurnUsed.toFixed(2)+' / $'+kpis.costBurnCap.toFixed(2), gauge:burnPct, color:burnPct>=80?T.block:burnPct>=50?T.accent:T.ok, mono:true }),
        React.createElement(IndicatorCell, { label:'NEXT MEETING', value:kpis.nextMeetingAt, sub:kpis.nextMeetingTitle, color:T.ok, mono:true })
      )
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 2 · MISSION MAP — flow chart (simplified for live data)
  // ═══════════════════════════════════════════════════════════════
  function MissionMap({ inbox }) {
    var sources = [{name:"TG",full:"Telegram",live:true},{name:"MAIL",full:"Email",live:true},{name:"CAL",full:"Calendar",live:true},{name:"MAN",full:"Manual",live:true}];
    var outputs = [{name:"NOTION",full:"Notion"},{name:"EMAIL",full:"Email"},{name:"TG",full:"Telegram"},{name:"FILES",full:"Files"}];
    var specs = AGENTS.filter(function(a) { return a.id !== 'jarvis'; });

    function MapRow({ label, children }) {
      return React.createElement('div', { style:{display:'grid', gridTemplateColumns:'66px minmax(0,1fr)', gap:12, alignItems:'center'} },
        React.createElement('div', { style:{fontFamily:F.body, fontSize:8.5, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', textAlign:'right', borderRight:'2px solid '+T.borderMid, paddingRight:8, lineHeight:1.25} }, label),
        React.createElement('div', { style:{minWidth:0} }, children)
      );
    }
    function Stem() {
      return React.createElement('div', { style:{display:'grid', gridTemplateColumns:'66px minmax(0,1fr)', gap:12, alignItems:'center', height:18} },
        React.createElement('span'),
        React.createElement('div', { style:{width:2, height:18, background:T.accent, marginLeft:14} })
      );
    }

    var c = {
      queued: inbox.filter(function(i) { return i.status==='queued'; }).length,
      running: inbox.filter(function(i) { return i.status==='running'; }).length,
      blocked: inbox.filter(function(i) { return i.status==='blocked'; }).length,
      p1: inbox.filter(function(i) { return i.priority==='P1' && i.status!=='done'; }).length,
    };

    return React.createElement('div', { style:{background:T.bg, border:'1px solid '+T.text, position:'relative'} },
      // Header
      React.createElement('div', { style:{background:T.text, color:'#fff', padding:'8px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'} },
        React.createElement('div', { style:{display:'flex', alignItems:'center', gap:8} },
          React.createElement(Glyph, { name:'radar', size:16, color:T.accent, weight:300 }),
          React.createElement('span', { style:{fontFamily:F.display, fontSize:13, letterSpacing:'0.1em'} }, 'MISSION MAP'),
          React.createElement('span', { style:{fontFamily:F.mono, fontSize:9, color:'#ffffff77'} }, '\u00b7 live system topology')
        ),
        React.createElement('div', { style:{display:'flex', alignItems:'center', gap:7} },
          React.createElement(Dot, { color:T.ok, pulse:true, size:6 }),
          React.createElement('span', { style:{fontFamily:F.mono, fontSize:9, color:'#ffffff99', letterSpacing:'0.08em'} }, 'SCANNING')
        )
      ),
      React.createElement('div', { style:{padding:'18px 20px 16px'} },
        // INPUTS
        React.createElement(MapRow, { label:'INPUTS' },
          React.createElement('div', { style:{display:'grid', gridTemplateColumns:'repeat('+sources.length+', minmax(0,1fr))', gap:5} },
            sources.map(function(s) {
              return React.createElement('div', { key:s.name, title:s.full, style:{display:'flex', alignItems:'center', justifyContent:'space-between', gap:5, minWidth:0, background:T.surface, border:'1px solid '+T.border, padding:'6px 9px'} },
                React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:T.text, fontWeight:600, letterSpacing:'0.05em', minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'} }, s.full.toUpperCase()),
                React.createElement(Dot, { color:s.live?T.ok:T.textFaint, pulse:s.live, size:5 })
              );
            })
          )
        ),
        React.createElement(Stem),
        // QUEUE
        React.createElement(MapRow, { label:'QUEUE' },
          React.createElement('div', { style:{background:T.accentLight, border:'1px solid '+T.accent, padding:'10px 14px', display:'flex', flexWrap:'wrap', gap:12, alignItems:'center', justifyContent:'space-between'} },
            React.createElement('div', { style:{display:'flex', alignItems:'center', gap:11, minWidth:0} },
              React.createElement(Glyph, { name:'inbox', size:22, color:T.accent, weight:300 }),
              React.createElement('div', { style:{minWidth:0} },
                React.createElement('div', { style:{display:'flex', alignItems:'baseline', gap:8, minWidth:0} },
                  React.createElement('span', { style:{fontFamily:F.display, fontSize:18, color:T.accent, letterSpacing:'0.06em', lineHeight:1} }, 'SG INBOX'),
                  React.createElement('span', { style:{fontFamily:F.mono, fontSize:11, color:T.accentDark, fontWeight:600} }, inbox.length+' TOTAL')
                ),
                React.createElement('div', { style:{fontFamily:F.mono, fontSize:10, color:T.accentDark, marginTop:4} }, 'one front door \u00b7 auto-assign on')
              )
            ),
            React.createElement('div', { style:{display:'flex', gap:6, flexWrap:'wrap'} },
              React.createElement(KpiPill, { label:'QUEUED', value:c.queued, color:T.accent }),
              React.createElement(KpiPill, { label:'RUN', value:c.running, color:T.run, pulse:c.running>0 }),
              React.createElement(KpiPill, { label:'BLOCK', value:c.blocked, color:T.block }),
              React.createElement(KpiPill, { label:'P1', value:c.p1, color:c.p1>0?T.block:T.ok })
            )
          )
        ),
        React.createElement(Stem),
        // ROUTER
        React.createElement(MapRow, { label:'ROUTER' },
          React.createElement('div', { style:{background:T.text, color:'#fff', padding:'12px 16px', display:'grid', gridTemplateColumns:'42px minmax(0,1fr) auto', gap:14, alignItems:'center'} },
            React.createElement(Glyph, { name:'hub', size:30, color:T.accent, weight:300 }),
            React.createElement('div', null,
              React.createElement('div', { style:{display:'flex', alignItems:'baseline', gap:10} },
                React.createElement('span', { style:{fontFamily:F.display, fontSize:24, letterSpacing:'0.08em', lineHeight:1} }, 'JARVIS'),
                React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:'#ffffff77'} }, 'Sonnet \u00b7 routing')
              ),
              React.createElement('div', { style:{fontFamily:F.body, fontSize:10, color:'#ffffffaa', marginTop:5, letterSpacing:'0.08em', fontWeight:600} }, 'ORCHESTRATOR \u00b7 ROUTES, NEVER EXECUTES')
            ),
            React.createElement(Dot, { color:T.ok, pulse:true, size:9 })
          )
        ),
        // Connector tree
        React.createElement('div', { style:{display:'grid', gridTemplateColumns:'66px minmax(0,1fr)', gap:12} },
          React.createElement('span'),
          React.createElement('div', { style:{position:'relative', height:22} },
            React.createElement('div', { style:{position:'absolute', left:'calc(50% - 1px)', top:0, width:2, height:10, background:T.accent} }),
            React.createElement('div', { style:{position:'absolute', left:'calc('+(100/specs.length/2)+'%)', right:'calc('+(100/specs.length/2)+'%)', top:8, height:2, background:T.accent} }),
            specs.map(function(_, i) {
              return React.createElement('div', { key:i, style:{position:'absolute', left:'calc('+((i+0.5)*100/specs.length)+'% - 1px)', top:8, width:2, height:14, background:T.accent} });
            })
          )
        ),
        // SPECIALISTS
        React.createElement(MapRow, { label:'ROSTER' },
          React.createElement('div', { style:{display:'grid', gridTemplateColumns:'repeat('+specs.length+', minmax(0,1fr))', gap:5} },
            specs.map(function(a) {
              var statusColor = a.status === 'active' ? T.ok : T.pilot;
              var isWorking = inbox.find(function(i) { return i.routed === a.id && i.status === 'running'; });
              return React.createElement('div', { key:a.id, title:a.name+' \u00b7 '+a.role, style:{background:isWorking?T.bg:T.surface, border:'1px solid '+T.border, borderTop:'3px solid '+statusColor, boxShadow:isWorking?'0 0 0 2px '+T.accent+'33':'none', padding:'8px 6px 7px', textAlign:'center', display:'flex', flexDirection:'column', gap:4, minWidth:0, transition:'all 0.2s'} },
                React.createElement('div', { style:{display:'flex', alignItems:'center', justifyContent:'center', gap:4, minWidth:0} },
                  React.createElement('span', { style:{fontFamily:F.display, fontSize:11, color:T.text, letterSpacing:'0.03em', minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'} }, a.name.toUpperCase()),
                  React.createElement(Dot, { color:isWorking?T.run:statusColor, pulse:isWorking||a.lastActive==='now', size:5 })
                ),
                React.createElement('div', { style:{fontFamily:F.mono, fontSize:9, color:isWorking?T.run:T.textDim, fontWeight:isWorking?700:500, letterSpacing:'0.03em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', minHeight:13} }, isWorking?'RUN':'IDLE')
              );
            })
          )
        ),
        React.createElement(Stem),
        // OUTPUTS
        React.createElement(MapRow, { label:'OUTPUTS' },
          React.createElement('div', { style:{display:'grid', gridTemplateColumns:'repeat('+outputs.length+', minmax(0,1fr))', gap:5} },
            outputs.map(function(o) {
              return React.createElement('div', { key:o.name, title:o.full, style:{display:'flex', alignItems:'center', justifyContent:'space-between', gap:5, minWidth:0, background:T.surface, border:'1px solid '+T.border, padding:'6px 9px', opacity:0.85} },
                React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:T.text, fontWeight:600, letterSpacing:'0.05em', minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'} }, o.full.toUpperCase()),
                React.createElement(Dot, { color:T.textFaint, size:5 })
              );
            })
          )
        )
      )
    );
  }

  function KpiPill({ label, value, color, pulse }) {
    return React.createElement('div', { style:{minWidth:48, padding:'6px 8px', border:'1px solid '+color, background:pulse?color+'1A':'#fff', textAlign:'center', animation:pulse?'pulse 1.6s infinite':'none'} },
      React.createElement('div', { style:{fontFamily:F.body, fontSize:8, fontWeight:700, color:color, letterSpacing:'0.1em'} }, label),
      React.createElement('div', { style:{fontFamily:F.mono, fontSize:14, color:color, fontWeight:700, lineHeight:1.1, marginTop:2} }, String(value).padStart(2,'0'))
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 3 · CRITICAL RAIL
  // ═══════════════════════════════════════════════════════════════
  function CriticalRail() {
    var offSwitches = KILL_SWITCHES.filter(function(k) { return !k.on; });
    var blockedItems = SEED_INBOX.filter(function(i) { return i.status === 'blocked'; });
    var totalAlerts = ALERTS.length + blockedItems.length;

    function CriticalCard(props) {
      var sevColor = function(s) { return s==='red'?T.block:s==='amber'?T.accent:T.ok; };
      return React.createElement('div', { style:{background:T.bg, border:'1px solid '+T.text} },
        React.createElement('div', { style:{background:T.text, color:'#fff', padding:'7px 11px', display:'flex', alignItems:'center', justifyContent:'space-between'} },
          React.createElement('div', { style:{display:'flex', alignItems:'center', gap:7} },
            React.createElement(Glyph, { name:props.glyph, size:14, color:props.countColor, weight:300 }),
            React.createElement('span', { style:{fontFamily:F.display, fontSize:12, letterSpacing:'0.1em'} }, props.title)
          ),
          React.createElement('span', { style:{fontFamily:F.mono, fontSize:16, color:props.countColor, fontWeight:700, lineHeight:1} }, String(props.count).padStart(2,'0'))
        ),
        React.createElement('div', { style:{padding:'7px 11px 4px', fontFamily:F.mono, fontSize:9, color:T.textDim, letterSpacing:'0.05em'} }, props.sub),
        React.createElement('div', { style:{display:'flex', flexDirection:'column', gap:1, padding:'0 7px 7px'} },
          props.items.length === 0
            ? React.createElement('div', { style:{padding:'10px 4px', fontFamily:F.mono, fontSize:10, color:T.textFaint, textAlign:'center', fontStyle:'italic'} }, 'none \u2014 all clear')
            : props.items.map(function(it) {
                return React.createElement('div', { key:it.id, style:{display:'flex', alignItems:'center', gap:6, minWidth:0, background:T.surface, border:'1px solid '+T.border, borderTop:'2px solid '+sevColor(it.severity), padding:'6px 8px', textAlign:'left', transition:'background 0.1s'} },
                  React.createElement('div', { style:{flex:1, minWidth:0} },
                    React.createElement('div', { style:{fontFamily:F.body, fontSize:9, fontWeight:700, color:sevColor(it.severity), letterSpacing:'0.08em', marginBottom:2} }, it.who.toUpperCase()),
                    React.createElement('div', { style:{fontFamily:F.body, fontSize:11, color:T.text, lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'} }, it.title)
                  ),
                  React.createElement('span', { style:{flexShrink:0, color:T.textDim, fontFamily:F.mono, fontSize:14, lineHeight:1, fontWeight:300, paddingLeft:4} }, '\u203A')
                );
              })
        )
      );
    }

    return React.createElement('aside', { style:{display:'grid', gap:10} },
      React.createElement(CriticalCard, { glyph:'how_to_reg', title:'GATES WAITING', count:APPROVALS.length, countColor:APPROVALS.length>0?T.accent:T.ok, sub:'needs your approval', items:APPROVALS.slice(0,3).map(function(a) { return {id:a.id, severity:a.risk==='high'?'red':a.risk==='medium'?'amber':'green', who:a.who, title:a.what}; }) }),
      React.createElement(CriticalCard, { glyph:'warning', title:'ALERTS', count:totalAlerts, countColor:totalAlerts>0?T.block:T.ok, sub:'anomalies + blocks', items:ALERTS.slice(0,3).map(function(a) { return {id:a.id, severity:a.severity, who:a.source, title:a.title}; }) }),
      React.createElement(CriticalCard, { glyph:'emergency', title:'KILL SWITCHES', count:offSwitches.length, countColor:offSwitches.length>0?T.accent:T.ok, sub:offSwitches.length+' OFF of '+KILL_SWITCHES.length, items:offSwitches.slice(0,3).map(function(k) { return {id:k.key, severity:'amber', who:k.scope, title:k.label}; }) })
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 4 · TODAY STRIP
  // ═══════════════════════════════════════════════════════════════
  function TodayStrip({ kpis, counts }) {
    return React.createElement(Card, null,
      React.createElement('div', { style:{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12} },
        React.createElement('div', null,
          React.createElement('div', { style:{fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', marginBottom:4} }, 'DONE TODAY'),
          React.createElement('div', { style:{fontFamily:F.display, fontSize:28, color:T.text, lineHeight:1} }, counts.done+'/'+kpis.totalToday)
        ),
        React.createElement('div', null,
          React.createElement('div', { style:{fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', marginBottom:4} }, 'MEETINGS'),
          React.createElement('div', { style:{fontFamily:F.display, fontSize:28, color:T.text, lineHeight:1} }, String(kpis.meetingsToday))
        ),
        React.createElement('div', null,
          React.createElement('div', { style:{fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', marginBottom:4} }, 'BRIEFING'),
          React.createElement('div', { style:{fontFamily:F.mono, fontSize:14, color:T.ok, fontWeight:600} }, kpis.briefingDelivered ? 'DELIVERED '+kpis.briefingAt : 'PENDING')
        ),
        React.createElement('div', null,
          React.createElement('div', { style:{fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', marginBottom:4} }, 'UPTIME'),
          React.createElement('div', { style:{fontFamily:F.mono, fontSize:14, color:T.text} }, kpis.uptimeDays+'d '+kpis.uptimeHours+'h')
        )
      )
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 5 · LIVE TELEMETRY (Hive Log)
  // ═══════════════════════════════════════════════════════════════
  function LiveTelemetry() {
    return React.createElement(Card, { accent:true },
      React.createElement(SectionTitle, { kicker:'LIVE', title:'Hive Log', sub:'Recent agent activity across all channels' }),
      React.createElement('div', { style:{display:'flex', flexDirection:'column', gap:2} },
        HIVE_LOG.map(function(entry, i) {
          return React.createElement('div', { key:i, style:{display:'flex', alignItems:'center', gap:10, padding:'6px 10px', background:T.surface, border:'1px solid '+T.border} },
            React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:T.textFaint, width:44, flexShrink:0} }, entry.time),
            React.createElement(Dot, { color:entry.dot, size:6 }),
            React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:T.accentDark, fontWeight:600, width:52, flexShrink:0} }, entry.agent),
            React.createElement('span', { style:{fontFamily:F.body, fontSize:12, color:T.text, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'} }, entry.action),
            React.createElement(Chip, { color:T.textFaint, bg:T.surface }, entry.channel)
          );
        })
      )
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // MISSION VIEW — main component
  // ═══════════════════════════════════════════════════════════════
  function MissionView() {
    var _a = useState(null), status = _a[0], setStatus = _a[1];
    var _b = useState([]), sessions = _b[0], setSessions = _b[1];

    var fetchData = useCallback(function() {
      Promise.all([
        api.getStatus().catch(function() { return null; }),
        api.getSessions(20, 0).catch(function() { return {sessions:[], total:0}; }),
      ]).then(function(results) {
        setStatus(results[0]);
        setSessions(results[1].sessions || []);
      }).catch(function() {});
    }, []);

    useEffect(function() {
      fetchData();
      var interval = setInterval(fetchData, 15000);
      return function() { clearInterval(interval); };
    }, [fetchData]);

    // Merge live sessions with seed data for display
    var inbox = useMemo(function() {
      var live = (sessions || []).map(function(s) {
        return { id:s.id, title:s.title||s.id.slice(0,12), source:s.source||'CLI', status:s.is_active?'running':'done', priority:'P2', routed:null, classified:null };
      });
      return live.length > 0 ? live.concat(SEED_INBOX) : SEED_INBOX;
    }, [sessions]);

    var counts = {
      queued: inbox.filter(function(i) { return i.status==='queued'; }).length,
      running: inbox.filter(function(i) { return i.status==='running'; }).length,
      blocked: inbox.filter(function(i) { return i.status==='blocked'; }).length,
      done: inbox.filter(function(i) { return i.status==='done'; }).length,
    };
    var p1 = inbox.filter(function(i) { return i.priority==='P1' && i.status!=='done'; }).length;
    var redAlerts = ALERTS.filter(function(a) { return a.severity==='red'; }).length;
    var amberAlerts = ALERTS.filter(function(a) { return a.severity==='amber'; }).length;
    var systemStatus = redAlerts>0 ? {label:'AMBER \u00b7 1 RED ALERT',color:T.accent} : amberAlerts>1 ? {label:'AMBER \u00b7 DEGRADED',color:T.accent} : {label:'ALL SYSTEMS GREEN',color:T.ok};

    return React.createElement('div', null,
      React.createElement(StatusTicker, { systemStatus:systemStatus, kpis:TODAY_KPIS, p1:p1 }),
      React.createElement('div', { style:{padding:'18px 24px 0'}, className:'cockpit-grid' },
        React.createElement('style', null, '.cockpit-grid{display:grid;gap:14px;align-items:flex-start;grid-template-columns:minmax(0,1fr) 240px}@media(max-width:1180px){.cockpit-grid{grid-template-columns:minmax(0,1fr)}}'),
        React.createElement(MissionMap, { inbox:inbox }),
        React.createElement(CriticalRail)
      ),
      React.createElement('div', { style:{padding:'18px 24px 0'} },
        React.createElement(TodayStrip, { kpis:TODAY_KPIS, counts:counts })
      ),
      React.createElement('div', { style:{padding:'18px 24px 24px'} },
        React.createElement(LiveTelemetry)
      )
    );
  }

  window.__HERMES_PLUGINS__.register('sid-mission', MissionView);
})();
