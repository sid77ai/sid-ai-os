#!/usr/bin/env node
/**
 * PR-0 plugin harness.
 *
 * Loads each Hermes dashboard bundle in a fake browser, records SDK calls,
 * and checks whether fixture copy remains on screen when the SDK responds.
 * Does not start Hermes, Notion, or any model provider. Does not fetch fonts.
 *
 * Usage: node scripts/audit/verify-plugins.mjs [--out docs/audit/plugin-harness-results.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const pluginDirs = fs.readdirSync(root).filter((name) => name.startsWith('sid-')).sort();

const FIXTURE_MARKERS = [
  'Telekom invoice',
  'Hive Log',
  'SG INBOX',
  'War Room',
  'Morning briefing',
  'Pong',
];
const LANE_MARKERS = ['ISC', 'SIOP', 'ABB', 'Sharepoint', 'Marco'];

function hermesOnPath() {
  try {
    execFileSync('which', ['hermes'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function staticScan(source) {
  const apiCalls = [...source.matchAll(/\bapi\.([A-Za-z0-9_]+)\s*\(/g)].map((m) => m[1]);
  const network = ['fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'localStorage', 'indexedDB']
    .filter((token) => source.includes(token));
  const fontUrls = [...source.matchAll(/https:\/\/fonts\.googleapis\.com[^'"]+/g)].map((m) => m[0]);
  const readsSdkApi = source.includes('__HERMES_PLUGIN_SDK__.api');
  const laneMarkers = LANE_MARKERS.filter((marker) => source.includes(marker));
  return {
    apiCalls: [...new Set(apiCalls)],
    networkPrimitives: network,
    fontUrls,
    readsSdkApi,
    laneMarkers,
  };
}

function makeReact() {
  const states = [];
  const effects = [];
  const memos = [];
  const callbacks = [];
  const refs = [];
  let stateIdx = 0;
  let effectIdx = 0;
  let memoIdx = 0;
  let callbackIdx = 0;
  let refIdx = 0;

  function useState(init) {
    const i = stateIdx++;
    if (states[i] === undefined) states[i] = typeof init === 'function' ? init() : init;
    const set = (next) => {
      states[i] = typeof next === 'function' ? next(states[i]) : next;
    };
    return [states[i], set];
  }
  function useEffect(fn, deps) {
    const i = effectIdx++;
    const prev = effects[i];
    const changed = !prev || !deps || deps.some((dep, j) => dep !== prev.deps[j]);
    effects[i] = { fn, deps: deps || [], changed };
  }
  function useMemo(fn, deps) {
    const i = memoIdx++;
    const prev = memos[i];
    const same = prev && deps && prev.deps.length === deps.length && deps.every((dep, j) => dep === prev.deps[j]);
    if (same) return prev.value;
    const value = fn();
    memos[i] = { value, deps: deps || [] };
    return value;
  }
  function useCallback(fn, deps) {
    const i = callbackIdx++;
    const prev = callbacks[i];
    const same = prev && deps && prev.deps.length === deps.length && deps.every((dep, j) => dep === prev.deps[j]);
    if (same) return prev.fn;
    callbacks[i] = { fn, deps: deps || [] };
    return fn;
  }
  function useRef(init) {
    const i = refIdx++;
    if (!refs[i]) refs[i] = { current: init };
    return refs[i];
  }
  function resetIndexes() {
    stateIdx = 0;
    effectIdx = 0;
    memoIdx = 0;
    callbackIdx = 0;
    refIdx = 0;
  }
  function runEffects() {
    for (const slot of effects) {
      if (slot && slot.changed) {
        slot.changed = false;
        slot.fn();
      }
    }
  }
  const React = {
    Fragment: Symbol('Fragment'),
    createElement(type, props, ...children) {
      const flat = [];
      const push = (child) => {
        if (Array.isArray(child)) child.forEach(push);
        else if (child !== null && child !== undefined && child !== false && child !== true) flat.push(child);
      };
      children.forEach(push);
      return { type, props: props || {}, children: flat };
    },
  };
  return { React, hooks: { useState, useEffect, useMemo, useCallback, useRef }, resetIndexes, runEffects };
}

function collectText(node, acc) {
  if (node == null || typeof node === 'boolean') return acc;
  if (typeof node === 'string' || typeof node === 'number') {
    acc.push(String(node));
    return acc;
  }
  if (Array.isArray(node)) {
    node.forEach((child) => collectText(child, acc));
    return acc;
  }
  if (node.children) node.children.forEach((child) => collectText(child, acc));
  return acc;
}

function expand(node, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 40) return node;
  if (typeof node.type === 'function') {
    const props = { ...node.props };
    if (node.children.length) props.children = node.children;
    return expand(node.type(props), depth + 1);
  }
  if (Array.isArray(node)) return node.map((child) => expand(child, depth + 1));
  if (node.children) node.children = node.children.map((child) => expand(child, depth + 1));
  return node;
}

function findButtons(node, acc = []) {
  if (!node || typeof node !== 'object') return acc;
  if (node.props && typeof node.props.onClick === 'function') {
    const label = collectText(node, []).join(' ').replace(/\s+/g, ' ').trim();
    acc.push({ label, onClick: node.props.onClick, aria: node.props['aria-label'] || '' });
  }
  if (node.children) node.children.forEach((child) => findButtons(child, acc));
  return acc;
}

function makeDom() {
  const links = [];
  const document = {
    createElement() {
      return {
        rel: '',
        href: '',
        id: '',
        textContent: '',
        setAttribute() {},
        appendChild() {},
      };
    },
    querySelector(sel) {
      if (typeof sel === 'string' && sel.includes('fonts.googleapis')) return null;
      return null;
    },
    getElementById() {
      return null;
    },
    head: {
      appendChild(el) {
        if (el && el.href) links.push(el.href);
      },
    },
  };
  return { document, links };
}

async function renderPlugin(source, apiImpl) {
  const calls = [];
  const api = new Proxy(apiImpl, {
    get(target, prop) {
      if (typeof prop !== 'string') return target[prop];
      const value = target[prop];
      if (typeof value === 'function') {
        return (...args) => {
          calls.push(prop);
          return value(...args);
        };
      }
      return value;
    },
  });
  const react = makeReact();
  const dom = makeDom();
  const registered = {};
  const sandbox = {
    window: {},
    console,
    setTimeout(fn) {
      queueMicrotask(fn);
      return 1;
    },
    clearTimeout() {},
    setInterval() {
      return 1;
    },
    clearInterval() {},
    Date,
    Math,
    Object,
    Array,
    String,
    Number,
    Promise,
    Symbol,
    RegExp,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    queueMicrotask,
    document: dom.document,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.window.__HERMES_PLUGIN_SDK__ = { React: react.React, api, hooks: react.hooks };
  sandbox.window.__HERMES_PLUGINS__ = {
    register(name, component) {
      registered[name] = component;
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { timeout: 2000 });
  const names = Object.keys(registered);
  if (names.length !== 1) {
    throw new Error(`expected 1 registration, got ${names.join(',') || 'none'}`);
  }
  const Component = registered[names[0]];

  async function settle() {
    let tree = null;
    for (let pass = 0; pass < 4; pass++) {
      react.resetIndexes();
      tree = expand(Component({}));
      react.runEffects();
      for (let tick = 0; tick < 12; tick++) await Promise.resolve();
    }
    return tree;
  }

  const tree = await settle();
  return {
    name: names[0],
    calls: [...calls],
    text: collectText(tree, []).join('\n'),
    buttons: findButtons(tree),
    fontLinksAttempted: dom.links.length,
    rerender: settle,
  };
}

function includesAll(text, markers) {
  return markers.filter((marker) => text.includes(marker));
}

async function main() {
  const outFlag = process.argv.indexOf('--out');
  const outPath = outFlag >= 0 ? path.resolve(root, process.argv[outFlag + 1]) : null;
  const failures = [];
  const plugins = [];

  for (const dir of pluginDirs) {
    const entry = path.join(root, dir, 'dashboard', 'dist', 'index.js');
    const manifestPath = path.join(root, dir, 'dashboard', 'manifest.json');
    const source = fs.readFileSync(entry, 'utf8');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const scan = staticScan(source);
    if (manifest.name !== dir) failures.push(`${dir}: manifest name ${manifest.name}`);
    if (manifest.entry !== 'dist/index.js') failures.push(`${dir}: unexpected entry ${manifest.entry}`);
    if (!fs.existsSync(path.join(root, dir, 'dashboard', manifest.entry))) {
      failures.push(`${dir}: entry missing`);
    }

    const rejectView = await renderPlugin(source, {
      getStatus() {
        return Promise.reject(new Error('hermes-not-installed'));
      },
      getSessions() {
        return Promise.reject(new Error('hermes-not-installed'));
      },
    });
    const liveView = await renderPlugin(source, {
      getStatus() {
        return Promise.resolve({ label: 'STATUS_SENTINEL_UNUSED' });
      },
      getSessions() {
        return Promise.resolve({
          sessions: [{
            id: 'live-session-1',
            title: 'LIVE_SESSION_SENTINEL',
            is_active: true,
            source: 'CLI',
            message_count: 2,
            input_tokens: 10,
            output_tokens: 4,
            model: 'stub-model',
            last_active: Math.floor(Date.now() / 1000),
          }],
          total: 1,
        });
      },
    });

    const record = {
      plugin: dir,
      manifestLabel: manifest.label,
      bytes: Buffer.byteLength(source),
      registeredAs: rejectView.name,
      static: scan,
      apiRejected: {
        calls: rejectView.calls,
        fixtureMarkers: includesAll(rejectView.text, FIXTURE_MARKERS),
        laneMarkers: includesAll(rejectView.text, LANE_MARKERS),
        showsLiveSentinel: rejectView.text.includes('LIVE_SESSION_SENTINEL'),
      },
      apiResolved: {
        calls: liveView.calls,
        showsLiveSentinel: liveView.text.includes('LIVE_SESSION_SENTINEL'),
        showsStatusSentinel: liveView.text.includes('STATUS_SENTINEL_UNUSED'),
        stillShowsLaneFixture: includesAll(liveView.text, LANE_MARKERS),
      },
      interactions: {},
    };

    if (dir === 'sid-settings') {
      const test = liveView.buttons.find((button) => button.label === 'TEST' || button.aria.startsWith('Test '));
      const toggle = liveView.buttons.find((button) => button.aria.startsWith('Toggle '));
      if (!test || !toggle) failures.push('sid-settings: expected TEST and toggle buttons');
      else {
        test.onClick();
        await Promise.resolve();
        await Promise.resolve();
        const afterTest = await liveView.rerender();
        const afterText = collectText(afterTest, []).join('\n');
        toggle.onClick();
        const afterToggle = await liveView.rerender();
        const toggleText = collectText(afterToggle, []).join('\n');
        record.interactions.testPing = {
          renderedPong: afterText.includes('Pong'),
          apiCallsDuringTest: liveView.calls.length,
          networkPrimitives: scan.networkPrimitives,
        };
        record.interactions.killSwitch = {
          showedOff: toggleText.includes('○ OFF') || toggleText.includes('OFF'),
          persistedOutsideReact: false,
        };
        if (!afterText.includes('Pong')) failures.push('sid-settings: TEST did not render a synthetic Pong');
        if (liveView.calls.length !== 0) failures.push('sid-settings: TEST called the Hermes SDK');
      }
    }

    if (dir === 'sid-inbox') {
      const route = rejectView.buttons.find((button) => button.label === 'ROUTE');
      if (!route) failures.push('sid-inbox: ROUTE button missing');
      else {
        const before = rejectView.calls.length;
        route.onClick();
        const after = await rejectView.rerender();
        const text = collectText(after, []).join('\n');
        record.interactions.route = {
          apiCalls: rejectView.calls.length - before,
          routedLocally: text.includes('→ '),
        };
        if (rejectView.calls.length !== before) failures.push('sid-inbox: ROUTE called the SDK');
      }
    }

    if (dir === 'sid-mission') {
      // Session titles are copied into inbox state and then used only as counts.
      // A successful SDK response must change the queue total and must not replace fixtures.
      record.apiRejected.queueTotal = (rejectView.text.match(/(\d+) TOTAL/) || [])[1] || null;
      record.apiResolved.queueTotal = (liveView.text.match(/(\d+) TOTAL/) || [])[1] || null;
      record.apiResolved.rendersSessionTitle = liveView.text.includes('LIVE_SESSION_SENTINEL');
      if (record.apiRejected.queueTotal !== '8') failures.push(`sid-mission: expected seed total 8, got ${record.apiRejected.queueTotal}`);
      if (record.apiResolved.queueTotal !== '9') failures.push(`sid-mission: expected seed+live total 9, got ${record.apiResolved.queueTotal}`);
      if (liveView.text.includes('STATUS_SENTINEL_UNUSED')) failures.push('sid-mission: getStatus payload was rendered');
      if (liveView.text.includes('LIVE_SESSION_SENTINEL')) failures.push('sid-mission: session title leaked into the cockpit (counts only expected)');
      if (!liveView.text.includes('Sharepoint')) failures.push('sid-mission: fixture approval disappeared when the SDK responded');
      if (!liveView.calls.includes('getStatus') || !liveView.calls.includes('getSessions')) {
        failures.push('sid-mission: expected getStatus and getSessions');
      }
    }
    if (dir === 'sid-hivemind') {
      if (!liveView.text.includes('LIVE_SESSION_SENTINEL')) failures.push('sid-hivemind: live session was not rendered');
      if (!liveView.text.includes('AI-OS Context Hub')) failures.push('sid-hivemind: fixture hive log missing');
      if (!rejectView.text.includes('No sessions yet')) failures.push('sid-hivemind: rejected SDK did not show the empty session state');
    }
    if (scan.networkPrimitives.length) failures.push(`${dir}: network primitive in source`);
    if (rejectView.name !== manifest.name) failures.push(`${dir}: register() name ${rejectView.name} != manifest`);

    plugins.push(record);
  }

  const summary = {
    ranAt: new Date().toISOString(),
    node: process.version,
    hermesOnPath: hermesOnPath(),
    pluginCount: plugins.length,
    workingIntegrations: [],
    failures,
    plugins,
  };

  const json = JSON.stringify(summary, null, 2);
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, json + '\n');
  }
  console.log(json);
  if (failures.length) {
    console.error(`\n${failures.length} assertion(s) failed`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
