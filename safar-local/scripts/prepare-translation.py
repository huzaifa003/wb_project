"""Prepare pinned OPUS int8 translation packs; requires onnx in .translation-tools.

The vendored merge helpers retain Hugging Face's Apache-2.0 copyright notices.
Local model optimization combines the first-token and cached-token decoders and
deduplicates their weights. Browser packs do not contain the original graphs.
"""
from pathlib import Path
import sys,json,urllib.request,hashlib,concurrent.futures
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'.translation-tools'))
sys.path.insert(0,str(root/'scripts/onnx_helpers'))
from graph_transformations import merge_decoders
models=[('en','ur','ac7b3450b2f927db9f60597a0fbc9bed337d63cb'),('ur','en','efa493ac1a42b5d9a504590600a714f7e9b1bc00')]
manifest={}
for src,tgt,revision in models:
 name=f'opus-mt-{src}-{tgt}';repo=f'R4kSo1997/{name}-onnx-int8';folder=root/'public/models'/name;raw=root/'.translation-tools'/name
 folder.mkdir(parents=True,exist_ok=True);raw.mkdir(parents=True,exist_ok=True);(folder/'onnx').mkdir(exist_ok=True)
 files=['config.json','generation_config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','vocab.json','source.spm','target.spm','README.md','encoder_model_quantized.onnx','decoder_model_quantized.onnx','decoder_with_past_model_quantized.onnx']
 def download(file):
  dest=(raw if file.endswith('.onnx') else folder)/file
  if not dest.exists():
   with urllib.request.urlopen(f'https://huggingface.co/{repo}/resolve/{revision}/{file}') as r,dest.with_suffix(dest.suffix+'.part').open('wb') as out:
    while chunk:=r.read(1024*1024):out.write(chunk)
   dest.with_suffix(dest.suffix+'.part').replace(dest)
  print(name,file,dest.stat().st_size,flush=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(download,files))
 # Correct the community export: append EOS and prevent target-only vocabulary
 # entries (exported with score 0) from competing with source SentencePiece.
 import sentencepiece as spm
 processor=spm.SentencePieceProcessor(model_file=str(folder/'source.spm'))
 scores={processor.id_to_piece(i):processor.get_score(i) for i in range(processor.get_piece_size())}
 tokenizer=json.loads((folder/'tokenizer.json').read_text(encoding='utf-8'))
 tokenizer['model']['vocab']=[[piece,scores.get(piece,-100)] for piece,_ in tokenizer['model']['vocab']]
 tokenizer['normalizer']={'type':'Sequence','normalizers':[{'type':'Precompiled','precompiled_charsmap':''},{'type':'Replace','pattern':{'Regex':' {2,}'},'content':' '},{'type':'Strip','left':True,'right':True}]}
 tokenizer['post_processor']={'type':'TemplateProcessing','single':[{'Sequence':{'id':'A','type_id':0}},{'SpecialToken':{'id':'</s>','type_id':0}}],'pair':[{'Sequence':{'id':'A','type_id':0}},{'Sequence':{'id':'B','type_id':0}},{'SpecialToken':{'id':'</s>','type_id':0}}],'special_tokens':{'</s>':{'id':'</s>','ids':[0],'tokens':['</s>']}}}
 (folder/'tokenizer.json').write_text(json.dumps(tokenizer,ensure_ascii=False),encoding='utf-8')
 import shutil
 shutil.copyfile(raw/'encoder_model_quantized.onnx',folder/'onnx/encoder_model_quantized.onnx')
 merged=folder/'onnx/decoder_model_merged_quantized.onnx'
 if not merged.exists():merge_decoders(raw/'decoder_model_quantized.onnx',raw/'decoder_with_past_model_quantized.onnx',save_path=merged,strict=False)
 used=['config.json','generation_config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','onnx/encoder_model_quantized.onnx','onnx/decoder_model_merged_quantized.onnx']
 items=[{'url':f'/models/{name}/{f}','bytes':(folder/f).stat().st_size,'sha256':hashlib.sha256((folder/f).read_bytes()).hexdigest()} for f in used]
 manifest[src]={'name':name,'sourceLanguage':src,'targetLanguage':tgt,'repo':repo,'revision':revision,'upstream':f'Helsinki-NLP/{name}','license':'Apache-2.0 (upstream model card)','files':items,'bytes':sum(x['bytes'] for x in items)}
 (folder/'provenance.json').write_text(json.dumps(manifest[src],indent=2),encoding='utf-8')
 (folder/'UPSTREAM.md').write_bytes(urllib.request.urlopen(f'https://huggingface.co/Helsinki-NLP/{name}/raw/main/README.md').read())
 (folder/'LICENSE.txt').write_bytes((root/'public/models/all-MiniLM-L6-v2/LICENSE.txt').read_bytes())
 print('PACK',name,manifest[src]['bytes'],flush=True)
(root/'src/model/translation-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
