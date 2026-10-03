import {Navigate} from 'react-router-dom';

/** Retired project-library links now lead to creator inspiration. */
export default function Projects() {
  return <Navigate to="/#creator-toolkit" replace/>;
}
