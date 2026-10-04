import {Link} from 'react-router-dom';
import QuickSearch from '../components/QuickSearch';

const groups = [
  {title:'Resources', links:[
    {to:'/explore', label:'Discover'},
    {to:'/learn', label:'Learning guides'},
    {to:'/ootle-templates', label:'Ootle Templates'},
    {to:'/skills', label:'Agent skills'},
    {to:'/agent-start', label:'Build with your agent'},
  ]},
  {title:'Creator tools', links:[
    {to:'/create/trivia', label:'Riff the Daily Ritual'},
    {to:'/create/guessing-game', label:'Make a guessing game'},
    {to:'/create/video', label:'Create a video'},
    {to:'/#creator-community', label:'Connect & share'},
    {to:'/challenges', label:'Challenges'},
  ]},
  {title:'Updates', links:[
    {to:'/calendar', label:'Marketing calendar'},
    {to:'/blog', label:'Creator Journal'},
    {to:'/growth', label:'Growth Dashboard'},
  ]},
];

export default function LearnResources() {
  return <div className="wb-panel-content">
    <QuickSearch/>
    {groups.map(group=><section key={group.title} aria-label={group.title}>
      <h2>{group.title}</h2>
      {group.links.map(link=>link.to==='/agent-start'?<a key={link.to} href={link.to}>{link.label}</a>:<Link key={link.to} to={link.to}>{link.label}</Link>)}
      {group.title==='Resources'&&<a href="https://ootle.tari.com/guides/getting-started/" target="_blank" rel="noreferrer">Ootle documentation</a>}
    </section>)}
  </div>;
}
