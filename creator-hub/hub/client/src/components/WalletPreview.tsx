import {useState} from 'react';
import './WalletPreview.css';

/** Presentation-only until an explicitly configured wallet adapter is available. */
export default function WalletPreview() {
  const [showStake, setShowStake] = useState(false);
  return <div className="wallet-preview">
    <button type="button" className="btn wallet-connect" aria-pressed={showStake}
      aria-label={showStake ? '10,000 wXTM staked. Show Connect wallet' : 'Connect wallet. Show staked amount'}
      aria-description="Presentation placeholder. No wallet is connected and no funds are staked."
      title="Presentation placeholder. No wallet is connected and no funds are staked."
      onClick={() => setShowStake(value => !value)}>
      <span className="wallet-flip" data-staked={showStake} aria-hidden="true">
        <span className="wallet-face wallet-front">Connect wallet</span>
        <span className="wallet-face wallet-back"><strong>10,000 wXTM</strong><small>Staked</small></span>
      </span>
    </button>
  </div>;
}
