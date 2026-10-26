#!/bin/bash
# Печатает занятия, где текст слайда не влез в страницу: tools/check-overflow.sh 9-01 9-02 ...
ROOT=$(cd "$(dirname "$0")/.." && pwd); SL=$ROOT/program/slides
SCR=/tmp/claude-1000/-home-claude-work/08ba3e6f-3c21-4786-b586-981793a0d2de/scratchpad
CH=$(find ~/.cache/ms-playwright/chromium_headless_shell-1248 -name chrome-headless-shell -type f | head -1)
export LD_LIBRARY_PATH=$(cat $SCR/libpath.txt 2>/dev/null || cat ~/.cache/pdf-libpath.txt)
PORT=${PORT:-8790}; (cd "$SL" && exec python3 -m http.server $PORT >/dev/null 2>&1) & SRV=$!; trap "kill $SRV" EXIT; sleep 1
for id in "$@"; do g=${id%-*}; n=$((10#${id#*-}))
  o=$("$CH" --headless --no-sandbox --disable-gpu --window-size=1280,720 --virtual-time-budget=8000 --dump-dom "http://localhost:$PORT/print.html?g=$g&n=$n&mode=slides" 2>/dev/null | grep -o 'data-overflow="[^"]*"')
  [ "$o" != 'data-overflow=""' ] && echo "$id $o"
done; true
