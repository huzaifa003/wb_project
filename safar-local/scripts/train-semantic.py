import json
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1]
rows=json.loads((root/'data/english-embeddings.json').read_text())
train=[r for r in rows if r['split']=='train'];dev=[r for r in rows if r['split']=='dev'];test=[r for r in rows if r['split']=='test']
classes=sorted({r['intent'] for r in train}); X=np.array([r['embedding'] for r in train]);target=np.eye(len(classes))[[classes.index(r['intent']) for r in train]]
W=np.zeros((384,len(classes)));b=np.zeros(len(classes))
for _ in range(700):
    logits=X@W+b;logits-=logits.max(axis=1,keepdims=True);p=np.exp(logits);p/=p.sum(axis=1,keepdims=True);err=(p-target)/len(train)
    W-=4*(X.T@err+.001*W);b-=4*err.sum(axis=0)
W=np.round(W,5);b=np.round(b,5)
def predict(r):
    z=np.array(r['embedding'])@W+b;p=np.exp(z-z.max());p/=p.sum();rank=np.argsort(-p)
    return classes[rank[0]],float(p[rank[0]]),float(p[rank[0]]-p[rank[1]])
choices=[]
for score in [.3,.4,.5,.6,.7]:
    for margin in [.05,.1,.15,.2]:
        accepted=[(r,predict(r)) for r in dev if predict(r)[1]>=score and predict(r)[2]>=margin and predict(r)[0]!='OTHER']
        correct=sum(r['intent']==p[0] for r,p in accepted)
        if correct/max(1,len(accepted))>=.9:choices.append((len(accepted),correct/max(1,len(accepted)),score,margin))
_,_,score,margin=max(choices) if choices else (0,0,.7,.2)
head={'name':'MiniLM + Safar intent head','version':'1.0.0','classes':classes,'weights':W.tolist(),'bias':b.tolist(),'thresholds':{'score':score,'margin':margin},'language':'en'}
(root/'src/model/semantic-head.js').write_text('export default '+json.dumps(head,separators=(',',':'))+';\n')
report={'name':head['name'],'language':'English','train':len(train),'dev':len(dev),'test':len(test),'thresholds':head['thresholds'],'results':[]}
for r in test:
    intent,s,g=predict(r);accepted=intent!='OTHER' and s>=score and g>=margin
    report['results'].append({k:v for k,v in r.items() if k!='embedding'}|{'raw_prediction':intent,'prediction':intent if accepted else 'OTHER','accepted':accepted,'score':round(s,4)})
rr=report['results']; aa=[r for r in rr if r['accepted']]
report['raw_correct']=sum(r['raw_prediction']==r['intent'] for r in rr);report['accepted']=len(aa);report['accepted_correct']=sum(r['prediction']==r['intent'] for r in aa);report['abstained']=len(rr)-len(aa)
report['limitations']=['Small synthetic internal evaluation; not field accuracy.','Model selection was informed by earlier baseline results. No independent external benchmark was run.','English only; Urdu uses existing bundled phrases and rules.','Predictions may be wrong. Scores are not calibrated probabilities.','No automatic translation, cultural generation, booking or pricing.']
(root/'data/semantic-evaluation.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='results'},indent=2))
