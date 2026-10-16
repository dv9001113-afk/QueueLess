#!/bin/bash
# ==============================================================================
# QueueLess — macOS Smart Universal Launcher (.command)
# Automatically locates index.html across directories and opens in App mode
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Search for index.html in multiple candidate locations
if [ -f "$DIR/index.html" ]; then
    TARGET_PATH="$DIR/index.html"
elif [ -f "$DIR/../../index.html" ]; then
    TARGET_PATH="$DIR/../../index.html"
elif [ -f "$DIR/../index.html" ]; then
    TARGET_PATH="$DIR/../index.html"
elif [ -f "$DIR/QueueLess/index.html" ]; then
    TARGET_PATH="$DIR/QueueLess/index.html"
else
    # Fallback to local server if running
    TARGET_PATH="http://localhost:5000"
fi

echo "Launching QueueLess on macOS from: $TARGET_PATH"

# 1. Try Google Chrome in standalone App Mode (no address bar or tabs)
if [ -d "/Applications/Google Chrome.app" ]; then
    open -a "Google Chrome" --args --app="file://$TARGET_PATH" 2>/dev/null && exit 0
fi

# 2. Try Microsoft Edge in standalone App Mode
if [ -d "/Applications/Microsoft Edge.app" ]; then
    open -a "Microsoft Edge" --args --app="file://$TARGET_PATH" 2>/dev/null && exit 0
fi

# 3. Default Safari / System browser
open "$TARGET_PATH"
exit 0
