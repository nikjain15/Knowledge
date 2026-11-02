#!/bin/bash
# Lakewell Knowledge demo: run from this folder, no network needed. Double-click in Finder.
cd "$(dirname "$0")"
# Audit A-079: the private copy (folder uc2-proto) serves on 8743, any other copy on 8744, so one never opens the other
PORT=8744; [ "$(basename "$PWD")" = "uc2-proto" ] && PORT=8743
if ! curl -s -o /dev/null http://127.0.0.1:$PORT/; then nohup python3 -m http.server $PORT >/dev/null 2>&1 & sleep 1; fi
open "http://127.0.0.1:$PORT/"
