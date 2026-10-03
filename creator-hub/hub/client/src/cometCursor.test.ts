import {afterEach,expect,test,vi} from 'vitest';
import {createCometCursor} from './cometCursor';

afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();});

function fixture() {
 let now=0, sequence=0;
 const pending=new Map<number,FrameRequestCallback>();
 vi.spyOn(performance,'now').mockImplementation(()=>now);
 vi.stubGlobal('innerWidth',1200);vi.stubGlobal('innerHeight',800);vi.stubGlobal('devicePixelRatio',3);
 vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>{pending.set(++sequence,callback);return sequence;});
 vi.stubGlobal('cancelAnimationFrame',(id:number)=>pending.delete(id));
 const context={clearRect:vi.fn(),setTransform:vi.fn(),save:vi.fn(),restore:vi.fn(),beginPath:vi.fn(),
  rect:vi.fn(),arc:vi.fn(),clip:vi.fn(),moveTo:vi.fn(),lineTo:vi.fn(),stroke:vi.fn(),fill:vi.fn(),
  fillRect:vi.fn(),createRadialGradient:()=>({addColorStop:vi.fn()})};
 const canvas={getContext:()=>context,style:{opacity:'0'},width:0,height:0};
 const comet=createCometCursor(canvas as unknown as HTMLCanvasElement);
 return {comet,canvas,pending,context,advance(time:number){now=time;const callbacks=[...pending.values()];pending.clear();callbacks.forEach(callback=>callback(now));}};
}

test('movement renders at capped resolution and stops scheduling after particles expire',()=>{
 const f=fixture();f.comet.move(100,100);f.advance(16);f.comet.move(110,100);f.advance(32);
 expect(f.canvas.style.opacity).toBe('1');expect(f.canvas.width).toBe(2400);
 expect(f.context.arc).toHaveBeenCalled();expect(f.pending.size).toBe(1);
 f.advance(1000);expect(f.pending.size).toBe(0);expect(f.canvas.style.opacity).toBe('0');
});

test('leaving or disabling the effect cancels work, and pointer teleports do not draw long streaks',()=>{
 const f=fixture();f.comet.move(100,100);f.advance(16);f.comet.move(110,100);
 expect(f.pending.size).toBe(1);f.comet.hide();expect(f.pending.size).toBe(0);
 f.comet.move(100,100);f.comet.move(900,100);
 expect(f.pending.size).toBe(0);expect(f.canvas.style.opacity).toBe('0');
});
