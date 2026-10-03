export function safeSkillLink(href:string,base:string):string|null {
 try {const url=new URL(href,base);return ['http:','https:'].includes(url.protocol)?url.href:null;} catch {return null;}
}
