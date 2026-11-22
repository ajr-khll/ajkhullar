// Runs Arpeggio (arpeggio.wasm, built from ~/Projects/chess-ai/web) off the
// main thread. Messages: {id, cmd: "legal" | "go", position, ms} -> {id, result}.
// The engine is a WASI "reactor"; the few system calls it makes (clock, stdout,
// random) are provided here, everything else reports "not supported".

let ex;
const enc = new TextEncoder();
const dec = new TextDecoder();
const view = () => new DataView(ex.memory.buffer);

const wasi = {
  clock_time_get(id, _precision, out) {
    const ms = id === 0 ? Date.now() : performance.now();
    view().setBigUint64(out, BigInt(Math.round(ms * 1e6)), true);
    return 0;
  },
  fd_write(_fd, iovs, count, written) {
    const dv = view();
    let total = 0;
    for (let i = 0; i < count; i++) total += dv.getUint32(iovs + i * 8 + 4, true);
    dv.setUint32(written, total, true); // output is discarded
    return 0;
  },
  random_get(buf, len) {
    for (let off = 0; off < len; off += 65536)
      crypto.getRandomValues(new Uint8Array(ex.memory.buffer, buf + off, Math.min(65536, len - off)));
    return 0;
  },
  environ_sizes_get(count, size) {
    view().setUint32(count, 0, true);
    view().setUint32(size, 0, true);
    return 0;
  },
  environ_get: () => 0,
  args_sizes_get(count, size) {
    view().setUint32(count, 0, true);
    view().setUint32(size, 0, true);
    return 0;
  },
  args_get: () => 0,
  proc_exit(code) {
    throw new Error(`engine exited (${code})`);
  },
};
const imports = {
  wasi_snapshot_preview1: new Proxy(wasi, { get: (t, k) => t[k] ?? (() => 52 /* ENOSYS */) }),
};

const ready = WebAssembly.instantiateStreaming(fetch(new URL("arpeggio.wasm", self.location)), imports).then(
  ({ instance }) => {
    ex = instance.exports;
    ex._initialize?.();
    ex.arp_init();
  },
);

function call(fn, str, ...args) {
  const bytes = enc.encode(str + "\0");
  const p = ex.malloc(bytes.length);
  new Uint8Array(ex.memory.buffer).set(bytes, p);
  const r = ex[fn](p, ...args);
  ex.free(p);
  const mem = new Uint8Array(ex.memory.buffer);
  let end = r;
  while (mem[end]) end++;
  return dec.decode(mem.subarray(r, end));
}

self.onmessage = async ({ data: { id, cmd, position, ms } }) => {
  try {
    await ready;
    const result = cmd === "go" ? call("arp_go", position, ms) : call("arp_legal", position);
    self.postMessage({ id, result });
  } catch (e) {
    self.postMessage({ id, error: String(e?.message ?? e) });
  }
};
