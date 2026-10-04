"""Reproducible small supervised classifier. Requires only numpy; no cloud calls.

Train vocabulary and weights on train only, choose rejection thresholds on dev only.
The paired English/Urdu test set is never used to select model settings.
"""
import collections, hashlib, json, re, unicodedata
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
def normalize(text):
    return re.sub(r'\s+', ' ', re.sub(r'[^\w\s]', ' ', unicodedata.normalize('NFKC', text).lower())).strip()

def features(text):
    text = normalize(text)
    words = text.split()
    f = collections.Counter({'w:' + w: 0 for w in words})
    for w in words: f['w:' + w] += 2
    for a, b in zip(words, words[1:]): f['b:' + a + ' ' + b] += 1
    for word in words:
        s = '^' + word + '$'
        for n in (3, 4):
            for i in range(len(s) - n + 1): f['c:' + s[i:i+n]] += 1
    return f

rows=[]
for i, line in enumerate((ROOT/'data/intent-corpus.txt').read_text(encoding='utf-8').splitlines()):
    if not line or line.startswith('#'): continue
    intent, split, en, ur = line.split('|')
    for lang, text in [('en', en), ('ur', ur)]:
        rows.append(dict(id=f'group-{i}-{lang}',group=f'group-{i}',intent=intent,split=split,language=lang,text=text,source='synthetic-authored'))
assert len({(normalize(r['text']),r['language']) for r in rows})==len(rows)
train=[r for r in rows if r['split']=='train']
dev=[r for r in rows if r['split']=='dev']
test=[r for r in rows if r['split']=='test']
labels=sorted({r['intent'] for r in train})
df=collections.Counter()
for r in train: df.update(features(r['text']).keys())
vocab=sorted(k for k,v in df.items() if v>=2 or k.startswith('w:'))
index={v:i for i,v in enumerate(vocab)}
idf=np.array([np.log((1+len(train))/(1+df[v]))+1 for v in vocab])
def vector(text):
    counts=features(text); x=np.zeros(len(vocab));known=0
    for k,v in counts.items():
        if k in index:
            x[index[k]]=(1+np.log(v))*idf[index[k]]
            known+=v
    length=np.linalg.norm(x)
    if length: x/=length
    return x,known/max(1,sum(counts.values()))
X=np.array([vector(r['text'])[0] for r in train]); y=np.array([labels.index(r['intent']) for r in train])
W=np.zeros((len(vocab),len(labels))); b=np.zeros(len(labels)); onehot=np.eye(len(labels))[y]
for step in range(650):
    logits=X@W+b; logits-=logits.max(axis=1,keepdims=True)
    p=np.exp(logits);p/=p.sum(axis=1,keepdims=True)
    err=(p-onehot)/len(train)
    W-=5*(X.T@err+.0007*W); b-=5*err.sum(axis=0)
scale=float(np.max(np.abs(W))/127); Q=np.round(W/scale).astype(np.int8); Wq=Q.astype(float)*scale
def predict(row):
    x,coverage=vector(row['text']); z=x@Wq+b; p=np.exp(z-z.max());p/=p.sum();order=np.argsort(-p)
    return labels[order[0]],float(p[order[0]]),float(p[order[0]]-p[order[1]]),coverage
dev_predictions=[predict(r) for r in dev]
choices=[]
for minimum in [.3,.4,.5,.6]:
    for margin in [.05,.1,.15]:
        accepted=[(r,p) for r,p in zip(dev,dev_predictions) if p[1]>=minimum and p[2]>=margin and p[3]>=.35 and p[0]!='OTHER']
        precision=sum(r['intent']==p[0] for r,p in accepted)/max(1,len(accepted))
        if precision>=.9: choices.append((len(accepted),precision,minimum,margin))
_,_,minimum,margin=max(choices) if choices else (0,0,.6,.15)
model={'name':'Safar Intent Tiny','version':'1.0.0','type':'TF-IDF + multinomial logistic regression','languages':['en','ur'],'classes':labels,'vocabulary':vocab,'idf':np.round(idf,6).tolist(),'weights':Q.tolist(),'scale':round(scale,9),'bias':np.round(b,6).tolist(),'thresholds':{'score':minimum,'margin':margin,'coverage':.35},'training_examples':len(train),'development_examples':len(dev),'test_examples':len(test),'provenance':'Synthetic authored English/Urdu pairs; not field-validated. No external dataset or pretrained weights.'}
serialized=json.dumps(model,ensure_ascii=False,separators=(',',':'))
(ROOT/'src/model/model-data.js').write_text('export default '+serialized+';\n',encoding='utf-8')
report={'model':model['name'],'version':model['version'],'model_bytes':len(serialized.encode()),'train':len(train),'dev':len(dev),'test':len(test),'thresholds':model['thresholds'],'corpus_sha256':hashlib.sha256((ROOT/'data/intent-corpus.txt').read_bytes()).hexdigest(),'limitations':['All examples are synthetic and authored by the same assistant.','Small internal holdout, not an independent benchmark or field validation.','Urdu requires fluent-speaker review; Roman Urdu and dialects are not covered.','Scores are uncalibrated model outputs, not probabilities of correctness.','This model predicts one intent; it does not translate or perform semantic topic extraction.'],'results':[]}
for r in test:
    intent,score,gap,coverage=predict(r)
    accepted=intent!='OTHER' and score>=minimum and gap>=margin and coverage>=.35
    report['results'].append({**r,'raw_prediction':intent,'prediction':intent if accepted else 'OTHER','accepted':accepted,'score':round(score,4),'coverage':round(coverage,4)})
for lang in ['all','en','ur']:
    subset=[r for r in report['results'] if lang=='all' or r['language']==lang]
    accepted=[r for r in subset if r['accepted']]
    report[lang]={'n':len(subset),'raw_accuracy':sum(r['raw_prediction']==r['intent'] for r in subset)/len(subset),'accuracy_with_abstention':sum(r['prediction']==r['intent'] for r in subset)/len(subset),'accepted_count':len(accepted),'accepted_accuracy':sum(r['prediction']==r['intent'] for r in accepted)/max(1,len(accepted))}
(ROOT/'data/evaluation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'data/intent-corpus.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='results'},indent=2))
