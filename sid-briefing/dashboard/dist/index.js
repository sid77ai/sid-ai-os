(function() {
  'use strict';
  var React = window.__HERMES_PLUGIN_SDK__.React;
  var hooks = window.__HERMES_PLUGIN_SDK__.hooks;
  var useState = hooks.useState;
  var useEffect = hooks.useEffect;
  var useRef = hooks.useRef;

  /* ─── Interactive Styles ─── */
  function injectStyles() {
    if (!document.querySelector('link[href*="DM+Sans"]')) {
      var dmLink = document.createElement('link');
      dmLink.rel = 'stylesheet';
      dmLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..900;1,9..40,300..900&display=swap';
      document.head.appendChild(dmLink);
    }
    if (!document.getElementById('sid-interactive')) {
      var interactiveStyle = document.createElement('style');
      interactiveStyle.id = 'sid-interactive';
      interactiveStyle.textContent = '.sid-btn{cursor:pointer;transition:opacity 0.12s ease;}.sid-btn:hover{opacity:0.75;}.sid-btn:focus-visible{outline:2px solid #E07340;outline-offset:2px;}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important;animation-iteration-count:1!important;}}';
      document.head.appendChild(interactiveStyle);
    }
  }
  injectStyles();

  var T = {bg:"#FAFAF8",surface:"#F3F3F0",surfaceHigh:"#EAEAE6",border:"#E2E2DE",borderMid:"#C8C8C3",borderStrong:"#9A9A95",accent:"#E07340",accentLight:"#FFF4ED",accentDark:"#B85A28",accentBorder:"#F0A060",text:"#111110",textMid:"#4A4A48",textDim:"#8A8A87",textFaint:"#C0C0BC",ok:"#16A34A",okLight:"#DCFCE7",run:"#0284C7",runLight:"#E0F2FE",block:"#DC2626",blockLight:"#FEE2E2",pilot:"#7C3AED",pilotLight:"#EDE9FE",done:"#71717A",doneLight:"#F4F4F5",ink:"#1B1A18",inkSurface:"#262522"};
  var F = {display:"'DM Sans', system-ui, sans-serif", body:"'DM Sans', system-ui, sans-serif", mono:"'JetBrains Mono', monospace"};

  var ICON = {hub:"◎",inbox:"📥",mail:"✉",calendar_today:"📅",send:"📤",edit_square:"✏️",person:"👤",check_circle:"✓",shield:"🛡",alt_route:"→",play_arrow:"▶",category:"🏷",download:"↓",experiment:"🔬",terminal:"⌘",work:"💼",folder_open:"📂",wifi:"◉",battery_full:"▮",arrow_back:"←",more_vert:"⋮",attach_file:"+",mic:"🎤",play_circle:"▶",school:"🎓",backpack:"🎒",extension:"🔌",psychology:"🧠",receipt_long:"📋",stop_circle:"⏹",input:"📥",gavel:"⚖",history_edu:"📜",toll:"💰",emergency:"🚨",power:"⏻",upgrade:"⬆",scatter_plot:"⚡",folder:"📁",build:"🔧",account_tree:"🌳",language:"🌐",forum:"💬",smart_toy:"🤖",tag:"🏷",api:"🔗",library_books:"📚",description:"📄",code:"💻",event:"📅",chat:"💬",travel_explore:"🔍",trending_up:"📈",verified:"✅",play_lesson:"📖",menu_book:"📖",schema:"📊",rocket_launch:"🚀",contact_support:"❓",link:"🔗",verified_user:"🛡",monitoring:"📊",military_tech:"🎖",how_to_reg:"✅",warning:"⚠",flash_on:"⚡",compare_arrows:"↔",reply:"←",visibility:"👁",add_circle:"➕",search:"🔍",history:"📜",nights_stay:"🌙",alarm:"⏰",phone_iphone:"📱",check:"✓",group:"👥",badge:"🎖",science:"🔬",settings_input_component:"🔌"};

  var AGENTS = [
    {id:"jarvis",name:"JARVIS",status:"active",model:"Sonnet",role:"Orchestrator",glyph:"hub",domain:"Routes every request to exactly one specialist. Never executes work itself.",skills:["/route","/dispatch","/wrap"],keywords:[],voice:"Calm, terse. British butler.",memoryCount:847,lastActive:"now"},
    {id:"birgit",name:"Birgit",status:"active",model:"Sonnet",role:"Personal Ops",glyph:"inbox",domain:"Inbox, calendar, meeting prep, short replies.",skills:["/gm","/triage","/reply","/prep"],keywords:["email","inbox","calendar","meeting","reply","triage","schedule","prep","briefing"],voice:"Warm, efficient.",memoryCount:1240,lastActive:"2m ago"},
    {id:"kenji",name:"Kenji",status:"active",model:"Haiku",role:"Workspace",glyph:"folder_open",domain:"Notion, schemas, knowledge base, persona lifecycle.",skills:["/file","/schema","/index","/promote"],keywords:["notion","schema","database","page","knowledge","file","organise","tag"],voice:"Quiet. Surgical.",memoryCount:2103,lastActive:"5m ago"},
    {id:"kumar",name:"Kumar",status:"active",model:"Sonnet",role:"Build",glyph:"terminal",domain:"Code, infra, Café Platform, eval harness, deploys.",skills:["/eval","/deploy","/diff","/test"],keywords:["code","build","deploy","github","eval","cafe","infra","ci","bug","fix"],voice:"Precise. Loves diffs.",memoryCount:894,lastActive:"23m ago"},
    {id:"q",name:"Q",status:"active",model:"Opus",role:"Research",glyph:"experiment",domain:"Research, briefs, decisions, long-form prose.",skills:["/brief","/decide","/synthesize","/draft","/visualise"],keywords:["research","write","brief","decide","draft","analyse","essay","synthesise"],voice:"Considered. Cites sources.",memoryCount:612,lastActive:"1h ago"},
    {id:"claire",name:"Claire",status:"piloting",model:"Sonnet",role:"ISC / Work",glyph:"work",domain:"ISC, SIOP, ABB, supply-chain ops, team 1:1s.",skills:["/siop","/coach","/standup"],keywords:["isc","siop","abb","sunrise","supply","coaching","1:1","team"],voice:"Strategic.",memoryCount:340,lastActive:"3h ago"},
    {id:"hans",name:"Hans",status:"piloting",model:"Haiku",role:"Governance",glyph:"shield",domain:"Security, privacy, cost cap, audit log, kill switches.",skills:["/guardrail","/cost","/redact"],keywords:["security","privacy","legal","behörden","audit","cost","redact","gdpr","leak"],voice:"Stern. Will block.",memoryCount:528,lastActive:"14m ago"}
  ];

  var BRIEFING = {
    date:"Thu, 15 May 2026", time:"05:00", agent:"Birgit",
    highlights:[
      {kind:"calendar",title:"3 meetings today",body:"ISC team sync 10:00 · Q4 SIOP review 14:30 · 1:1 with Marco 16:00. Birgit prepped the SIOP deck — pending your approval."},
      {kind:"inbox",title:"5 untriaged · 2 P1",body:"Telekom renewal query needs you. RWTH essay draft is ready for review. Dentist reschedule is blocked on your availability."},
      {kind:"market",title:"Meta Ads anomaly",body:"CPM up 280% overnight on the EU campaign. Hans flagged — campaign paused. Kumar investigating attribution."},
      {kind:"agents",title:"Overnight agent work",body:"Kumar shipped eval harness v0.4 (6/6 passing). Q delivered the Hermes + Notion stack brief. Kenji indexed 3 new context-hub entries."}
    ],
    asks:[
      {who:"Birgit",q:"Approve the SIOP deck for 14:30?",urgency:"P1"},
      {who:"Hans",q:"Cost cap stays at $3/day? Yesterday hit $0.34.",urgency:"P3"},
      {who:"Claire",q:"Promote me PILOT → ACTIVE? 14 days passing.",urgency:"P2"}
    ]
  };

  function Dot(props) {
    return React.createElement('span',{style:{display:"inline-block",width:props.size||8,height:props.size||8,borderRadius:"50%",background:props.color,flexShrink:0}});
  }
  function Pill(props) {
    return React.createElement('span',{style:{fontFamily:props.mono?F.mono:F.body,fontSize:11,fontWeight:500,color:props.color||T.textDim,background:props.bg||T.surface,border:"1px solid "+(props.color||T.textDim)+"30",padding:"1px 7px",borderRadius:3,lineHeight:1.7,whiteSpace:"nowrap"}},props.label);
  }
  var SC = {queued:{label:"QUEUED",c:T.accentDark,bg:T.accentLight},running:{label:"RUNNING",c:T.run,bg:T.runLight},blocked:{label:"BLOCKED",c:T.block,bg:T.blockLight},done:{label:"DONE",c:T.done,bg:T.doneLight},ok:{label:"OK",c:T.ok,bg:T.okLight},active:{label:"ACTIVE",c:T.ok,bg:T.okLight},piloting:{label:"PILOT",c:T.pilot,bg:T.pilotLight},override:{label:"OVERRIDE",c:T.accentDark,bg:T.accentLight},open:{label:"OPEN",c:T.run,bg:T.runLight},closed:{label:"CLOSED",c:T.done,bg:T.doneLight}};
  function StatusPill(props) {
    var s = SC[props.status] || {label:String(props.status||"").toUpperCase(),c:T.textDim,bg:T.surface};
    return React.createElement(Pill,{label:s.label,color:s.c,bg:s.bg});
  }
  function Glyph(props) {
    var ch = ICON[props.name] || "•";
    return React.createElement('span',{style:{fontSize:props.size||16,color:props.color||T.textMid,lineHeight:1,display:"inline-block"}},ch);
  }
  function SectionTitle(props) {
    return React.createElement('div',{style:{marginBottom:14}},
      props.kicker && React.createElement('div',{style:{fontFamily:F.body,fontSize:11,fontWeight:700,color:T.accentDark,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:6}},props.kicker),
      React.createElement('div',{style:{fontFamily:F.body,fontWeight:800,fontSize:20,color:T.text,letterSpacing:"0.01em",lineHeight:1}},props.title,props.accent && React.createElement('span',{style:{color:T.accent}}," ",props.accent)),
      props.sub && React.createElement('div',{style:{fontFamily:F.body,fontSize:12,color:T.textDim,marginTop:8,lineHeight:1.5,maxWidth:680}},props.sub)
    );
  }
  function FlowExplainer(props) {
    return React.createElement('div',null,
      props.kicker && React.createElement('div',{style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:6}},props.kicker),
      props.title && React.createElement('div',{style:{fontFamily:F.body,fontWeight:700,fontSize:15,color:T.text,letterSpacing:"0.01em",lineHeight:1.1,marginBottom:14}},props.title),
      React.createElement('div',{style:{display:"grid",gap:8}},
        props.steps.map(function(s,i) {
          var dense = props.dense;
          return React.createElement('div',{key:i,style:{display:"grid",gridTemplateColumns:dense?"32px 90px minmax(0,1fr)":"40px 100px minmax(0,1fr)",gap:dense?10:14,padding:dense?"8px 12px":"10px 14px",background:T.bg,border:"1px solid "+T.border,borderLeft:"1px solid "+T.border}},
            React.createElement('span',{style:{fontFamily:F.body,fontWeight:800,fontSize:dense?14:18,color:T.textFaint,letterSpacing:"0.01em"}},String(i+1).padStart(2,"0")),
            React.createElement('div',{style:{display:"flex",alignItems:"center",gap:6}},
              s.glyph && React.createElement(Glyph,{name:s.glyph,size:dense?13:14,color:T.textMid}),
              React.createElement('span',{style:{fontFamily:F.body,fontWeight:600,fontSize:dense?12:13,color:T.text}},s.who)
            ),
            React.createElement('span',{style:{fontFamily:F.body,fontSize:dense?11:12,color:T.textMid,lineHeight:1.45}},s.desc)
          );
        })
      )
    );
  }

  function FlowDemoStrip(props) {
    var _a = useState(-1), step = _a[0], setStep = _a[1];
    var _b = useState(false), running = _b[0], setRunning = _b[1];
    var timerRef = useRef(null);
    var steps = props.steps;
    useEffect(function(){return function(){clearTimeout(timerRef.current)}});
    var play = function() {
      if (running) return;
      setRunning(true); setStep(0);
      var i = 0;
      var advance = function() {
        i += 1;
        if (i >= steps.length) { setStep(steps.length-1); setRunning(false); return; }
        setStep(i);
        timerRef.current = setTimeout(advance, 900);
      };
      timerRef.current = setTimeout(advance, 900);
    };
    var reset = function() { clearTimeout(timerRef.current); setStep(-1); setRunning(false); };

    return React.createElement('div',{style:{background:T.bg,border:"1px solid "+T.border}},
      React.createElement('div',{style:{padding:"10px 14px",background:T.text,color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}},
        React.createElement('div',{style:{display:"flex",alignItems:"center",gap:10}},
          React.createElement(Glyph,{name:"play_circle",size:18,color:T.accent}),
          React.createElement('span',{style:{fontFamily:F.body,fontWeight:700,fontSize:13,letterSpacing:"0.04em"}},props.title),
          props.kicker && React.createElement('span',{style:{fontFamily:F.mono,fontSize:10,color:"#aaa"}},"· "+props.kicker)
        ),
        React.createElement('div',{style:{display:"flex",gap:6}},
          React.createElement('button',{className:'sid-btn',onClick:reset,disabled:step<0,style:{background:"transparent",border:"1px solid #ffffff44",color:"#fff",fontFamily:F.body,fontSize:10,fontWeight:700,padding:"4px 10px",cursor:step<0?"not-allowed":"pointer",letterSpacing:"0.05em",opacity:step<0?0.4:1}},"RESET"),
          React.createElement('button',{className:'sid-btn',onClick:play,disabled:running,style:{background:T.accent,border:"none",color:"#fff",fontFamily:F.body,fontWeight:700,fontSize:11,letterSpacing:"0.06em",padding:"5px 14px",cursor:running?"wait":"pointer"}},running?"RUNNING…":step>=steps.length-1?"REPLAY":"PLAY")
        )
      ),
      React.createElement('div',{style:{height:3,background:T.surface}},
        React.createElement('div',{style:{height:"100%",background:T.accent,width:"100%",transform:"scaleX("+(step<0?0:((step+1)/steps.length))+")",transformOrigin:"left",transition:"transform 0.3s cubic-bezier(0.22,1,0.36,1)"}})
      ),
      React.createElement('div',{style:{display:"grid",gridTemplateColumns:"repeat("+steps.length+", 1fr)",padding:"14px 8px",gap:0}},
        steps.map(function(s,i) {
          var isActive = i===step;
          var isPast = step>=0 && i<step;
          var isFuture = step>=0 && i>step;
          var stale = step<0;
          return React.createElement('div',{key:i,style:{display:"flex",flexDirection:"column",alignItems:"center",padding:"0 6px",position:"relative",opacity:stale?0.85:isFuture?0.4:1,transition:"opacity 0.3s"}},
            i<steps.length-1 && React.createElement('div',{style:{position:"absolute",top:18,left:"calc(50% + 18px)",right:"calc(-50% + 18px)",height:2,background:isPast?T.accent:T.border,transition:"background 0.3s"}}),
            React.createElement('div',{style:{width:38,height:38,borderRadius:"50%",background:isActive?T.accent:isPast?T.accent:T.bg,border:"2px solid "+(isActive?T.accent:isPast?T.accent:T.borderMid),display:"flex",alignItems:"center",justifyContent:"center",zIndex:1,marginBottom:8,transition:"all 0.25s",boxShadow:isActive?"0 0 0 4px "+T.accent+"22":"none"}},
              isPast ? React.createElement(Glyph,{name:"check",size:18,color:"#fff"}) : React.createElement('span',{style:{fontFamily:F.body,fontWeight:800,fontSize:12,color:isActive?"#fff":T.textFaint}},String(i+1).padStart(2,"0"))
            ),
            React.createElement('div',{style:{textAlign:"center"}},
              React.createElement('div',{style:{fontFamily:F.body,fontWeight:600,fontSize:11,color:isActive?T.accent:T.text}},s.who),
              React.createElement('div',{style:{fontFamily:F.body,fontSize:10,color:T.textDim,marginTop:3,lineHeight:1.4}},s.what)
            )
          );
        })
      ),
      React.createElement('div',{style:{background:T.surface,padding:"10px 14px",minHeight:38,borderTop:"1px solid "+T.border,display:"flex",alignItems:"center",gap:8}},
        step>=0 ? React.createElement(React.Fragment,null,
          React.createElement(Dot,{color:running?T.accent:T.ok,pulse:running}),
          React.createElement('span',{style:{fontFamily:F.mono,fontSize:11,color:T.textMid}},"["+new Date().toTimeString().slice(0,8)+"] "+steps[step].log)
        ) : React.createElement('span',{style:{fontFamily:F.mono,fontSize:11,color:T.textFaint}},"Press PLAY to run the flow.")
      )
    );
  }

  function useToast() {
    var _a = useState(null), toast = _a[0], setToast = _a[1];
    var timerRef = useRef(null);
    var showToast = function(msg, undo) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({msg:msg,undo:undo});
      timerRef.current = setTimeout(function(){setToast(null)},3000);
    };
    var toastEl = toast ? React.createElement('div',{style:{position:"fixed",bottom:20,right:20,zIndex:999,background:T.text,color:"#fff",padding:"10px 18px",fontFamily:F.body,fontSize:12,fontWeight:600,display:"flex",gap:12,alignItems:"center",boxShadow:"4px 4px 0 "+T.accentBorder+"80"}},
      React.createElement('span',null,toast.msg),
      toast.undo && React.createElement('button',{onClick:function(){toast.undo();setToast(null);},style:{background:"transparent",border:"1px solid #ffffff66",color:"#fff",fontFamily:F.body,fontSize:10,fontWeight:700,padding:"3px 10px",cursor:"pointer"}},"UNDO")
    ) : null;
    return {showToast:showToast,toastEl:toastEl};
  }

  function BriefingView() {
    var _a = useState(BRIEFING.asks.map(function(a,i){return Object.assign({},a,{_id:i})})), asks = _a[0], setAsks = _a[1];
    var _b = useState(new Set()), deferred = _b[0], setDeferred = _b[1];
    var _c = useToast(), showToast = _c.showToast, toastEl = _c.toastEl;

    var approveAsk = function(ask) {
      var prev = asks.slice(); var prevD = new Set(deferred);
      setAsks(function(a){return a.filter(function(x){return x._id!==ask._id})});
      showToast("Approved · "+ask.who, function(){setAsks(prev);setDeferred(prevD)});
    };
    var deferAsk = function(ask) {
      var prev = new Set(deferred);
      setDeferred(function(d){var n=new Set(d);n.add(ask._id);return n});
      showToast("Deferred · "+ask.who, function(){setDeferred(prev)});
    };
    var HL_GLYPHS = {calendar:"calendar_today",inbox:"inbox",market:"trending_up",agents:"hub"};
    var HL_COLORS = {calendar:T.run,inbox:T.accent,market:T.block,agents:T.pilot};

    var demoSteps = [
      {who:"SCHEDULER",what:"05:00 fires",log:"cron 0 5 * * * triggers /gm — Birgit picks up"},
      {who:"BIRGIT",what:"Pull sources",log:"Gmail (12), Calendar (3 events), Telegram (1 anomaly), Notion deltas"},
      {who:"Q",what:"Synthesize",log:"/synthesize → 4 highlights + 3 asks · 280 tokens out, $0.018"},
      {who:"HANS",what:"Guardrail",log:"PII scrub on previews · no leaked OAuth · ALLOW"},
      {who:"BRIDGE",what:"Dispatch",log:"Text → Telegram thread · Voice → ElevenLabs TTS · ready 1:24"}
    ];
    var briefingExplainer = [
      {who:"OVERNIGHT",glyph:"nights_stay",desc:"Email lands. Events shift. Markets move. Agents work."},
      {who:"05:00",glyph:"alarm",desc:"Scheduler hook fires. Birgit picks up the request."},
      {who:"PULL",glyph:"download",desc:"Read every connected source. Last 24h window."},
      {who:"Q",glyph:"experiment",desc:"Synthesise into 4 highlights · 3 asks · one paragraph."},
      {who:"HANS",glyph:"shield",desc:"Guardrail scrub. No PII slips into voice file."},
      {who:"YOU",glyph:"phone_iphone",desc:"Reads on Telegram. Voice or text. Asks bubble up."}
    ];

    return React.createElement('div',{style:{padding:"24px",maxWidth:1080}},
      toastEl,
      React.createElement(SectionTitle,{kicker:"DAILY · 05:00 · BIRGIT",title:"THE MORNING BRIEFING.",accent:"/gm",sub:"What you'd otherwise have to assemble yourself — overnight comms, calendar, market deltas, agent work. Birgit reads it to you via Telegram voice if you ask."}),
      React.createElement('div',{style:{marginBottom:18}},
        React.createElement(FlowDemoStrip,{title:"HOW /gm IS BUILT",kicker:"Scheduler → Pull → Synthesize → Guardrail → Dispatch",steps:demoSteps})
      ),
      React.createElement('div',{style:{display:"grid",gridTemplateColumns:"minmax(0,1fr) 280px",gap:18,marginBottom:18}},
        React.createElement('div',{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))",gap:1,background:T.border,alignSelf:"start"}},
          [{l:"DATE",v:BRIEFING.date,c:T.text},{l:"DELIVERED",v:BRIEFING.time,c:T.text,mono:true},{l:"OWNER",v:BRIEFING.agent,c:T.accent},{l:"FORMAT",v:"voice + text",c:T.textMid,mono:true}].map(function(k){return React.createElement('div',{key:k.l,style:{background:T.bg,padding:"10px 12px"}},
            React.createElement('div',{style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:"0.14em",marginBottom:5}},k.l),
            React.createElement('div',{style:{fontFamily:k.mono?F.mono:F.display,fontSize:k.mono?15:18,color:k.c,letterSpacing:k.mono?"0":"0.04em"}},k.v)
          );})
        ),
        React.createElement('aside',null,
          React.createElement(FlowExplainer,{kicker:"RECIPE · OVERNIGHT TO POCKET",title:"The morning, assembled.",steps:briefingExplainer,dense:true})
        )
      ),
      React.createElement('div',{style:{fontFamily:F.body,fontSize:11,fontWeight:700,color:T.accentDark,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:10}},"HIGHLIGHTS"),
      React.createElement('div',{style:{display:"grid",gap:10,marginBottom:24}},
        BRIEFING.highlights.map(function(h,i){return React.createElement('div',{key:i,style:{display:"grid",gridTemplateColumns:"48px minmax(0,1fr)",gap:14,background:T.bg,border:"1px solid "+T.border,borderTop:"2px solid "+HL_COLORS[h.kind],padding:"14px 16px"}},
          React.createElement('div',{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:4}},
            React.createElement(Glyph,{name:HL_GLYPHS[h.kind],size:26,color:HL_COLORS[h.kind]}),
            React.createElement('span',{style:{fontFamily:F.mono,fontSize:8,color:HL_COLORS[h.kind],letterSpacing:"0.08em",fontWeight:700}},h.kind.toUpperCase())
          ),
          React.createElement('div',null,
            React.createElement('div',{style:{fontFamily:F.body,fontWeight:700,fontSize:16,color:T.text,lineHeight:1.1,marginBottom:6}},h.title),
            React.createElement('div',{style:{fontFamily:F.body,fontSize:13,color:T.textMid,lineHeight:1.55}},h.body)
          )
        );})
      ),
      React.createElement('div',{style:{fontFamily:F.body,fontSize:11,fontWeight:700,color:T.accentDark,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:10}},"WAITING ON YOU · "+asks.filter(function(a){return!deferred.has(a._id)}).length+" ASKS"),
      asks.length === 0 ? React.createElement('div',{style:{border:"1px solid "+T.border,background:T.bg,padding:"16px",fontFamily:F.body,fontSize:12,color:T.textDim,textAlign:"center",marginBottom:20}},"All caught up — no open asks.") :
      React.createElement('div',{style:{border:"1px solid "+T.accentBorder,background:T.accentLight,marginBottom:20}},
        asks.map(function(a,i){var isDef=deferred.has(a._id);return React.createElement('div',{key:a._id,style:{display:"grid",gridTemplateColumns:"80px minmax(0,1fr) auto auto",gap:14,alignItems:"center",padding:"12px 16px",opacity:isDef?0.5:1,borderBottom:i<asks.length-1?"1px solid "+T.accentBorder:"none"}},
          React.createElement('span',{style:{fontFamily:F.body,fontWeight:600,fontSize:14,color:T.accent}},a.who),
          React.createElement('span',{style:{fontFamily:F.body,fontSize:13,color:T.text}},a.q),
          React.createElement(Pill,{label:isDef?"DEFERRED":a.urgency,color:isDef?T.textDim:a.urgency==="P1"?T.block:a.urgency==="P2"?T.accent:T.textDim}),
          isDef ? React.createElement('span',{style:{fontFamily:F.mono,fontSize:10,color:T.textDim,padding:"5px 12px"}},"—") :
          React.createElement('div',{style:{display:"flex",gap:5}},
            React.createElement('button',{className:'sid-btn',onClick:function(){approveAsk(a)},'aria-label':'Approve: '+a.q,style:{background:T.accent,border:"none",color:"#fff",fontFamily:F.body,fontSize:10,fontWeight:700,padding:"5px 12px",cursor:"pointer",letterSpacing:"0.05em"}},"APPROVE"),
            React.createElement('button',{className:'sid-btn',onClick:function(){deferAsk(a)},'aria-label':'Defer: '+a.q,style:{background:"transparent",border:"1px solid "+T.accentBorder,color:T.accent,fontFamily:F.body,fontSize:10,fontWeight:700,padding:"5px 12px",cursor:"pointer",letterSpacing:"0.05em"}},"DEFER")
          )
        );})
      ),
      React.createElement('div',{style:{fontFamily:F.body,fontSize:11,fontWeight:700,color:T.accentDark,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:10}},"DELIVERED · TELEGRAM · 05:00"),
      React.createElement('div',{style:{background:T.ink,padding:14,borderRadius:6,display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:8,alignItems:"flex-start"}},
        React.createElement('div',{style:{background:"#182533",color:"#fff",padding:"10px 14px",borderRadius:8}},
          React.createElement('div',{style:{display:"flex",alignItems:"center",gap:5,marginBottom:5}},
            React.createElement(Dot,{color:T.accent,size:5}),
            React.createElement('span',{style:{fontFamily:F.body,fontSize:10,color:T.accent,fontWeight:700}},"BIRGIT · 05:00")
          ),
          React.createElement('div',{style:{fontFamily:F.body,fontSize:12,lineHeight:1.5}},"☀️ Briefing ready. 3 meetings today, 5 inbox items (2 P1), Meta Ads anomaly on EU campaign. Three asks waiting on you.")
        ),
        React.createElement('div',{style:{background:"#182533",color:"#fff",padding:"12px 14px",borderRadius:8}},
          React.createElement('div',{style:{display:"flex",alignItems:"center",gap:5,marginBottom:7}},
            React.createElement(Dot,{color:T.accent,size:5}),
            React.createElement('span',{style:{fontFamily:F.body,fontSize:10,color:T.accent,fontWeight:700}},"BIRGIT · VOICE · 1:24")
          ),
          React.createElement('div',{style:{display:"flex",alignItems:"center",gap:9}},
            React.createElement(Glyph,{name:"play_arrow",size:20,color:"#fff"}),
            React.createElement('div',{style:{flex:1,display:"flex",gap:2,alignItems:"center"}},
              [5,9,12,8,14,10,7,12,9,11,6,13,8,11,9,12,7,10,8,11,5,9,12,8,14,10,7].map(function(h,j){return React.createElement('span',{key:j,style:{display:"inline-block",width:2,height:h,background:"#fff",opacity:0.85}})})
            ),
            React.createElement('span',{style:{fontFamily:F.mono,fontSize:11}},"0:00")
          )
        )
      ),
      React.createElement('div',{style:{marginTop:20,display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:T.surface,border:"1px solid "+T.border}},
        React.createElement(Glyph,{name:"mic",size:20,color:T.accent}),
        React.createElement('span',{style:{fontFamily:F.body,fontSize:12,color:T.textMid,flex:1}},"Want it read aloud? Birgit will dispatch a 90-second voice version to Telegram."),
        React.createElement('button',{className:'sid-btn',style:{background:T.text,border:"none",color:"#fff",fontFamily:F.body,fontSize:11,fontWeight:700,padding:"7px 14px",cursor:"pointer",letterSpacing:"0.06em"}},"PLAY · 1:24")
      )
    );
  }

  window.__HERMES_PLUGINS__.register('sid-briefing', BriefingView);
})();
