import React from 'react';
import {Cpu} from 'lucide-react';
export default function IntentResult({message,onAnalyze}){
 const pending=message.method==='Analyzing on this device…',uncertain=message.uncertain??message.confidence<.55;
 const trained=!!message.classification;
 return <section className={'message-intent '+(trained?'trained':'')} aria-label="Visitor intent" aria-live="polite"><div className="message-intent-heading"><Cpu size={16}/><strong>{pending?'Analyzing visitor intent…':trained?'TRAINED CLASSIFIER RESULT':'PHRASE / RULE RESULT'}</strong></div><p className="message-intent-label">{pending?'Please wait':uncertain?'Not sure — ask for clarification':message.intent.toLowerCase().replaceAll('_',' ')}</p><small>{trained?`MiniLM + Safar classifier · ${Math.round(message.classification.elapsedMs||0)} ms · processed locally`:message.method}</small>{trained&&<p className="message-intent-note">{uncertain?'The classifier could not confidently assign a request type.':'Suggested intent. Confirm the meaning with the visitor.'} This result does not translate the message.</p>}{onAnalyze&&message.visitor_language==='en'&&!trained&&!pending&&<button className="secondary-button" onClick={()=>onAnalyze(message)}>Analyze this message with the classifier</button>}</section>
}
