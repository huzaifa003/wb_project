export const TRANSLATION_LIMIT=2000;
export function translationChunks(text){
 const clean=text.trim();if(!clean)throw new Error('Enter some text to translate.');
 if(clean.length>TRANSLATION_LIMIT)throw new Error('Please split this message into parts of 2,000 characters or fewer.');
 const sentences=clean.match(/[^.!?۔؟\n]+[.!?۔؟]*|[.!?۔؟]+/gu)||[clean],chunks=[];
 for(const sentence of sentences){let part='';for(const word of sentence.trim().split(/\s+/u)){
  if(word.length>220)throw new Error('One word or link is too long. Please shorten it before translating.');
  if(part.length+word.length+1>220){chunks.push(part);part=''}part+=(part?' ':'')+word;
 }if(part)chunks.push(part)}return chunks;
}
const digits=s=>s.replace(/[۰-۹٠-٩]/g,c=>String(c.charCodeAt(0)-(c<='٩'?0x660:0x6f0)));
const numbers=s=>(digits(s).match(/\d+(?:[.,:]\d+)*/g)||[]).sort().join('|');
export function translationWarnings(source,output,language){
 const warnings=[];
 if(numbers(source)!==numbers(output))warnings.push('Numbers changed or were omitted. Confirm prices, dates and quantities.');
 const enNeg=/\b(?:no|not|never|cannot|without)\b|n['’]t\b/i,urNeg=/(?:^|[^\p{L}\p{M}])(?:نہیں|نہ|مت|بغیر)(?=$|[^\p{L}\p{M}])/u;
 if((language==='en'?enNeg:urNeg).test(source)&&!(language==='en'?urNeg:enNeg).test(output))warnings.push('A negative phrase may be missing. Confirm the intended meaning.');
 if(language==='en'&&!/[\u0600-\u06ff]/u.test(output)||language==='ur'&&!/[a-z]/i.test(output))warnings.push('The output may not be in the expected language.');
 if(language==='en'){
  if(/\btomorrow\b/i.test(source)&&!/(?:کل|اگلے دن)/u.test(output)||/\btoday\b/i.test(source)&&!/آج/u.test(output))warnings.push('The day may have changed. Confirm when the visit will happen.');
  if(/\bp\.?m\.?\b/i.test(source)&&!/(?:دوپہر|شام|رات|\bp\.?m\.?\b)/iu.test(output)||/\ba\.?m\.?\b/i.test(source)&&!/(?:صبح|\ba\.?m\.?\b)/iu.test(output))warnings.push('AM or PM may be missing. Confirm the time of day.');
  if(/[a-z]{3,}/i.test(output))warnings.push('Some words remain in Latin script. Check names and any untranslated words.');
 }
 return warnings;
}
