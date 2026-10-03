# Y6HUAQT licensed crystal

Project-restricted Envato source. Not a standalone asset catalog. SKQF3R7 is not used.

Daily Spark does not use this plate as the crystal hero. The displayed hero is Lobby Vault Charge v3.1, `data-art="authored-lobby-vault-charge"`, file `client/public/daily-spark/vault-charge/vault-charge-hero.png`, SHA256 `f038205b9a4522665cd3c4f66a37e6aed0478ce826e51d622a27d62bd293b076`. This note stays so the licensed derivative can be refreshed without putting it back on the vault.

## Verified master

Release: `creator-handoff-2026-09-23-current-v2`  
File: `ootle-envato-Y6HUAQT-crystal.mp4`  
Receipt: pull request 186, comment 5804778032  
Bytes: 11,454,052  
SHA256: `9adfc36713d4d8232fda6fe8e6ff30d382ea09eb1a2152d96352921e664e3646`

ffprobe of that file: H.264 High, yuv420p, 1920×1080, 10.01s, about 8823 kb/s video, plus AAC LC stereo 48 kHz. There is no alpha channel. The background is black. Envato’s listing is not proof of alpha in these bytes.

The master is not committed. A checked copy for Assets is `jam-handoff/crystal-y6huaqt-trial/licensed/ootle-envato-Y6HUAQT-crystal.mp4` on the worker that downloaded it. Refresh with the command below.

## Retained derivative

`creator-hub/hub/client/public/daily-spark/y6huaqt/crystal.mp4` is a muted web derivative: crop `368:640:760:240`, scale to 480×834, H.264 yuv420p, no audio, faststart. Poster: `crystal-poster.png` from 1.5s of that derivative. SparkReactor does not load these files.

The old player did not use `mix-blend-mode`. `.daily-spark` isolates its backdrop, so a screen blend on the video never composited against the vault and the black field stayed a readable rectangle. Each video frame and the poster were drawn to a canvas and the black field was keyed to alpha (peak channel at or under 18 is clear; 19–41 feathers). Those keying helpers remain in `crystalMedia.ts` and are covered by tests. They are not the Daily Spark hero path. AAC on the master was not auditioned.

## Loop seam

This describes the retained derivative, which the vault no longer plays.

First and last frames of the master are not the same pose. SSIM All between them is about 0.936. Looping the derivative therefore makes a small jump once each 10 seconds. Idle keeps a low rate so that jump is infrequent. Settled does not play the loop. This is not an authored seamless loop.

## Refresh

From the repository root, with `gh` authenticated for this private release:

```bash
mkdir -p /tmp/y6huaqt-source
gh release download creator-handoff-2026-09-23-current-v2 \
  --repo marguerite347/tari-growth \
  --pattern ootle-envato-Y6HUAQT-crystal.mp4 \
  --dir /tmp/y6huaqt-source --clobber
sha256sum /tmp/y6huaqt-source/ootle-envato-Y6HUAQT-crystal.mp4
# must print 9adfc36713d4d8232fda6fe8e6ff30d382ea09eb1a2152d96352921e664e3646
ffmpeg -y -i /tmp/y6huaqt-source/ootle-envato-Y6HUAQT-crystal.mp4 -an \
  -vf "crop=368:640:760:240,scale=480:-2" \
  -c:v libx264 -pix_fmt yuv420p -crf 26 -movflags +faststart \
  creator-hub/hub/client/public/daily-spark/y6huaqt/crystal.mp4
ffmpeg -y -ss 1.5 -i creator-hub/hub/client/public/daily-spark/y6huaqt/crystal.mp4 \
  -frames:v 1 -update 1 \
  creator-hub/hub/client/public/daily-spark/y6huaqt/crystal-poster.png
```

Do not commit the 11MB master.
