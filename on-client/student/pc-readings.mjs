import os from 'node:os';
import {statfs} from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
const unavailable=reason=>({status:'unverifiable',reason});
const script=String.raw`
$ErrorActionPreference='Stop'
$result=@{}
try { $result.disks=@(Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' | ForEach-Object { @{drive=$_.DeviceID;freeBytes=[double]$_.FreeSpace;totalBytes=[double]$_.Size} }); $result.diskStatus='ok' } catch { $result.diskStatus='unverifiable' }
try { $result.network=@(Get-NetAdapter | ForEach-Object { @{name=$_.Name;status=[string]$_.Status;linkSpeed=[string]$_.LinkSpeed} }); $result.networkStatus='ok' } catch { $result.networkStatus='unverifiable' }
try { $result.firewall=@(Get-NetFirewallProfile | ForEach-Object { @{name=$_.Name;enabled=[string]$_.Enabled} }); $result.firewallStatus='ok' } catch { $result.firewallStatus='unverifiable' }
$result.logs=@()
foreach($log in @('System','Application')) {
 try { $items=@(Get-WinEvent -FilterHashtable @{LogName=$log;StartTime=(Get-Date).AddHours(-24);Level=1,2,3} -MaxEvents 5000 -ErrorAction Stop); $result.logs+=@{name=$log;status='ok';count=$items.Count;limited=($items.Count -ge 5000)} }
 catch { if($_.FullyQualifiedErrorId -like 'NoMatchingEventsFound*') { $result.logs+=@{name=$log;status='ok';count=0;limited=$false} } else { $result.logs+=@{name=$log;status='unverifiable';reason='일반 권한으로 기록을 읽지 못했습니다.'} } }
}
$result | ConvertTo-Json -Depth 6 -Compress
`;
const cpuSnapshot=()=>os.cpus().reduce((v,c)=>{for(const [k,n] of Object.entries(c.times)){v.total+=n;if(k==='idle')v.idle+=n;}return v;},{idle:0,total:0});
export async function readPc(){
 const start=cpuSnapshot();await new Promise(resolve=>setTimeout(resolve,350));const end=cpuSnapshot(),delta=end.total-start.total;
 const memory={status:'ok',totalBytes:os.totalmem(),usedBytes:os.totalmem()-os.freemem(),unit:'bytes'};
 const cpu=delta>0?{status:'ok',percent:Math.max(0,Math.min(100,100*(1-(end.idle-start.idle)/delta))),sampleMs:350,unit:'%'}:unavailable('CPU 사용률의 측정 구간을 확인하지 못했습니다.');
 let windows={};let reason='Windows 전용 읽기 조회입니다.';
 if(process.platform==='win32')try{const output=await run('powershell.exe',['-NoProfile','-NonInteractive','-Command','[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; '+script],{windowsHide:true,timeout:25000,maxBuffer:1024*1024});windows=JSON.parse(output.stdout.replace(/^\uFEFF/,''));}catch{reason='일반 권한 조회가 실패했거나 25초 제한을 초과했습니다. 관리자 권한이나 설정 변경 없이 담당자에게 확인하세요.';}
 if(windows.diskStatus!=='ok')try{const drive=path.parse(process.cwd()).root;const info=await statfs(drive);windows.disks=[{drive,freeBytes:info.bavail*info.bsize,totalBytes:info.blocks*info.bsize}];windows.diskStatus='ok';}catch{};
 const group=(key,status)=>windows[status]==='ok'?{status:'ok',items:windows[key]??[]}:unavailable(reason==='Windows 전용 읽기 조회입니다.'?'일반 권한으로 읽지 못했습니다. 운영체제 정책·서비스 접근을 확인하세요.':reason);
 return {source:'local-measurement',checkedAt:new Date().toISOString(),cpu,memory,disks:group('disks','diskStatus'),network:group('network','networkStatus'),firewall:group('firewall','firewallStatus'),logs:Array.isArray(windows.logs)?{status:'ok',windowHours:24,items:windows.logs}:unavailable(reason),sdp:{status:'disconnected',reason:'PC 조회 성공은 SDP 연결 성공이 아닙니다. 기본 제공 서버의 연결은 별도 확인하세요.'}};
}
