#!/usr/bin/env python3
"""Run a command with bind(2) denied (EPERM), emulating a sandboxed
environment that forbids binding local ports. Linux/x86_64, seccomp-bpf.
Usage: python3 deny-bind.py <cmd> [args...]
"""
import ctypes, os, struct, sys

BPF_LD, BPF_W, BPF_ABS, BPF_JMP, BPF_JEQ, BPF_K, BPF_RET = 0x00, 0x00, 0x20, 0x05, 0x10, 0x00, 0x06
AUDIT_ARCH_X86_64 = 0xC000003E
NR_BIND = 49
SECCOMP_RET_ERRNO = 0x00050000
SECCOMP_RET_ALLOW = 0x7FFF0000
EPERM = 1

def stmt(code, k): return struct.pack("HBBI", code, 0, 0, k)
def jump(code, k, jt, jf): return struct.pack("HBBI", code, jt, jf, k)

prog = b"".join([
    stmt(BPF_LD | BPF_W | BPF_ABS, 4),                       # arch
    jump(BPF_JMP | BPF_JEQ | BPF_K, AUDIT_ARCH_X86_64, 0, 3),
    stmt(BPF_LD | BPF_W | BPF_ABS, 0),                       # syscall nr
    jump(BPF_JMP | BPF_JEQ | BPF_K, NR_BIND, 0, 1),
    stmt(BPF_RET | BPF_K, SECCOMP_RET_ERRNO | EPERM),
    stmt(BPF_RET | BPF_K, SECCOMP_RET_ALLOW),
])

class SockFprog(ctypes.Structure):
    _fields_ = [("len", ctypes.c_ushort), ("filter", ctypes.c_void_p)]

libc = ctypes.CDLL("libc.so.6", use_errno=True)
buf = ctypes.create_string_buffer(prog, len(prog))
fprog = SockFprog(len(prog) // 8, ctypes.cast(buf, ctypes.c_void_p))
assert libc.prctl(38, 1, 0, 0, 0) == 0, "PR_SET_NO_NEW_PRIVS failed"
assert libc.prctl(22, 2, ctypes.byref(fprog), 0, 0) == 0, "PR_SET_SECCOMP failed"
os.execvp(sys.argv[1], sys.argv[1:])
