(function() {
  'use strict';
  var React = window.__HERMES_PLUGIN_SDK__.React;
  var hooks = window.__HERMES_PLUGIN_SDK__.hooks;
  var useState = hooks.useState;
  var useEffect = hooks.useEffect;
  var useRef = hooks.useRef;
  var useCallback = hooks.useCallback;
  var useMemo = hooks.useMemo;

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

  /* ─── Design Tokens ─── */
  var T = {bg:"#FAFAF8",surface:"#F3F3F0",surfaceHigh:"#EAEAE6",border:"#E2E2DE",borderMid:"#C8C8C3",borderStrong:"#9A9A95",accent:"#E07340",accentLight:"#FFF4ED",accentDark:"#B85A28",accentBorder:"#F0A060",text:"#111110",textMid:"#4A4A48",textDim:"#8A8A87",textFaint:"#C0C0BC",ok:"#16A34A",okLight:"#DCFCE7",run:"#0284C7",runLight:"#E0F2FE",block:"#DC2626",blockLight:"#FEE2E2",pilot:"#7C3AED",pilotLight:"#EDE9FE",done:"#71717A",doneLight:"#F4F4F5",ink:"#1B1A18",inkSurface:"#262522"};
  var F = {display:"'DM Sans', system-ui, sans-serif", body:"'DM Sans', system-ui, sans-serif", mono:"'JetBrains Mono', monospace"};

  /* ─── Unicode Icon Map ─── */
  var ICON = {hub:"◎",inbox:"📥",mail:"✉",calendar_today:"📅",send:"📤",edit_square:"✏️",person:"👤",check_circle:"✓",shield:"🛡",alt_route:"→",play_arrow:"▶",category:"🏷",download:"↓",experiment:"🔬",terminal:"⌘",work:"💼",folder_open:"📂",wifi:"◉",battery_full:"▮",arrow_back:"←",more_vert:"⋮",attach_file:"+",mic:"🎤",play_circle:"▶",school:"🎓",backpack:"🎒",extension:"🔌",psychology:"🧠",receipt_long:"📋",stop_circle:"⏹",input:"📥",gavel:"⚖",history_edu:"📜",toll:"💰",emergency:"🚨",power:"⏻",upgrade:"⬆",scatter_plot:"⚡",folder:"📁",build:"🔧",account_tree:"🌳",language:"🌐",forum:"💬",smart_toy:"🤖",tag:"🏷",api:"🔗",library_books:"📚",description:"📄",code:"💻",event:"📅",chat:"💬",travel_explore:"🔍",trending_up:"📈",verified:"✅",play_lesson:"📖",menu_book:"📖",schema:"📊",rocket_launch:"🚀",contact_support:"❓",link:"🔗",verified_user:"🛡",monitoring:"📊",military_tech:"🎖",how_to_reg:"✅",warning:"⚠",flash_on:"⚡",compare_arrows:"↔",reply:"←",visibility:"👁",add_circle:"➕",search:"🔍",history:"📜",nights_stay:"🌙",alarm:"⏰",phone_iphone:"📱",check:"✓",group:"👥",badge:"🎖",science:"🔬",settings_input_component:"🔌"};

  /* ─── AGENTS ─── */
  var AGENTS = [
    {id:"jarvis",name:"JARVIS",status:"active",model:"Sonnet",role:"Orchestrator",glyph:"hub",domain:"Routes every request to exactly one specialist. Never executes work itself.",skills:["/route","/dispatch","/wrap"],keywords:[],voice:"Calm, terse. British butler.",memoryCount:847,lastActive:"now"},
    {id:"birgit",name:"Birgit",status:"active",model:"Sonnet",role:"Personal Ops",glyph:"inbox",domain:"Inbox, calendar, meeting prep, short replies.",skills:["/gm","/triage","/reply","/prep"],keywords:["email","inbox","calendar","meeting","reply","triage","schedule","prep","briefing"],voice:"Warm, efficient.",memoryCount:1240,lastActive:"2m ago"},
    {id:"kenji",name:"Kenji",status:"active",model:"Haiku",role:"Workspace",glyph:"folder_open",domain:"Notion, schemas, knowledge base, persona lifecycle.",skills:["/file","/schema","/index","/promote"],keywords:["notion","schema","database","page","knowledge","file","organise","tag"],voice:"Quiet. Surgical.",memoryCount:2103,lastActive:"5m ago"},
    {id:"kumar",name:"Kumar",status:"active",model:"Sonnet",role:"Build",glyph:"terminal",domain:"Code, infra, Café Platform, eval harness, deploys.",skills:["/eval","/deploy","/diff","/test"],keywords:["code","build","deploy","github","eval","cafe","infra","ci","bug","fix"],voice:"Precise. Loves diffs.",memoryCount:894,lastActive:"23m ago"},
    {id:"q",name:"Q",status:"active",model:"Opus",role:"Research",glyph:"experiment",domain:"Research, briefs, decisions, long-form prose.",skills:["/brief","/decide","/synthesize","/draft","/visualise"],keywords:["research","write","brief","decide","draft","analyse","essay","synthesise"],voice:"Considered. Cites sources.",memoryCount:612,lastActive:"1h ago"},
    {id:"claire",name:"Claire",status:"piloting",model:"Sonnet",role:"ISC / Work",glyph:"work",domain:"ISC, SIOP, ABB, supply-chain ops, team 1:1s.",skills:["/siop","/coach","/standup"],keywords:["isc","siop","abb","sunrise","supply","coaching","1:1","team"],voice:"Strategic.",memoryCount:340,lastActive:"3h ago"},
    {id:"hans",name:"Hans",status:"piloting",model:"Haiku",role:"Governance",glyph:"shield",domain:"Security, privacy, cost cap, audit log, kill switches.",skills:["/guardrail","/cost","/redact"],keywords:["security","privacy","legal","behörden","audit","cost","redact","gdpr","leak"],voice:"Stern. Will block.",memoryCount:528,lastActive:"14m ago"}
  ];

  function autoRoute(title) {
    var t = (title||"").toLowerCase();
    var scored = AGENTS.filter(function(a){return a.id!=="jarvis"})
      .map(function(a){return {id:a.id,name:a.name,score:a.keywords.filter(function(k){return t.includes(k)}).length}});
    var best = scored.reduce(function(a,b){return b.score>a.score?b:a},{id:"jarvis",name:"JARVIS",score:0});
    return best.score > 0 ? best : {id:"jarvis",name:"JARVIS"};
  }

  /* ─── SEED INBOX ─── */
  var SEED_INBOX = [
    {id:1,title:"Telekom invoice — renewal query",source:"Email",status:"queued",priority:"P1",routed:null,classified:null,age:"4m"},
    {id:2,title:"ISC team sync — Thursday prep",source:"Calendar",status:"queued",priority:"P1",routed:null,classified:null,age:"12m"},
    {id:3,title:"AI OS v3 deploy notes — document",source:"Manual",status:"running",priority:"P2",routed:"kumar",classified:"Project",age:"1h"},
    {id:4,title:"Dentist — reschedule needed",source:"Manual",status:"blocked",priority:"P2",routed:"birgit",classified:"Task",age:"2h"},
    {id:5,title:"RWTH application — essay draft",source:"Manual",status:"queued",priority:"P1",routed:null,classified:null,age:"3h"},
    {id:6,title:"Q4 SIOP review pack",source:"Calendar",status:"running",priority:"P1",routed:"claire",classified:"Project",age:"4h"},
    {id:7,title:"Meta Ads anomaly — 280% CPM spike",source:"Telegram",status:"blocked",priority:"P1",routed:"hans",classified:"Task",age:"5h"},
    {id:8,title:"Weekly review pack → Sid",source:"Manual",status:"done",priority:"P2",routed:"jarvis",classified:"Project",age:"yest"},
  ];

  /* ─── Primitives ─── */
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
    var name = props.name;
    var ch = ICON[name] || "•";
    return React.createElement('span',{style:{fontSize:props.size||16,color:props.color||T.textMid,lineHeight:1,display:"inline-block"}},ch);
  }
  function SectionTitle(props) {
    return React.createElement('div',{style:{marginBottom:14}},
      props.kicker && React.createElement('div',{style:{fontFamily:F.body,fontSize:11,fontWeight:700,color:T.accentDark,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:6}},props.kicker),
      React.createElement('div',{style:{fontFamily:F.body,fontWeight:800,fontSize:20,color:T.text,letterSpacing:"0.01em",lineHeight:1}},props.title,props.accent && React.createElement('span',{style:{color:T.accent}}," ",props.accent)),
      props.sub && React.createElement('div',{style:{fontFamily:F.body,fontSize:12,color:T.textDim,marginTop:8,lineHeight:1.5,maxWidth:680}},props.sub)
    );
  }
  /* ─── FlowExplainer ─── */
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

  /* ─── EcosystemFunnel ─── */
  function FunnelArrows() {
    return React.createElement('div',{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:2,position:"relative",height:30}},
      [0,1,2].map(function(i){return React.createElement('span',{key:i,style:{width:0,height:0,borderTop:"6px solid transparent",borderBottom:"6px solid transparent",borderLeft:"8px solid "+T.accent,opacity:0.85}});})
    );
  }
  function EcosystemFunnel(props) {
    var sources = props.sources;
    var destination = props.destination;
    var dest_label = props.dest_label || "SG INBOX";
    return React.createElement('div',{style:{background:T.bg,border:"1px solid "+T.border,padding:"14px 16px"}},
      React.createElement('div',{style:{display:"grid",gridTemplateColumns:"1fr 80px 1fr 80px 1fr",gap:12,alignItems:"center"}},
        React.createElement('div',{style:{display:"flex",flexDirection:"column",gap:5}},
          React.createElement('div',{style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:3}},"SOURCES"),
          sources.map(function(s){return React.createElement('div',{key:s.name,style:{display:"flex",alignItems:"center",gap:7,background:T.surface,border:"1px solid "+T.border,padding:"6px 10px"}},
            React.createElement(Glyph,{name:s.glyph,size:13,color:T.textMid}),
            React.createElement('span',{style:{fontFamily:F.body,fontSize:11,color:T.text,fontWeight:500,flex:1}},s.name),
            React.createElement(Dot,{color:s.live?T.ok:T.textFaint,size:5})
          );})
        ),
        React.createElement(FunnelArrows),
        React.createElement('div',{style:{background:T.accentLight,border:"2px solid "+T.accent,padding:"16px 18px",textAlign:"center"}},
          React.createElement(Glyph,{name:destination.glyph||"inbox",size:28,color:T.accent}),
          React.createElement('div',{style:{fontFamily:F.body,fontWeight:800,fontSize:15,color:T.accent,letterSpacing:"0.06em",marginTop:6}},dest_label),
          React.createElement('div',{style:{fontFamily:F.body,fontSize:11,color:T.accentDark,marginTop:4}},destination.note)
        ),
        React.createElement(FunnelArrows),
        React.createElement('div',{style:{display:"flex",flexDirection:"column",gap:5}},
          React.createElement('div',{style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:3}},"ROUTES TO"),
          destination.routes.map(function(r){var a=AGENTS.find(function(x){return x.id===r});return React.createElement('div',{key:r,style:{display:"flex",alignItems:"center",gap:7,background:T.bg,border:"1px solid "+T.border,padding:"6px 10px"}},
            React.createElement(Glyph,{name:a.glyph,size:13,color:T.accent}),
            React.createElement('span',{style:{fontFamily:F.body,fontSize:11,color:T.text,fontWeight:500,flex:1}},a.name),
            React.createElement('span',{style:{fontFamily:F.mono,fontSize:9,color:T.textDim}},a.role)
          );})
        )
      )
    );
  }

  /* ─── Toast ─── */
  function useToast() {
    var _a = useState(null), toast = _a[0], setToast = _a[1];
    var timerRef = useRef(null);
    var showToast = useCallback(function(msg, undo) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({msg:msg,undo:undo});
      timerRef.current = setTimeout(function(){setToast(null)},3000);
    },[]);
    var toastEl = toast ? React.createElement('div',{style:{position:"fixed",bottom:20,right:20,zIndex:999,background:T.text,color:"#fff",padding:"10px 18px",fontFamily:F.body,fontSize:12,fontWeight:600,display:"flex",gap:12,alignItems:"center",boxShadow:"4px 4px 0 "+T.accentBorder+"80"}},
      React.createElement('span',null,toast.msg),
      toast.undo && React.createElement('button',{onClick:function(){toast.undo();setToast(null);},style:{background:"transparent",border:"1px solid #ffffff66",color:"#fff",fontFamily:F.body,fontSize:10,fontWeight:700,padding:"3px 10px",cursor:"pointer"}},"UNDO")
    ) : null;
    return {showToast:showToast,toastEl:toastEl};
  }

  /* ═══════════════════════════════════════════════════════════════
     INBOX VIEW
  ═══════════════════════════════════════════════════════════════ */
  function InboxView() {
    var _a = useState(SEED_INBOX), items = _a[0], setItems = _a[1];
    var _b = useState(null), classifying = _b[0], setClassifying = _b[1];
    var _c = useToast(), showToast = _c.showToast, toastEl = _c.toastEl;

    var route = function(id) {
      var item = items.find(function(i){return i.id===id}); if(!item) return;
      var ag = autoRoute(item.title);
      var prev = Object.assign({},item);
      setItems(function(prevItems){return prevItems.map(function(i){return i.id===id?Object.assign({},i,{status:"running",routed:ag.id}):i})});
      showToast("→ Routed to "+ag.name, function(){setItems(function(all){return all.map(function(i){return i.id===id?prev:i})})});
    };
    var classify = function(id, type) {
      var item = items.find(function(i){return i.id===id}); if(!item) return;
      var prev = Object.assign({},item);
      setItems(function(all){return all.map(function(i){return i.id===id?Object.assign({},i,{classified:type}):i})});
      setClassifying(null);
      showToast("Classified as "+type, function(){setItems(function(all){return all.map(function(i){return i.id===id?prev:i})})});
    };
    var queued = items.filter(function(i){return i.status==="queued"}).length;
    var itemLifecycle = [
      {who:"INBOUND",glyph:"download",desc:"Email, Telegram, Calendar event, or you typing."},
      {who:"CLASSIFY",glyph:"category",desc:"Task / Note / Project / Reference / Trash. One label."},
      {who:"ROUTE",glyph:"alt_route",desc:"Auto-Assign matches keywords → one specialist."},
      {who:"EXECUTE",glyph:"play_arrow",desc:"Specialist runs the right skill. Drafts only."},
      {who:"GATE",glyph:"shield",desc:"You (or Hans) approve. Outbound stays human-gated."},
      {who:"CLOSE",glyph:"check_circle",desc:"Status → DONE. Filed. Audit row written."}
    ];
    var sources = [
      {name:"Email",glyph:"mail",live:true},
      {name:"Calendar",glyph:"calendar_today",live:true},
      {name:"Telegram",glyph:"send",live:true},
      {name:"Manual",glyph:"edit_square",live:true}
    ];
    var destination = {glyph:"inbox",note:"One queue. Untriaged surfaces first.",routes:["birgit","kumar","q","claire","hans"]};

    return React.createElement('div',{style:{padding:"24px"}},
      toastEl,
      React.createElement('div',{style:{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:14}},
        React.createElement(SectionTitle,{kicker:"ONE FRONT DOOR · ALL CHANNELS",title:"SG INBOX.",accent:"EVERYTHING LANDS HERE FIRST.",sub:"Every channel funnels into a single triage queue. The classifier suggests a route. Nothing leaves your hands without a decision."}),
        React.createElement('div',{style:{display:"flex",gap:6,alignItems:"center"}},
          React.createElement(Pill,{label:"NOTION-SHAPED",color:T.textDim,mono:true}),
          React.createElement(Pill,{label:queued+" UNTRIAGED",color:queued>0?T.accentDark:T.ok,mono:true})
        )
      ),
      React.createElement('div',{style:{marginBottom:18}},
        React.createElement('div',{style:{fontFamily:F.body,fontSize:11,fontWeight:700,color:T.accentDark,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:8}},"CHANNELS IN · OWNERS OUT"),
        React.createElement(EcosystemFunnel,{sources:sources,destination:destination,dest_label:"SG INBOX"})
      ),
      React.createElement('div',{style:{display:"grid",gridTemplateColumns:"minmax(0,1fr) 280px",gap:18}},
        React.createElement('div',null,
          React.createElement('div',{style:{fontFamily:F.body,fontSize:11,fontWeight:700,color:T.accentDark,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:8}},"QUEUE · "+items.length+" ITEMS"),
          React.createElement('div',{style:{border:"1px solid "+T.border}},
            items.map(function(item,i) {
              var ag = AGENTS.find(function(a){return a.id===item.routed});
              var rowBg = item.status==="blocked"?T.blockLight:item.status==="running"?T.runLight:item.status==="done"?T.okLight:T.bg;
              return React.createElement('div',{key:item.id,style:{borderBottom:i<items.length-1?"1px solid "+T.border:"none"}},
                React.createElement('div',{style:{padding:"11px 14px",display:"flex",gap:12,alignItems:"flex-start",background:rowBg}},
                  React.createElement('div',{style:{flex:1,minWidth:0}},
                    React.createElement('div',{style:{fontFamily:F.body,fontSize:13,fontWeight:500,color:T.text,lineHeight:1.3,marginBottom:5}},item.title),
                    React.createElement('div',{style:{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}},
                      React.createElement(StatusPill,{status:item.status}),
                      React.createElement(Pill,{label:item.priority,color:item.priority==="P1"?T.block:T.textDim}),
                      React.createElement(Pill,{label:item.source,color:T.textDim}),
                      React.createElement('span',{style:{fontFamily:F.mono,fontSize:10,color:T.textFaint}},item.age),
                      ag && React.createElement('span',{style:{fontFamily:F.body,fontSize:11,fontWeight:600,color:T.accentDark}},"→ "+ag.name),
                      item.classified && React.createElement(Pill,{label:item.classified,color:T.ok})
                    )
                  ),
                  item.status!=="done" && React.createElement('div',{style:{display:"flex",gap:5,flexShrink:0}},
                    React.createElement('button',{className:'sid-btn',onClick:function(){setClassifying(classifying===item.id?null:item.id)},style:{background:T.surface,border:"1px solid "+T.border,color:T.textMid,fontFamily:F.body,fontSize:10,fontWeight:700,padding:"4px 8px",cursor:"pointer",letterSpacing:"0.04em"}},"CLASSIFY"),
                    React.createElement('button',{className:'sid-btn',onClick:function(){route(item.id)},'aria-label':'Route item',style:{background:T.accentLight,border:"1px solid "+T.accentBorder,color:T.accent,fontFamily:F.body,fontSize:10,fontWeight:700,padding:"4px 8px",cursor:"pointer",letterSpacing:"0.04em"}},"ROUTE")
                  )
                ),
                classifying===item.id && React.createElement('div',{style:{padding:"8px 14px",background:T.surface,borderTop:"1px solid "+T.border,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}},
                  React.createElement('span',{style:{fontFamily:F.body,fontSize:10,color:T.textDim,marginRight:4,fontWeight:600}},"CLASSIFY AS:"),
                  ["Task","Note","Project","Reference","Trash"].map(function(type){return React.createElement('button',{key:type,className:'sid-btn',onClick:function(){classify(item.id,type)},'aria-label':'Classify as '+type,style:{background:"none",border:"1px solid "+(type==="Trash"?T.block:T.border),color:type==="Trash"?T.block:T.textMid,fontFamily:F.body,fontSize:10,fontWeight:700,padding:"3px 9px",cursor:"pointer",letterSpacing:"0.04em"}},type.toUpperCase());})
                )
              );
            })
          )
        ),
        React.createElement('aside',null,
          React.createElement(FlowExplainer,{kicker:"LIFECYCLE · ONE ITEM",title:"From inbound to closed.",steps:itemLifecycle,dense:true})
        )
      )
    );
  }

  window.__HERMES_PLUGINS__.register('sid-inbox', InboxView);
})();