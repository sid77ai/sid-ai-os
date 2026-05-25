(function() {
  'use strict';

  var React = window.__HERMES_PLUGIN_SDK__.React;
  var api = window.__HERMES_PLUGIN_SDK__.api;
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
  var F = { display:"'Bebas Neue', sans-serif", body:"'DM Sans', system-ui, sans-serif", mono:"'JetBrains Mono', 'Fira Code', monospace" };

  var _injected = false;
  function injectStyles() {
    if (_injected || typeof document === 'undefined') return;
    _injected = true;
    if (!document.querySelector('link\[href\*="Material+Symbols+Outlined"\]')) {
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

  function Dot({ color, size, pulse }) {
    return React.createElement('span', { style:{display:'inline-block', width:size||8, height:size||8, borderRadius:'50%', background:color, flexShrink:0, animation:pulse?'pulse 1.6s ease-in-out infinite':'none'} });
  }
  function Glyph({ name, size, color, weight }) {
    size = size||16; color = color||T.textMid; weight = weight||200;
    return React.createElement('span', { className:'ms', style:{fontFamily:"'Material Symbols Outlined'", fontVariationSettings:"'FILL' 0,'wght' "+weight+",'GRAD' 0,'opsz' "+size, fontSize:size, color:color, lineHeight:1, display:'inline-block'} }, name);
  }
  function Pill({ label, color, bg }) {
    return React.createElement('span', { style:{fontFamily:F.body, fontSize:11, fontWeight:500, color:color||T.textDim, background:bg||T.surface, border:'1px solid '+(color||T.textDim)+'30', padding:'1px 7px', borderRadius:3, lineHeight:1.7, whiteSpace:'nowrap'} }, label);
  }
  function SectionTitle({ kicker, title, accent, sub }) {
    return React.createElement('div', { style:{marginBottom:14} },
      kicker && React.createElement('div', { style:{fontFamily:F.body, fontSize:11, fontWeight:700, color:T.accentDark, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:6} }, kicker),
      React.createElement('div', { style:{fontFamily:F.display, fontSize:24, color:T.text, letterSpacing:'0.04em', lineHeight:1} }, title, accent && React.createElement('span', { style:{color:T.accent} }, ' '+accent)),
      sub && React.createElement('div', { style:{fontFamily:F.body, fontSize:12, color:T.textDim, marginTop:8, lineHeight:1.5, maxWidth:680} }, sub)
    );
  }
  function Card({ children, accent, padding, style }) {
    return React.createElement('div', { style:Object.assign({background:T.bg, border:'1px solid '+T.border, borderTop:accent?'2px solid '+T.accent:undefined, padding:padding||'16px'}, style||{}) }, children);
  }

  var AGENTS = [
    { id:"jarvis", name:"JARVIS", status:"active", model:"Sonnet", role:"Orchestrator", glyph:"hub", lastActive:"now" },
    { id:"birgit", name:"Birgit", status:"active", model:"Sonnet", role:"Personal Ops", glyph:"inbox", lastActive:"2m ago" },
    { id:"kenji", name:"Kenji", status:"active", model:"Haiku", role:"Workspace", glyph:"folder_open", lastActive:"5m ago" },
    { id:"kumar", name:"Kumar", status:"active", model:"Sonnet", role:"Build", glyph:"terminal", lastActive:"23m ago" },
    { id:"q", name:"Q", status:"active", model:"Opus", role:"Research", glyph:"experiment", lastActive:"1h ago" },
    { id:"claire", name:"Claire", status:"piloting", model:"Sonnet", role:"ISC / Work", glyph:"work", lastActive:"3h ago" },
    { id:"hans", name:"Hans", status:"piloting", model:"Haiku", role:"Governance", glyph:"shield", lastActive:"14m ago" },
  ];

  function ModelGlyph({ model }) {
    var color = model==='Haiku'?T.run:model==='Sonnet'?T.accent:T.pilot;
    return React.createElement('span', { style:{width:8, height:8, borderRadius:'50%', background:color, display:'inline-block', marginRight:4, verticalAlign:'middle'} });
  }

  function SpecialistCard({ agent, selected, onSelect }) {
    var statusColor = agent.status === 'active' ? T.ok : T.pilot;
    return React.createElement('button', { onClick:onSelect, style:{background:selected?T.accentLight:T.surface, border:'1px solid '+(selected?T.accent:T.border), padding:'12px 8px', cursor:'pointer', textAlign:'left', transition:'all 0.15s', minWidth:0} },
      React.createElement('div', { style:{display:'flex', alignItems:'center', gap:7, marginBottom:6} },
        React.createElement(Glyph, { name:agent.glyph, size:18, color:T.accent }),
        React.createElement('span', { style:{fontFamily:F.display, fontSize:16, color:T.text, letterSpacing:'0.04em', minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'} }, agent.name),
        React.createElement(Dot, { color:statusColor, size:6 })
      ),
      React.createElement('div', { style:{fontFamily:F.body, fontSize:10, color:T.textDim, lineHeight:1.4, marginBottom:6} }, agent.role),
      React.createElement('div', { style:{fontFamily:F.mono, fontSize:9, color:T.textFaint, letterSpacing:'0.04em'} }, agent.model.toUpperCase())
    );
  }

  function AgentsView() {
    var _a = useState(null), sel = _a[0], setSel = _a[1];
    var agents = AGENTS;
    var agent = agents.find(function(a) { return a.id === sel; });
    var jarvis = agents.find(function(a) { return a.id === 'jarvis'; });
    var specialists = agents.filter(function(a) { return a.id !== 'jarvis'; });

    var flow = [
      { who:"YOU", glyph:"keyboard", desc:"Capture a request \u2014 voice, text, email." },
      { who:"JARVIS", glyph:"hub", desc:"Classifies + routes. Never executes." },
      { who:"SPECIALIST", glyph:"group", desc:"One owner drafts the work." },
      { who:"YOU", glyph:"check_circle", desc:"Approve, edit, or cancel before send." },
    ];

    return React.createElement('div', { style:{padding:'24px'} },
      React.createElement(SectionTitle, { kicker:'ROSTER \u00b7 1 ORCHESTRATOR + 6 SPECIALISTS', title:'THE TEAM.', accent:'ONE ROUTER. SIX EXPERTS. ONE OWNER PER TASK.', sub:'Click any card to open the detail panel. Pilots run shadow-mode 14 days before promotion.' } ),

      // Org Chart
      jarvis && React.createElement('div', { style:{background:T.bg, border:'1px solid '+T.border, padding:'28px 28px 22px'} },
        // YOU
        React.createElement('div', { style:{display:'flex', justifyContent:'center'} },
          React.createElement('div', { style:{display:'inline-flex', alignItems:'center', gap:9, background:T.surface, border:'1px solid '+T.borderMid, padding:'7px 16px'} },
            React.createElement(Glyph, { name:'person', size:14, color:T.textMid }),
            React.createElement('span', { style:{fontFamily:F.display, fontSize:14, color:T.text, letterSpacing:'0.1em'} }, 'YOU'),
            React.createElement('span', { style:{fontFamily:F.mono, fontSize:9.5, color:T.textDim, letterSpacing:'0.04em'} }, '\u00b7 captures \u00b7 approves \u00b7 gates')
          )
        ),
        // Stem
        React.createElement('div', { style:{display:'flex', justifyContent:'center'} },
          React.createElement('div', { style:{width:1, height:22, background:T.borderMid} })
        ),
        // JARVIS
        React.createElement('div', { style:{display:'flex', justifyContent:'center'} },
          React.createElement('button', { onClick:function() { setSel('jarvis'); }, style:{display:'flex', alignItems:'center', gap:18, background:sel==='jarvis'?T.accent:T.text, color:'#fff', border:'none', padding:'16px 28px', cursor:'pointer', transition:'background 0.15s', minWidth:340} },
            React.createElement(Glyph, { name:'hub', size:34, color:'#fff', weight:300 }),
            React.createElement('div', { style:{textAlign:'left', flex:1} },
              React.createElement('div', { style:{display:'flex', alignItems:'baseline', gap:10} },
                React.createElement('span', { style:{fontFamily:F.display, fontSize:34, letterSpacing:'0.08em', lineHeight:1} }, 'JARVIS'),
                React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:'#ffffff99', letterSpacing:'0.05em'} }, 'Sonnet')
              ),
              React.createElement('div', { style:{fontFamily:F.body, fontSize:11, color:'#ffffffbb', marginTop:6, letterSpacing:'0.08em', fontWeight:600} }, 'ORCHESTRATOR \u00b7 ROUTES, NEVER EXECUTES')
            ),
            React.createElement(Dot, { color:T.accent, pulse:true, size:10 })
          )
        ),
        // Connector tree
        React.createElement('div', { style:{position:'relative', height:36, marginTop:0} },
          React.createElement('div', { style:{position:'absolute', left:'calc(50% - 1px)', top:0, width:2, height:18, background:T.accent} }),
          React.createElement('div', { style:{position:'absolute', left:'calc('+(100/specialists.length/2)+'%)', right:'calc('+(100/specialists.length/2)+'%)', top:16, height:2, background:T.accent} }),
          specialists.map(function(_, i) {
            return React.createElement('div', { key:i, style:{position:'absolute', left:'calc('+((i+0.5)*100/specialists.length)+'% - 1px)', top:16, width:2, height:20, background:T.accent} });
          })
        ),
        // Specialist cards
        React.createElement('div', { style:{display:'grid', gridTemplateColumns:'repeat('+specialists.length+', minmax(0,1fr))', gap:8} },
          specialists.map(function(a) {
            return React.createElement(SpecialistCard, { key:a.id, agent:a, selected:sel===a.id, onSelect:function() { setSel(a.id); } });
          })
        ),
        // Legend
        React.createElement('div', { style:{display:'flex', flexWrap:'wrap', gap:18, marginTop:18, paddingTop:14, borderTop:'1px solid '+T.border, fontFamily:F.mono, fontSize:10, color:T.textDim, letterSpacing:'0.05em'} },
          React.createElement('span', { style:{display:'flex', alignItems:'center', gap:6} }, React.createElement('span', { style:{width:18, height:3, background:T.ok} }), 'ACTIVE'),
          React.createElement('span', { style:{display:'flex', alignItems:'center', gap:6} }, React.createElement('span', { style:{width:18, height:3, background:T.pilot} }), 'PILOTING'),
          React.createElement('span', { style:{display:'flex', alignItems:'center', gap:6} }, React.createElement(ModelGlyph, { model:'Haiku' }), React.createElement('span', null, 'HAIKU \u00b7 fast / cheap')),
          React.createElement('span', { style:{display:'flex', alignItems:'center', gap:6} }, React.createElement(ModelGlyph, { model:'Sonnet' }), React.createElement('span', null, 'SONNET \u00b7 default')),
          React.createElement('span', { style:{display:'flex', alignItems:'center', gap:6} }, React.createElement(ModelGlyph, { model:'Opus' }), React.createElement('span', null, 'OPUS \u00b7 heavy thinking'))
        )
      ),

      // Flow strip
      React.createElement('div', { style:{marginTop:36} },
        React.createElement(SectionTitle, { kicker:'HOW IT WORKS', title:'Request Flow' }),
        React.createElement('div', { style:{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:8} },
          flow.map(function(step, i) {
            return React.createElement(Card, { key:i },
              React.createElement('div', { style:{textAlign:'center', padding:'12px 8px'} },
                React.createElement(Glyph, { name:step.glyph, size:28, color:T.accent, weight:300 }),
                React.createElement('div', { style:{fontFamily:F.display, fontSize:14, color:T.text, letterSpacing:'0.06em', marginTop:8} }, step.who),
                React.createElement('div', { style:{fontFamily:F.body, fontSize:11, color:T.textDim, marginTop:4, lineHeight:1.4} }, step.desc)
              )
            );
          })
        )
      ),

      // Lifecycle Ladder
      React.createElement('div', { style:{marginTop:28} },
        React.createElement(SectionTitle, { kicker:'LIFECYCLE', title:'Promotion Ladder' }),
        React.createElement('div', { style:{display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:6} },
          [{n:'01',label:'IDENTIFY'},{n:'02',label:'DRAFT'},{n:'03',label:'BUILD'},{n:'04',label:'EVAL'},{n:'05',label:'SHIP'}].map(function(stage) {
            return React.createElement(Card, { key:stage.n },
              React.createElement('div', { style:{textAlign:'center', padding:'10px 4px'} },
                React.createElement('div', { style:{fontFamily:F.display, fontSize:22, color:T.accent, letterSpacing:'0.06em'} }, stage.n),
                React.createElement('div', { style:{fontFamily:F.mono, fontSize:10, color:T.textMid, letterSpacing:'0.06em', marginTop:4} }, stage.label)
              )
            );
          })
        )
      ),

      // Selected agent detail
      agent && React.createElement('div', { style:{marginTop:28} },
        React.createElement(Card, { accent:true },
          React.createElement('div', { style:{display:'flex', alignItems:'center', gap:14} },
            React.createElement('div', { style:{width:48, height:48, background:T.accentLight, border:'1px solid '+T.border, display:'flex', alignItems:'center', justifyContent:'center'} },
              React.createElement(Glyph, { name:agent.glyph, size:24, color:T.accent })
            ),
            React.createElement('div', null,
              React.createElement('div', { style:{fontFamily:F.display, fontSize:24, color:T.text, letterSpacing:'0.04em'} }, agent.name),
              React.createElement('div', { style:{fontFamily:F.body, fontSize:12, color:T.textDim, marginTop:2} }, agent.role),
              React.createElement('div', { style:{fontFamily:F.mono, fontSize:10, color:T.textFaint, marginTop:2} }, agent.model.toUpperCase()+' \u00b7 '+agent.status.toUpperCase())
            ),
            React.createElement('button', { onClick:function() { setSel(null); }, style:{marginLeft:'auto', background:'none', border:'1px solid '+T.border, color:T.textDim, fontFamily:F.mono, fontSize:11, padding:'4px 10px', cursor:'pointer'} }, 'CLOSE')
          )
        )
      )
    );
  }

  window.__HERMES_PLUGINS__.register('sid-agents', AgentsView);
})();
