import {recordsForInsights} from './records.js';
export const TRIAL_KEY='safar-trial-v1';
export const DEMO_NOTES=[
 {id:'noor-1',visitor:'Party 1 · week 1',text:'Could we watch the coffee being roasted and taste a cup afterwards?',topics:['Coffee roasting','Coffee tasting']},
 {id:'noor-2',visitor:'Party 2 · week 1',text:'We would love a short roasting demonstration with a tasting, before our guide leaves.',topics:['Coffee roasting','Coffee tasting']},
 {id:'noor-3',visitor:'Party 3 · week 2',text:'The farm walk was lovely. We only have twenty minutes today.',topics:['Farm walk']},
 {id:'noor-4',visitor:'Party 4 · week 3',text:'Can you show us how the coffee is roasted?',topics:['Coffee roasting']},
 {id:'noor-5',visitor:'Party 5 · week 3',text:'Why did the host refuse my money? I thought the tea was included.',topics:['Hospitality']},
 {id:'noor-6',visitor:'Party 6 · week 4',text:'We would be keen to see the beans being prepared, then sample the finished drink. Is there a short session?',topics:['Coffee roasting','Coffee tasting']},
];
export const EMPTY_PLAN={title:'',duration:'',capacity:'',minimum:'',price:'',variable:'',fixed:'',slot:'',meeting:'',access:'',boundary:''};
export const DEMO_PLAN={title:'Roast & Taste with Noor',duration:'45',capacity:'4',minimum:'3',price:'600',variable:'150',fixed:'900',slot:'Next Saturday, 3:00–3:45 PM · confirm with Noor',meeting:'Meet the guide at the agreed public village meeting point. Request directions after confirmation.',access:'Seated tasting available. Uneven approach: ask about access needs before confirming.',boundary:'Tasting and demonstration only; no lunch. Ask before photographing people. Stay back from hot equipment.'};
export function currentNotes(conversations){return recordsForInsights(conversations).flatMap(c=>c.messages.filter(m=>m.role==='visitor').map(m=>({id:m.id,visitor:`Visitor ${c.number}`,party:c.id,text:m.original_text,topics:m.topics||[],demo:!!c.demo})));}
export function selectedParties(notes,ids){return new Set(notes.filter(n=>ids.includes(n.id)).map(n=>n.party||n.id)).size;}
const number=(v)=>v!==''&&v!=null&&Number.isFinite(Number(v))&&Number(v)>=0;
export function validatePlan(p){
 const errors=[];
 for(const k of ['title','slot','meeting','access','boundary'])if(!p[k]?.trim())errors.push(`Please complete ${k==='boundary'?'inclusions and boundaries':k}.`);
 for(const k of ['duration','capacity','minimum'])if(!number(p[k])||!Number.isInteger(Number(p[k]))||Number(p[k])<1)errors.push(`${k} must be a positive whole number.`);
 for(const k of ['price','variable','fixed'])if(!number(p[k]))errors.push(`${k} must be a number of zero or more.`);
 if(Number(p.minimum)>Number(p.capacity))errors.push('Minimum guests cannot exceed capacity.');
 return errors;
}
export function economics(p,guests=Number(p.minimum)){
 const margin=Number(p.price)-Number(p.variable);
 return {revenue:guests*Number(p.price),cost:guests*Number(p.variable)+Number(p.fixed),contribution:guests*margin-Number(p.fixed),breakEven:margin>0?Math.ceil(Number(p.fixed)/margin):null};
}
export function validateOutcome(o,p){const e=[];
 if(!number(o.guests)||!Number.isInteger(Number(o.guests))||Number(o.guests)>Number(p.capacity))e.push('Attendance must be a whole number between zero and capacity.');
 for(const k of ['revenue','cost'])if(!number(o[k]))e.push(`Enter actual ${k}, including zero if applicable.`);
 if(!o.feedback?.trim())e.push('Record what happened before deciding.');
 if(!['repeat','change','stop'].includes(o.decision))e.push('Choose repeat, change or stop.');
 if(!o.next?.trim())e.push('Add your next action.');return e;
}
export function offerText(p,demo){return `${demo?'FICTIONAL DEMO · NOT A REAL OFFER\n\n':''}${p.title}\n${p.duration} minutes · up to ${p.capacity} guests\nPKR ${p.price} per guest · minimum ${p.minimum} confirmed guests\n${p.slot}\nMeet: ${p.meeting}\nAccess: ${p.access}\nIncludes / boundaries: ${p.boundary}\nPlease ask Noor to confirm the time, meeting point and availability. Interest is not a booking. No payment has been taken.`;}
export function newTrial(source='demo'){return {version:1,source,step:0,selected:[],plan:{...EMPTY_PLAN},approved:false,outcome:{guests:'',revenue:'',cost:'',feedback:'',decision:'',next:''},finished:false};}
export function loadTrial(){try{const v=JSON.parse(localStorage.getItem(TRIAL_KEY));if(v?.version===1&&['demo','live'].includes(v.source)&&Array.isArray(v.selected)&&v.plan&&v.outcome&&Number.isInteger(v.step)&&v.step>=0&&v.step<=3)return v;}catch{}return newTrial();}
