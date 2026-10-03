import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type RecipeSummary } from '../api';
import { Spinner } from '../ui';

export default function Recipes() {
  const [recipes, setRecipes] = useState<RecipeSummary[] | null>(null);
  useEffect(() => { api.recipes().then((d) => setRecipes(d.recipes)).catch(() => setRecipes([])); }, []);

  return (
    <>
      <div className="section-head" style={{ marginTop: 28 }}>
        <div>
          <h1 style={{ fontSize: 32 }}>Recipes</h1>
          <div className="sub">Composable Tari-first game recipes: pick one, configure supported components, preview, and export build instructions. Executing on Ootle uses your wallet (CH-024).</div>
        </div>
      </div>
      {!recipes && <Spinner />}
      <div className="grid mt16">
        {recipes?.map((r) => (
          <Link key={r.id} to={`/recipe/${r.id}`} className="card card-link">
            <div className="top">
              <span className="badge ext">{r.engine}</span>
              <span className="badge">{r.status}</span>
              <span className="badge" title="Tari/Ootle testnet verification">{r.verifiedTestnet ? 'testnet-verified' : 'not verified'}</span>
            </div>
            <h3>{r.title} <span className="faint" style={{ fontSize: 12 }}>v{r.version}</span></h3>
            <p className="summary">{r.description}</p>
            <div className="foot"><span>{r.componentCount} components</span><span style={{ marginLeft: 'auto' }}>Configure →</span></div>
          </Link>
        ))}
        {recipes && recipes.length === 0 && <div className="panel muted">No recipes yet.</div>}
      </div>
    </>
  );
}
