import type {Workflow} from './workflow.mjs';
export const STUDIO_STAGES:Record<string,{title:string;role:string;purpose:string;query:string;path:string}>;
export const STUDIO_RECIPES:{id:string;title:string;label:string;description:string;stages:string[]}[];
export function scaffoldStudio(id:string):Workflow;
