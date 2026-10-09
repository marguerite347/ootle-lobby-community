import {safeHref} from '../../../shared/safeLinks.mjs';
import {useState} from 'react';
import {MONTHLY_CONTEST, contestOpen, contestEntryText, validatePublicProjectUrl, validateContestSocialUrl, type ContestEntry} from '../monthlyContest';

export default function MonthlyContest() {
  const [entry, setEntry] = useState<ContestEntry>({title:'',projectUrl:'',description:'',address:'',socialUrl:''});
  const [notice, setNotice] = useState('');
  const [prepared, setPrepared] = useState('');
  function update(field: keyof ContestEntry, value: string) {
    setEntry(current => ({...current,[field]:value}));
    setPrepared(''); setNotice('');
  }
  async function copy(text: string) {
    try {await navigator.clipboard.writeText(text); setNotice('Copied. Review your post before sharing.');}
    catch {setNotice('Clipboard unavailable. Select and copy the prepared text below.');}
  }
  function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contestOpen()) {setNotice('This contest is not open. Check the official thread for its status.'); return;}
    if (!validatePublicProjectUrl(entry.projectUrl)) {setNotice('Use a publicly reachable code or app URL. Local preview links cannot be submitted.'); return;}
    if (!validateContestSocialUrl(entry.socialUrl)) {setNotice('Add a public link to your social announcement on X, Bluesky, Reddit or another platform.'); return;}
    setPrepared(contestEntryText(entry));
    setNotice('Your entry is prepared. It has not been submitted. Copy it, review it, and post it in the official thread.');
  }
  const socialDraft = `${entry.title || 'My Spooky Secrets project'}\n${entry.description || 'Here is what I am building with Tari’s privacy tools.'}\n${entry.projectUrl}\nMy entry for Spooky Secrets, the October 2026 Ootle build contest. #Tari #Ootle`;
  return <section className="season-entry" id="entry" aria-labelledby="entry-title">
    <div className="season-section-heading"><div><span className="season-eyebrow">THE FINAL STEP</span><h2 id="entry-title">Get your entry ready.</h2></div><a href={safeHref(MONTHLY_CONTEST.entryUrl)} target="_blank" rel="noreferrer">Official submission thread</a></div>
    <p className="entry-intro">Bring your links together, then publish your entry on the Tari forum. This form stays in memory on this page. Your payment address is not stored or sent by the Lobby.</p>
    <form onSubmit={prepare} className="season-entry-form">
      <label>Project name<input required maxLength={120} value={entry.title} placeholder="What’s your creation called?" onChange={event=>update('title',event.target.value)}/></label>
      <label>Public code or app URL<input required type="url" value={entry.projectUrl} placeholder="https://github.com/you/your-project" onChange={event=>update('projectUrl',event.target.value)}/></label>
      <label className="entry-wide">What did you build?<textarea required maxLength={3000} rows={4} value={entry.description} placeholder="Describe your project, how it uses privacy, and how to try it." onChange={event=>update('description',event.target.value)}/></label>
      <details className="entry-wide entry-social"><summary>Need a social announcement? Prepare a draft <span>+</span></summary><textarea aria-label="Social announcement draft" readOnly value={socialDraft} rows={5}/><button type="button" className="season-button secondary" onClick={()=>copy(socialDraft)}>Copy announcement</button><p>Share on X, Bluesky, Reddit or another social platform, then add the public post link below.</p></details>
      <label>Public social announcement<input required type="url" value={entry.socialUrl} placeholder="https://x.com/you/status/…" onChange={event=>update('socialUrl',event.target.value)}/></label>
      <label>Tari payment address<input required maxLength={256} autoComplete="off" value={entry.address} placeholder="Your public payment address" onChange={event=>update('address',event.target.value)}/><small>Use your public address, never a seed phrase or private key.</small></label>
      <div className="entry-wide entry-submit"><button type="submit" className="season-button">Prepare forum entry </button><a href={safeHref(MONTHLY_CONTEST.entryUrl)} target="_blank" rel="noreferrer">See how others post their entries</a></div>
    </form>
    {notice && <p className="entry-notice" role="status">{notice}</p>}
    {prepared && <div className="entry-prepared"><label>Prepared forum entry<textarea rows={12} readOnly value={prepared}/></label><div><button type="button" className="season-button secondary" onClick={()=>copy(prepared)}>Copy forum entry</button><a className="season-button" href={safeHref(MONTHLY_CONTEST.entryUrl)} target="_blank" rel="noreferrer">Open thread to submit</a></div></div>}
    <details className="entry-eligibility"><summary>Eligibility & submission essentials</summary><p>October entries must use new code created after the theme announcement, be your or your team’s work, and use an OSI-approved open-source license. Don’t borrow code from other submissions. Tari Council members and Tari Labs employees are ineligible.</p><p>The official forum post must include a public code/app link, a project description, a Tari payment address, and a public social announcement. Use one post per entry and update it when your project changes.</p><a href={safeHref(MONTHLY_CONTEST.rulesUrl)} target="_blank" rel="noreferrer">Read the complete rules</a></details>
  </section>;
}
