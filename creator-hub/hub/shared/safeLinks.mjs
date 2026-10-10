/** URLs rendered as navigation: local paths/fragments or credential-free HTTPS only. */
export function safeHref(value) {
 if(typeof value!=='string'||value!==value.trim()||/[\\\u0000-\u0020\u007f]/.test(value))return undefined;
 if(value.startsWith('#') || (value.startsWith('/')&&!value.startsWith('//')))return value;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:undefined;}catch{return undefined;}
}
export function requireLinkHost(value,field='source') {
 const href=safeHref(value);
 if(!href||!href.startsWith('https:'))throw new Error('A public HTTPS link is required.');
 const groups={
  source:['github.com','git.disroot.org','community.tari.com','ootle.tari.com','tari.com','www.tari.com','wiki.tari.com'],
  repository:['github.com','git.disroot.org'],
  demo:['feeltherevolt-xehqj-studio.wp.build','labyrinthos.markets','sooon.fun','tari-market.johnnytsunami14.chatgpt.site'],
  recording:['ootle-lobby-preview.vercel.app','github.com','raw.githubusercontent.com','www.youtube.com','youtube.com','youtu.be','vimeo.com'],
 };
 if(!groups[field]?.includes(new URL(href).hostname))throw new Error('Link destination needs maintainer review.');
 return href;
}
