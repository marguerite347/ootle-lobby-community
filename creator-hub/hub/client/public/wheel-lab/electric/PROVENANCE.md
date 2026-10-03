# Electric plasma charge trial

- Asset: Electric Energy Circle Logo Reveal Intro, by notjungcg.
- Envato item U5XYXWE: https://elements.envato.com/effect-black-magic-explosion-shockwave-U5XYXWE
- Authenticated Envato download displayed Automatically licensed on September 25, 2026. User supplied the downloaded master afterward. No license secrets stored here.
- Master: `creator-hub/handoff/reward-proof/assets/masters/electric-plasma.mp4`, 3840×2160, 8.108 seconds, 29.97 fps, black background.
- Runtime: `plasma.webm`, 1280×720 VP9 alpha, silent. Both files are private Git LFS dependencies of this project. Do not redistribute as standalone stock assets.

Rebuild from repository root:

```sh
ffmpeg -i creator-hub/handoff/reward-proof/assets/masters/electric-plasma.mp4 -vf 'scale=1280:720,colorkey=0x000000:0.025:0.12,format=yuva420p' -c:v libvpx-vp9 -b:v 0 -crf 32 -auto-alt-ref 0 -an creator-hub/hub/client/public/wheel-lab/electric/plasma.webm
```

Selection receipt: reuse the approved Envato master and existing ffmpeg alpha workflow; the previous 128px sprite was too pixelated. Inspected the actual master and both spinning wheels. Preserve source aspect ratio and colors. Canvas sits behind the transparent Spline wheel, with inward feathering and peg exclusion. Play once at 1.2× per spin, never loop; fade at landing. First intensity 0.42, Super 1.0 with existing assembly shake. Optional synthesized buzz remains separate and has not been auditioned.

Enabled in the Lobby embedded reward playtest and the `?charge` comparison. Real-credit settlement remains unchanged. The rejected D3velopp sheet is retired from current assets; historical Git revisions preserve its provenance.


## Persistent idle fire

`plasma-loop.webm` is a 2.5-second seamless derivative of the same licensed plasma. It crossfades the tail into the head without adding a second runtime decoder. Both wheels keep it playing at0.8x while idle and1.2x while spinning; opacity rises from0.30 to0.65 on the first wheel, and0.40 to1.0 on Super. No seeking or restart at spin boundaries. Reduced motion/effects-off and hidden documents pause/hide it. Audio and shake still occur only during spins.

Rebuild from this directory:

```sh
ffmpeg -c:v libvpx-vp9 -i plasma.webm -filter_complex "[0:v]trim=start=2:end=5,setpts=PTS-STARTPTS,split[a][b];[a][b]xfade=transition=fade:duration=0.5:offset=2.5,trim=start=0.5:end=3,setpts=PTS-STARTPTS,format=yuva420p[out]" -map '[out]' -an -c:v libvpx-vp9 -b:v 0 -crf 32 -deadline good -cpu-used 4 -auto-alt-ref 0 plasma-loop.webm
```
