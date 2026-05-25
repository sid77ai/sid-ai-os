(function() {
  'use strict';
  var React = window.__HERMES_PLUGIN_SDK__.React;

  var T = { bg:"#FAFAF8", surface:"#F3F3F0", accent:"#E07340", accentLight:"#FFF4ED", accentDark:"#B85A28", accentBorder:"#F0A060", text:"#111110", textMid:"#4A4A48", textDim:"#8A8A87", textFaint:"#C0C0BC", ok:"#16A34A", ink:"#1B1A18", border:"#E2E2DE", borderMid:"#C8C8C3" };
  var F = { display:"'Bebas Neue', sans-serif", body:"'DM Sans', system-ui, sans-serif", mono:"'JetBrains Mono', monospace" };

  var CHAT = [
    {who:"jarvis",t:"07:01",msg:"☀️ Briefing ready. 3 meetings, 2 P1 items, 1 anomaly."},
    {who:"you",t:"07:02",msg:"read it"},
    {who:"jarvis",t:"07:02",msg:"🎙️ Birgit · 1:24",audio:true},
    {who:"you",t:"07:05",msg:"reply to telekom — say no, cancel by 30 June"},
    {who:"jarvis",t:"07:05",msg:"→ Routed to Birgit. Drafting now."},
    {who:"birgit",t:"07:06",msg:"Draft ready 👇"},
    {who:"birgit",t:"07:06",msg:'"Sehr geehrte Damen und Herren..."',quote:true},
    {who:"birgit",t:"07:06",msg:"Send / edit / cancel?",chips:["SEND","EDIT","CANCEL"]},
    {who:"you",t:"07:08",msg:"send"},
    {who:"hans",t:"07:08",msg:"🛡️ Guardrail pass · no PII. ALLOWING."},
    {who:"birgit",t:"07:09",msg:"✓ Sent. Filed → SG Inbox → DONE."},
  ];

  var STEPS = [
    {n:'01',who:'YOU',desc:'Tap into your morning briefing — voice or text.'},
    {n:'02',who:'JARVIS',desc:'Hears the request, classifies, routes to Birgit.'},
    {n:'03',who:'BIRGIT',desc:'Drafts the reply in your voice. Never sends without you.'},
    {n:'04',who:'HANS',desc:'Guardrail runs on every outbound. Blocks PII.'},
    {n:'05',who:'LOOP',desc:'Action filed in SG Inbox, hive_mind_log, project page.'},
  ];

  var BRIDGES = [
    {n:'Claude Desktop',g:'smart_toy',on:true,note:'console'},
    {n:'Web',g:'language',on:true,note:'this'},
    {n:'Email',g:'mail',on:true,note:'inbound only'},
    {n:'Slack',g:'tag',on:false,note:'awaiting'},
    {n:'Discord',g:'forum',on:false,note:'awaiting'},
    {n:'Voice',g:'mic',on:true,note:'telegram'},
  ];

  function BridgeView() {
    var header = React.createElement('div',{style:{marginBottom:14}},
      React.createElement('div',{style:{fontFamily:F.body,fontSize:11,fontWeight:700,color:T.accentDark,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:6}},'THE BRIDGE'),
      React.createElement('div',{style:{fontFamily:F.display,fontSize:24,color:T.text,letterSpacing:'0.04em',lineHeight:1}},'JARVIS IN YOUR POCKET.',React.createElement('span',{style:{color:T.accent}},' TELEGRAM IS THE STEERING WHEEL.')),
      React.createElement('div',{style:{fontFamily:F.body,fontSize:12,color:T.textDim,marginTop:8,lineHeight:1.5}},'The Bridge layer makes the OS portable.')
    );

    var statusBar = React.createElement('div',{style:{display:'flex',justifyContent:'space-between',padding:'10px 22px 6px',color:'#fff',fontFamily:F.mono,fontSize:11}},
      React.createElement('span',null,'9:41'),
      React.createElement('span',null,'●●●')
    );

    var tgHeader = React.createElement('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',background:'#17212B',color:'#fff',borderBottom:'1px solid #0E1621'}},
      React.createElement('span',{style:{width:20,height:20,borderRadius:'50%',background:'#5288c1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10}},'←'),
      React.createElement('div',{style:{width:30,height:30,background:T.accent,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F.body,fontSize:10}},'OS'),
      React.createElement('div',{style:{flex:1,minWidth:0}},
        React.createElement('div',{style:{fontFamily:F.body,fontSize:13,fontWeight:600}},'JARVIS'),
        React.createElement('div',{style:{fontFamily:F.body,fontSize:10,color:'#7c93a8'}},'online · 6 agents')
      ),
      React.createElement('span',{style:{color:'#7c93a8',fontSize:16}},'⋮')
    );

    var msgEls = [];
    for (var i = 0; i < CHAT.length; i++) {
      var m = CHAT[i];
      var isYou = m.who === 'you';
      var bg = isYou ? '#3A6E8F' : '#182533';
      var nameLabel = null;
      if (!isYou) {
        nameLabel = React.createElement('div',{style:{fontFamily:F.body,fontSize:10,color:T.accent,fontWeight:700,marginBottom:2,marginLeft:4}},m.who.toUpperCase());
      }
      var content = React.createElement('div',{style:{fontFamily:F.body,fontSize:12,lineHeight:1.45}},m.msg);
      var chips = null;
      if (m.chips) {
        var chipEls = [];
        for (var ci = 0; ci < m.chips.length; ci++) {
          chipEls.push(React.createElement('span',{key:ci,style:{fontFamily:F.body,fontSize:10,fontWeight:700,padding:'3px 9px',background:'#2C3E50',borderRadius:3,letterSpacing:'0.05em',marginRight:4}},m.chips[ci]));
        }
        chips = React.createElement('div',{style:{display:'flex',marginTop:7}},chipEls);
      }
      msgEls.push(
        React.createElement('div',{key:i,style:{alignSelf:isYou?'flex-end':'flex-start',maxWidth:'82%'}},
          nameLabel,
          React.createElement('div',{style:{background:bg,color:'#fff',padding:m.audio?'10px 14px':'7px 11px',borderRadius:10,borderTopLeftRadius:isYou?10:2,borderTopRightRadius:isYou?2:10,fontStyle:m.quote?'italic':'normal',borderLeft:m.quote?'2px solid '+T.accent:'none'}},
            content,
            React.createElement('div',{style:{fontFamily:F.mono,fontSize:9,opacity:0.55,textAlign:'right',marginTop:3}},m.t),
            chips
          )
        )
      );
    }

    var composer = React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'#17212B',borderTop:'1px solid #0E1621',color:'#7c93a8',fontFamily:F.body,fontSize:11}},
      React.createElement('span',null,'+'),
      React.createElement('span',{style:{flex:1}},'Message'),
      React.createElement('span',{color:T.accent},'🎤')
    );

    var phone = React.createElement('div',{style:{width:320,background:T.text,padding:8,borderRadius:36,border:'1px solid #000',boxShadow:'8px 8px 0 '+T.accentBorder}},
      React.createElement('div',{style:{background:T.ink,borderRadius:30,overflow:'hidden',display:'flex',flexDirection:'column',height:620}},
        statusBar,
        tgHeader,
        React.createElement('div',{style:{flex:1,overflowY:'auto',padding:'12px 10px',background:'#0E1621',display:'flex',flexDirection:'column',gap:8}},msgEls),
        composer
      )
    );

    var stepEls = [];
    for (var si = 0; si < STEPS.length; si++) {
      var s = STEPS[si];
      stepEls.push(
        React.createElement('div',{key:si,style:{display:'grid',gridTemplateColumns:'40px 100px minmax(0,1fr)',gap:14,background:T.bg,border:'1px solid '+T.border,padding:'10px 14px'}},
          React.createElement('span',{style:{fontFamily:F.display,fontSize:18,color:T.accent}},s.n),
          React.createElement('span',{style:{fontFamily:F.display,fontSize:13,color:T.text,letterSpacing:'0.05em'}},s.who),
          React.createElement('span',{style:{fontFamily:F.body,fontSize:12,color:T.textMid,lineHeight:1.5}},s.desc)
        )
      );
    }

    var bridgeEls = [];
    for (var bi = 0; bi < BRIDGES.length; bi++) {
      var b = BRIDGES[bi];
      bridgeEls.push(
        React.createElement('div',{key:bi,style:{background:T.bg,border:'1px solid '+(b.on?T.border:T.borderMid),padding:'10px 12px',opacity:b.on?1:0.55}},
          React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:4}},
            React.createElement('span',{style:{fontFamily:F.body,fontSize:12,color:b.on?T.accent:T.textDim}},b.g),
            React.createElement('span',{style:{fontFamily:F.display,fontSize:13,color:T.text,letterSpacing:'0.04em'}},b.n)
          ),
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
            React.createElement('span',{style:{fontFamily:F.mono,fontSize:10,color:T.textDim}},b.note),
            React.createElement('span',{style:{fontFamily:F.mono,fontSize:9,fontWeight:700,color:b.on?T.ok:T.textFaint}},b.on?'● ON':'○ OFF')
          )
        )
      );
    }

    var rightRail = React.createElement('div',null,
      React.createElement('div',{style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.accent,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:8}},
        "WHAT'S HAPPENING IN THE THREAD",
        React.createElement('span',{style:{fontFamily:F.mono,fontSize:8,fontWeight:700,color:'#92601A',background:'#FDF0DC',padding:'1px 6px',letterSpacing:'0.08em',display:'inline-block',border:'1px solid #E8C97A',verticalAlign:'middle',marginLeft:7}},'DEMO')
      ),
      React.createElement('div',{style:{display:'grid',gap:8,marginBottom:24}},stepEls),
      React.createElement('div',{style:{fontFamily:F.body,fontSize:9,fontWeight:700,color:T.textDim,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:8}},'OTHER BRIDGES'),
      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))',gap:6}},bridgeEls)
    );

    return React.createElement('div',{style:{padding:'24px'}},
      header,
      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'320px minmax(0,1fr)',gap:30,alignItems:'flex-start'}},
        phone,
        rightRail
      )
    );
  }

  window.__HERMES_PLUGINS__.register('sid-bridge', BridgeView);
})();
