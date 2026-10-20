"""更新既有的管理/公開部署；識別碼只從本機 .local/deployments.json 讀取。"""
from pathlib import Path
import json
import shutil
import subprocess

root = Path(__file__).resolve().parents[1]
local = json.loads((root/'.local/deployments.json').read_text(encoding='utf-8'))
manifest_path = root/'gas/appsscript.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
clasp = shutil.which('clasp.cmd') or shutil.which('clasp')
if not clasp:
    raise SystemExit('找不到 clasp')

def command(*args):
    subprocess.run([clasp,*args],cwd=root,check=True)

shutil.copyfile(manifest_path,str(manifest_path)+'.bak')
try:
    for access, key, title in [
        ('MYSELF','adminDeploymentId','管理者專用後台 v0.1.0-test'),
        ('ANYONE_ANONYMOUS','publicDeploymentId','匿名投稿與公開作品 v0.1.0-test')
    ]:
        manifest['webapp']['access'] = access
        manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        command('push','--force')
        command('deploy','--deploymentId',local[key],'--description',title)
finally:
    manifest['webapp']['access'] = 'ANYONE_ANONYMOUS'
    manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
