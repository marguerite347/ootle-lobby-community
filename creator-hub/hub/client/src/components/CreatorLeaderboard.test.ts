import {describe, expect, it} from 'vitest';
import {rankCreators} from './CreatorLeaderboard';
const creators = [
    {id:'a',name:'Ari',showActivity:true},
    {id:'b',name:'Bo',showActivity:true},
    {id:'c',name:'Cora',showActivity:true},
    {id:'private',name:'Hidden',showActivity:false}
];
const listings = [
    {creatorId:'a',downloads:10,weeklyDownloads:2},
    {creatorId:'b',downloads:5,weeklyDownloads:2},
    {creatorId:'c',downloads:3,weeklyDownloads:1},
    {creatorId:'private',downloads:100,weeklyDownloads:90}
];
describe('creator standings', () => {
    it('honors opt-outs and uses competition ranks for ties', () => {
        expect(rankCreators(creators,listings,'weeklyDownloads').map(creator=>[creator.id,creator.rank])).toEqual([['a',1],['b',1],['c',3]]);
    });
    it('uses the selected window and sums multiple listings', () => {
        const ranked = rankCreators(creators,[...listings,{creatorId:'b',downloads:6,weeklyDownloads:0}],'downloads');
        expect(ranked[0]).toMatchObject({id:'b',score:11,rank:1});
    });
    it('never creates standings from missing, zero or invalid scores', () => {
        expect(rankCreators(creators,[{creatorId:'a',downloads:NaN,weeklyDownloads:0}],'downloads')).toEqual([]);
        expect(rankCreators(creators,[],'weeklyDownloads')).toEqual([]);
    });
});
