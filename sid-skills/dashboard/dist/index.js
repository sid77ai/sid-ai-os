/* ═══════════════════════════════════════════════════════════════
   SID AI-OS — SKILLS ACADEMY PLUGIN
   Center of Excellence: competency matrix, agent dossiers, plugin armory
═══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var React = window.__HERMES_PLUGIN_SDK__.React;
  var hooks = window.__HERMES_PLUGIN_SDK__.hooks;
  var useState = hooks.useState;
  var useEffect = hooks.useEffect;
  var useCallback = hooks.useCallback;
  var useMemo = hooks.useMemo;

  /* ─── Design tokens ─── */
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

  /* ─── Icon map ─── */
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
    radar:"📡",settings_input_component:"🔧",badge:"🏅",science:"🔬",
  };

  /* ─── Keyframe CSS ─── */
  var ACADEMY_CSS = `
    @keyframes stageGlow {
      0%,100% { box-shadow: 0 0 0 0 rgba(224,115,64,0.4); }
      50%      { box-shadow: 0 0 0 8px rgba(224,115,64,0); }
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(8px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes cardDeal {
      from { opacity:0; transform: translateY(28px) rotate(-2deg); }
      to   { opacity:1; transform: translateY(0) rotate(0deg); }
    }
    @keyframes medalPop {
      0%   { opacity:0; transform: translateX(-10px) scale(0.96); }
      60%  { transform: translateX(0) scale(1.02); }
      100% { opacity:1; transform: translateX(0) scale(1); }
    }
    @keyframes chipPop {
      from { opacity:0; transform: scale(0.7); }
      to   { opacity:1; transform: scale(1); }
    }
    @keyframes shimmer {
      0%   { background-position: -120px 0; }
      100% { background-position: 240px 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration:0ms !important; transition-duration:0ms !important; }
    }
  `;

  /* ─── Data ─── */
  var AGENTS = [
    { id:"jarvis", name:"JARVIS", status:"active", model:"Sonnet", role:"Orchestrator",
      glyph:"hub", domain:"Routes every request to exactly one specialist. Never executes work itself.",
      skills:["/route","/dispatch","/wrap"], keywords:[],
      voice:"Calm, terse. British butler.", memoryCount:847, lastActive:"now" },
    { id:"birgit", name:"Birgit", status:"active", model:"Sonnet", role:"Personal Ops",
      glyph:"inbox", domain:"Inbox, calendar, meeting prep, short replies.",
      skills:["/gm","/triage","/reply","/prep"],
      keywords:["email","inbox","calendar","meeting","reply","triage","schedule","prep","briefing"],
      voice:"Warm, efficient.", memoryCount:1240, lastActive:"2m ago" },
    { id:"kenji", name:"Kenji", status:"active", model:"Haiku", role:"Workspace",
      glyph:"folder_open", domain:"Notion, schemas, knowledge base, persona lifecycle.",
      skills:["/file","/schema","/index","/promote"],
      keywords:["notion","schema","database","page","knowledge","file","organise","tag"],
      voice:"Quiet. Surgical.", memoryCount:2103, lastActive:"5m ago" },
    { id:"kumar", name:"Kumar", status:"active", model:"Sonnet", role:"Build",
      glyph:"terminal", domain:"Code, infra, Café Platform, eval harness, deploys.",
      skills:["/eval","/deploy","/diff","/test"],
      keywords:["code","build","deploy","github","eval","cafe","infra","ci","bug","fix"],
      voice:"Precise. Loves diffs.", memoryCount:894, lastActive:"23m ago" },
    { id:"q", name:"Q", status:"active", model:"Opus", role:"Research",
      glyph:"experiment", domain:"Research, briefs, decisions, long-form prose.",
      skills:["/brief","/decide","/synthesize","/draft","/visualise"],
      keywords:["research","write","brief","decide","draft","analyse","essay","synthesise"],
      voice:"Considered. Cites sources.", memoryCount:612, lastActive:"1h ago" },
    { id:"claire", name:"Claire", status:"piloting", model:"Sonnet", role:"ISC / Work",
      glyph:"work", domain:"ISC, SIOP, ABB, supply-chain ops, team 1:1s.",
      skills:["/siop","/coach","/standup"],
      keywords:["isc","siop","abb","sunrise","supply","coaching","1:1","team"],
      voice:"Strategic.", memoryCount:340, lastActive:"3h ago" },
    { id:"hans", name:"Hans", status:"piloting", model:"Haiku", role:"Governance",
      glyph:"shield", domain:"Security, privacy, cost cap, audit log, kill switches.",
      skills:["/guardrail","/cost","/redact"],
      keywords:["security","privacy","legal","behörden","audit","cost","redact","gdpr","leak"],
      voice:"Stern. Will block.", memoryCount:528, lastActive:"14m ago" },
  ];

  var SKILLS = [
    { id:"gm", path:"/gm", owner:"birgit", verb:"Morning briefing",
      desc:"Pulls overnight comms, calendar, market deltas → 90-second voice + text dispatch.",
      inputs:["window=last_24h","style=voice|text"], outputs:["briefing.md","tts.mp3"],
      runs:312, p95:"2.4s", costPer:"$0.028", evalScore:"6/6", lastRun:"05:00", trend:"steady" },
    { id:"triage", path:"/triage", owner:"birgit", verb:"Classify SG Inbox",
      desc:"Every item → Task | Note | Project | Reference | Trash. Routes to owner.",
      inputs:["item_id"], outputs:["classification","routed_to"],
      runs:1840, p95:"0.8s", costPer:"$0.001", evalScore:"6/6", lastRun:"07:02", trend:"up" },
    { id:"reply", path:"/reply", owner:"birgit", verb:"Draft email reply",
      desc:"Composes a reply in your voice. PII-checked. Always human-gated before send.",
      inputs:["thread_id","tone?"], outputs:["draft.html","tone_match"],
      runs:980, p95:"1.2s", costPer:"$0.014", evalScore:"6/6", lastRun:"07:08", trend:"up" },
    { id:"prep", path:"/prep", owner:"birgit", verb:"Pre-meeting brief",
      desc:"Pulls attendees, last decisions, open threads → 1-pager for the next meeting.",
      inputs:["event_id"], outputs:["prep.md"],
      runs:220, p95:"3.1s", costPer:"$0.030", evalScore:"5/6", lastRun:"yest", trend:"steady" },
    { id:"file", path:"/file", owner:"kenji", verb:"File to Notion",
      desc:"Adds a row to the right database with classification, tags, and links.",
      inputs:["item","db?"], outputs:["page_id","path"],
      runs:1240, p95:"0.4s", costPer:"$0.002", evalScore:"6/6", lastRun:"05:30", trend:"steady" },
    { id:"schema", path:"/schema", owner:"kenji", verb:"Manage Notion schema",
      desc:"Apply schema changes, validate fields, propagate to clients. Rollback on diff.",
      inputs:["db","change_spec"], outputs:["migration.md","diff"],
      runs:34, p95:"6.5s", costPer:"$0.012", evalScore:"5/6", lastRun:"3d", trend:"steady" },
    { id:"index", path:"/index", owner:"kenji", verb:"Re-index knowledge",
      desc:"Re-runs embeddings + FTS5 on new/changed pages. Salience-weighted.",
      inputs:["since?"], outputs:["indexed_count","cost"],
      runs:104, p95:"45s", costPer:"$0.080", evalScore:"6/6", lastRun:"02:00", trend:"steady" },
    { id:"promote", path:"/promote", owner:"kenji", verb:"Promote persona lifecycle",
      desc:"Walk an agent through DRAFT → PILOT → ACTIVE. Updates files + bridge surfaces.",
      inputs:["agent_id","stage"], outputs:["before","after"],
      runs:8, p95:"1.0s", costPer:"$0.003", evalScore:"6/6", lastRun:"2w", trend:"steady" },
    { id:"eval", path:"/eval", owner:"kumar", verb:"Run agent eval harness",
      desc:"Runs the eval harness — 6 skills × golden set. Fails the build if <90%.",
      inputs:["target?"], outputs:["report.html","pass_rate"],
      runs:96, p95:"3m 12s", costPer:"$0.040", evalScore:"6/6", lastRun:"06:15", trend:"steady" },
    { id:"deploy", path:"/deploy", owner:"kumar", verb:"Deploy via CI",
      desc:"Triggers GitHub Action, watches it, reports back with URL + status.",
      inputs:["ref","env"], outputs:["url","status"],
      runs:62, p95:"4m 12s", costPer:"$0.001", evalScore:"6/6", lastRun:"yest", trend:"steady" },
    { id:"diff", path:"/diff", owner:"kumar", verb:"Smart diff review",
      desc:"Comments on a PR diff. Highlights risk lines, suggests tests, summarises.",
      inputs:["pr_url"], outputs:["review.md"],
      runs:148, p95:"22s", costPer:"$0.018", evalScore:"5/6", lastRun:"05:30", trend:"up" },
    { id:"test", path:"/test", owner:"kumar", verb:"Run test suite",
      desc:"Runs unit + integration tests. First-failure reporting, retry on flake.",
      inputs:["target?"], outputs:["report","first_fail"],
      runs:84, p95:"1m 40s", costPer:"$0.000", evalScore:"6/6", lastRun:"05:14", trend:"steady" },
    { id:"brief", path:"/brief", owner:"q", verb:"Research brief",
      desc:"Topic → structured 1-pager with sources, counter-args, recommendation.",
      inputs:["topic","window","depth"], outputs:["brief.md","sources[]"],
      runs:84, p95:"42s", costPer:"$0.241", evalScore:"6/6", lastRun:"06:30", trend:"up" },
    { id:"decide", path:"/decide", owner:"q", verb:"Frame a decision",
      desc:"Question → options matrix → recommendation, logged to Decisions database.",
      inputs:["question","options[]?"], outputs:["decision.md"],
      runs:46, p95:"38s", costPer:"$0.180", evalScore:"6/6", lastRun:"2d", trend:"steady" },
    { id:"synthesize", path:"/synthesize", owner:"q", verb:"Stitch sources",
      desc:"Many inputs → one coherent piece. Used for weekly review packs.",
      inputs:["sources[]"], outputs:["synthesis.md"],
      runs:118, p95:"28s", costPer:"$0.309", evalScore:"5/6", lastRun:"12:03", trend:"up" },
    { id:"draft", path:"/draft", owner:"q", verb:"Long-form draft",
      desc:"Multi-page draft in DE or EN. Builds citation graph; flags weak claims.",
      inputs:["brief","len?"], outputs:["draft.md","citations[]"],
      runs:38, p95:"1m 15s", costPer:"$0.150", evalScore:"5/6", lastRun:"3d", trend:"steady" },
    { id:"visualise", path:"/visualise", owner:"q", verb:"Render inline visual",
      desc:"Generates SVG diagrams, interactive HTML charts, and data viz inline.",
      inputs:["topic","type?","data?"], outputs:["svg|html"],
      runs:14, p95:"8.2s", costPer:"$0.028", evalScore:"5/6", lastRun:"3d", trend:"up" },
    { id:"siop", path:"/siop", owner:"claire", verb:"SIOP review pack",
      desc:"Quarterly SIOP review — demand, supply, gap, mitigation. PDF + commentary.",
      inputs:["quarter","portfolio?"], outputs:["pack.pdf","commentary.md"],
      runs:6, p95:"2m 30s", costPer:"$0.220", evalScore:"5/6", lastRun:"4w", trend:"steady" },
    { id:"coach", path:"/coach", owner:"claire", verb:"1:1 coach prep",
      desc:"Pulls last 1:1 notes, key threads, prep questions for the next session.",
      inputs:["person","since?"], outputs:["coach.md"],
      runs:22, p95:"6.2s", costPer:"$0.025", evalScore:"4/6", lastRun:"1w", trend:"up" },
    { id:"standup", path:"/standup", owner:"claire", verb:"Team standup digest",
      desc:"Each report's blockers and what's on. Compact dispatch back to the team.",
      inputs:["team_id"], outputs:["standup.md"],
      runs:18, p95:"4.5s", costPer:"$0.018", evalScore:"6/6", lastRun:"2d", trend:"up" },
    { id:"guardrail", path:"/guardrail", owner:"hans", verb:"Block before harm",
      desc:"Scans every outgoing message for PII, cost, irreversible side-effects.",
      inputs:["draft"], outputs:["allow|block","reason"],
      runs:2103, p95:"0.2s", costPer:"$0.000", evalScore:"6/6", lastRun:"11:02", trend:"up" },
    { id:"cost", path:"/cost", owner:"hans", verb:"Cost audit",
      desc:"Daily + monthly spend per agent, per model. Anomaly flagging + auto-cap.",
      inputs:["window?"], outputs:["report.md","alerts[]"],
      runs:340, p95:"0.3s", costPer:"$0.001", evalScore:"6/6", lastRun:"06:00", trend:"steady" },
    { id:"redact", path:"/redact", owner:"hans", verb:"Redact PII",
      desc:"Scans + redacts PII from drafts and persisted data. Audited each run.",
      inputs:["text"], outputs:["redacted","report"],
      runs:412, p95:"0.5s", costPer:"$0.002", evalScore:"6/6", lastRun:"05:30", trend:"steady" },
    { id:"route", path:"/route", owner:"jarvis", verb:"Route to specialist",
      desc:"Classifies a request and routes to exactly one specialist. Never executes.",
      inputs:["item"], outputs:["agent","skill","confidence"],
      runs:2840, p95:"0.18s", costPer:"$0.005", evalScore:"6/6", lastRun:"now", trend:"up" },
    { id:"dispatch", path:"/dispatch", owner:"jarvis", verb:"Dispatch a skill",
      desc:"Invokes a skill on the owner's behalf. Logs every call to hive_mind_log.",
      inputs:["agent","skill","payload"], outputs:["result","trace"],
      runs:1840, p95:"variable", costPer:"$0.001", evalScore:"6/6", lastRun:"now", trend:"up" },
    { id:"wrap", path:"/wrap", owner:"jarvis", verb:"Close the loop",
      desc:"Marks a Mission Control task done, files artefacts, notifies you on Telegram.",
      inputs:["task_id"], outputs:["wrap_msg","links[]"],
      runs:642, p95:"0.4s", costPer:"$0.002", evalScore:"6/6", lastRun:"08:30", trend:"steady" },
  ];

  var CAPABILITY_AREAS = [
    { id:"orchestration", label:"ORCHESTRATION", glyph:"hub", owner:"jarvis", subtitle:"Routing, dispatch, closing the loop" },
    { id:"inbox", label:"INBOX & COMMS", glyph:"inbox", owner:"birgit", subtitle:"Email, calendar, replies, meeting prep" },
    { id:"workspace", label:"WORKSPACE", glyph:"folder_open", owner:"kenji", subtitle:"Notion, schemas, filing, persona lifecycle" },
    { id:"build", label:"BUILD & SHIP", glyph:"terminal", owner:"kumar", subtitle:"Code, CI, deploys, evals, GitHub" },
    { id:"research", label:"RESEARCH & WRITING", glyph:"experiment", owner:"q", subtitle:"Briefs, decisions, synthesis, long-form" },
    { id:"isc", label:"ISC & STRATEGY", glyph:"work", owner:"claire", subtitle:"SIOP, ABB, supply, coaching, team" },
    { id:"governance", label:"GOVERNANCE", glyph:"shield", owner:"hans", subtitle:"Security, cost, audit, redaction" },
  ];

  var PLUGIN_CATEGORIES = [
    { id:"MCP", label:"MCP SERVERS", glyph:"settings_input_component", subtitle:"Live integrations — Notion, GitHub, Calendar, etc." },
    { id:"API", label:"EXTERNAL APIS", glyph:"api", subtitle:"Web search, fetch, marketing data" },
    { id:"DOCS", label:"KNOWLEDGE FILES", glyph:"library_books", subtitle:"CLAUDE.md, schemas, golden sets, runbooks" },
  ];

  var PLUGINS = [
    { id:"mcp-notion", category:"MCP", name:"Notion", glyph:"description",
      desc:"Read/write Notion pages and databases.", usedBy:["birgit","kenji","claire","q"], status:"connected", lastUse:"2m", scope:"read+write" },
    { id:"mcp-github", category:"MCP", name:"GitHub", glyph:"code",
      desc:"Repo browsing, PR review, CI status.", usedBy:["kumar"], status:"connected", lastUse:"23m", scope:"repo+actions" },
    { id:"mcp-gmail", category:"MCP", name:"Gmail", glyph:"mail",
      desc:"Inbox triage and drafts. Outbound send is human-gated.", usedBy:["birgit"], status:"connected", lastUse:"4m", scope:"read · draft-only send" },
    { id:"mcp-calendar", category:"MCP", name:"Google Cal", glyph:"event",
      desc:"Read + write calendar. Meeting prep, scheduling.", usedBy:["birgit","claire"], status:"connected", lastUse:"35m", scope:"read+write" },
    { id:"mcp-telegram", category:"MCP", name:"Telegram", glyph:"chat",
      desc:"The Bridge — primary user channel.", usedBy:["jarvis","birgit"], status:"connected", lastUse:"now", scope:"bidirectional" },
    { id:"mcp-slack", category:"MCP", name:"Slack", glyph:"forum",
      desc:"Team channel bridge. Awaiting workspace key.", usedBy:[], status:"disconnected", lastUse:"never", scope:"—" },
    { id:"api-search", category:"API", name:"Web Search", glyph:"travel_explore",
      desc:"Curated search over Q's research queries.", usedBy:["q","kumar"], status:"connected", lastUse:"1h", scope:"5 queries/min" },
    { id:"api-fetch", category:"API", name:"Web Fetch", glyph:"download",
      desc:"Fetch and parse a URL for citations.", usedBy:["q"], status:"connected", lastUse:"1h", scope:"GET · 200 KB cap" },
    { id:"api-meta", category:"API", name:"Meta Ads", glyph:"trending_up",
      desc:"Campaign data + pause/resume.", usedBy:["hans","claire"], status:"degraded", lastUse:"5h", scope:"read · pause-on-anomaly" },
    { id:"kb-claude", category:"DOCS", name:"CLAUDE.md", glyph:"menu_book",
      desc:"Per-agent persona spec.", usedBy:["jarvis","birgit","kenji","kumar","q","claire","hans"], status:"current", lastUse:"now", scope:"agents/<id>/CLAUDE.md" },
    { id:"kb-schema", category:"DOCS", name:"Notion Schemas", glyph:"schema",
      desc:"Field definitions for Inbox, Decisions, Hive Log.", usedBy:["kenji","birgit","q"], status:"current", lastUse:"6m", scope:"schemas/*.yaml" },
    { id:"kb-golden", category:"DOCS", name:"Golden Sets", glyph:"verified",
      desc:"Eval fixtures. 24 skills × 20 cases each.", usedBy:["kumar","hans"], status:"current", lastUse:"daily", scope:"evals/golden/" },
    { id:"kb-runbook", category:"DOCS", name:"Runbook", glyph:"play_lesson",
      desc:"Incident playbook. Kill-switch SOPs.", usedBy:["hans","kumar"], status:"current", lastUse:"7d", scope:"docs/runbook.md" },
  ];

  var ACADEMY_DOMAINS = [
    { key:"ops", label:"OPS", full:"Operations" },
    { key:"intel", label:"INTEL", full:"Intelligence" },
    { key:"strat", label:"STRAT", full:"Strategy" },
    { key:"eng", label:"ENG", full:"Engineering" },
    { key:"gov", label:"GOV", full:"Governance" },
  ];

  var AGENT_DOMAIN_MAP = {
    jarvis: { ops:3, intel:3, strat:3, eng:1, gov:2 },
    birgit: { ops:3, intel:1, strat:1, eng:0, gov:2 },
    kenji:  { ops:1, intel:3, strat:1, eng:0, gov:0 },
    kumar:  { ops:1, intel:2, strat:3, eng:0, gov:2 },
    q:      { ops:2, intel:1, strat:1, eng:3, gov:1 },
    claire: { ops:3, intel:1, strat:2, eng:0, gov:1 },
    hans:   { ops:1, intel:0, strat:1, eng:0, gov:3 },
  };

  var AGENT_QUESTS = {
    jarvis: { skill:"/meta-review", desc:"Cross-agent synthesis across all specialist reports", pct:0.35 },
    birgit: { skill:"/negotiate", desc:"High-stakes correspondence and counter-offer drafting", pct:0.20 },
    kenji:  { skill:"/forecast", desc:"Predictive trend modeling from sparse market signals", pct:0.55 },
    kumar:  { skill:"/simulate", desc:"Scenario planning and red-team stress testing", pct:0.15 },
    q:      { skill:"/deploy", desc:"Automated CI/CD pipeline and release management", pct:0.70 },
    claire: { skill:"/risk-model", desc:"Probabilistic supply chain risk scoring", pct:0.40 },
    hans:   { skill:"/audit", desc:"End-to-end compliance audit report generation", pct:0.60 },
  };

  var SKILL_LIFECYCLE = [
    { n:"01", label:"IDENTIFY GAP", glyph:"travel_explore", desc:"Noticed in standup or a missed routing." },
    { n:"02", label:"DRAFT SKILL.md", glyph:"description", desc:"Owner writes id, inputs, outputs, side-effects." },
    { n:"03", label:"BUILD", glyph:"build", desc:"scripts/ + references/ + assets/. Hooks wired." },
    { n:"04", label:"EVAL", glyph:"science", desc:"Golden set ≥ 90%. Kumar gates the build." },
    { n:"05", label:"SHIP", glyph:"rocket_launch", desc:"/promote → ACTIVE. Bridge surfaces enabled." },
  ];

  var PLUGIN_LIFECYCLE = [
    { n:"01", label:"REQUEST", glyph:"contact_support", desc:"An agent needs a new tool or data source." },
    { n:"02", label:"CONNECT", glyph:"link", desc:"OAuth or webhook. Scope minimal by default." },
    { n:"03", label:"GUARDRAIL", glyph:"shield", desc:"Hans reviews — rate caps, cost caps, PII rules." },
    { n:"04", label:"GRANT", glyph:"verified_user", desc:"Scoped access issued. Agents updated." },
    { n:"05", label:"MONITOR", glyph:"monitoring", desc:"Health checks, anomaly alerts, auto-revoke." },
  ];

  /* ─── Status color mapping ─── */
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
    connected:{label:"CONNECTED",c:T.ok,bg:T.okLight},
    disconnected:{label:"OFF",c:T.textFaint,bg:T.surface},
    degraded:{label:"DEGRADED",c:T.accent,bg:T.accentLight},
    current:{label:"CURRENT",c:T.ok,bg:T.okLight},
  };

  /* ═══════════════════════════════════════════════════════════════
     PRIMITIVES
  ═══════════════════════════════════════════════════════════════ */

  function Glyph(props) {
    var ch = ICON[props.name] || "•";
    return React.createElement('span', {
      style: { fontSize: props.size||16, color: props.color||T.textMid, lineHeight: 1, display: 'inline-block' }
    }, ch);
  }

  function Dot(props) {
    return React.createElement('span', {
      style: {
        display: 'inline-block', width: props.size||8, height: props.size||8,
        borderRadius: '50%', background: props.color, flexShrink: 0,
        animation: props.pulse ? 'pulse 1.6s ease-in-out infinite' : 'none'
      }
    });
  }

  function Pill(props) {
    return React.createElement('span', {
      style: {
        fontFamily: F.body, fontSize: 11, fontWeight: 500,
        color: props.color||T.textDim, background: props.bg||T.surface,
        border: '1px solid ' + (props.color||T.textDim) + '30',
        padding: '1px 7px', borderRadius: 3, lineHeight: 1.7, whiteSpace: 'nowrap'
      }
    }, props.label);
  }

  function StatusPill(props) {
    var s = SC[props.status] || {label: String(props.status||"").toUpperCase(), c: T.textDim, bg: T.surface};
    return React.createElement(Pill, {label: s.label, color: s.c, bg: s.bg});
  }

  function SectionTitle(props) {
    return React.createElement('div', {style: {marginBottom: 14}},
      props.kicker && React.createElement('div', {
        style: {fontFamily: F.body, fontSize: 11, fontWeight: 700, color: T.accentDark, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6}
      }, props.kicker),
      React.createElement('div', {
        style: {fontFamily: F.body, fontWeight: 800, fontSize: 20, color: T.text, letterSpacing: '0.01em', lineHeight: 1}
      }, props.title, props.accent && React.createElement('span', {style: {color: T.accent}}, " ", props.accent)),
      props.sub && React.createElement('div', {
        style: {fontFamily: F.body, fontSize: 12, color: T.textDim, marginTop: 8, lineHeight: 1.5, maxWidth: 680}
      }, props.sub)
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

  function MiniTrend(props) {
    var t = props.trend || 'steady';
    var ch = t === 'up' ? '↑' : t === 'down' ? '↓' : '→';
    var c = t === 'up' ? T.ok : t === 'down' ? T.block : T.textDim;
    return React.createElement('span', {
      style: {fontFamily: F.mono, fontSize: 10, color: c, fontWeight: 700}
    }, ch);
  }

  function domainRank(score) {
    if (score >= 3) return {short:"MST", color:T.ok};
    if (score >= 2) return {short:"ADT", color:T.run};
    if (score >= 1) return {short:"TRN", color:T.pilot};
    return {short:"—", color:T.textFaint};
  }

  /* ═══════════════════════════════════════════════════════════════
     LIFECYCLE INFOGRAPHIC — 4-beat story strip
  ═══════════════════════════════════════════════════════════════ */
  function LifecycleInfographic() {
    var beats = [
      { n: AGENTS.length, noun:"AGENTS", icon:"group", color:T.accent,
        line1:"Your team.", line2:"Each one has a role, a domain specialisation, and a rank.", tag:"CLICK ANY ROW BELOW" },
      { n: SKILLS.length, noun:"SKILLS", icon:"psychology", color:T.run,
        line1:"What they can do.", line2:"Earned through deployment, tested on a 12-case golden set.", tag:"EARNED · NOT ASSUMED" },
      { n: "4", noun:"RANKS", icon:"military_tech", color:T.ok,
        line1:"How good they are.", line2:"Eval score drives rank: TRAINEE → ADEPT → EXPERT → MASTER.", tag:"SCORE DECIDES" },
      { n: PLUGINS.length, noun:"PLUGINS", icon:"extension", color:T.pilot,
        line1:"Tools they wield.", line2:"Connected and scoped per agent. Every addition reviewed by Hans.", tag:"GOVERNED · NOT FREE" },
    ];

    return React.createElement('div', {style: {border:'1px solid '+T.border, marginBottom:28}},
      React.createElement('div', {style: {padding:'9px 16px', background:T.surface, borderBottom:'1px solid '+T.border, display:'flex', alignItems:'center', gap:10}},
        React.createElement(Glyph, {name:"school", size:13, color:T.textDim}),
        React.createElement('span', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.14em'}},
          "WHAT THIS TAB DOES · MANAGING AGENTS AS EMPLOYEES")
      ),
      React.createElement('div', {style: {display:'grid', gridTemplateColumns:'repeat(4, 1fr)'}},
        beats.map(function(b, i) {
          return React.createElement('div', {
            key: b.noun,
            style: {
              padding:'20px 20px 18px', borderRight: i<3?'1px solid '+T.border:'none',
              background: i%2===0?T.bg:T.surface, position:'relative'
            }
          },
            i < 3 && React.createElement('div', {style: {
              position:'absolute', right:-9, top:'50%', transform:'translateY(-50%)',
              width:0, height:0, zIndex:2,
              borderTop:'7px solid transparent', borderBottom:'7px solid transparent',
              borderLeft:'9px solid '+T.border
            }}),
            React.createElement('div', {style: {display:'flex', alignItems:'flex-end', gap:10, marginBottom:10}},
              React.createElement('div', {style: {
                width:38, height:38, background:b.color,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
              }}, React.createElement(Glyph, {name:b.icon, size:22, color:'#fff'})),
              React.createElement('div', null,
                React.createElement('div', {style: {fontFamily:F.body, fontWeight:800, fontSize:28, color:b.color, lineHeight:1, letterSpacing:'0.01em'}}, b.n),
                React.createElement('div', {style: {fontFamily:F.mono, fontSize:9, fontWeight:700, color:b.color, letterSpacing:'0.1em', marginTop:1, opacity:0.75}}, b.noun)
              )
            ),
            React.createElement('div', {style: {fontFamily:F.body, fontSize:12, fontWeight:700, color:T.text, marginBottom:4}}, b.line1),
            React.createElement('div', {style: {fontFamily:F.body, fontSize:11, color:T.textMid, lineHeight:1.55, marginBottom:12}}, b.line2),
            React.createElement('span', {style: {fontFamily:F.mono, fontSize:8, fontWeight:700, color:b.color, letterSpacing:'0.1em', background:b.color+'15', padding:'3px 7px'}}, b.tag)
          );
        })
      )
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     AGENT ACADEMY — competency matrix + inline dossier
  ═══════════════════════════════════════════════════════════════ */
  function AgentAcademy() {
    var _useState = useState(null);
    var selected = _useState[0];
    var setSelected = _useState[1];
    var _useState2 = useState(0);
    var visible = _useState2[0];
    var setVisible = _useState2[1];

    useEffect(function() {
      var ts = AGENTS.map(function(_, i) {
        return setTimeout(function() { setVisible(function(c) { return c + 1; }); }, i * 80 + 60);
      });
      return function() { ts.forEach(clearTimeout); };
    }, []);

    function AgentDossier(props) {
      var agent = props.agent;
      var skills = props.skills;
      var domains = props.domains;
      var quest = AGENT_QUESTS[agent.id];
      var totalRuns = skills.reduce(function(s, sk) { return s + sk.runs; }, 0);
      var certified = skills.filter(function(sk) {
        var parts = sk.evalScore.split("/").map(Number);
        return parts[0]/parts[1] >= 0.83;
      });
      var specDomain = ACADEMY_DOMAINS.reduce(function(best, d) {
        return (domains[d.key]||0) > (domains[best.key]||0) ? d : best;
      }, ACADEMY_DOMAINS[0]);
      var specLabel = agent.id === "jarvis" ? "ORCHESTRATION" : specDomain.full.toUpperCase();

      return React.createElement('div', {
        style: {background:T.accentLight, borderBottom:'1px solid '+T.border, padding:'22px', animation:'fadeUp 0.28s cubic-bezier(0.25,1,0.5,1) both'}
      },
        React.createElement('div', {style: {display:'grid', gridTemplateColumns:'200px 1fr 200px', gap:24}},
          /* Left: identity + competency bars */
          React.createElement('div', null,
            React.createElement('div', {style: {display:'flex', alignItems:'center', gap:12, marginBottom:18}},
              React.createElement('div', {style: {width:46, height:46, background:T.accent, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center'}},
                React.createElement(Glyph, {name:agent.glyph, size:28, color:'#fff'})),
              React.createElement('div', null,
                React.createElement('div', {style: {fontFamily:F.body, fontWeight:700, fontSize:18, color:T.accent, letterSpacing:'0.01em', lineHeight:1}}, agent.name),
                React.createElement('div', {style: {fontFamily:F.body, fontSize:10, color:T.textMid, marginTop:4}}, agent.role + " · ",
                  React.createElement('span', {style: {fontFamily:F.mono, color:T.text, fontWeight:600}}, agent.model))
              )
            ),
            React.createElement('div', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', marginBottom:4}}, "SPECIALISATION"),
            React.createElement('div', {style: {fontFamily:F.mono, fontWeight:700, fontSize:13, color:T.textMid, letterSpacing:'0.08em', marginBottom:16}}, specLabel),
            React.createElement('div', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', marginBottom:8}}, "DOMAIN PROFICIENCY"),
            React.createElement('div', {style: {display:'flex', flexDirection:'column', gap:7}},
              ACADEMY_DOMAINS.map(function(d) {
                var score = domains[d.key] || 0;
                var r = domainRank(score);
                return React.createElement('div', {key:d.key, style: {display:'grid', gridTemplateColumns:'46px 1fr 28px', gap:8, alignItems:'center'}},
                  React.createElement('span', {style: {fontFamily:F.mono, fontSize:9, color:T.textDim}}, d.label),
                  React.createElement('div', {style: {height:4, background:T.border}},
                    React.createElement('div', {style: {height:'100%', width:'100%', transform:'scaleX('+(score/3)+')', transformOrigin:'left', background:score===0?T.borderMid:r.color, transition:'transform 0.7s cubic-bezier(0.25,1,0.5,1) 0.1s'}})
                  ),
                  React.createElement('span', {style: {fontFamily:F.mono, fontSize:8, color:r.color, textAlign:'right'}}, score===0?"—":r.short)
                );
              })
            )
          ),
          /* Center: skills record */
          React.createElement('div', null,
            React.createElement('div', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', marginBottom:10}},
              "SKILLS RECORD · ", skills.length, " OWNED · ", totalRuns.toLocaleString(), "× RUN"
            ),
            skills.length === 0 ?
              React.createElement('div', {style: {fontFamily:F.mono, fontSize:11, color:T.textFaint, fontStyle:'italic', padding:'12px 0', lineHeight:1.6}},
                "No skills owned.", React.createElement('br'), "Inherits common library via JARVIS.")
            :
              React.createElement('div', {style: {border:'1px solid '+T.border, background:T.bg}},
                React.createElement('div', {style: {display:'grid', gridTemplateColumns:'86px minmax(0,1fr) 38px 38px 52px', gap:10, padding:'6px 12px', background:T.surface, borderBottom:'1px solid '+T.border}},
                  ["SKILL","VERB","EVAL","RUNS","TREND"].map(function(h) {
                    return React.createElement('span', {key:h, style: {fontFamily:F.body, fontSize:8, fontWeight:700, color:T.textDim, letterSpacing:'0.1em'}}, h);
                  })
                ),
                skills.map(function(sk, i) {
                  var parts = sk.evalScore.split("/").map(Number);
                  var evalColor = parts[0]/parts[1] >= 0.9 ? T.ok : parts[0]/parts[1] >= 0.8 ? T.run : T.pilot;
                  return React.createElement('div', {key:sk.id, style: {display:'grid', gridTemplateColumns:'86px minmax(0,1fr) 38px 38px 52px', gap:10, padding:'8px 12px', borderBottom:i<skills.length-1?'1px solid '+T.border:'none', alignItems:'center'}},
                    React.createElement('span', {style: {fontFamily:F.mono, fontSize:11, color:T.accent, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}, sk.path),
                    React.createElement('span', {style: {fontFamily:F.body, fontSize:11, color:T.textMid, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}, sk.verb),
                    React.createElement('span', {style: {fontFamily:F.mono, fontSize:11, color:evalColor, fontWeight:700}}, sk.evalScore),
                    React.createElement('span', {style: {fontFamily:F.mono, fontSize:10, color:T.textDim}}, sk.runs+"×"),
                    React.createElement(MiniTrend, {trend:sk.trend})
                  );
                })
              )
          ),
          /* Right: certifications + quest + stats */
          React.createElement('div', null,
            React.createElement('div', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', marginBottom:8}}, "CERTIFICATIONS"),
            certified.length === 0 ?
              React.createElement('div', {style: {fontFamily:F.mono, fontSize:10, color:T.textFaint, fontStyle:'italic', marginBottom:14}}, "none yet")
            :
              React.createElement('div', {style: {display:'flex', flexWrap:'wrap', gap:4, marginBottom:16}},
                certified.map(function(sk) {
                  return React.createElement('span', {key:sk.id, style: {fontFamily:F.mono, fontSize:9, fontWeight:700, color:T.ok, background:T.okLight, padding:'3px 8px', letterSpacing:'0.04em'}}, sk.path);
                })
              ),
            quest && React.createElement(React.Fragment, null,
              React.createElement('div', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', marginBottom:8}}, "CURRENT QUEST"),
              React.createElement('div', {style: {background:T.bg, border:'1px solid '+T.accentBorder, borderTop:'2px solid '+T.accent, padding:'11px 12px', marginBottom:16}},
                React.createElement('div', {style: {fontFamily:F.mono, fontSize:13, color:T.accent, fontWeight:700, letterSpacing:'0.04em', marginBottom:5}}, quest.skill),
                React.createElement('div', {style: {fontFamily:F.body, fontSize:11, color:T.textMid, lineHeight:1.5, marginBottom:10}}, quest.desc),
                React.createElement('div', {style: {height:3, background:T.border}},
                  React.createElement('div', {style: {height:'100%', width:'100%', transform:'scaleX('+quest.pct+')', transformOrigin:'left', background:T.pilot, transition:'transform 0.7s cubic-bezier(0.25,1,0.5,1) 0.3s'}})
                ),
                React.createElement('div', {style: {fontFamily:F.mono, fontSize:9, color:T.pilot, textAlign:'right', marginTop:4}}, Math.round(quest.pct*100)+"% COMPLETE")
              )
            ),
            React.createElement('div', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', marginBottom:6}}, "STATS"),
            React.createElement('div', {style: {display:'grid', gridTemplateColumns:'1fr 1fr', gap:5}},
              [
                {l:"MEMORIES", v:(agent.memoryCount||0).toLocaleString()},
                {l:"LAST ACTIVE", v:agent.lastActive},
                {l:"LIFECYCLE", v:(agent.status||"").toUpperCase()},
                {l:"TOTAL RUNS", v:totalRuns+"×"},
              ].map(function(stat) {
                return React.createElement('div', {key:stat.l, style: {background:T.bg, border:'1px solid '+T.border, padding:'7px 9px'}},
                  React.createElement('div', {style: {fontFamily:F.mono, fontSize:8, color:T.textFaint, letterSpacing:'0.08em', marginBottom:2}}, stat.l),
                  React.createElement('div', {style: {fontFamily:F.mono, fontSize:11, color:T.text, fontWeight:600}}, stat.v)
                );
              })
            )
          )
        )
      );
    }

    return React.createElement('div', null,
      React.createElement('div', {style: {display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.14em', textTransform:'uppercase'}},
        React.createElement('span', null, "COMPETENCY MATRIX · ", AGENTS.length, " AGENTS ENROLLED"),
        React.createElement('span', null, "CLICK ROW TO OPEN DOSSIER")
      ),
      React.createElement('div', {style: {border:'1px solid '+T.border}},
        React.createElement('div', {style: {display:'grid', gridTemplateColumns:'220px repeat(5, 1fr) 88px', padding:'8px 14px', background:T.surface, borderBottom:'1px solid '+T.border}},
          React.createElement('span', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em'}}, "AGENT"),
          ACADEMY_DOMAINS.map(function(d) {
            return React.createElement('span', {key:d.key, style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', textAlign:'center'}}, d.label);
          }),
          React.createElement('span', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:'0.12em', textAlign:'right'}}, "RANK")
        ),
        AGENTS.map(function(agent, i) {
          var domains = AGENT_DOMAIN_MAP[agent.id] || {};
          var scores = ACADEMY_DOMAINS.map(function(d) { return domains[d.key] || 0; });
          var nonZero = scores.filter(function(s) { return s > 0; });
          var avgScore = nonZero.length ? nonZero.reduce(function(a,b) { return a+b; }, 0) / nonZero.length : 0;
          var rank = domainRank(avgScore);
          var skills = SKILLS.filter(function(s) { return s.owner === agent.id; });
          var isOpen = selected === agent.id;
          var isIn = i < visible;
          var statusColor = agent.status === "active" ? T.ok : T.pilot;

          return React.createElement(React.Fragment, {key:agent.id},
            React.createElement('button', {
              className: 'sid-btn',
              onClick: function() { setSelected(isOpen ? null : agent.id); },
              style: {
                display:'grid', gridTemplateColumns:'220px repeat(5, 1fr) 88px', width:'100%', border:'none', textAlign:'left', cursor:'pointer',
                borderBottom:'1px solid '+(isOpen?T.accent:T.border), padding:'10px 14px',
                background:isOpen?T.accentLight:(i%2===0?T.bg:T.surface),
                opacity:isIn?1:0, transform:isIn?'translateY(0)':'translateY(6px)',
                transition:'opacity 0.3s ease, transform 0.3s ease, background 0.15s'
              }
            },
              React.createElement('div', {style: {display:'flex', alignItems:'center', gap:10}},
                React.createElement('div', {style: {width:30, height:30, flexShrink:0, background:isOpen?T.accent:T.ink, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s'}},
                  React.createElement(Glyph, {name:agent.glyph, size:17, color:'#fff'})
                ),
                React.createElement('div', {style: {minWidth:0}},
                  React.createElement('div', {style: {fontFamily:F.body, fontWeight:600, fontSize:14, color:isOpen?T.accent:T.text, letterSpacing:'0.05em', lineHeight:1}}, agent.name),
                  React.createElement('div', {style: {fontFamily:F.body, fontSize:10, color:T.textDim, marginTop:2, display:'flex', alignItems:'center', gap:5}},
                    React.createElement(Dot, {color:statusColor, size:4, pulse:agent.status==="piloting"}),
                    agent.role
                  )
                )
              ),
              ACADEMY_DOMAINS.map(function(d) {
                var score = domains[d.key] || 0;
                var r = domainRank(score);
                return React.createElement('div', {key:d.key, style: {display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3}},
                  score === 0 ?
                    React.createElement('span', {style: {fontFamily:F.mono, fontSize:12, color:T.borderMid}}, "—")
                  :
                    React.createElement(React.Fragment, null,
                      React.createElement('div', {style: {display:'flex', gap:2}},
                        [1,2,3].map(function(n) {
                          return React.createElement('div', {key:n, style: {width:8, height:8, background:n<=score?r.color:T.border}});
                        })
                      ),
                      React.createElement('span', {style: {fontFamily:F.mono, fontSize:8, fontWeight:700, color:r.color, letterSpacing:'0.04em'}}, r.short)
                    )
                );
              }),
              React.createElement('div', {style: {textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', justifyContent:'center', gap:3}},
                React.createElement('span', {style: {fontFamily:F.mono, fontSize:9, fontWeight:700, color:rank.color, letterSpacing:'0.08em'}}, rank.short),
                React.createElement('span', {style: {fontFamily:F.mono, fontSize:8, color:T.textFaint}}, skills.length+" skills")
              )
            ),
            isOpen && React.createElement(AgentDossier, {agent:agent, skills:skills, domains:domains})
          );
        })
      ),
      React.createElement('div', {style: {marginTop:28}},
        React.createElement(SkillLifecycle, null)
      )
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     SKILL LIFECYCLE
  ═══════════════════════════════════════════════════════════════ */
  function SkillLifecycle() {
    return React.createElement('div', null,
      React.createElement('div', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.accent, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:10}},
        "SKILL LIFECYCLE · FROM IDEA TO SHIPPED"),
      React.createElement('div', {style: {display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:1, background:T.border}},
        SKILL_LIFECYCLE.map(function(s, i) {
          return React.createElement('div', {key:s.n, style: {background:T.bg, padding:'14px 12px', borderRight:i<4?'1px solid '+T.border:'none'}},
            React.createElement('div', {style: {display:'flex', alignItems:'center', gap:8, marginBottom:8}},
              React.createElement('div', {style: {width:28, height:28, background:T.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}},
                React.createElement(Glyph, {name:s.glyph, size:16, color:'#fff'})
              ),
              React.createElement('span', {style: {fontFamily:F.mono, fontSize:10, color:T.accent, fontWeight:700, letterSpacing:'0.06em'}}, s.n)
            ),
            React.createElement('div', {style: {fontFamily:F.body, fontWeight:600, fontSize:13, color:T.text, letterSpacing:'0.04em', marginBottom:4}}, s.label),
            React.createElement('div', {style: {fontFamily:F.body, fontSize:10, color:T.textMid, lineHeight:1.5}}, s.desc)
          );
        })
      )
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     ARMORY SECTION — plugin armory grouped by category
  ═══════════════════════════════════════════════════════════════ */
  function ArmorySection() {
    return React.createElement('div', null,
      React.createElement('div', {style: {fontFamily:F.body, fontSize:9, fontWeight:700, color:T.accent, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:10}},
        "ARMORY · ", PLUGINS.length, " TOOLS · GROUPED BY TYPE"),
      PLUGIN_CATEGORIES.map(function(cat) {
        var catPlugins = PLUGINS.filter(function(p) { return p.category === cat.id; });
        return React.createElement('div', {key:cat.id, style: {marginBottom:18}},
          React.createElement('div', {style: {display:'flex', alignItems:'center', gap:8, marginBottom:8}},
            React.createElement(Glyph, {name:cat.glyph, size:14, color:T.accent}),
            React.createElement('span', {style: {fontFamily:F.body, fontWeight:600, fontSize:14, color:T.text, letterSpacing:'0.05em'}}, cat.label),
            React.createElement('span', {style: {fontFamily:F.mono, fontSize:10, color:T.textDim}}, "("+catPlugins.length+")"),
            React.createElement('div', {style: {flex:1, height:1, background:T.border}}),
            React.createElement('span', {style: {fontFamily:F.body, fontSize:10, color:T.textDim}}, cat.subtitle)
          ),
          React.createElement('div', {style: {display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:1, background:T.border}},
            catPlugins.map(function(p) {
              var sc = p.status === "connected" || p.status === "current" ? T.ok : p.status === "degraded" ? T.accent : T.textFaint;
              return React.createElement('div', {key:p.id, style: {background:T.bg, padding:'12px 14px'}},
                React.createElement('div', {style: {display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6}},
                  React.createElement('div', {style: {display:'flex', alignItems:'center', gap:7}},
                    React.createElement(Dot, {color:sc, size:6, pulse:p.status==="degraded"}),
                    React.createElement('span', {style: {fontFamily:F.body, fontWeight:500, fontSize:13, color:T.text, letterSpacing:'0.04em'}}, p.name)
                  ),
                  React.createElement(Pill, {label:p.status.toUpperCase(), color:sc, bg:sc+'15'})
                ),
                React.createElement('div', {style: {fontFamily:F.body, fontSize:11, color:T.textMid, lineHeight:1.5, marginBottom:6}}, p.desc),
                React.createElement('div', {style: {fontFamily:F.mono, fontSize:9, color:T.textDim, paddingTop:6, borderTop:'1px solid '+T.border}},
                  "scope: ", p.scope, " · last: ", p.lastEvent,
                  p.usedBy.length > 0 && React.createElement('span', null, " · used by: ", p.usedBy.join(", "))
                )
              );
            })
          )
        );
      })
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     MAIN VIEW
  ═══════════════════════════════════════════════════════════════ */
  function SkillsView() {
    injectStyles();
    return React.createElement('div', {style: {padding:'24px'}},
      React.createElement('style', null, ACADEMY_CSS),
      React.createElement(SectionTitle, {
        kicker: "CENTER OF EXCELLENCE · THE ACADEMY",
        title: "SEVEN AGENTS.",
        accent: "SKILL UP · EARN RANK · MANAGE TOOLS.",
        sub: "One view. Competency matrix, employee dossiers, and plugin armory — everything an agent needs to operate, earned, equipped, and governed."
      }),
      React.createElement(LifecycleInfographic, null),
      React.createElement(AgentAcademy, null),
      React.createElement('div', {style: {marginTop:32}},
        React.createElement(ArmorySection, null)
      )
    );
  }

  window.__HERMES_PLUGINS__.register('sid-skills', SkillsView);
})();
