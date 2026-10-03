import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import CreatorLeaderboard, {type RankedCreator, type RankedListing} from './CreatorLeaderboard';

export default function CommunityArena() {
  const [data, setData] = useState<{creators: RankedCreator[]; listings: RankedListing[]}>({creators: [], listings: []});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/skill-market', {signal: controller.signal}).then(async response => {
      if (!response.ok) throw new Error('Standings unavailable');
      const result = await response.json();
      if (!Array.isArray(result.creators) || !Array.isArray(result.listings)) throw new Error('Invalid standings');
      setData(result);
    }).catch(() => {if (!controller.signal.aborted) setFailed(true);})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, []);
  return <CreatorLeaderboard compact {...data} loading={loading} failed={failed} onJoin={() => navigate('/skills')}/>;
}
