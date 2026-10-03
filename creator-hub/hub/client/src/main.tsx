import { StrictMode, Suspense, lazy } from 'react';
import {installShellRestore} from './shellRestore';
installShellRestore();
const BuildFeedback = lazy(() => import('./pages/BuildFeedback'));
const MarketingCalendar = lazy(() => import('./pages/MarketingCalendar'));
const Blog = lazy(() => import('./pages/Blog'));
const OotleLaunch = lazy(() => import('./components/OotleLaunch'));
const LearningLoop = lazy(() => import('./pages/LearningLoop'));
const Challenges = lazy(() => import('./pages/Challenges'));
const WeeklyChallenges = lazy(() => import('./pages/WeeklyChallenges'));
const Insights = lazy(() => import('./pages/Insights'));
const Growth = lazy(() => import('./pages/Growth'));
const GameKit = lazy(() => import('./pages/GameKit'));
const SkillMarket = lazy(() => import('./pages/SkillMarket'));
const Assets = lazy(() => import('./pages/Assets'));
const GameStarters = lazy(() => import('./pages/GameStarters'));
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-800.css';
import './styles.css';
const Projects = lazy(() => import('./pages/Projects'));
const LobbyGames = lazy(() => import('./pages/LobbyGames'));
import {legacyDestination} from './journey';
import Layout from './Layout';
import Home from './pages/Home';
import './Seasonal.css';
const HuggingFace = lazy(() => import('./pages/HuggingFace'));
const OotleTemplates = lazy(() => import('./pages/OotleTemplates'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Detail = lazy(() => import('./pages/Detail'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const TriviaRiffEditor = lazy(() => import('./pages/TriviaRiffEditor'));
const TriviaRiffPlayer = lazy(() => import('./pages/TriviaRiffPlayer'));
const GuessingGameEditor = lazy(() => import('./pages/GuessingGameEditor'));
const Sources = lazy(() => import('./pages/Sources'));
const Popularity = lazy(() => import('./pages/Popularity'));
const Learn = lazy(() => import('./pages/Learn'));
const Skills = lazy(() => import('./pages/Skills'));
const Recipe = lazy(() => import('./pages/Recipe'));
const MakeVideo = lazy(() => import('./pages/MakeVideo'));
const VideoPicker = lazy(() => import('./pages/MakeVideo').then(module => ({default: module.VideoPicker})));

function LegacyRoute(){const l=useLocation();return <Navigate replace to={legacyDestination(l.pathname,l.search)}/>;}

const router = createBrowserRouter([
  {path: '/play/trivia-riff', element: <Suspense fallback={<p>Opening your Riff…</p>}><TriviaRiffPlayer /></Suspense>},
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'insights', element: <Insights /> },
      { path: 'growth', element: <Growth /> },
      { path: 'challenges', element: <Challenges /> },
      { path: 'challenges/weekly', element: <WeeklyChallenges /> },
      { path: 'challenges/:contest', element: <Challenges /> },
      { path: 'huggingface', element: <HuggingFace /> },
      { path: 'ootle-templates', element: <OotleTemplates /> },
      { path: 'explore', element: <Catalog mode="explore" /> },
      { path: 'build', element: <LegacyRoute /> },
      { path: 'create', element: <Navigate to="/#creator-toolkit" replace/> },
      { path: 'build-feedback', element: <BuildFeedback /> },
      { path: 'create/ui-kit', element: <GameKit /> },
      { path: 'create/assets', element: <Assets /> },
      { path: 'create/starters', element: <GameStarters /> },
      { path: 'create/goal/:id', element: <Onboarding /> },
      { path: 'create/recipe/:id', element: <Recipe /> },
      { path: 'create/video', element: <VideoPicker /> },
      { path: 'create/video/:id', element: <MakeVideo /> },
      { path: 'create/trivia', element: <TriviaRiffEditor /> },
      { path: 'create/guessing-game', element: <GuessingGameEditor /> },
      { path: 'create/project', element: <Navigate to="/#creator-toolkit" replace/> },
      { path: 'games', element: <LobbyGames /> },
      { path: 'projects', element: <Projects /> },
      { path: 'calendar', element: <MarketingCalendar /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:slug', element: <Blog /> },
      { path: 'ootle', element: <OotleLaunch /> },
      { path: 'learn', element: <Learn /> },
      { path: 'skills', element: <SkillMarket /> },
      { path: 'skills/learning-loop', element: <LearningLoop /> },
      { path: 'skills/native', element: <Skills /> },
      { path: 'creators/:creatorId', element: <SkillMarket /> },
      { path: 'skills/:slug', element: <Skills /> },
      { path: 'resource/:id', element: <Detail /> },
      { path: 'onboarding', element: <LegacyRoute /> },
      { path: 'onboarding/:id', element: <LegacyRoute /> },
      { path: 'studio', element: <Navigate to="/#creator-toolkit" replace/> },
      { path: 'project/:id', element: <Navigate to="/#creator-toolkit" replace/> },
      { path: 'sources', element: <Sources /> },
      { path: 'popularity', element: <Popularity /> },
      { path: 'recipes', element: <LegacyRoute /> },
      { path: 'recipe/:id', element: <LegacyRoute /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
