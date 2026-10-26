#!/bin/bash
# Собирает PDF к занятиям программы: презентация, конспект репетитора, ДЗ.
#   tools/build-pdfs.sh            — все занятия из program/slides/data
#   tools/build-pdfs.sh 8-05 9-01  — только указанные
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
SL=$ROOT/program/slides; OUT=$ROOT/program/files; mkdir -p "$OUT"
SCR=/tmp/claude-1000/-home-claude-work/08ba3e6f-3c21-4786-b586-981793a0d2de/scratchpad
CH=$(find ~/.cache/ms-playwright/chromium_headless_shell-1248 -name chrome-headless-shell -type f | head -1)
export LD_LIBRARY_PATH=$(cat $SCR/libpath.txt 2>/dev/null || cat ~/.cache/pdf-libpath.txt)
PORT=8766; (cd "$SL" && exec python3 -m http.server $PORT >/dev/null 2>&1) & SRV=$!; trap "kill $SRV" EXIT; sleep 1
ids=("$@"); [ ${#ids[@]} -eq 0 ] && ids=($(cd "$SL/data" && ls *.js | sed 's/\.js$//'))
for id in "${ids[@]}"; do
  g=${id%-*}; n=$((10#${id#*-}))
  for m in slides tutor hw; do
    f=$OUT/$id-$m.pdf
    "$CH" --headless --no-sandbox --disable-gpu --no-pdf-header-footer --virtual-time-budget=8000 \
      --print-to-pdf="$f" "http://localhost:$PORT/print.html?g=$g&n=$n&mode=$m" 2>/dev/null
  done
  echo "$id ok"
done
