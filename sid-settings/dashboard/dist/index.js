/* ═══════════════════════════════════════════════════════════════
   SID AI-OS — SETTINGS PLUGIN
   Integrations, kill switches, agent lifecycle, cost caps.
═══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var React = window.__HERMES_PLUGIN_SDK__.React;
  var hooks = window.__HERMES_PLUGIN_SDK__.hooks;
  var useState = hooks.useState;
  var useEffect = hooks.useEffect;
  var useRef = hooks.useRef;
  var useCallback = hooks.useCallback;
  var useMemo = hooks.useMemo;

  var T = {
    bg:"#FAFAF8", surface:"#F3F3F0", surfaceHigh:"#EAEAE6", paper:"#FCFAF5",
    border:"#E2E2DE", borderMid:"#C8C8C3", borderStrong:"#9A9A95",
    accent:"#E07340", accentLight:"#FFF4ED", accentDark:"#B85A28", accentBorder:"#F0A060",
    text:"#111110", textMid:"#4A4A48", textDim:"#8A8A87", textFaint:"#C0C0BC",
    ok:"#16A34A", okLight:"#DCFCE7", run:"#0284C7", runLight:"#E0F2FE",
    block:"#DC2626", blockLight:"#FEE2E2", pilot:"#7C3AED", pilotLight:"#EDE9FE",
    done:"#71717A", doneLight:"#F4F4F5", ink:"#1B1A18", inkSurface:"#262522",
  };
  var F = {
    display:"'DM Sans', system-ui, sans-serif",
    body:"'DM Sans', system-ui, sans-serif",
    mono:"'JetBrains Mono', 'Fira Code', monospace",
  };

  var ICON = {
    hub:"◎",inbox:"📥",mail:"✉",calendar_today:"📅",send:"📤",edit_square:"✏️",
    person:"👤",check_circle:"✓",shield:"🛡",alt_route:"→",play_arrow:"▶",
    category:"🏷",download:"↓",experiment:"🔬",terminal:"⌘",work:"💼",
    folder_open:"📂",wifi:"◉",battery_full:"▮",arrow_back:"←",more_vert:"⋮",
    attach_file:"+",mic:"🎤",play_circle:"▶",school:"🎓",backpack:"🎒",
    extension:"🔌",psychology:"🧠",receipt_long:"📋",stop_circle:"⏹",input:"📥",
    gavel:"⚖",history_edu:"📜",toll:"💰",emergency:"🚨",power:"⏻",upgrade:"⬆",
    scatter_plot:"⚡",folder:"📁",build:"🔧",account_tree:"🌳",language:"🌐",
    forum:"💬",smart_toy:"🤖",tag:"🏷",api:"🔗",library_books:"📚",description:"📄",
    code:"💻",event:"📅",chat:"💬",travel_explore:"🔍",trending_up:"📈",
    verified:"✅",play_lesson:"📖",menu_book:"📖",schema:"📊",rocket_launch:"🚀",
    contact_support:"❓",link:"🔗",verified_user:"🛡",monitoring:"📊",military_tech:"🎖",
    how_to_reg:"✅",warning:"⚠",flash_on:"⚡",compare_arrows:"↔",reply:"←",
    visibility:"👁",add_circle:"➕",search:"🔍",history:"📜",nights_stay:"🌙",
    alarm:"⏰",phone_iphone:"📱",keyboard:"⌨",group:"👥",pending_actions:"⏳",
    radar:"📡",
  };

  var SC = {
    ok:{label:"OK",c:T.ok,bg:T.okLight},
    active:{label:"ACTIVE",c:T.ok,bg:T.okLight},
    piloting:{label:"PILOT",c:T.pilot,bg:T.pilotLight},
    open:{label:"OPEN",c:T.run,bg:T.runLight},
    closed:{label:"CLOSED",c:T.done,bg:T.doneLight},
    blocked:{label:"BLOCKED",c:T.block,bg:T.blockLight},
  };

  var AGENTS = [
    { id:"jarvis", name:"JARVIS", status:"active", model:"Sonnet", role:"Orchestrator", glyph:"hub",
      domain:"Routes every request to exactly one specialist." },
    { id:"birgit", name:"Birgit", status:"active", model:"Sonnet", role:"Personal Ops", glyph:"inbox",
      domain:"Inbox, calendar, meeting prep, short replies." },
    { id:"kenji", name:"Kenji", status:"active", model:"Haiku", role:"Workspace", glyph:"folder_open",
      domain:"Notion, schemas, knowledge base, persona lifecycle." },
    { id:"kumar", name:"Kumar", status:"active", model:"Sonnet", role:"Build", glyph:"terminal",
      domain:"Code, infra, Café Platform, eval harness, deploys." },
    { id:"q", name:"Q", status:"active", model:"Opus", role:"Research", glyph:"experiment",
      domain:"Research, briefs, decisions, long-form prose." },
    { id:"claire", name:"Claire", status:"piloting", model:"Sonnet", role:"ISC / Work", glyph:"work",
      domain:"ISC, SIOP, ABB, supply-chain ops, team 1:1s." },
    { id:"hans", name:"Hans", status:"piloting", model:"Haiku", role:"Governance", glyph:"shield",
      domain:"Security, privacy, cost cap, audit log, kill switches." },
  ];

  var INTEGRATIONS = [
    { id:"telegram", name:"Telegram", on:true, role:"Primary bridge", health:"green", lastEvent:"7:31 routed JARVIS→Birgit" },
    { id:"claude", name:"Claude Desktop", on:true, role:"Operator console", health:"green", lastEvent:"connected · agent files synced" },
    { id:"web", name:"Web (this)", on:true, role:"Mission control", health:"green", lastEvent:"active session" },
    { id:"notion", name:"Notion", on:true, role:"Workspace + memory", health:"green", lastEvent:"3 pages written today" },
    { id:"email", name:"Email (Gmail)", on:true, role:"Inbox source", health:"amber", lastEvent:"OAuth refresh in 6 days" },
    { id:"discord", name:"Discord", on:false, role:"Community door", health:"off", lastEvent:"never connected" },
    { id:"slack", name:"Slack", on:false, role:"Team channel", health:"off", lastEvent:"awaiting workspace key" },
    { id:"meta", name:"Meta Ads", on:true, role:"Marketing data", health:"red", lastEvent:"CPM anomaly 280% · paused" },
    { id:"calendar", name:"Google Cal", on:true, role:"Schedule", health:"green", lastEvent:"3 events parsed today" },
  ];

  var KILL_SWITCHES = [
    { key:"MISSION_AUTO_ASSIGN_ENABLED", label:"Auto-Assign Router", on:true, scope:"Mission Control", desc:"Off = items stay in QUEUED until you route manually." },
    { key:"SCHEDULER_ENABLED", label:"Scheduler", on:true, scope:"All agents", desc:"Off = no cron, no morning briefing." },
    { key:"OUTBOUND_SEND_ENABLED", label:"Outbound send", on:false, scope:"Email / Telegram", desc:"Off = drafts only. Human gate every send." },
    { key:"PILOT_AGENTS_LIVE", label:"Pilot agents live", on:true, scope:"Claire, Hans", desc:"Off = pilots run shadow-mode, no user-facing actions." },
    { key:"OPUS_ALLOWED", label:"Allow Opus model", on:true, scope:"Q only", desc:"Off = downgrade Q to Sonnet. Cost protection." },
  ];

  /* ─── Primitives ─── */
  function Glyph(props) {
    return React.createElement('span', {style:{fontSize:props.size||16,color:props.color||T.textMid,lineHeight:1,display:'inline-block'}}, ICON[props.name]||"•");
  }
  function Dot(props) {
    return React.createElement('span', {style:{display:'inline-block',width:props.size||8,height:props.size||8,borderRadius:'50%',background:props.color,flexShrink:0,animation:props.pulse?'pulse 1.6s ease-in-out infinite':'none'}});
  }
  function Pill(props) {
    return React.createElement('span', {style:{fontFamily:F.body,fontSize:11,fontWeight:500,color:props.color||T.textDim,background:props.bg||T.surface,border:'1px solid '+(props.color||T.textDim)+'30',padding:'1px 7px',borderRadius:3,lineHeight:1.7,whiteSpace:'nowrap'}}, props.label);
  }
  function StatusPill(props) {
    var s = SC[props.status] || {label:String(props.status||"").toUpperCase(),c:T.textDim,bg:T.surface};
    return React.createElement(Pill, {label:s.label,color:s.c,bg:s.bg});
  }
  function SectionTitle(props) {
    return React.createElement('div', {style:{marginBottom:14}},
      props.kicker && React.createElement('div', {style:{fontFamily:F.body,fontSize:11,fontWeight:700,color:T.accentDark,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:6}}, props.kicker),
      React.createElement('div', {style:{fontFamily:F.body,fontWeight:800,fontSize:20,color:T.text,letterSpacing:'0.01em',lineHeight:1}}, props.title, props.accent && React.createElement('span',{style:{color:T.accent}}," ",props.accent)),
      props.sub && React.createElement('div', {style:{fontFamily:F.body,fontSize:12,color:T.textDim,marginTop:8,lineHeight:1.5,maxWidth:680}}, props.sub)
    );
  }
  function injectStyles() {
    var interactiveStyle = document.createElement('style');
    interactiveStyle.id = 'sid-interactive';
    if (!document.querySelector('link[href*="DM+Sans"]')) {
      var dmLink = document.createElement('link');
      dmLink.rel = 'stylesheet';
      dmLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..900;1,9..40,300..900&display=swap';
      document.head.appendChild(dmLink);
    }
    if (!document.getElementById('sid-interactive')) {
      interactiveStyle.textContent = '.sid-btn{cursor:pointer;transition:opacity 0.12s ease;}.sid-btn:hover{opacity:0.75;}.sid-btn:focus-visible{outline:2px solid #E07340;outline-offset:2px;}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important;animation-iteration-count:1!important;}}';
      document.head.appendChild(interactiveStyle);
    }
  }

  function FlowExplainer(props) {
    return React.createElement('div', null,
      props.kicker && React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:6}}, props.kicker),
      props.title && React.createElement('div', {style:{fontFamily:F.body,fontWeight:700,fontSize:15,color:T.text,letterSpacing:'0.01em',lineHeight:1.1,marginBottom:14}}, props.title),
      React.createElement('div', {style:{display:'grid',gap:8}},
        props.steps.map(function(s, i) {
          var dense = props.dense;
          return React.createElement('div', {key:i, style:{
            display:'grid', gridTemplateColumns: dense?'32px 90px minmax(0,1fr)':'40px 100px minmax(0,1fr)',
            gap:dense?10:14, background:T.bg, border:'1px solid '+T.border,
            borderLeft:'1px solid '+T.border, padding:dense?'8px 12px':'10px 14px'
          }},
            React.createElement('span', {style:{fontFamily:F.body,fontWeight:800,fontSize:dense?14:18,color:T.textFaint,letterSpacing:'0.01em'}}, String(i+1).padStart(2,"0")),
            React.createElement('div', {style:{display:'flex',alignItems:'center',gap:6}},
              s.glyph && React.createElement(Glyph,{name:s.glyph,size:dense?13:14,color:T.textMid}),
              React.createElement('span', {style:{fontFamily:F.body,fontSize:dense?12:13,color:T.text,letterSpacing:'0.05em'}}, s.who)
            ),
            React.createElement('span', {style:{fontFamily:F.body,fontSize:dense?11:12,color:T.textMid,lineHeight:1.45}}, s.desc)
          );
        })
      )
    );
  }

  /* ─── EcosystemMap ─── */
  function EcosystemMap() {
    return React.createElement('div', {style:{border:'1px solid '+T.border,padding:'16px',background:T.bg}},
      React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:'0.12em',marginBottom:12}}, "SYSTEM ARCHITECTURE"),
      React.createElement('div', {style:{display:'flex',flexDirection:'column',gap:8}},
        /* Inputs row */
        React.createElement('div', {style:{display:'flex',gap:8,alignItems:'center'}},
          React.createElement('div', {style:{fontFamily:F.body,fontSize:9,color:T.textDim,width:60,textAlign:'right'}},"INPUTS"),
          React.createElement('div', {style:{flex:1,display:'flex',gap:4}},
            ["Email","Calendar","Telegram","Manual"].map(function(src) {
              return React.createElement('div', {key:src, style:{flex:1,background:T.surface,border:'1px solid '+T.border,padding:'6px 8px',textAlign:'center',fontFamily:F.body,fontWeight:500,fontSize:10,color:T.text,letterSpacing:'0.04em'}}, src);
            })
          )
        ),
        /* Arrow */
        React.createElement('div', {style:{textAlign:'center',color:T.textDim,fontFamily:F.mono,fontSize:12}},"↓"),
        /* SG INBOX */
        React.createElement('div', {style:{background:T.accentLight,border:'1px solid '+T.accentBorder,padding:'8px 12px',textAlign:'center',fontFamily:F.body,fontWeight:600,fontSize:14,color:T.accent,letterSpacing:'0.06em'}},"SG INBOX · ONE FRONT DOOR"),
        /* Arrow */
        React.createElement('div', {style:{textAlign:'center',color:T.textDim,fontFamily:F.mono,fontSize:12}},"↓"),
        /* JARVIS */
        React.createElement('div', {style:{background:T.ink,padding:'8px 12px',textAlign:'center',fontFamily:F.body,fontWeight:600,fontSize:13,color:'#fff',letterSpacing:'0.06em'}},"JARVIS · ROUTER"),
        /* Arrow */
        React.createElement('div', {style:{textAlign:'center',color:T.textDim,fontFamily:F.mono,fontSize:12}},"↓"),
        /* Specialists grid */
        React.createElement('div', {style:{fontFamily:F.body,fontSize:9,color:T.textDim,width:60,textAlign:'right',paddingTop:4}},"SPECIALISTS"),
        React.createElement('div', {style:{display:'grid',gridTemplateColumns:'repeat(6, 1fr)',gap:4}},
          AGENTS.filter(function(a) { return a.id !== "jarvis"; }).map(function(a) {
            return React.createElement('div', {key:a.id, style:{background:T.surface,border:'1px solid '+T.border,padding:'6px 4px',textAlign:'center'}},
              React.createElement('div', {style:{marginBottom:2}}, React.createElement(Glyph, {name:a.glyph, size:14, color:T.accent})),
              React.createElement('div', {style:{fontFamily:F.body,fontWeight:500,fontSize:9,color:T.text,letterSpacing:'0.04em'}}, a.name),
              React.createElement('div', {style:{fontFamily:F.mono,fontSize:7,color:T.textDim,marginTop:1}}, a.model)
            );
          })
        )
      )
    );
  }

  /* ─── BuildJourney ─── */
  function BuildJourney() {
    var steps = [
      { n:"01", label:"SHELL", desc:"Hermes gateway + Telegram bridge. Agent files on disk." },
      { n:"02", label:"PERSONAS", desc:"7 agents with CLAUDE.md. Voice, domain, keywords." },
      { n:"03", label:"SKILLS", desc:"24 skills with I/O contracts. Eval harness at 90%." },
      { n:"04", label:"PLUGINS", desc:"13 tools connected. Hans governs. Cost caps live." },
      { n:"05", label:"DASHBOARD", desc:"This UI. 10 tabs. Mission Control in the browser." },
    ];
    return React.createElement('div', {style:{display:'grid',gridTemplateColumns:'repeat(5, 1fr)',gap:1,background:T.border}},
      steps.map(function(s, i) {
        var isLast = i === steps.length - 1;
        return React.createElement('div', {key:s.n, style:{background:isLast?T.accentLight:T.bg,padding:'14px 12px',borderRight:i<4?'1px solid '+T.border:'none'}},
          React.createElement('div', {style:{display:'flex',alignItems:'center',gap:6,marginBottom:6}},
            React.createElement('span', {style:{fontFamily:F.mono,fontSize:10,color:isLast?T.accent:T.textDim,fontWeight:700}}, s.n),
            React.createElement('span', {style:{fontFamily:F.body,fontWeight:600,fontSize:13,color:isLast?T.accent:T.text,letterSpacing:'0.04em'}}, s.label)
          ),
          React.createElement('div', {style:{fontFamily:F.body,fontSize:10,color:T.textMid,lineHeight:1.5}}, s.desc)
        );
      })
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     SETTINGS VIEW
  ═══════════════════════════════════════════════════════════════ */
  function SettingsView() {
    injectStyles();
    var _useState = useState(null);
    var testing = _useState[0];
    var setTesting = _useState[1];
    var _useState2 = useState({});
    var results = _useState2[0];
    var setResults = _useState2[1];
    var _useState3 = useState(KILL_SWITCHES);
    var killSwitches = _useState3[0];
    var setKillSwitches = _useState3[1];
    var testTimerRef = useRef(null);

    useEffect(function() {
      return function() { if (testTimerRef.current) clearTimeout(testTimerRef.current); };
    }, []);

    var toggleKS = function(key) {
      setKillSwitches(function(prev) { return prev.map(function(k) { return k.key===key ? Object.assign({},k,{on:!k.on}) : k; }); });
    };
    var healthColor = function(h) { return h==="green"?T.ok:(h==="amber"?T.accent:(h==="red"?T.block:T.textFaint)); };

    var testIntegration = function(intg) {
      if (testing) return;
      if (testTimerRef.current) clearTimeout(testTimerRef.current);
      setTesting(intg.id);
      setResults(function(prev) { var n = Object.assign({},prev); n[intg.id] = null; return n; });
      testTimerRef.current = setTimeout(function() {
        testTimerRef.current = null;
        var t = new Date().toTimeString().slice(0,8);
        var result;
        if (!intg.on) result = {ok:false, message:"Disabled — flip ON to test.", t:t};
        else if (intg.health==="red") result = {ok:false, message:"Anomaly active — see lastEvent.", t:t};
        else if (intg.health==="amber") result = {ok:true, message:"OK · "+intg.lastEvent+" · check soon.", t:t};
        else result = {ok:true, message:"Pong · "+Math.floor(Math.random()*120+40)+"ms · "+intg.lastEvent, t:t};
        setResults(function(prev) { var n = Object.assign({},prev); n[intg.id] = result; return n; });
        setTesting(null);
      }, 750 + Math.random()*900);
    };

    var settingsExplainer = [
      { who:"INTEGRATIONS", glyph:"power", desc:"Each one is a source, destination, or both. ON/OFF gates traffic." },
      { who:"KILL SWITCHES", glyph:"emergency", desc:"Big red buttons. Halt auto-assign, scheduler, outbound — instantly." },
      { who:"LIFECYCLE", glyph:"upgrade", desc:"PILOT agents earn ACTIVE. ACTIVE agents earn retire." },
      { who:"COST", glyph:"toll", desc:"Per-model, per-day caps. Opus stays quarantined to Q." },
    ];

    return React.createElement('div', {style:{padding:'24px'}},
      React.createElement(SectionTitle, {
        kicker:"CONFIG · GOVERNANCE",
        title:"SETTINGS.",
        accent:"POWER ON, OFF, OR LIMITED.",
        sub:"Integrations, kill switches, persona lifecycle, model caps. Everything that gates the OS lives here."
      }),

      /* Ecosystem map + explainer */
      React.createElement('div', {style:{display:'grid',gridTemplateColumns:'minmax(0,1fr) 260px',gap:18,marginBottom:28}},
        React.createElement('div', null,
          React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10}}, "THE SYSTEM · BIRD'S-EYE"),
          React.createElement(EcosystemMap, null)
        ),
        React.createElement('aside', null,
          React.createElement(FlowExplainer, {kicker:"WHAT YOU CONTROL HERE", title:"Four levers.", steps:settingsExplainer, dense:true})
        )
      ),

      /* Integrations */
      React.createElement('div', {style:{marginBottom:28}},
        React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10}},
          "INTEGRATIONS · ", INTEGRATIONS.filter(function(i) { return i.on; }).length, " ON / ", INTEGRATIONS.length, " TOTAL · PRESS TEST TO PING"
        ),
        React.createElement('div', {style:{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',gap:1,background:T.border}},
          INTEGRATIONS.map(function(intg) {
            var result = results[intg.id];
            var isTesting = testing === intg.id;
            return React.createElement('div', {key:intg.id, style:{background:T.bg,padding:'12px 14px',opacity:intg.on?1:0.65}},
              React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}},
                React.createElement('div', null,
                  React.createElement('div', {style:{display:'flex',alignItems:'center',gap:7}},
                    React.createElement(Dot, {color:healthColor(intg.health), pulse:intg.health==="red"}),
                    React.createElement('span', {style:{fontFamily:F.body,fontWeight:500,fontSize:14,color:T.text,letterSpacing:'0.05em'}}, intg.name)
                  ),
                  React.createElement('div', {style:{fontFamily:F.body,fontSize:11,color:T.textMid,marginTop:4}}, intg.role)
                ),
                React.createElement(Pill, {label:intg.on?"ON":"OFF", color:intg.on?T.ok:T.textFaint, bg:intg.on?T.okLight:T.surface})
              ),
              React.createElement('div', {style:{fontFamily:F.mono,fontSize:10,color:T.textDim,marginBottom:8,paddingTop:6,borderTop:'1px solid '+T.border}}, intg.lastEvent),
              React.createElement('div', {style:{display:'flex',gap:5,alignItems:'center'}},
                React.createElement('button', {
                  className: 'sid-btn',
                  onClick: function() { testIntegration(intg); },
                  disabled: isTesting,
                  'aria-label': 'Test '+intg.name,
                  style:{background:isTesting?T.surface:T.accent,color:isTesting?T.textDim:'#fff',border:'none',fontFamily:F.body,fontSize:10,fontWeight:700,padding:'5px 10px',cursor:isTesting?'wait':'pointer',letterSpacing:'0.05em'}
                }, isTesting ? "PINGING..." : "TEST"),
                React.createElement('button', {className:'sid-btn',style:{background:'transparent',border:'1px solid '+T.border,color:T.textMid,fontFamily:F.body,fontSize:10,fontWeight:700,padding:'5px 10px',cursor:'pointer',letterSpacing:'0.05em'}}, "CONFIG"),
                result && React.createElement('span', {style:{flex:1,textAlign:'right',fontFamily:F.mono,fontSize:10,color:result.ok?T.ok:T.block,fontWeight:600}},
                  result.ok ? "✓ " : "✗ ", result.message
                )
              )
            );
          })
        )
      ),

      /* Kill switches */
      React.createElement('div', {style:{marginBottom:28}},
        React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10}}, "KILL SWITCHES · BIG RED BUTTONS"),
        React.createElement('div', {style:{border:'1px solid '+T.border}},
          killSwitches.map(function(ks, i) {
            return React.createElement('div', {key:ks.key, style:{display:'grid',gridTemplateColumns:'minmax(0,1fr) 130px 80px',gap:14,alignItems:'center',padding:'12px 14px',borderBottom:i<killSwitches.length-1?'1px solid '+T.border:'none',borderTop:'2px solid '+(ks.on?T.ok:T.block),background:ks.on?T.bg:T.blockLight}},
              React.createElement('div', null,
                React.createElement('div', {style:{display:'flex',alignItems:'center',gap:8,marginBottom:3}},
                  React.createElement('span', {style:{fontFamily:F.body,fontWeight:600,fontSize:14,color:T.text,letterSpacing:'0.04em'}}, ks.label),
                  React.createElement('span', {style:{fontFamily:F.mono,fontSize:9,color:T.textDim}}, ks.key)
                ),
                React.createElement('div', {style:{fontFamily:F.body,fontSize:11,color:T.textMid,lineHeight:1.5}}, ks.desc)
              ),
              React.createElement(Pill, {label:(ks.scope||"").toUpperCase(), color:T.textDim, mono:true}),
              React.createElement('button', {
                className: 'sid-btn',
                onClick: function() { toggleKS(ks.key); },
                'aria-label': 'Toggle '+ks.label,
                'aria-pressed': ks.on,
                style:{background:ks.on?T.ok:T.block,color:'#fff',border:'none',fontFamily:F.body,fontWeight:600,fontSize:12,letterSpacing:'0.1em',padding:'8px 12px',cursor:'pointer'}
              }, ks.on ? "● LIVE" : "○ OFF")
            );
          })
        )
      ),

      /* Agent visibility lifecycle */
      React.createElement('div', {style:{marginBottom:28}},
        React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10}}, "AGENT VISIBILITY · LIFECYCLE"),
        React.createElement('div', {style:{border:'1px solid '+T.border}},
          AGENTS.map(function(a, i) {
            return React.createElement('div', {key:a.id, style:{display:'grid',gridTemplateColumns:'40px 130px 100px minmax(0,1fr) auto',gap:14,alignItems:'center',padding:'10px 14px',borderBottom:i<AGENTS.length-1?'1px solid '+T.border:'none'}},
              React.createElement('div', {style:{width:30,height:30,background:T.text,display:'flex',alignItems:'center',justifyContent:'center'}},
                React.createElement(Glyph, {name:a.glyph, size:16, color:'#fff'})
              ),
              React.createElement('div', null,
                React.createElement('div', {style:{fontFamily:F.body,fontWeight:600,fontSize:14,color:T.text,letterSpacing:'0.05em'}}, a.name),
                React.createElement('div', {style:{fontFamily:F.body,fontSize:10,color:T.textDim}}, a.role)
              ),
              React.createElement(StatusPill, {status:a.status}),
              React.createElement('div', {style:{fontFamily:F.body,fontSize:11,color:T.textMid}}, a.domain),
              a.status==="piloting" && React.createElement('button', {className:'sid-btn',style:{background:T.pilot,border:'none',color:'#fff',fontFamily:F.body,fontSize:10,fontWeight:700,padding:'5px 10px',cursor:'pointer',letterSpacing:'0.05em'}}, "PROMOTE")
            );
          })
        )
      ),

      /* Build journey footer */
      React.createElement('div', null,
        React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10}}, "HOW THIS GOT HERE · 5-STEP JOURNEY"),
        React.createElement(BuildJourney, null)
      )
    );
  }

  window.__HERMES_PLUGINS__.register('sid-settings', SettingsView);
})();
