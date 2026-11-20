import fs from 'node:fs';
import { emptyDeps, loadGatewayConfig, startGateway } from './server.ts';

const file = JSON.parse(fs.readFileSync(new URL('../config/gateway.example.json', import.meta.url), 'utf8'));
const config = loadGatewayConfig({ env: process.env, file });
const gateway = await startGateway({ host: '127.0.0.1', port: config.port, deps: emptyDeps(config) });
console.log(`gateway listening on http://${gateway.host}:${gateway.port}`);
