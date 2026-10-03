import {Link} from 'react-router-dom';
import {JourneyArt} from '../HubMotion';

const journeys = [
 {k:'01',to:'/explore',title:'Discover',text:'Find community creations and the templates, people and resources behind them.'},
 {k:'02',to:'/learn',title:'Learn',text:'Learn what each part does and where native Tari integration fits.'},
 {k:'03',to:'/create?view=frameworks',title:'Create',text:'Choose a starter or recipe, configure it and save your project.'},
 {k:'04',to:'/projects',title:'Share & Riff',text:'Explore saved projects, give feedback and fork a version to make it your own.'},
];

export default function CreatorJourney() {
  return (
            <section className="section">
              <div className="journey-heading"><div><small>YOUR CREATOR ADVENTURE</small><h2>Your next build starts here.</h2></div><p>Find a game you love. Learn its tricks. Then throw in a twist nobody saw coming.</p></div>
              <div className="journeys">
                {journeys.map((j, index) => (
                  <Link key={j.title} to={j.to} className="journey">
                    <div className="k">{j.k}<span>CREATOR PATH</span></div>
                    <JourneyArt step={index}/>
                    <h4>{j.title}</h4>
                    <p>{j.text}</p>
                    <div className="journey-action">{["Explore the collection","Open your field guide","Begin creating","Find your squad"][index]}<b aria-hidden="true">↗</b></div>
                  </Link>
                ))}
              </div>
            </section>
  );
}
