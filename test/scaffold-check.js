'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const file of ['manifest.template.yml','package.json','src/frontend/index.jsx','src/index.js','config/build-contract.json']) { if(!fs.existsSync(path.join(root,file))) throw new Error('Missing '+file); }
const manifest=fs.readFileSync(path.join(root,'manifest.template.yml'),'utf8');
if(!/licensing:\s*\n\s*enabled: true/.test(manifest)) throw new Error('Licensing not enabled');
if(!/name: nodejs24\.x/.test(manifest)) throw new Error('Node 24 runtime missing');
if(/forge\s+(deploy|install)|publish|submit/i.test(manifest)) throw new Error('Release command found');
console.log('FORGE_SCAFFOLD_CHECK=PASS');
