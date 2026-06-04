/* ═══════════════════════════════════════════════════════════════
   SID AI-OS — AUDIT PLUGIN
   Hooks board, cost telemetry, decisions log. Append-only. Trace it back.
═══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var React = window.__HERMES_PLUGIN_SDK__.React;
  var hooks = window.__HERMES_PLUGIN_SDK__.hooks;
  var useState = hooks.useState;
  var useEffect = hooks.useEffect;
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

  var AGENTS = [
    { id:"jarvis", name:"JARVIS", status:"active", model:"Sonnet", role:"Orchestrator", glyph:"hub" },
    { id:"birgit", name:"Birgit", status:"active", model:"Sonnet", role:"Personal Ops", glyph:"inbox" },
    { id:"kenji", name:"Kenji", status:"active", model:"Haiku", role:"Workspace", glyph:"folder_open" },
    { id:"kumar", name:"Kumar", status:"active", model:"Sonnet", role:"Build", glyph:"terminal" },
    { id:"q", name:"Q", status:"active", model:"Opus", role:"Research", glyph:"experiment" },
    { id:"claire", name:"Claire", status:"piloting", model:"Sonnet", role:"ISC / Work", glyph:"work" },
    { id:"hans", name:"Hans", status:"piloting", model:"Haiku", role:"Governance", glyph:"shield" },
  ];

  var TELEMETRY = [
    { time:"08:30", agent:"jarvis", skill:"/route", model:"sonnet", tok:420, cost:0.032, outcome:"ok" },
    { time:"08:32", agent:"birgit", skill:"/gm", model:"sonnet", tok:1840, cost:0.028, outcome:"ok" },
    { time:"09:14", agent:"q", skill:"/brief", model:"opus", tok:3210, cost:0.241, outcome:"ok" },
    { time:"10:45", agent:"kenji", skill:"/triage", model:"haiku", tok:1120, cost:0.001, outcome:"ok" },
    { time:"11:02", agent:"hans", skill:"/guardrail", model:"haiku", tok:340, cost:0.000, outcome:"blocked" },
    { time:"11:18", agent:"kumar", skill:"/eval", model:"sonnet", tok:2640, cost:0.040, outcome:"override" },
    { time:"11:42", agent:"birgit", skill:"/reply", model:"sonnet", tok:980, cost:0.014, outcome:"ok" },
    { time:"12:03", agent:"q", skill:"/synthesize", model:"opus", tok:4120, cost:0.309, outcome:"ok" },
  ];

  var DECISIONS = [
    { id:"D-2026-041", date:"15 May", title:"Ship Café Platform v3 Monday after /redact pass", by:"JARVIS+Q+Hans+Kumar", status:"open" },
    { id:"D-2026-040", date:"14 May", title:"Promote Claire PILOT → ACTIVE on 28 May (14d clean)", by:"You", status:"open" },
    { id:"D-2026-039", date:"12 May", title:"Cost cap raised $2 → $3/day during Opus pilot", by:"Hans+You", status:"closed" },
    { id:"D-2026-038", date:"08 May", title:"Telegram remains primary Bridge channel", by:"You", status:"closed" },
    { id:"D-2026-037", date:"05 May", title:"Retire Heidi persona — superseded by Birgit", by:"Kenji+You", status:"closed" },
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

  /* ─── FlowExplainer ─── */
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

  /* ─── FlowDemoStrip ─── */
  function FlowDemoStrip(props) {
    var _useState = useState(-1);
    var activeStep = _useState[0];
    var setActiveStep = _useState[1];
    var _useState2 = useState(false);
    var playing = _useState2[0];
    var setPlaying = _useState2[1];

    useEffect(function() {
      if (!playing || activeStep >= props.steps.length - 1) {
        if (activeStep >= props.steps.length - 1) setPlaying(false);
        return;
      }
      var timer = setTimeout(function() {
        setActiveStep(function(s) { return s + 1; });
      }, 1200);
      return function() { clearTimeout(timer); };
    }, [playing, activeStep]);

    return React.createElement('div', null,
      React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}},
        React.createElement('div', null,
          props.kicker && React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:4}}, props.kicker),
          props.title && React.createElement('div', {style:{fontFamily:F.body,fontWeight:600,fontSize:14,color:T.text,letterSpacing:'0.04em'}}, props.title)
        ),
        React.createElement('button', {
          className: 'sid-btn',
          onClick: function() { setActiveStep(-1); setPlaying(true); },
          style:{background:T.accent,color:'#fff',border:'none',fontFamily:F.body,fontSize:10,fontWeight:700,padding:'5px 12px',cursor:'pointer',letterSpacing:'0.05em'}
        }, playing ? "PLAYING..." : "▶ PLAY")
      ),
      React.createElement('div', {style:{display:'grid',gridTemplateColumns:'repeat('+props.steps.length+', 1fr)',gap:1,background:T.border}},
        props.steps.map(function(step, i) {
          var isActive = i === activeStep;
          var isPast = activeStep >= 0 && i < activeStep;
          return React.createElement('div', {key:i, style:{
            background:isActive?T.accentLight:(isPast?T.okLight:T.bg),
            padding:'10px 12px',
            borderBottom:'3px solid '+(isActive?T.accent:(isPast?T.ok:T.border)),
            transition:'background 0.3s, border-color 0.3s'
          }},
            React.createElement('div', {style:{fontFamily:F.body,fontSize:11,color:isActive?T.accent:T.text,letterSpacing:'0.05em',marginBottom:4}}, step.who),
            React.createElement('div', {style:{fontFamily:F.body,fontSize:10,color:T.textMid,lineHeight:1.4}}, step.what),
            React.createElement('div', {style:{fontFamily:F.mono,fontSize:9,color:T.textDim,marginTop:4,lineHeight:1.3}}, step.log)
          );
        })
      )
    );
  }

  /* ─── HooksBoard ─── */
  var HOOKS_LIST = [
    { name:"SessionStart", desc:"Auto-convert inputs to context-ready format", detail:"input.pdf → input.md · 4.2 KB · ready" },
    { name:"PreToolUse", desc:"Validate tool calls before execution", detail:"Cost check · PII scan · scope verify" },
    { name:"PostToolUse", desc:"Log every tool result to hive_mind_log", detail:"Row appended · diff hash computed" },
    { name:"GUARDRAIL", desc:"Pre-flight scan on all outbound", detail:"PII check · cost gate · ALLOW/BLOCK" },
    { name:"Stop", desc:"Human gate before loop closes", detail:"You approve · receipt issued · logged" },
  ];
  function HooksBoard() {
    var hooks = HOOKS_LIST;
    return React.createElement('div', {style:{border:'1px solid '+T.border}},
      React.createElement('div', {style:{padding:'8px 14px',background:T.surface,borderBottom:'1px solid '+T.border,fontFamily:F.body,fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:'0.12em',textTransform:'uppercase'}},
        "HOOKS · 5 TAPS ON EVERY FLOW"),
      hooks.map(function(h, i) {
        return React.createElement('div', {key:i, style:{display:'grid',gridTemplateColumns:'140px 1fr',gap:14,padding:'10px 14px',borderBottom:i<hooks.length-1?'1px solid '+T.border:'none',background:i%2===0?T.bg:T.surface}},
          React.createElement('div', null,
            React.createElement('div', {style:{fontFamily:F.body,fontWeight:500,fontSize:12,color:T.accent,letterSpacing:'0.04em',marginBottom:2}}, h.name),
            React.createElement('div', {style:{fontFamily:F.body,fontSize:10,color:T.textMid}}, h.desc)
          ),
          React.createElement('div', {style:{fontFamily:F.mono,fontSize:10,color:T.textDim,lineHeight:1.5,display:'flex',alignItems:'center'}}, h.detail)
        );
      })
    );
  }

  /* ─── CostChart ─── */
  function CostChart() {
    var days = [
      {d:"Mon",v:0.42},{d:"Tue",v:0.38},{d:"Wed",v:0.55},{d:"Thu",v:0.34},
      {d:"Fri",v:0.61},{d:"Sat",v:0.12},{d:"Sun",v:0.08},
    ];
    var maxV = 0.7;
    return React.createElement('div', {style:{border:'1px solid '+T.border,padding:'14px'}},
      React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:'0.12em',marginBottom:12}},"DAILY COST · LAST 7 DAYS"),
      React.createElement('div', {style:{display:'flex',alignItems:'flex-end',gap:6,height:80}},
        days.map(function(day, i) {
          var h = (day.v / maxV) * 100;
          return React.createElement('div', {key:i, style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}},
            React.createElement('div', {style:{width:'100%',maxHeight:h+'%',height:'100%',background:day.v>0.5?T.accent:T.ok,borderRadius:'2px 2px 0 0',overflow:'hidden',transition:'max-height 0.3s cubic-bezier(0.22,1,0.36,1)'}}),
            React.createElement('span', {style:{fontFamily:F.mono,fontSize:8,color:T.textDim}}, day.d),
            React.createElement('span', {style:{fontFamily:F.mono,fontSize:8,color:T.textMid}},"$"+day.v.toFixed(2))
          );
        })
      )
    );
  }

  /* ─── ModelBreakdown ─── */
  function ModelBreakdown() {
    var models = [
      {name:"Sonnet",cost:0.114,pct:0.68,color:T.run},
      {name:"Opus",cost:0.550,pct:0.30,color:T.accent},
      {name:"Haiku",cost:0.001,pct:0.02,color:T.ok},
    ];
    return React.createElement('div', {style:{border:'1px solid '+T.border,padding:'14px'}},
      React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:'0.12em',marginBottom:12}},"MODEL BREAKDOWN · TODAY"),
      models.map(function(m, i) {
        return React.createElement('div', {key:i, style:{marginBottom:10}},
          React.createElement('div', {style:{display:'flex',justifyContent:'space-between',marginBottom:4}},
            React.createElement('span', {style:{fontFamily:F.body,fontWeight:500,fontSize:12,color:T.text,letterSpacing:'0.04em'}}, m.name),
            React.createElement('span', {style:{fontFamily:F.mono,fontSize:11,color:T.textMid}},"$"+m.cost.toFixed(3))
          ),
          React.createElement('div', {style:{height:4,background:T.surface}},
            React.createElement('div', {style:{height:'100%',width:'100%',transform:'scaleX('+m.pct+')',transformOrigin:'left',background:m.color,transition:'transform 0.4s cubic-bezier(0.22,1,0.36,1)'}})
          ),
          React.createElement('div', {style:{fontFamily:F.mono,fontSize:8,color:T.textDim,marginTop:2}}, Math.round(m.pct*100)+"% of spend")
        );
      })
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     AUDIT VIEW
  ═══════════════════════════════════════════════════════════════ */
  function AuditView() {
    injectStyles();
    var total = TELEMETRY.reduce(function(s,e) { return s+e.cost; }, 0);
    var monthly = total * 30;
    var pct = Math.min((monthly/60)*100, 100);
    var cc = monthly >= 60 ? T.block : monthly >= 48 ? T.accent : T.ok;

    var hookDemo = [
      { who:"SessionStart", what:"Auto-convert", log:"input.pdf → input.md · 4.2 KB · ready for context window" },
      { who:"AGENT", what:"Read + reason", log:"Birgit pulls 12 emails, classifies 5 as actionable" },
      { who:"PostToolUse", what:"Log every edit", log:"hive_mind_log row #1840 appended · diff hash 8a3c" },
      { who:"GUARDRAIL", what:"Pre-flight scan", log:"PII check passed · cost $0.018 · ALLOW outbound" },
      { who:"Stop", what:"Human gate", log:"You approved the reply · loop closed · receipt issued" },
    ];

    var auditExplainer = [
      { who:"3 HOOKS", glyph:"hub", desc:"SessionStart · PostToolUse · Stop. Three taps on every flow." },
      { who:"APPEND", glyph:"add_circle", desc:"Append-only. No edits. No deletes. Pinned rows survive decay." },
      { who:"COST", glyph:"toll", desc:"Daily cap stops runaway. Opus quarantined to Q." },
      { who:"DECIDE", glyph:"history_edu", desc:"Every decision logged with timestamp, signers, dissents." },
    ];

    return React.createElement('div', {style:{padding:'24px'}},
      React.createElement(SectionTitle, {
        kicker:"OBSERVABILITY · GOVERNANCE",
        title:"AUDIT.",
        accent:"APPEND-ONLY. TRACE IT BACK.",
        sub:"Three hooks log every action. Cost caps stop runaway spend. Decisions are timestamped. Pinned rows survive 90-day decay."
      }),

      /* Demo strip — hook lifecycle */
      React.createElement('div', {style:{marginBottom:18}},
        React.createElement(FlowDemoStrip, {
          title:"ONE FLOW · FIVE HOOKS",
          kicker:"See how a single action traces through the system",
          steps:hookDemo
        })
      ),

      /* Hooks board + explainer */
      React.createElement('div', {style:{display:'grid',gridTemplateColumns:'minmax(0,1fr) 260px',gap:18,marginBottom:24}},
        React.createElement('div', null,
          React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10}}, "HOOKS · THE UNSEXY WORK"),
          React.createElement(HooksBoard, null)
        ),
        React.createElement('aside', null,
          React.createElement(FlowExplainer, {kicker:"WHY THIS LAYER MATTERS", title:"The audit is the brand.", steps:auditExplainer, dense:true})
        )
      ),

      /* Cost visuals */
      React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10}}, "COST · KILL ABOVE THRESHOLD"),
      React.createElement('div', {style:{display:'grid',gridTemplateColumns:'minmax(0,1fr) 260px',gap:14,marginBottom:14}},
        React.createElement(CostChart, null),
        React.createElement(ModelBreakdown, null)
      ),

      /* Cost caps */
      React.createElement('div', {style:{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',gap:1,background:T.border,marginBottom:24}},
        [
          { label:"PORTFOLIO / MONTH (proj.)", val:"$"+monthly.toFixed(2), target:"$60 halt", pct:pct, color:cc },
          { label:"JARVIS / DAY", val:"$"+total.toFixed(3), target:"$3.00 cap", pct:Math.min((total/3)*100,100), color:total>=3?T.block:T.ok },
          { label:"OPUS / DAY (Q only)", val:"$0.55", target:"$1.50 cap", pct:Math.min((0.55/1.5)*100,100), color:T.ok },
        ].map(function(m, i) {
          return React.createElement('div', {key:i, style:{background:T.bg,padding:'14px'}},
            React.createElement('div', {style:{fontFamily:F.mono,fontWeight:700,fontSize:11,color:T.accent,letterSpacing:'0.1em',marginBottom:6}}, m.label),
            React.createElement('div', {style:{fontFamily:F.body,fontWeight:800,fontSize:26,color:m.color,lineHeight:1,marginBottom:8}}, m.val),
            React.createElement('div', {style:{height:4,background:T.surface,marginBottom:5}},
              React.createElement('div', {style:{height:'100%',width:'100%',background:m.color,transform:'scaleX('+(m.pct/100)+')',transformOrigin:'left',transition:'transform 0.4s'}})
            ),
            React.createElement('div', {style:{fontFamily:F.body,fontSize:10,color:T.textDim}}, m.target)
          );
        })
      ),

      /* Telemetry table */
      React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10}}, "TELEMETRY · LAST 4 HOURS"),
      React.createElement('div', {style:{overflowX:'auto',marginBottom:24}},
        React.createElement('div', {style:{minWidth:540,border:'1px solid '+T.border}},
          React.createElement('div', {style:{display:'grid',gridTemplateColumns:'55px 75px 95px 65px 70px 65px 90px',padding:'7px 14px',background:T.surface,borderBottom:'1px solid '+T.border}},
            ["Time","Agent","Skill","Model","Tokens","Cost","Status"].map(function(h) {
              return React.createElement('span', {key:h, style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.08em'}}, h);
            })
          ),
          TELEMETRY.map(function(e, i) {
            var a = AGENTS.find(function(x) { return x.id === e.agent; }) || {};
            return React.createElement('div', {key:i, style:{display:'grid',gridTemplateColumns:'55px 75px 95px 65px 70px 65px 90px',padding:'8px 14px',borderBottom:i<TELEMETRY.length-1?'1px solid '+T.border:'none',alignItems:'center',background:e.outcome==='blocked'?T.blockLight:(e.outcome==='override'?T.accentLight:(i%2===0?T.bg:T.surface))}},
              React.createElement('span', {style:{fontFamily:F.mono,fontSize:10,color:T.textDim}}, e.time),
              React.createElement('span', {style:{fontFamily:F.body,fontSize:11,fontWeight:600,color:T.text}}, a.name||e.agent),
              React.createElement('span', {style:{fontFamily:F.mono,fontSize:11,color:T.accent}}, e.skill),
              React.createElement('span', {style:{fontFamily:F.mono,fontSize:10,color:T.textDim}}, e.model),
              React.createElement('span', {style:{fontFamily:F.mono,fontSize:10,color:T.textMid}}, e.tok.toLocaleString()),
              React.createElement('span', {style:{fontFamily:F.mono,fontSize:10}}, "$"+e.cost.toFixed(3)),
              React.createElement(StatusPill, {status:e.outcome})
            );
          })
        )
      ),

      /* Decisions log */
      React.createElement('div', {style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10}}, "DECISIONS · WHAT WAS DECIDED, BY WHOM, WHEN"),
      React.createElement('div', {style:{border:'1px solid '+T.border}},
        DECISIONS.map(function(d, i) {
          return React.createElement('div', {key:d.id, style:{display:'grid',gridTemplateColumns:'110px 80px minmax(0,1fr) auto auto',gap:14,padding:'11px 14px',borderBottom:i<DECISIONS.length-1?'1px solid '+T.border:'none',background:i%2===0?T.bg:T.surface}},
            React.createElement('span', {style:{fontFamily:F.mono,fontSize:11,color:T.accent,fontWeight:600}}, d.id),
            React.createElement('span', {style:{fontFamily:F.mono,fontSize:11,color:T.textDim}}, d.date),
            React.createElement('span', {style:{fontFamily:F.body,fontSize:12.5,color:T.text}}, d.title),
            React.createElement('span', {style:{fontFamily:F.mono,fontSize:10,color:T.textDim}}, "by "+d.by),
            React.createElement(StatusPill, {status:d.status})
          );
        })
      )
    );
  }

  window.__HERMES_PLUGINS__.register('sid-audit', AuditView);
})();
