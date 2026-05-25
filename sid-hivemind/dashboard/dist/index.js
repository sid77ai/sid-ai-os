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
    done:"#71717A", doneLight:"#F4F4F5",
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

  var HIVE_LOG = [
    { time:"07:31", agent:"JARVIS", action:"Routed to Birgit (inbox triage \u00d7 4 items)", channel:"Telegram", dot:T.ok },
    { time:"07:28", agent:"Birgit", action:"Drafted reply to Telekom \u2014 awaiting human gate", channel:"Email", dot:T.run },
    { time:"07:02", agent:"Birgit", action:"Triaged SG Inbox \u2014 4 items classified and filed", channel:"Notion", dot:T.run },
    { time:"06:58", agent:"Kenji", action:"AI-OS Context Hub updated \u2014 3 entries added", channel:"Notion", dot:T.run },
    { time:"06:30", agent:"Q", action:"Research brief complete: Hermes + Notion stack", channel:"Notion", dot:T.ok },
    { time:"06:15", agent:"Kumar", action:"Eval harness run \u2014 6/6 skills passed \u226590%", channel:"GitHub", dot:T.ok },
    { time:"06:00", agent:"Hans", action:"Daily cost check: $0.34 spent / $3.00 cap", channel:"System", dot:T.accent },
    { time:"05:30", agent:"JARVIS", action:"Weekly review pack delivered", channel:"Telegram", dot:T.run },
    { time:"05:14", agent:"Claire", action:"SIOP draft \u2014 pilot output saved (not yet sent)", channel:"Notion", dot:T.pilot },
    { time:"05:00", agent:"Birgit", action:"Morning briefing /gm dispatched", channel:"Telegram", dot:T.ok },
  ];

  var APPROVALS = [
    { id:1, who:"Birgit", what:"Reply: Telekom \u2014 renewal cancellation", preview:"Sehr geehrte Damen und Herren\u2026", risk:"low" },
    { id:2, who:"Claire", what:"SIOP deck v3 \u2192 upload to ISC team Sharepoint", preview:"24 slides \u00b7 ABB Q4 forecast revised", risk:"medium" },
    { id:3, who:"Q", what:"Decision logged: Caf\u00e9 Platform v3 ship-Monday", preview:"Frame, options, recommendation, dissents\u2026", risk:"low" },
    { id:4, who:"Kumar", what:"Deploy eval-harness@v0.4.1 to prod", preview:"diff +320 / \u221244 \u00b7 all green", risk:"medium" },
  ];

  function HiveMindView() {
    var _a = useState([]), sessions = _a[0], setSessions = _a[1];
    var _b = useState(true), loading = _b[0], setLoading = _b[1];

    var fetchData = useCallback(function() {
      api.getSessions(50, 0).then(function(r) { setSessions(r.sessions||[]); setLoading(false); }).catch(function() { setLoading(false); });
    }, []);

    useEffect(function() { fetchData(); var i = setInterval(fetchData, 15000); return function() { clearInterval(i); }; }, [fetchData]);

    var stats = useMemo(function() {
      var active = sessions.filter(function(s) { return s.is_active; }).length;
      var totalMsgs = sessions.reduce(function(s,x) { return s+(x.message_count||0); }, 0);
      var totalIn = sessions.reduce(function(s,x) { return s+(x.input_tokens||0); }, 0);
      var totalOut = sessions.reduce(function(s,x) { return s+(x.output_tokens||0); }, 0);
      var models = {};
      sessions.forEach(function(s) { if (s.model) models[s.model] = (models[s.model]||0)+1; });
      return { active:active, total:sessions.length, totalMsgs:totalMsgs, totalIn:totalIn, totalOut:totalOut, models:Object.entries(models).sort(function(a,b) { return b[1]-a[1]; }) };
    }, [sessions]);

    function formatTokens(n) {
      if (!n) return '0';
      if (n >= 1000000) return (n/1000000).toFixed(1)+'M';
      if (n >= 1000) return (n/1000).toFixed(1)+'k';
      return String(n);
    }

    function timeAgo(ts) {
      if (!ts) return '';
      var diff = Date.now() - ts*1000;
      var m = Math.floor(diff/60000);
      if (m < 1) return 'just now';
      if (m < 60) return m+'m ago';
      if (m < 1440) return Math.floor(m/60)+'h ago';
      return Math.floor(m/1440)+'d ago';
    }

    return React.createElement('div', { style:{padding:'24px'} },
      React.createElement(SectionTitle, { kicker:'INTELLIGENCE', title:'Hive Mind', sub:'Session activity, search, and aggregated intelligence from all agent interactions.' }),

      React.createElement('div', { style:{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12} },
        React.createElement(Card, null,
          React.createElement('div', { style:{fontFamily:F.body, fontSize:10, fontWeight:700, color:T.textDim, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8} }, 'Sessions'),
          React.createElement('div', { style:{fontFamily:F.display, fontSize:36, color:T.text, lineHeight:1} }, String(stats.total)),
          React.createElement('div', { style:{fontFamily:F.mono, fontSize:11, color:T.ok, marginTop:4} }, stats.active+' active')
        ),
        React.createElement(Card, null,
          React.createElement('div', { style:{fontFamily:F.body, fontSize:10, fontWeight:700, color:T.textDim, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8} }, 'Messages'),
          React.createElement('div', { style:{fontFamily:F.display, fontSize:36, color:T.text, lineHeight:1} }, String(stats.totalMsgs)),
          React.createElement('div', { style:{fontFamily:F.body, fontSize:11, color:T.textFaint, marginTop:4} }, 'Across all sessions')
        ),
        React.createElement(Card, null,
          React.createElement('div', { style:{fontFamily:F.body, fontSize:10, fontWeight:700, color:T.textDim, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8} }, 'Tokens'),
          React.createElement('div', { style:{fontFamily:F.display, fontSize:36, color:T.text, lineHeight:1} }, formatTokens(stats.totalIn+stats.totalOut)),
          React.createElement('div', { style:{fontFamily:F.mono, fontSize:10, color:T.textFaint, marginTop:4} }, formatTokens(stats.totalIn)+' in / '+formatTokens(stats.totalOut)+' out')
        ),
        React.createElement(Card, null,
          React.createElement('div', { style:{fontFamily:F.body, fontSize:10, fontWeight:700, color:T.textDim, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8} }, 'Models'),
          React.createElement('div', { style:{fontFamily:F.display, fontSize:36, color:T.text, lineHeight:1} }, String(stats.models.length)),
          React.createElement('div', { style:{display:'flex', gap:4, marginTop:8, flexWrap:'wrap'} },
            stats.models.slice(0,4).map(function(m) {
              return React.createElement('span', { key:m[0], style:{fontFamily:F.mono, fontSize:10, color:T.textMid, background:T.surface, padding:'2px 6px', border:'1px solid '+T.border} }, m[0].split('/').pop());
            })
          )
        ),
      ),

      React.createElement('div', { style:{marginTop:16} },
        React.createElement(Card, { accent:true },
          React.createElement(SectionTitle, { kicker:'ACTIVITY', title:'Hive Log', sub:'Recent agent activity across all channels' }),
          React.createElement('div', { style:{display:'flex', flexDirection:'column', gap:2} },
            HIVE_LOG.map(function(entry, i) {
              return React.createElement('div', { key:i, style:{display:'flex', alignItems:'center', gap:10, padding:'6px 10px', background:T.surface, border:'1px solid '+T.border} },
                React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:T.textFaint, width:44, flexShrink:0} }, entry.time),
                React.createElement(Dot, { color:entry.dot, size:6 }),
                React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:T.accentDark, fontWeight:600, width:52, flexShrink:0} }, entry.agent),
                React.createElement('span', { style:{fontFamily:F.body, fontSize:12, color:T.text, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'} }, entry.action),
                React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:T.textFaint, background:T.surface, padding:'2px 6px', border:'1px solid '+T.border} }, entry.channel)
              );
            })
          )
        )
      ),

      React.createElement('div', { style:{marginTop:16} },
        React.createElement(Card, null,
          React.createElement(SectionTitle, { kicker:'APPROVALS', title:'Pending', accent:String(APPROVALS.length), sub:'Items waiting for your approval before sending.' }),
          React.createElement('div', { style:{display:'flex', flexDirection:'column', gap:4} },
            APPROVALS.map(function(a) {
              return React.createElement('div', { key:a.id, style:{display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:T.surface, border:'1px solid '+T.border} },
                React.createElement('div', { style:{width:28, height:28, background:T.accentLight, border:'1px solid '+T.border, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0} },
                  React.createElement(Glyph, { name:'pending_actions', size:14, color:T.accent })
                ),
                React.createElement('div', { style:{flex:1, minWidth:0} },
                  React.createElement('div', { style:{fontFamily:F.body, fontSize:11, fontWeight:600, color:T.text} }, a.who+' \u2014 '+a.what),
                  React.createElement('div', { style:{fontFamily:F.body, fontSize:10, color:T.textDim, marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'} }, a.preview)
                ),
                React.createElement('span', { style:{fontFamily:F.mono, fontSize:9, color:a.risk==='medium'?T.accent:T.ok, fontWeight:600, letterSpacing:'0.04em', flexShrink:0} }, a.risk.toUpperCase())
              );
            })
          )
        )
      ),

      React.createElement('div', { style:{marginTop:16} },
        React.createElement(Card, null,
          React.createElement(SectionTitle, { kicker:'RECENT', title:'Sessions', accent:String(sessions.length) }),
          loading
            ? React.createElement('div', { style:{fontFamily:F.body, fontSize:13, color:T.textDim, padding:20} }, 'Loading\u2026')
            : sessions.length === 0
              ? React.createElement('div', { style:{fontFamily:F.body, fontSize:13, color:T.textDim, padding:20} }, 'No sessions yet')
              : React.createElement('div', { style:{display:'flex', flexDirection:'column', gap:2} },
                  sessions.slice(0,15).map(function(s) {
                    return React.createElement('div', { key:s.id, style:{display:'flex', alignItems:'center', gap:12, padding:'8px 14px', background:T.surface, border:'1px solid '+T.border} },
                      React.createElement(Dot, { color:s.is_active?T.run:T.textFaint, size:6 }),
                      React.createElement('div', { style:{flex:1, minWidth:0} },
                        React.createElement('div', { style:{fontFamily:F.body, fontSize:13, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'} }, s.title||s.id.slice(0,12)+'\u2026'),
                        React.createElement('div', { style:{fontFamily:F.mono, fontSize:10, color:T.textFaint} }, (s.model||'\u2014')+' \u00b7 '+(s.message_count||0)+' msgs \u00b7 '+formatTokens(s.input_tokens)+' in / '+formatTokens(s.output_tokens)+' out')
                      ),
                      React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:T.textFaint, flexShrink:0} }, timeAgo(s.last_active))
                    );
                  })
                )
        )
      )
    );
  }

  window.__HERMES_PLUGINS__.register('sid-hivemind', HiveMindView);
})();
