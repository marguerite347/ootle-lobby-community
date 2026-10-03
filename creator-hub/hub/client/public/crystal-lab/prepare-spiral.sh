#!/bin/sh
set -eu
source_file=${1:?Pass the licensed Envato ProRes master path}
asset_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ffmpeg -y -v error -i "$source_file" -vf 'scale=960:540,format=yuv420p' -an -c:v libx264 -crf 18 -movflags +faststart "$asset_dir/spiral.mp4"
