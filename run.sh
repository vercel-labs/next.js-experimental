#!/usr/bin/env bash
# Reproduces: next dev panics with "task is missing in memory or persistent
# storage" after Turbopack persistent-cache compaction when experimental.turbopackGc
# is enabled.
#
# These two env vars only shorten the snapshot interval so GC + compaction
# passes happen in seconds instead of minutes. They do not change behavior
# otherwise; with the defaults the same failure needs far longer sessions.
set -euo pipefail
export TURBO_ENGINE_SNAPSHOT_IDLE_TIMEOUT_MILLIS=${TURBO_ENGINE_SNAPSHOT_IDLE_TIMEOUT_MILLIS:-200}
export TURBO_ENGINE_SNAPSHOT_MIN_ACTIVE_TIME_MILLIS=${TURBO_ENGINE_SNAPSHOT_MIN_ACTIVE_TIME_MILLIS:-200}
export CYCLES=${CYCLES:-12}
export IDLE_MS=${IDLE_MS:-12000}
export PORT=${PORT:-3000}
exec node scripts/stress.mjs
