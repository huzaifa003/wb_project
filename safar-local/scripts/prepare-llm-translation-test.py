"""Download pinned public weights for local evaluation, not the shipped app."""
import hashlib, json, pathlib, urllib.request

root = pathlib.Path(__file__).resolve().parents[1]
repo = 'onnx-community/Qwen3-0.6B-ONNX'
revision = 'da1453100cf3ff33ef56d17983fc7a8648706db6'
target = root / '.translation-tools/models/Qwen3-0.6B'
files = ['config.json', 'generation_config.json', 'tokenizer.json',
         'tokenizer_config.json', 'special_tokens_map.json', 'onnx/model_q4.onnx']
records = []
for name in files:
    path = target / name
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        print('Downloading ' + name, flush=True)
        temporary = path.with_suffix(path.suffix + '.partial')
        urllib.request.urlretrieve(f'https://huggingface.co/{repo}/resolve/{revision}/{name}', temporary)
        temporary.replace(path)
    records.append({'file': name, 'bytes': path.stat().st_size,
                    'sha256': hashlib.file_digest(path.open('rb'), 'sha256').hexdigest()})
(target / 'provenance.json').write_text(json.dumps({'repo':repo,'revision':revision,'files':records}, indent=2), encoding='utf-8')
print('Evaluation pack ready: ' + str(sum(r['bytes'] for r in records)) + ' bytes', flush=True)
