import {useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import './CreatorLeaderboard.css';
import BudgetLeaderboard from './BudgetLeaderboard';

export type RankedCreator = {id: string; name: string; showActivity: boolean};
export type RankedListing = {creatorId: string; downloads: number; weeklyDownloads: number};
export type RankingPeriod = 'weeklyDownloads' | 'downloads';

export function rankCreators(creators: RankedCreator[], listings: RankedListing[], period: RankingPeriod) {
    const totals = new Map<string, number>();
    for (const listing of listings) {
        const value = listing[period];
        if (Number.isFinite(value) && value > 0) {
            totals.set(listing.creatorId, (totals.get(listing.creatorId) || 0) + value);
        }
    }
    let previousScore = -1;
    let rank = 0;
    return creators.filter(creator => creator.showActivity && totals.has(creator.id))
        .map(creator => ({...creator, score: totals.get(creator.id)!}))
        .sort((first, second) => second.score - first.score || first.name.localeCompare(second.name) || first.id.localeCompare(second.id))
        .map((creator, index) => {
            if (creator.score !== previousScore) rank = index + 1;
            previousScore = creator.score;
            return {...creator, rank};
        });
}

export default function CreatorLeaderboard({creators, listings, loading, failed, onJoin, compact = false}: {
    creators: RankedCreator[]; listings: RankedListing[]; loading: boolean; failed: boolean; onJoin: () => void; compact?: boolean;
}) {
    const [period, setPeriod] = useState<RankingPeriod>('weeklyDownloads');
    const [searchParams]=useSearchParams();
    const [board, setBoard] = useState<'downloads'|'budget'>('downloads');
    useEffect(()=>{if(searchParams.get('board')==='budget'){setBoard('budget');document.getElementById('creator-arena')?.scrollIntoView();}},[searchParams]);
    const standings = rankCreators(creators, listings, period);
    const leader = standings[0];
    return <aside id="creator-arena" className="creator-arena" aria-labelledby="creator-arena-title">
        <header className="arena-heading"><span className="arena-kicker">COMMUNITY LEADERBOARD</span><h2 id="creator-arena-title">Creator <em>Arena.</em></h2><p>Build something others reach for.</p></header>
        <div className="arena-period" role="group" aria-label="Leaderboard"><button aria-pressed={board==='downloads'} onClick={()=>setBoard('downloads')}>Downloads</button><button aria-pressed={board==='budget'} onClick={()=>setBoard('budget')}>Small budgets</button></div>
        {board==='budget'?<BudgetLeaderboard onJoin={onJoin}/>:<>
        <div className="arena-period" role="group" aria-label="Ranking period">
            <button aria-pressed={period === 'weeklyDownloads'} onClick={() => setPeriod('weeklyDownloads')}>This week</button>
            <button aria-pressed={period === 'downloads'} onClick={() => setPeriod('downloads')}>All time</button>
        </div>
        <div className="arena-caption"><span>{period === 'weeklyDownloads' ? 'ROLLING 7 DAYS' : 'ALL-TIME STANDINGS'}</span><span>DOWNLOADS ↓</span></div>
        {loading ? <p role="status" className="arena-state">Loading standings…</p> : failed ? <p role="status" className="arena-state">Standings unavailable. Refresh to try again.</p> : leader ? <>
            <Link className="arena-champion" to={`/creators/${leader.id}`}>
                <span className="arena-crown" aria-hidden="true">♛</span><span className="arena-lead-label">{standings[1]?.rank === 1 ? 'JOINT LEADER' : 'LEADING THE BOARD'}</span>
                <strong>{leader.name}</strong><span className="arena-champion-score">{leader.score.toLocaleString()} <small>downloads</small></span><span className="arena-profile">View creator ↗</span>
            </Link>
            <ol className="arena-roster" aria-label="Creator standings">{standings.slice(compact ? 1 : 0, compact ? 4 : 10).map(creator => <li key={creator.id}>
                <Link to={`/creators/${creator.id}`} className={creator.rank <= 3 ? `arena-rank arena-rank-${creator.rank}` : 'arena-rank'}>
                    <span className="arena-position">{String(creator.rank).padStart(2, '0')}</span>
                    <span className="arena-identity"><strong>{creator.name}</strong><span className="arena-score-track" aria-hidden="true"><i style={{width: `${creator.score / leader.score * 100}%`}}/></span></span>
                    <span className="arena-score">{creator.score.toLocaleString()}<small>downloads</small></span>
                </Link>
            </li>)}</ol>
        </> : <div className="arena-open"><div className="arena-open-emblem" aria-hidden="true">♛</div><span className="arena-open-rank">#01 · UNCLAIMED</span><h3>The top spot is open.</h3><p>Publish a useful skill or workflow. Its first download puts you on the board.</p><div className="arena-podium" aria-hidden="true"><span>02</span><span>01</span><span>03</span></div></div>}
        <button className="arena-join" onClick={onJoin}>Enter the arena <span aria-hidden="true">↗</span></button>
        <details className="arena-rules"><summary>How the standings work</summary><p>Scores count local hub downloads, once per browser, per listing, per day. Weekly scores cover the last seven days. Equal scores share a rank. Creators can opt out in their profile.</p><p>These are download signals, not verified installs or unique people. Ranking does not unlock a payout.</p></details>
        </>}
    </aside>;
}
