#!/bin/bash
# Lakewell Knowledge demo: run from this folder, no network needed. Double-click in Finder.
cd "$(dirname "$0")"
if ! curl -s -o /dev/null http://127.0.0.1:8743/; then nohup python3 -m http.server 8743 >/dev/null 2>&1 & sleep 1; fi
open "http://127.0.0.1:8743/"
