import model from './model-data.js';
export const modelInfo = model;
const vocabulary = new Map(model.vocabulary.map((s,i)=>[s,i]));
export function modelFeatures(text) {
  const words = text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}_\s]/gu,' ').trim().split(/\s+/).filter(Boolean);
  const features = new Map();
  const add=(key,n=1)=>features.set(key,(features.get(key)||0)+n);
  words.forEach((w,i)=>{
    add('w:'+w,2);
    if(i+1<words.length)add('b:'+w+' '+words[i+1]);
    const s='^'+w+'$';
    for(const n of [3,4])for(let j=0;j<=s.length-n;j++)add('c:'+s.slice(j,j+n));
  });
  return features;
}
export function classifyIntent(text) {
  const start=performance.now();
  const features=modelFeatures(text.slice(0,2000));
  const sparse=[];let norm=0,known=0,total=0;
  for(const [key,count] of features){total+=count;const i=vocabulary.get(key);if(i!==undefined){const value=(1+Math.log(count))*model.idf[i];norm+=value*value;sparse.push([i,value]);known+=count}}
  const logits=[...model.bias];norm=Math.sqrt(norm)||1;
  for(const [i,value] of sparse)for(let j=0;j<logits.length;j++)logits[j]+=value/norm*model.weights[i][j]*model.scale;
  const max=Math.max(...logits),exp=logits.map(v=>Math.exp(v-max)),sum=exp.reduce((a,b)=>a+b,0);
  const ranked=exp.map((v,i)=>({intent:model.classes[i],score:v/sum})).sort((a,b)=>b.score-a.score);
  const top=ranked[0],gap=top.score-ranked[1].score,coverage=known/Math.max(1,total);
  const accepted=top.intent!=='OTHER'&&top.score>=model.thresholds.score&&gap>=model.thresholds.margin&&coverage>=model.thresholds.coverage;
  return {intent:accepted?top.intent:'OTHER',rawIntent:top.intent,accepted,score:top.score,margin:gap,coverage,elapsedMs:performance.now()-start,version:model.version,method:'On-device model'};
}
