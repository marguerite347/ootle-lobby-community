/** Navigation uses credential-free HTTPS, except the exact reviewed HTTP-only test-shop page. */
const reviewedHttpDemo = value => value === 'http://172.105.101.24/shop/';
export function safeHref(value) {
 if(typeof value!=='string'||value!==value.trim()||/[\\\u0000-\u0020\u007f]/.test(value))return undefined;
 if(value.startsWith('#') || (value.startsWith('/')&&!value.startsWith('//')))return value;
 try{const url=new URL(value);return (url.protocol==='https:'||reviewedHttpDemo(value))&&!url.username&&!url.password?url.href:undefined;}catch{return undefined;}
}
export function requireLinkHost(value,field='source') {
 const href=safeHref(value);
 if(!href||(!href.startsWith('https:')&&!(field==='demo'&&reviewedHttpDemo(href))))throw new Error('A reviewed public link is required.');
 const groups={
  source:['www.reddit.com','radicle.network','gitlab.com','github.com','git.disroot.org','community.tari.com','ootle.tari.com','tari.com','www.tari.com','wiki.tari.com','skydrop.tari.mw','bsky.app'],
  repository:['radicle.network','gitlab.com','github.com','git.disroot.org'],
  demo:['hycorange.github.io','172.105.101.24','lrifton92.github.io','ghostline-ui.vercel.app','testnet-faucet.supportxtm.com','testnet-faucet.taritracker.com','hauntboard.taritracker.com','explorer.tari.mw','skydrop.tari.mw','feeltherevolt-xehqj-studio.wp.build','labyrinthos.markets','sooon.fun','tari-market.johnnytsunami14.chatgpt.site'],
  recording:['ootle-lobby-preview.vercel.app','github.com','raw.githubusercontent.com','www.youtube.com','youtube.com','youtu.be','vimeo.com'],
 };
 if(!groups[field]?.includes(new URL(href).hostname))throw new Error('Link destination needs maintainer review.');
 return href;
}
