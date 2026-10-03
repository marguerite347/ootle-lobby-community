export const primaryNavigation = [
 {to:'/games',label:'Lobby Games'}, {to:'/explore',label:'Discover'}, {to:'/learn',label:'Learn'}, {to:'/skills',label:'Skills'},
 {to:'/challenges',label:'Challenges'}, {to:'/create',label:'Create'}, {to:'/projects',label:'Projects'},
];
export function legacyDestination(path:string, search:string){
 if(path==='/build')return '/explore'+(search||'?type=starter');
 if(path==='/studio')return search?'/create/project'+search:'/projects';
 if(path==='/onboarding')return '/games'+search;
 if(path==='/recipes')return '/create'+search;
 if(path.startsWith('/onboarding/'))return path.replace('/onboarding/','/create/goal/')+search;
 if(path.startsWith('/recipe/'))return path.replace('/recipe/','/create/recipe/')+search;
 return '/create';
}
