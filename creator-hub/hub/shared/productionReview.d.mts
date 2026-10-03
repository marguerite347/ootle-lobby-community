export type ReviewGate = {content:string;artifact:string;status:'pending'|'approved'|'changes';reviewer:string;feedback:string};
export type ReviewAttempt = {shot:string;provider:string;unit:string;cost:number|null;minutes:number|null;corrections:number|null;artifact:string;feedback:string;result:'pending'|'accepted'|'rejected'};
export type ProductionReview = {version:1;gates:Record<string,ReviewGate>;attempts:ReviewAttempt[]};
export const stages:string[];
export const stageTitles:Record<string,string>;
export function emptyReview():ProductionReview;
export function validateReview(value:unknown):ProductionReview;
export function reconcileReview(next:ProductionReview,previous?:ProductionReview):ProductionReview;
export function renderBlockers(review:unknown,mode?:'full'|'proof'):string[];
