import {recordsForInsights} from './records.js';
export function recordsExport(conversations){return {format:'safar-local-records',version:1,exportedAt:new Date().toISOString(),scope:'all saved conversations',notice:'Contains original visitor words and unverified model suggestions. Keep private. No automatic training or upload.',conversations:recordsForInsights(conversations)}}
export function downloadRecords(conversations){
 const blob=new Blob([JSON.stringify(recordsExport(conversations),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=`safar-visitor-records-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
