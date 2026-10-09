import os, pty, fcntl, termios, struct, signal, time, subprocess, sys, select, urllib.request

LOG = sys.argv[1] if len(sys.argv) > 1 else "dev-output.log"
pid, fd = pty.fork()
if pid == 0:
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    os.environ['FORCE_COLOR']='0'
    os.execvp('npm', ['npm','run','dev'])

def setsize(cols, rows=40):
    fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack('HHHH', rows, cols, 0, 0))

setsize(200)
out = open(LOG,'wb')
def pump(sec):
    end = time.time()+sec
    while time.time() < end:
        r,_,_ = select.select([fd],[],[],0.2)
        if r:
            try: d = os.read(fd, 65536)
            except OSError: return
            if not d: return
            out.write(d); out.flush()

def hit():
    try:
        urllib.request.urlopen('http://localhost:3000/width', timeout=30).read()
    except Exception as e:
        print('fetch err', e)

pump(20)
out.write(b'\n===== MARKER: request 1 at 200 columns =====\n'); out.flush()
hit(); pump(8)
out.write(b'\n===== MARKER: resizing terminal to 70 columns =====\n'); out.flush()
setsize(70)
os.kill(pid, signal.SIGWINCH)
pump(3)
out.write(b'\n===== MARKER: request 2 at 70 columns =====\n'); out.flush()
hit(); pump(8)
os.kill(pid, signal.SIGTERM)
pump(2)
out.close()
