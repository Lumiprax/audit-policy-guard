import React,{useEffect,useState} from 'react';
import ForgeReconciler,{Button,Heading,Lozenge,Stack,Text} from '@forge/react';
import {invoke} from '@forge/bridge';

function appearance(severity) {
  return severity==='HIGH'?'removed':'inprogress';
}
function Finding({finding}) {
  return (
    <Stack space="space.050">
      <Lozenge appearance={appearance(finding.severity)}>{finding.severity}</Lozenge>
      <Heading size="small">{finding.summary||'Audit policy finding'}</Heading>
      <Text>{finding.category||'Configuration change'} · {finding.created||'Time unavailable'}</Text>
      <Text>Policies: {(finding.policyIds||[]).join(', ')||'policy match'}</Text>
    </Stack>
  );
}

const App=()=>{
  const [data,setData]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const load=async()=>{
    try { setData(await invoke('getDashboard')); setError(''); }
    catch { setError('Admin access is required to view audit findings.'); }
  };
  useEffect(()=>{load();},[]);
  const scan=async()=>{
    setBusy(true); setError('');
    try {
      const result=await invoke('runScan');
      if(result?.status==='FAIL') setError(`Scan failed: ${result.errorCode||'AUDIT_SCAN_FAILED'}`);
      await load();
    } catch { setError('The audit scan could not be completed.'); }
    finally { setBusy(false); }
  };
  const status=data?.status?.status||'NOT_SCANNED';
  return (
    <Stack space="space.200">
      <Heading size="large">Audit Policy Guard</Heading>
      <Text>Policy-focused monitoring for security-relevant Jira administration and configuration changes.</Text>
      <Lozenge appearance={status==='PASS'?'success':status==='FAIL'?'removed':'inprogress'}>{status}</Lozenge>
      <Button appearance="primary" onClick={scan} isDisabled={busy}>{busy?'Scanning…':'Run scan now'}</Button>
      {error?<Text>{error}</Text>:null}
      <Heading size="medium">Scan health</Heading>
      <Text>Processed: {data?.status?.processed??0} · Findings: {data?.status?.findings??0} · Trigger: {data?.status?.initiatedBy||'not run'}</Text>
      <Text>Last completion: {data?.status?.completedAt||data?.status?.failedAt||'No scan has completed yet'}</Text>
      <Text>Automatic scans run every five minutes. Matched findings are retained in Forge storage for up to {data?.retentionDays||365} days.</Text>
      <Heading size="medium">Recent findings</Heading>
      {(data?.findings||[]).length
        ?data.findings.map((finding,index)=><Finding key={`${finding.sourceRecordId||'finding'}-${index}`} finding={finding}/>)
        :<Text>No policy findings have been stored yet.</Text>}
      <Heading size="medium">Policy coverage</Heading>
      {(data?.policies||[]).map((policy)=>(
        <Stack key={policy.id} space="space.050">
          <Text>{policy.label} · {policy.severity}</Text>
          <Text>{policy.description}</Text>
        </Stack>
      ))}
      <Heading size="medium">Coverage and limits</Heading>
      {(data?.limitations||[]).map((item,index)=><Text key={`limit-${index}`}>{item}</Text>)}
    </Stack>
  );
};

ForgeReconciler.render(<App/>);
