import {safeHref} from '../../../shared/safeLinks.mjs';
import {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {newTriviaRiff, readTriviaRiff, RITUAL_ART, triviaRiffError, type TriviaQuestion, type TriviaRiff} from '../triviaRiff/model';
import TriviaRiffPreview from '../triviaRiff/TriviaRiffPreview';
import {SOURCE_URL} from '../guessingGame/riff';
import './TriviaRiff.css';

type EditorTab = 'questions' | 'style' | 'ootle';
export default function TriviaRiffEditor() {
  const location = useLocation();
  const [riff, setRiff] = useState<TriviaRiff>(() => readTriviaRiff(location.state?.triviaSeed) || newTriviaRiff());
  const [downloadedDraft, setDownloadedDraft] = useState(() => JSON.stringify(readTriviaRiff(location.state?.triviaSeed) || newTriviaRiff()));
  const [tab, setTab] = useState<EditorTab>('questions');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [fullRewardPath, setFullRewardPath] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const serialized = JSON.stringify(riff);
  const dirty = serialized !== downloadedDraft;
  const question = riff.questions[questionIndex];

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {event.preventDefault(); event.returnValue = '';};
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function change(update: Partial<TriviaRiff>) {setRiff(current => ({...current, ...update})); setNotice(''); setError('');}
  function changeQuestion(update: Partial<TriviaQuestion>) {
    change({questions: riff.questions.map((value, index) => index === questionIndex ? {...value, ...update} : value)});
  }
  function addQuestion() {
    change({questions: [...riff.questions, {question: '', answers: ['', '', '', ''], correctIndex: 0, explanation: ''}]});
    setQuestionIndex(riff.questions.length);
  }
  function removeQuestion() {
    change({questions: riff.questions.filter((_, index) => index !== questionIndex)});
    setQuestionIndex(index => Math.max(0, index - 1));
  }
  function exportQuestions() {
    const invalid = triviaRiffError(riff);
    if (invalid) {setError(invalid); return;}
    setError('');
    const url = URL.createObjectURL(new Blob([JSON.stringify(riff, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'daily-ritual-riff.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadedDraft(serialized); setNotice('Question pack downloaded.');
  }
  return <div className="trivia-editor">
    <header className="trivia-editor-heading">
      <div><Link to="/#daily-spark">← Daily Ritual</Link><h1>Same spark. <em>Your twist.</em></h1><p>Make the Daily Ritual’s questions and style your own.</p></div>
      <div className="trivia-editor-actions"><a className="btn" href="#riff-preview">Preview ↓</a><button className="season-button" onClick={exportQuestions}>Download question pack ↓</button><label className="btn">Open question pack<input type="file" accept=".json,application/json" onChange={async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
          if (file.size > 100000) throw new Error('Choose a question pack smaller than 100 KB.');
          const loaded = readTriviaRiff(JSON.parse(await file.text()));
          if (!loaded) throw new Error('This file is not a supported Daily Ritual question pack.');
          setRiff(loaded); setQuestionIndex(0); setDownloadedDraft(JSON.stringify(loaded)); setError(''); setNotice('Question pack opened in this tab.');
        } catch (reason) {setError((reason as Error).message);}
        event.target.value = '';
      }}/></label></div>
    </header>
    <div role="status" className="trivia-editor-status">{notice || 'Not saved online. Download your questions to keep them.'}</div>
    {error && <p role="alert" className="trivia-editor-error">{error}</p>}
    <div className="trivia-editor-workspace">
      <section className="trivia-editor-controls" aria-label="Edit your trivia Riff">
        <div className="trivia-editor-tabs" role="tablist" aria-label="Riff editor mode">{(['questions','style','ootle'] as const).map(mode => <button key={mode} id={`riff-${mode}-tab`} role="tab" aria-selected={tab === mode} aria-controls={`riff-${mode}-panel`} onClick={() => setTab(mode)}>{mode === 'questions' ? 'Questions' : mode === 'style' ? 'Look & feel' : 'Ootle'}</button>)}</div>
        <div role="tabpanel" id={`riff-${tab}-panel`} aria-labelledby={`riff-${tab}-tab`}>
          <fieldset>
            {tab === 'questions' && <>
              <label>Question to edit<select value={questionIndex} onChange={event => setQuestionIndex(Number(event.target.value))}>{riff.questions.map((_, index) => <option key={index} value={index}>Question {index + 1}</option>)}</select></label>
              <div className="trivia-question-actions"><button className="btn" onClick={addQuestion} disabled={riff.questions.length >= 20}>Add question +</button><button className="btn" onClick={removeQuestion} disabled={riff.questions.length === 1}>Remove</button></div>
              <label>Your question<textarea rows={3} maxLength={240} value={question.question} onChange={event => changeQuestion({question: event.target.value})}/></label>
              {question.answers.map((answer, index) => <label key={index}>Answer {String.fromCharCode(65 + index)}<input maxLength={140} value={answer} onChange={event => changeQuestion({answers: question.answers.map((text, option) => option === index ? event.target.value : text) as TriviaQuestion['answers']})}/></label>)}
              <label>Correct answer<select value={question.correctIndex} onChange={event => changeQuestion({correctIndex: Number(event.target.value)})}>{question.answers.map((_, index) => <option key={index} value={index}>Answer {String.fromCharCode(65 + index)}</option>)}</select></label>
              <label>The takeaway<textarea rows={3} maxLength={600} value={question.explanation} onChange={event => changeQuestion({explanation: event.target.value})}/></label>

            </>}
            {tab === 'style' && <>
              <label>Riff title<input maxLength={80} value={riff.title} onChange={event => change({title: event.target.value})}/></label>
              <label>Invitation<input maxLength={160} value={riff.subtitle} onChange={event => change({subtitle: event.target.value})}/></label>
              <label>Seasonal artwork<select value={riff.artwork} onChange={event => change({artwork: event.target.value as TriviaRiff['artwork']})}>{Object.entries(RITUAL_ART).map(([id, art]) => <option key={id} value={id}>{art.name}</option>)}</select></label>
              <label>Accent color<input type="color" value={riff.accent} onChange={event => change({accent: event.target.value})}/></label>

            </>}
            {tab === 'ootle' && <>
              <h2>Build it on Ootle.</h2><p className="trivia-editor-note">Start with the guessing-game template. Connecting trivia answers and rewards to Ootle requires additional code; this preview is not connected.</p>
              <a href={safeHref(SOURCE_URL)} target="_blank" rel="noreferrer">Explore the official template ↗</a>
              <p><Link to="/create/guessing-game">Try the guessing-game starter ↗</Link></p>

            </>}
          </fieldset>
        </div>
      </section>
      <section id="riff-preview" aria-label="Play your trivia Riff">
        <div className="trivia-preview-toolbar"><h2>Play your Riff.</h2><select aria-label="Practice reward path" value={fullRewardPath ? 'full' : 'random'} onChange={event => setFullRewardPath(event.target.value === 'full')}><option value="full">Preview both wheels</option><option value="random">Random spins</option></select></div>
        <TriviaRiffPreview riff={riff} questionIndex={questionIndex} fullRewardPath={fullRewardPath}/>
      </section>
    </div>
  </div>;
}
