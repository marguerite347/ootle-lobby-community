import copy,json,tempfile,unittest,shutil
from pathlib import Path
from catalog import ROOT,load,artifacts
class CatalogTests(unittest.TestCase):
    def test_router_excludes_nonverified_and_survives_rollback(self):
        entries=load(); baseline=artifacts(entries)['SKILL.md']
        for state in ['draft','stale','deprecated']:
            changed=copy.deepcopy(entries)
            for m in changed:m['lifecycle']=state
            router=artifacts(changed)['SKILL.md']
            self.assertNotIn('](developer-setup/SKILL.md)',router)
        self.assertEqual(artifacts(entries)['SKILL.md'],baseline)
    def test_rejects_verification_without_evidence(self):
        with tempfile.TemporaryDirectory() as d:
            r=Path(d);shutil.copytree(ROOT/'developer-setup',r/'developer-setup');(r/'coverage.json').write_text(json.dumps({'skills':['developer-setup']}))
            p=r/'developer-setup/metadata.json';m=json.loads(p.read_text());m['lifecycle']='verified';m['validation']['evidence']=[];p.write_text(json.dumps(m))
            with self.assertRaisesRegex(ValueError,'without evidence'):load(r)
    def test_rejects_unknown_lifecycle(self):
        with tempfile.TemporaryDirectory() as d:
            r=Path(d);shutil.copytree(ROOT/'contribute',r/'contribute');p=r/'contribute/metadata.json';m=json.loads(p.read_text());m['lifecycle']='approved-ish';p.write_text(json.dumps(m))
            with self.assertRaisesRegex(ValueError,'lifecycle'):load(r)
if __name__=='__main__':unittest.main()
