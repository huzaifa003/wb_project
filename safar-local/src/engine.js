import {recordsForInsights} from './records.js';
// Replace this module's inference adapter with an on-device model later.
// All demo translations are authored phrases; unknown text is never fabricated.
export const INTENTS = ['BOOKING','PRICE','DIRECTIONS','FOOD','ACCESSIBILITY','EXPERIENCE_REQUEST','COMPLAINT','COMPLIMENT','CULTURAL_QUESTION','SAFETY_CONCERN','FOLLOW_UP','OTHER'];
export const normalize = text => text.toLowerCase().replace(/[.,!?؟۔]/g, '').replace(/\s+/g,' ').trim();
const phrases = [
 ['Can you show us how the coffee is roasted?','کیا آپ ہمیں دکھا سکتے ہیں کہ کافی کو کیسے بھونا جاتا ہے؟','EXPERIENCE_REQUEST',['Coffee roasting'],.92],
 ['I loved tasting the coffee. Could we see the roasting and meet the farmer?','مجھے کافی چکھنا بہت اچھا لگا۔ کیا ہم کافی بھونتے ہوئے دیکھ سکتے ہیں اور کسان سے مل سکتے ہیں؟','EXPERIENCE_REQUEST',['Coffee tasting','Coffee roasting','Farmer interaction']],
 ['Can you show me how coffee is roasted? We would love a tasting too.','کیا آپ مجھے کافی بھوننے کا طریقہ دکھا سکتے ہیں؟ ہم کافی چکھنا بھی چاہیں گے۔','EXPERIENCE_REQUEST',['Coffee roasting','Coffee tasting']],
 ['Can we walk around the farm and take some photos?','کیا ہم کھیت میں گھوم سکتے ہیں اور کچھ تصویریں لے سکتے ہیں؟','EXPERIENCE_REQUEST',['Farm walk','Photography']],
 ['Do you serve local food? We enjoyed the coffee tasting.','کیا آپ مقامی کھانا پیش کرتے ہیں؟ ہمیں کافی چکھنا اچھا لگا۔','FOOD',['Local food','Coffee tasting']],
 ['Can I take pictures of the workers during the farm walk?','کیا میں کھیت کی سیر کے دوران کارکنوں کی تصویریں لے سکتا ہوں؟','CULTURAL_QUESTION',['Photography','Farm walk']],
 ['Where can I buy these coffee beans? I loved the roasting and tasting.','میں یہ کافی کے دانے کہاں سے خرید سکتا ہوں؟ مجھے کافی بھوننا دیکھنا اور چکھنا بہت پسند آیا۔','PRICE',['Coffee sales','Coffee roasting','Coffee tasting']],
 ['Can children join the farm walk and meet the farmer?','کیا بچے کھیت کی سیر میں شامل ہو سکتے ہیں اور کسان سے مل سکتے ہیں؟','ACCESSIBILITY',['Farm walk','Farmer interaction']],
 ['How long is the tour? Does it include roasting and tasting?','دورہ کتنا طویل ہے؟ کیا اس میں کافی بھوننا دیکھنا اور چکھنا شامل ہے؟','BOOKING',['Coffee roasting','Coffee tasting']],
 ['We loved meeting the farmer and trying the local food.','ہمیں کسان سے ملنا اور مقامی کھانا چکھنا بہت اچھا لگا۔','COMPLIMENT',['Farmer interaction','Local food']],
 ['I wish we could see the roasting process after the farm walk.','کاش ہم کھیت کی سیر کے بعد کافی بھوننے کا عمل دیکھ سکتے۔','EXPERIENCE_REQUEST',['Coffee roasting','Farm walk']],
 ['Is lunch included? The local food smells wonderful.','کیا دوپہر کا کھانا شامل ہے؟ مقامی کھانے کی خوشبو بہت اچھی ہے۔','FOOD',['Local food']],
 ['How do we get back to town after the farm walk?','کھیت کی سیر کے بعد ہم شہر واپس کیسے جائیں؟','DIRECTIONS',['Farm walk']],
 ['Can we book for tomorrow? We want coffee roasting, tasting and photos.','کیا ہم کل کے لیے بکنگ کر سکتے ہیں؟ ہم کافی بھوننا دیکھنا، چکھنا اور تصویریں لینا چاہتے ہیں۔','BOOKING',['Coffee roasting','Coffee tasting','Photography']],
 ['Why did the host refuse my money after the local food?','مقامی کھانے کے بعد میزبان نے میرے پیسے کیوں لینے سے انکار کیا؟','CULTURAL_QUESTION',['Hospitality','Local food']],
 ['This was the best part of our trip. We loved meeting the farmer.','یہ ہمارے سفر کا بہترین حصہ تھا۔ ہمیں کسان سے ملنا بہت اچھا لگا۔','COMPLIMENT',['Farmer interaction']],
 ['Yes, we roast coffee at 3 PM.','جی ہاں، ہم سہ پہر تین بجے کافی بھونتے ہیں۔','FOLLOW_UP',['Coffee roasting']],
 ['We can arrange a short roasting demonstration.','ہم کافی بھوننے کا ایک مختصر مظاہرہ ترتیب دے سکتے ہیں۔','FOLLOW_UP',['Coffee roasting']],
 ['Sorry, roasting is not available today.','معذرت، آج کافی بھوننے کا مظاہرہ دستیاب نہیں ہے۔','FOLLOW_UP',['Coffee roasting']],
 ['Please tell me a little more.','براہ کرم مجھے تھوڑی مزید تفصیل بتائیں۔','FOLLOW_UP',[]],
 ['Let me check that for you.','میں آپ کے لیے اس کی تصدیق کر لوں۔','FOLLOW_UP',[]],
 ['Thank you for sharing that with me.','میرے ساتھ یہ بات شیئر کرنے کا شکریہ۔','FOLLOW_UP',[]],
 ['Why did she refuse my money when I tried to pay?','جب میں نے ادائیگی کی کوشش کی تو انہوں نے میرے پیسے کیوں لینے سے انکار کیا؟','CULTURAL_QUESTION',['Hospitality']],
 ['I loved tasting the coffee.','مجھے کافی چکھنا بہت اچھا لگا۔','COMPLIMENT',['Coffee tasting']],
 ['Can we book for tomorrow?','کیا ہم کل کے لیے بکنگ کر سکتے ہیں؟','BOOKING',[]],
 ['Do you serve local food?','کیا آپ مقامی کھانا پیش کرتے ہیں؟','FOOD',['Local food']],
 ['Can I take pictures of the workers?','کیا میں کارکنوں کی تصویریں لے سکتا ہوں؟','CULTURAL_QUESTION',['Photography']],
 ['Can you show me how coffee is roasted?','کیا آپ مجھے کافی بھوننے کا طریقہ دکھا سکتے ہیں؟','EXPERIENCE_REQUEST',['Coffee roasting']],
 ['Can we walk around the farm?','کیا ہم کھیت میں گھوم سکتے ہیں؟','EXPERIENCE_REQUEST',['Farm walk']],
 ['Where can I buy these coffee beans?','میں یہ کافی کے دانے کہاں سے خرید سکتا ہوں؟','PRICE',['Coffee sales']],
 ['Can children join the tour?','کیا بچے دورے میں شامل ہو سکتے ہیں؟','ACCESSIBILITY',[]],
 ['How long is the tour?','دورہ کتنا طویل ہے؟','BOOKING',[]],
 ['We loved meeting the farmer.','ہمیں کسان سے ملنا بہت اچھا لگا۔','COMPLIMENT',['Farmer interaction']],
 ['I wish we could see the roasting process.','کاش ہم کافی بھوننے کا عمل دیکھ سکتے۔','EXPERIENCE_REQUEST',['Coffee roasting']],
 ['Is lunch included?','کیا دوپہر کا کھانا شامل ہے؟','FOOD',['Local food']],
 ['How do we get back to town?','ہم شہر واپس کیسے جائیں؟','DIRECTIONS',[]],
 ['Why did the host refuse my money?','میزبان نے میرے پیسے کیوں لینے سے انکار کیا؟','CULTURAL_QUESTION',['Hospitality']],
 ['This was the best part of our trip.','یہ ہمارے سفر کا بہترین حصہ تھا۔','COMPLIMENT',[]],
 ['Hello.','السلام علیکم۔','FOLLOW_UP',[]],
 ['How are you?','آپ کیسے ہیں؟','FOLLOW_UP',[]],
 ['I am fine, thank you.','میں ٹھیک ہوں، شکریہ۔','FOLLOW_UP',[]],
 ['Welcome.','خوش آمدید۔','FOLLOW_UP',[]]
];
export const PACK = {id:'pk-en-ur',name:'Pakistan Pack',languages:['en','ur'],phrases,version:1};
const topicRules = [['Coffee roasting',/roast|بھون/],['Coffee tasting',/tast|چکھ/],['Farm walk',/farm walk|walk.*farm|کھیت.*سیر|کھیت.*گھوم/],['Local food',/food|lunch|کھانا|کھانے/],['Photography',/photo|picture|تصویر/],['Farmer interaction',/meet.*farmer|meeting.*farmer|کسان.*مل/],['Coffee sales',/(?:buy|purchase|sell|price|cost).*(?:coffee|beans)|دانے.*خرید/]];
const intentRules = [['SAFETY_CONCERN',/unsafe|danger|injur|emergency|خطر|زخمی/],['COMPLAINT',/disappoint|terrible|too expensive|not happy|شکایت|خراب/],['CULTURAL_QUESTION',/rude|custom|refuse.*money|photo.*(worker|people)|picture.*worker|married|دستور|انکار/],['ACCESSIBILITY',/wheelchair|children|accessible|disabil|بچے|معذور/],['PRICE',/price|cost|buy|how much|قیمت|خرید/],['BOOKING',/book|how long|reserv|بکنگ|کتنا طویل/],['DIRECTIONS',/where|direction|back to town|کیسے جائیں/],['EXPERIENCE_REQUEST',/show|wish|can we|can you|could we|want to|دکھا|چاہتے|کاش/],['FOOD',/food|lunch|eat|کھان/],['COMPLIMENT',/love|great|wonderful|best|enjoy|پسند|بہترین|اچھا/],['FOLLOW_UP',/thank|yes|no thanks|شکریہ|جی ہاں/]];
export function infer(text, language='en') {
 const exact = PACK.phrases.find(p=>normalize(p[language==='ur'?1:0])===normalize(text));
 const t=exact?exact[0].toLowerCase():text.toLowerCase();
 const intent=exact?.[2] || intentRules.find(([,r])=>r.test(t))?.[0] || 'OTHER';
 const topics=exact?.[3] || topicRules.filter(([,r])=>r.test(t)).map(([label])=>label);
 const confidence=exact?(exact[4]||.9):intent==='OTHER'?.3:.65;
 const positive=/love|liked|great|wonderful|best|enjoy|پسند|اچھا/.test(t);
 const negative=/disappoint|terrible|not happy|too expensive|خراب/.test(t);
 const question=/\?|؟/.test(text);
 return {original_text:text.trim(),translated_text:exact?.[language==='ur'?0:1]||null,translation_status:exact?'bundled':'unavailable',visitor_language:language,operator_language:language==='en'?'ur':'en',intent,confidence,topics,sentiment:positive&&negative?'mixed':positive?'positive':negative?'negative':'neutral',cultural_context_needed:intent==='CULTURAL_QUESTION',feedback:{topics,requests:/wish|can |could |want|کاش|چاہتے/.test(t)?[text.trim()]:[],positive_feedback:positive?[text.trim()]:[],negative_feedback:negative?[text.trim()]:[],questions:question?[text.trim()]:[],cultural_confusions:intent==='CULTURAL_QUESTION'?[text.trim()]:[]},method:exact?'Bundled example':'Local rule match'};
}
export function makeMessage(text,role='visitor',language='en') {return {id:crypto.randomUUID(),timestamp:new Date().toISOString(),role,...infer(text,language)}}
export function seedConversations() {return phrases.slice(1,16).map((p,i)=>{const date=new Date();date.setDate(date.getDate()-Math.floor((14-i)/3));date.setHours(10+(i%7),10+i*3,0,0);return {id:`demo-${i+1}`,number:i+1,language:'en',createdAt:date.toISOString(),demo:true,messages:[{...makeMessage(p[0]),timestamp:date.toISOString()}]}}).reverse()}
export function aggregate(conversations, days=7, now=new Date()) {
 const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-(days-1));
 const visitors=recordsForInsights(conversations).filter(c=>new Date(c.createdAt)>=start && new Date(c.createdAt)<=now);
 const counts={};
 for(const c of visitors) for(const topic of new Set(c.messages.filter(m=>m.role==='visitor').flatMap(m=>m.topics)))counts[topic]=(counts[topic]||0)+1;
 return {visitors:visitors.length,counts,topics:Object.entries(counts).sort((a,b)=>b[1]-a[1]),conversations:visitors};
}
// Business rules are deliberately independent of the inference adapter.
export function opportunities(counts) {
 const result=[];
 if((counts['Coffee tasting']||0)>=4&&(counts['Coffee roasting']||0)>=4)result.push({id:'bean',title:'Bean-to-Cup Experience',description:'A short guided experience following the journey from coffee bean to roasted cup.',topics:['Coffee roasting','Coffee tasting','Farmer interaction'],icon:'coffee'});
 if((counts['Farm walk']||0)>=3&&(counts.Photography||0)>=2)result.push({id:'walk',title:'Guided Farm Walk',description:'A gentle walk with time to enjoy the landscape and ask permission for photographs.',topics:['Farm walk','Photography'],icon:'leaf'});
 if((counts['Local food']||0)>=3)result.push({id:'food',title:'Farm Lunch Experience',description:'A small shared meal introducing visitors to locally prepared food.',topics:['Local food'],icon:'food'});
 return result;
}
export function evidence(conversations,topics){return conversations.flatMap(c=>c.messages.filter(m=>m.role==='visitor'&&m.topics.some(t=>topics.includes(t))).map(m=>({conversation:c,message:m})));}
export const CULTURES = [
 {id:'payment',title:'An offer to pay',question:'The host refused when I offered to pay. Is that rude?',match:/pay|money|payment|پیسے/,explanation:'A possible explanation is hospitality: some hosts prefer to offer something as a gift. It may also simply be their personal preference.',not:'It does not necessarily mean your offer was rude or that payment will never be expected.',action:'Thank you. Are you sure? I would still be happy to contribute.'},
 {id:'food',title:'One more helping',question:'The host kept insisting I eat more food even after I said I was full.',match:/food|eat|full|helping/,explanation:'In some families, repeatedly offering food can be a way of showing hospitality.',not:'It does not necessarily mean the host is ignoring your wishes.',action:'Thank you, it was delicious, but I am completely full.'},
 {id:'age',title:'A question about age',question:'Someone asked my age soon after meeting me. Why?',match:/age|old/,explanation:'Age can sometimes help people decide how formally to speak or address someone. It may be a question about social context.',not:'It does not necessarily mean someone intends to invade your privacy.',action:'I prefer to keep that private, but I am happy to tell you about my visit.'},
 {id:'photos',title:'Before taking a photo',question:'Is it rude to take photos of farmers working?',match:/photo|picture/,explanation:'People may have different preferences about being photographed, particularly while working. Ask permission before taking a picture.',not:'Being in a visible or public place does not necessarily mean someone agrees to a photograph.',action:'Would you be comfortable if I took a photo? It is completely fine to say no.'},
 {id:'hands',title:'Giving with both hands',question:'Why did they give me something using both hands?',match:/both hands|two hands/,explanation:'Using both hands can communicate respect when giving or receiving an item in some settings.',not:'It does not necessarily mean a one-handed gesture was intended to be disrespectful.',action:'Thank you. Is there a particular way I should receive this?'},
 {id:'bargain',title:'Is the price fixed?',question:'Can I bargain with the host?',match:/bargain|negotiat|price/,explanation:'Bargaining may be common in some markets, while tours or personal hospitality may have fixed prices. Ask before negotiating.',not:'A stated price does not necessarily invite negotiation.',action:'Is this a fixed price, or is there room to discuss it?'},
 {id:'family',title:'Personal questions',question:'They asked whether I was married. Is that too personal?',match:/marri|personal|family/,explanation:'Questions about family can sometimes be part of friendly conversation. Your boundaries still matter.',not:'It does not necessarily mean you are expected to share personal details.',action:'I would rather keep that private. How has your day been?'},
 {id:'going',title:'Where are you going?',question:'The local guide keeps asking where I am going.',match:/going|where|guide/,explanation:'Depending on the situation and language, this can be casual conversation. A guide may also be checking plans; the intent is worth clarifying.',not:'It does not necessarily mean a demand for your exact plans.',action:'Just exploring for a while. Did you need to know for our tour plans?'},
 {id:'home',title:'An invitation inside',question:'They invited me inside their home. Should I accept?',match:/home|invit|inside/,explanation:'An invitation can be a gesture of hospitality. Consider your comfort, your relationship with the host and the situation before deciding.',not:'An invitation does not mean you are obligated to accept, or establish that a situation is safe.',action:'Thank you for inviting me. I cannot join today, but I appreciate the offer.'}
];
export function culturalGuidance(text){return CULTURES.find(c=>c.match.test(text.toLowerCase()))||{id:'unknown',explanation:'I am not sure what this situation means. There is not enough context in the bundled guidance to offer a reliable explanation.',not:'One person’s behavior does not establish a custom or an intention.',action:'Could you help me understand what you meant?',low:true};}
export const STORAGE_KEY='safar-local-v1';
export function loadConversations(){try{const saved=localStorage.getItem(STORAGE_KEY);if(saved===null)return seedConversations();const parsed=JSON.parse(saved);if(!Array.isArray(parsed)||parsed.some(c=>!Array.isArray(c.messages)))throw new Error('Invalid stored data');return parsed.map(c=>({...c,messages:c.messages.map(recoverInterruptedMessage)}));}catch{return [];}}

export function recoverInterruptedMessage(m){
 let restored=m;
 if(m.translation_status==='pending')restored={...restored,translation_status:'unavailable',translation_error:'Translation was interrupted. Tap Translate to retry.'};
 if(m.method==='Analyzing on this device…'){const fallback=infer(m.original_text,m.visitor_language);restored={...restored,intent:fallback.intent,confidence:fallback.confidence,uncertain:fallback.confidence<.55,method:'Local rules · classifier interrupted',classification:null}}
 return restored;
}
