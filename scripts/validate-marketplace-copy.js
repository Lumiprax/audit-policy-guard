'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const text=fs.readFileSync(path.join(root,'docs/MARKETPLACE_LISTING.md'),'utf8');
const failures=[];
const one=(label,rx,max)=>{const m=text.match(rx);if(!m)return failures.push(`${label.toUpperCase().replace(/\s+/g,'_')}_MISSING`);if(m[1].trim().length>max)failures.push(`${label.toUpperCase().replace(/\s+/g,'_')}_TOO_LONG_${m[1].trim().length}_${max}`);};
one('app name',/\*\*Name:\*\* (.+)/,60);
one('tagline',/\*\*Tagline:\*\* (.+)/,130);
one('summary',/\*\*Summary:\*\* (.+)/,250);
one('release summary',/\*\*Release summary:\*\* (.+)/,80);
for(let i=1;i<=3;i++){
  const m=text.match(new RegExp(`### ${i}\\. (.+?)\\n\\*\\*Summary:\\*\\* (.+?)\\n\\n\\*\\*Caption:\\*\\* (.+?)\\n`,'s'));
  if(!m){failures.push(`HIGHLIGHT_${i}_MISSING`);continue;}
  if(m[1].trim().length>50)failures.push(`HIGHLIGHT_${i}_TITLE_TOO_LONG`);
  if(m[2].trim().length>220)failures.push(`HIGHLIGHT_${i}_SUMMARY_TOO_LONG`);
  if(m[3].trim().length>220)failures.push(`HIGHLIGHT_${i}_CAPTION_TOO_LONG`);
}
if(!/\*\*Documentation URL:\*\* https:\/\//.test(text))failures.push('DOCUMENTATION_URL_MISSING');
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('MARKETPLACE_COPY_CHECK=PASS');
