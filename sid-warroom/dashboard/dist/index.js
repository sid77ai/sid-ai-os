(function() {
  'use strict';

  var React = window.__HERMES_PLUGIN_SDK__.React;
  var hooks = window.__HERMES_PLUGIN_SDK__.hooks;
  var useState = hooks.useState;
  var useEffect = hooks.useEffect;
  var useCallback = hooks.useCallback;

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

  var TOPIC = {
    label:'Should we ship the next release this week?',
    views:[
      { agent:'Build', agentId:'build', point:'All tests green for 3 days. Rollback is 90s. Low risk.' },
      { agent:'Research', agentId:'research', point:'User feedback cycle suggests waiting. Early ship means missed signal.' },
      { agent:'Governance', agentId:'governance', point:'Security scan clean. One pending audit \u2014 non-blocking.' },
      { agent:'Ops', agentId:'ops', point:'Calendar can hold support window Thu to Fri. Good week to ship.' },
    ],
    verdict:'SHIP THURSDAY \u00b7 GOVERNANCE AUDIT NON-BLOCKING \u00b7 OPS SUPPORT WINDOW CONFIRMED',
    cost:'$0.42',
  };

  var COUNCIL_TOPICS = [
    { id:'v3-ship', label:'Ship Caf\u00e9 v3 Mon?', impulse:'/discuss Should we ship Caf\u00e9 Platform v3 on Monday?', impulseTime:'09:00', views:{birgit:{point:'Customer queries are at a 4-week low. Calendar can hold 10\u201314 launch support.'},kumar:{point:'Eval harness 6/6 three nights running. Memory-schema migration is the only risk. Rollback in 90s.'},q:{point:'v2 post-mortem cost us 1 day on memory regression. Mon ship lets us soak before Thursday\'s ABB review.'},claire:{point:'Friday rollback hurts more than a 2-day slip. Recommend Mon ship \u2014 provided Hans clears the schema.'},hans:{block:true, point:'PII schema not yet redacted. BLOCK ship until /redact pass on prod-mirror is clean. ETA 2h.'}}, consolidation:{verdict:'SHIP MONDAY \u00b7 CONDITIONAL', action:'Kumar pre-stages diff today \u00b7 Hans /redact Fri \u00b7 Mon ship \u00b7 Sid gates', dissent:'None.', cost:'$0.34', decisionId:'D-2026-041' } },
    { id:'opus-cap', label:'Raise Opus cap \u2192 $2/d?', impulse:'/discuss Raise Q\'s Opus cap from $1.50 to $2.00/day during pilot?', impulseTime:'10:42', views:{birgit:{point:'Q\'s briefs save me ~40 min/day on inbox triage prep. ROI is clear.'},kumar:{point:'Eval harness shows Opus +14% over Sonnet on multi-source synthesis. Worth the spend.'},q:{point:'Recused from voting. If raised, I should report a weekly tokens-to-outcome ratio.'},claire:{point:'SIOP lens: bottleneck cost > model cost by 10\u00d7. Raise it \u2014 easy call.'},hans:{point:'Conditional ALLOW: 14-day pilot, daily Q telemetry to Hans, auto-downgrade on anomaly.'}}, consolidation:{verdict:'RAISE TO $2.00 \u00b7 14-DAY PILOT', action:'Set OPUS_CAP=$2.00 \u00b7 14-day pilot \u00b7 weekly Q telemetry \u00b7 auto-downgrade rule', dissent:'Q recused (conflict of interest).', cost:'$0.41', decisionId:'D-2026-042' } },
    { id:'promote-claire', label:'Promote Claire?', impulse:'/discuss Promote Claire PILOT \u2192 ACTIVE \u2014 14 days clean.', impulseTime:'07:15', views:{birgit:{point:'Claire\'s SIOP drafts saved me ~6h in the last two weeks. Promotion overdue.'},kumar:{point:'Eval harness: Claire passes SIOP golden set at 94%, ABB at 91% \u2014 above the 90% threshold.'},q:{point:'Counter: 14 days is short for ISC. Recommend ACTIVE-conditional with 30-day soft monitor.'},claire:{point:'Recused \u2014 can\'t vote on my own promotion.'},hans:{point:'Clean trail \u2014 no PII leaks, no irreversible actions. ALLOW promotion.'}}, consolidation:{verdict:'PROMOTE \u2192 ACTIVE', action:'Set Claire.status=ACTIVE \u00b7 30-day soft monitor \u00b7 weekly eval pass-rate report', dissent:'Claire recused. Q recommends soft monitor.', cost:'$0.28', decisionId:'D-2026-040' } },
  ];

  var PHASES = [
    { id:'impulse', label:'IMPULSE', glyph:'flash_on' },
    { id:'open', label:'OPEN FLOOR', glyph:'forum' },
    { id:'cross', label:'CROSS-VIEWS', glyph:'compare_arrows' },
    { id:'consolidate', label:'CONSOLIDATE', glyph:'gavel' },
    { id:'return', label:'RETURN', glyph:'reply' },
  ];

  function WarRoomView() {
    var _a = useState({ running:false, phaseIdx:0, complete:false, spokenAgents:0 }), state = _a[0], setState = _a[1];
    var _b = useState(0), topicIdx = _b[0], setTopicIdx = _b[1];
    var topic = COUNCIL_TOPICS[topicIdx];

    var start = useCallback(function() {
      setState({ running:true, phaseIdx:0, complete:false, spokenAgents:0 });
    }, []);
    var reset = useCallback(function() {
      setState({ running:false, phaseIdx:0, complete:false, spokenAgents:0 });
    }, []);
    var nextTopic = useCallback(function() {
      setTopicIdx((topicIdx + 1) % COUNCIL_TOPICS.length);
      setState({ running:false, phaseIdx:0, complete:false, spokenAgents:0 });
    }, [topicIdx]);

    useEffect(function() {
      if (!state.running) return;
      if (state.phaseIdx >= PHASES.length - 1 && state.spokenAgents >= topic.views.length) {
        setState({ running:false, phaseIdx:PHASES.length-1, complete:true, spokenAgents:topic.views.length });
        return;
      }
      var delay = state.spokenAgents < topic.views.length && state.phaseIdx >= 1 ? 1200 : 1800;
      var timer = setTimeout(function() {
        if (state.spokenAgents < topic.views.length && state.phaseIdx >= 1) {
          setState({ running:true, phaseIdx:state.phaseIdx, complete:false, spokenAgents:state.spokenAgents+1 });
        } else {
          setState({ running:true, phaseIdx:Math.min(state.phaseIdx+1, PHASES.length-1), complete:false, spokenAgents:state.spokenAgents });
        }
      }, delay);
      return function() { clearTimeout(timer); };
    }, [state]);

    var phase = PHASES[state.phaseIdx];
    var phaseColors = { build:T.run, research:T.accent, governance:T.pilot, ops:T.ok };
    var viewAgents = Object.keys(topic.views);

    return React.createElement('div', { style:{padding:'24px'} },
      React.createElement(SectionTitle, { kicker:'COUNCIL', title:'War Room', accent:'5-phase', sub:'Structured multi-phase debate. Agents discuss, deliberate, and return a verdict.' }),

      // Topic selector
      React.createElement(Card, null,
        React.createElement('div', { style:{display:'grid', gridTemplateColumns:'minmax(0,1fr) auto', gap:12, alignItems:'center'} },
          React.createElement('div', null,
            React.createElement('div', { style:{display:'flex', alignItems:'center', gap:6, marginBottom:6} },
              React.createElement(Glyph, { name:'forum', size:16, color:T.accent }),
              React.createElement('span', { style:{fontFamily:F.body, fontSize:10, fontWeight:700, color:T.accentDark, letterSpacing:'0.14em', textTransform:'uppercase'} }, 'TOPIC '+(topicIdx+1)+' OF '+COUNCIL_TOPICS.length)
            ),
            React.createElement('div', { style:{fontFamily:F.body, fontSize:14, fontWeight:600, color:T.text, marginBottom:4} }, topic.label),
            React.createElement('div', { style:{fontFamily:F.mono, fontSize:10, color:T.textDim} }, topic.impulseTime+' \u00b7 '+viewAgents.length+' agents participating')
          ),
          React.createElement('div', { style:{display:'flex', gap:6} },
            React.createElement('button', { onClick:start, disabled:state.running, style:{fontFamily:F.body, fontSize:12, fontWeight:700, letterSpacing:'0.06em', background:state.running?T.textFaint:T.accent, color:'#fff', border:'none', padding:'10px 20px', cursor:state.running?'default':'pointer'} }, state.running?'IN PROGRESS':'LAUNCH'),
            React.createElement('button', { onClick:nextTopic, disabled:state.running, style:{fontFamily:F.body, fontSize:11, background:'none', border:'1px solid '+T.border, color:T.textDim, padding:'10px 14px', cursor:state.running?'default':'pointer'} }, 'NEXT TOPIC')
          )
        )
      ),

      // Active council
      (state.running || state.complete) && React.createElement('div', null,
        // Phase bar
        React.createElement('div', { style:{display:'flex', gap:3, marginBottom:16} },
          PHASES.map(function(p, i) {
            return React.createElement('div', { key:p.id, title:p.label, style:{flex:1, height:3, background:i<=state.phaseIdx?(i===state.phaseIdx?T.accent:T.accentMid):T.surfaceHigh, transition:'background 0.4s ease'} });
          })
        ),

        React.createElement(Card, { accent:true },
          React.createElement('div', { style:{display:'flex', alignItems:'center', gap:10, marginBottom:16} },
            React.createElement('div', { style:{width:32, height:32, background:T.accentLight, border:'1px solid '+T.border, display:'flex', alignItems:'center', justifyContent:'center'} },
              React.createElement(Glyph, { name:phase.glyph, size:18, color:T.accent })
            ),
            React.createElement('div', null,
              React.createElement('div', { style:{fontFamily:F.display, fontSize:20, color:T.text, letterSpacing:'0.03em'} }, phase.label),
              React.createElement('div', { style:{fontFamily:F.body, fontSize:11, color:T.textDim} }, 'Phase '+(state.phaseIdx+1)+' of '+PHASES.length)
            )
          ),

          // Agent views
          state.spokenAgents > 0 && React.createElement('div', { style:{display:'flex', flexDirection:'column', gap:8} },
            viewAgents.slice(0, state.spokenAgents).map(function(agentId) {
              var v = topic.views[agentId];
              var ac = phaseColors[agentId] || T.accent;
              return React.createElement('div', { key:agentId, style:{padding:'12px 16px', background:T.surface, border:'1px solid '+T.border, borderTop:'2px solid '+ac} },
                React.createElement('div', { style:{display:'flex', alignItems:'center', gap:8, marginBottom:6} },
                  React.createElement(Dot, { color:ac, size:6 }),
                  React.createElement('span', { style:{fontFamily:F.body, fontSize:11, fontWeight:700, color:T.textMid, letterSpacing:'0.04em'} }, v.agent.toUpperCase()),
                  v.block && React.createElement('span', { style:{fontFamily:F.mono, fontSize:9, fontWeight:700, color:T.block, background:T.blockLight, padding:'1px 6px', letterSpacing:'0.06em'} }, 'BLOCK')
                ),
                React.createElement('div', { style:{fontFamily:F.body, fontSize:13, color:T.text, lineHeight:1.5} }, v.point)
              );
            })
          ),

          // Verdict
          state.complete && React.createElement('div', { style:{marginTop:20, padding:'16px', background:T.accentLight, border:'1px solid '+T.accentBorder} },
            React.createElement('div', { style:{fontFamily:F.body, fontSize:10, fontWeight:700, color:T.accentDark, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8} }, 'VERDICT'),
            React.createElement('div', { style:{fontFamily:F.body, fontSize:15, fontWeight:600, color:T.text, lineHeight:1.4, marginBottom:8} }, topic.consolidation.verdict),
            React.createElement('div', { style:{fontFamily:F.body, fontSize:12, color:T.textMid, lineHeight:1.5, marginBottom:8} }, topic.consolidation.action),
            React.createElement('div', { style:{display:'flex', gap:16, fontFamily:F.mono, fontSize:10, color:T.textDim} },
              React.createElement('span', null, 'Cost: '+topic.consolidation.cost),
              React.createElement('span', null, topic.consolidation.decisionId),
              topic.consolidation.dissent !== 'None.' && React.createElement('span', { style:{color:T.accent} }, topic.consolidation.dissent)
            )
          )
        ),

        // Reset
        state.complete && React.createElement('button', { onClick:reset, style:{marginTop:12, fontFamily:F.body, fontSize:12, background:'none', border:'1px solid '+T.border, color:T.textDim, padding:'6px 16px', cursor:'pointer'} }, 'RESET')
      ),

      // Past decisions
      React.createElement('div', { style:{marginTop:28} },
        React.createElement(SectionTitle, { kicker:'DECISION LOG', title:'Past Verdicts' }),
        React.createElement('div', { style:{display:'flex', flexDirection:'column', gap:4} },
          COUNCIL_TOPICS.map(function(t) {
            return React.createElement('div', { key:t.id, style:{display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:T.surface, border:'1px solid '+T.border} },
              React.createElement(Dot, { color:T.ok, size:6 }),
              React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:T.accentDark, flexShrink:0} }, t.consolidation.decisionId),
              React.createElement('span', { style:{fontFamily:F.body, fontSize:12, color:T.text, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'} }, t.consolidation.verdict),
              React.createElement('span', { style:{fontFamily:F.mono, fontSize:10, color:T.textFaint, flexShrink:0} }, t.consolidation.cost)
            );
          })
        )
      )
    );
  }

  window.__HERMES_PLUGINS__.register('sid-warroom', WarRoomView);
})();
