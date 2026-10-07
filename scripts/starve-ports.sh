#!/bin/bash
# Runs inside a fresh network namespace: restrict the ephemeral port range to a
# single port, occupy it, then run the given command. Any attempt to bind an
# ephemeral loopback port now fails (EADDRINUSE), emulating an agent/CI sandbox
# where the process is not allowed to open a local listening port.
echo "20000 20000" > /proc/sys/net/ipv4/ip_local_port_range
python3 -c "
import socket, os, subprocess, sys
s = socket.socket()
s.bind(('127.0.0.1', 20000)); s.listen(1)
os.set_inheritable(s.fileno(), False)
print('[repro] ephemeral port range pinned to 20000 and occupied', flush=True)
sys.exit(subprocess.run(sys.argv[1:]).returncode)
" "$@"
