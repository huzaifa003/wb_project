import head from './semantic-head.js';
export function scoreEmbedding(embedding) {
  const logits=head.bias.map((b,j)=>b+embedding.reduce((sum,x,i)=>sum+x*head.weights[i][j],0));
  const max=Math.max(...logits),exps=logits.map(x=>Math.exp(x-max)),sum=exps.reduce((a,b)=>a+b,0);
  const ranked=exps.map((p,i)=>({intent:head.classes[i],score:p/sum})).sort((a,b)=>b.score-a.score);
  const top=ranked[0],margin=top.score-ranked[1].score;
  const accepted=top.intent!=='OTHER'&&top.score>=head.thresholds.score&&margin>=head.thresholds.margin;
  return {intent:accepted?top.intent:'OTHER',rawIntent:top.intent,accepted,score:top.score,margin,version:head.version,method:'On-device MiniLM'};
}
