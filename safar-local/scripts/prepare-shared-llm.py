"""Pinned MLC shards and GPU runtime for a local WebLLM pack."""
import hashlib, json, pathlib, urllib.request
root=pathlib.Path(__file__).resolve().parents[1]
repo='mlc-ai/Qwen3.5-4B-q4f16_1-MLC'
revision='44b42469f9e192814bfd90440e3b377d89ba7a13'
name=repo.split('/')[-1]
lib_revision='025bcaf3780fa8254f5e5efd3bfea0a5397248f4'
lib_name='Qwen3.5-4B-q4f16_1_cs1k-webgpu.wasm'
api=json.load(urllib.request.urlopen(f'https://huggingface.co/api/models/{repo}/revision/{revision}?blobs=true'))
files=[f['rfilename'] for f in api['siblings'] if f['rfilename'].endswith('.bin') or f['rfilename'] in ['mlc-chat-config.json','ndarray-cache.json','tensor-cache.json','tokenizer.json','tokenizer_config.json']]
records=[]
for file in files+(['README.md'] if any(f['rfilename']=='README.md' for f in api['siblings']) else [])+[lib_name]:
    path=root/'public/models'/name/'resolve'/revision/file
    path.parent.mkdir(parents=True,exist_ok=True)
    url=f'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/{lib_revision}/web-llm-models/v0_2_84/base/{lib_name}' if file==lib_name else f'https://huggingface.co/{repo}/resolve/{revision}/{file}'
    if not path.exists():
        tmp=path.with_suffix(path.suffix+'.partial')
        print('Downloading '+file,flush=True)
        with urllib.request.urlopen(url,timeout=60) as response,tmp.open('wb') as out:
            while chunk:=response.read(1024*1024):out.write(chunk)
        tmp.replace(path)
    if file!='README.md':
        with path.open('rb') as stream:digest=hashlib.file_digest(stream,'sha256').hexdigest()
        cache='webllm/wasm' if file==lib_name else 'webllm/config' if file=='mlc-chat-config.json' else 'webllm/model'
        records.append({'url':f'/models/{name}/resolve/{revision}/{file}','bytes':path.stat().st_size,'sha256':digest,'cache':cache})
tokenizer=json.loads((root/'public/models'/name/'resolve'/revision/'tokenizer.json').read_text(encoding='utf-8'))
# Some MLC configs retain Qwen2 stop IDs. Resolve them from this model's tokenizer.
stop_ids=[t['id'] for t in tokenizer['added_tokens'] if t['content'] in ['<|endoftext|>','<|im_end|>']]
assert len(stop_ids)==2
manifest={'name':name,'label':'Qwen3.5 4B · 4-bit WebLLM','repo':repo,'revision':revision,'license':'Apache-2.0','dtype':'q4f16_1','stopTokenIds':stop_ids,'runtimeRevision':lib_revision,'modelBase':f'/models/{name}/resolve/{revision}/','modelLib':f'/models/{name}/resolve/{revision}/{lib_name}','bytes':sum(r['bytes'] for r in records),'files':records}
(root/'src/model/shared-llm-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(root/'public/models'/name/'resolve'/revision/'provenance.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(root/'public/models'/name/'resolve'/revision/'LICENSE.txt').write_bytes((root/'public/models/all-MiniLM-L6-v2/LICENSE.txt').read_bytes())
print('Ready: '+str(manifest['bytes'])+' bytes',flush=True)
