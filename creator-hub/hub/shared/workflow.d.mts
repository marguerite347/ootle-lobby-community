export type WorkflowNode = {id:string;role:string;title:string;purpose:string;x:number;y:number;resourceId?:string;url?:string;comfy?:{classType:string;values:Record<string,string|number|boolean>}};
export type WorkflowEdge = {id:string;from:string;to:string;kind:'design'|'comfy';label:string;input?:string;output?:number};
export type Workflow = {version:1;nodes:WorkflowNode[];edges:WorkflowEdge[]};
export const ROLES:string[];
export function validateWorkflow(g:unknown):Workflow;
export function seedWorkflow(state:any):Workflow;
export function removeNode(g:Workflow,id:string):Workflow;
export function importComfy(prompt:unknown,prefix?:string):Workflow;
export function exportComfy(g:Workflow):Record<string,unknown>;
