"""Download pinned, public Apache-2.0 model assets for local-only inference."""
import json, urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[1]
models = [
    ('lite', 'HuggingFaceTB/SmolLM2-135M-Instruct', '12fd25f77366fa6b3b4b768ec3050bf629380bac', ['config.json','generation_config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','onnx/model_q4.onnx']),
    ('vision', 'HuggingFaceTB/SmolVLM-256M-Instruct', '7e3e67edbbed1bf9888184d9df282b700a323964', ['config.json','generation_config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','preprocessor_config.json','processor_config.json','chat_template.json','onnx/decoder_model_merged_q4.onnx','onnx/embed_tokens_q4.onnx','onnx/vision_encoder_q4.onnx']),
]
manifest = {}
for mode, repo, revision, files in models:
    name = repo.split('/')[-1]
    folder = root/'public/models'/name
    items = []
    for file in files + ['README.md']:
        dest = folder/file
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists():
            with urllib.request.urlopen(f'https://huggingface.co/{repo}/resolve/{revision}/{file}') as response, dest.with_suffix(dest.suffix+'.part').open('wb') as output:
                while chunk := response.read(1024*1024): output.write(chunk)
            dest.with_suffix(dest.suffix+'.part').replace(dest)
        print(mode, file, dest.stat().st_size, flush=True)
        if file != 'README.md': items.append({'url':f'/models/{name}/{file}', 'bytes':dest.stat().st_size})
    manifest[mode] = {'name':name,'repo':repo,'revision':revision,'license':'Apache-2.0','files':items,'bytes':sum(f['bytes'] for f in items)}
    (folder/'LICENSE.txt').write_bytes((root/'public/models/all-MiniLM-L6-v2/LICENSE.txt').read_bytes())
    (folder/'provenance.json').write_text(json.dumps(manifest[mode],indent=2),encoding='utf-8')
(root/'src/model/culture-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
