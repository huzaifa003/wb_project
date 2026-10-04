import json, urllib.request
from pathlib import Path
base='https://huggingface.co/Xenova/all-MiniLM-L6-v2'
sha='751bff37182d3f1213fa05d7196b954e230abad9'
root=Path('public/models/all-MiniLM-L6-v2');root.mkdir(parents=True,exist_ok=True)
for name in ['config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','onnx/model_quantized.onnx']:
    dest=root/name;dest.parent.mkdir(parents=True,exist_ok=True)
    with urllib.request.urlopen(base+'/resolve/'+sha+'/'+name) as response: dest.write_bytes(response.read())
    print(name,dest.stat().st_size,flush=True)
(root/'provenance.json').write_text(json.dumps({'repository':base,'revision':sha,'license':'Apache-2.0','files':'Quantized ONNX + tokenizer/config','language':'English','purpose':'Local sentence embeddings, not translation'},indent=2))
print('Revision',sha)
