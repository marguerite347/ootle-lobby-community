import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {parseStore, STORAGE_KEY} from '../workbench/model';
import WorkbenchWordmark from '../components/WorkbenchWordmark';

export const WORKBENCH_URL='https://ootle-workbench.vercel.app/';
// INTEGRATION_GAP[WB-FORK] (configuration-required): real Remix-based IDE lives in the public ootle-workbench fork.
export default function WorkbenchEntry(){
 useEffect(()=>{window.location.replace(WORKBENCH_URL);},[]);
 return <main style={{padding:32}}><p>Opening Ootle Workbench…</p><a href={WORKBENCH_URL}>Open Workbench</a></main>;
}

export function WorkbenchBackup(){
 const [message,setMessage]=useState('');
 function download(){
  try{
   const value=localStorage.getItem(STORAGE_KEY);
   if(!value){setMessage('No earlier Workbench workspaces are saved in this browser.');return;}
   const store=parseStore(value);
   const url=URL.createObjectURL(new Blob([JSON.stringify(store,null,2)],{type:'application/json'}));
   const a=document.createElement('a');a.href=url;a.download='ootle-workbench-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   setMessage('Backup downloaded. In the new Workbench, choose “Import earlier Workbench backup.” Your original files remain saved here.');
  }catch{setMessage('The saved workspace could not be read. Nothing has been deleted or changed.');}
 }
 return <main style={{maxWidth:720,margin:'40px auto',padding:24}}>
  <h1><img src="/ootle-jam-mark.svg" alt="" width="40" height="40" style={{marginRight:12}}/><WorkbenchWordmark/></h1>
  <h2>Recover earlier workspaces</h2>
  <p>Download files saved in this browser by the earlier editor, then import the backup into the new Remix-based Workbench. This runs in your browser and does not upload your files.</p>
  <button className="season-button" onClick={download}>Download workspace backup</button>
  {message&&<p role="status" style={{marginTop:20}}>{message}</p>}
  <p style={{marginTop:24}}><a href={WORKBENCH_URL}>Open Ootle Workbench</a> · <Link to="/">Back to Lobby</Link></p>
 </main>;
}
