import catalogue from '../../../../../content/mainnet-templates.json';

export default function PublishedMainnetTemplates(){
  const checked=new Date(catalogue.checkedAt).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/New_York',timeZoneName:'short'});
  return <section className="network-group published-templates" id="mainnet-templates" aria-labelledby="mainnet-templates-title">
    <h3 id="mainnet-templates-title">Published mainnet templates <span>{catalogue.entries.length}</span></h3>
    <p className="network-group-description">Templates are published contract code. Their presence on mainnet does not confirm that an app or every feature is working. See the live apps above for verified activity.</p>
    <p className="template-checked">Checked {checked} against both official mainnet indexers. This is a dated catalogue snapshot.</p>
    {(['community','builtin'] as const).map(kind=>{
      const entries=catalogue.entries.filter(entry=>entry.kind===kind);
      return <div className="template-category" key={kind}>
        <h4>{kind==='community'?'Community templates':'Built-in templates'} <span>{entries.length}</span></h4>
        <ul className="template-list">{entries.map(entry=><li key={entry.address}>
          <div><a href={`https://explorer.tari.mw/template/${entry.address}`} target="_blank" rel="noreferrer">{entry.name}</a><span>{entry.project}</span></div>
          <a className="template-address" href={`https://indexer-b.ootle.tari.com/templates/${entry.address}`} target="_blank" rel="noreferrer" aria-label={`View ${entry.name} template definition`} title={entry.address}>{entry.address.slice(0,10)}…{entry.address.slice(-8)}</a>
          <small>Epoch {entry.epoch}</small>
        </li>)}</ul>
      </div>;
    })}
    <p className="template-sources">Official catalogue: {catalogue.sources.map((url,index)=><a key={url} href={url} target="_blank" rel="noreferrer">Indexer {index===0?'A':'B'}</a>)}</p>
  </section>;
}
