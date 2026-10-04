from pathlib import Path
import sys,json
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'.translation-tools'))
import sentencepiece as spm
cases={'en':['Our bus will arrive at ten in the morning.','Please do not take photographs of my children.','The price is 600 rupees for 3 people.'],'ur':['ہم کل صبح آپ کے کھیت میں آنا چاہتے ہیں۔','تین لوگوں کے لیے قیمت کتنی ہے؟','براہ کرم میرے بچوں کی تصاویر نہ لیں۔']}
rows=[]
for src,texts in cases.items():
 folder=root/f'public/models/opus-mt-{src}-{ "ur" if src=="en" else "en"}'
 sp=spm.SentencePieceProcessor(model_file=str(folder/'source.spm'));vocab=json.loads((folder/'vocab.json').read_text(encoding='utf-8'))
 for text in texts:rows.append({'src':src,'text':text,'ids':[vocab.get(p,1) for p in sp.encode(text,out_type=str)]+[0]})
(root/'data/translation-tokenizer-cases.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
