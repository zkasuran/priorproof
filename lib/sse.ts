// Server-Sent Events helpers, shared by the API route (server) and the demo
// surface (client). Pure and isomorphic: no next/*, no node:*, no DOM. The route
// encodes each engine event as a frame, the browser decodes the byte stream back
// into frames. Keeping both sides on one module means the wire format cannot drift
// between producer and consumer.

/** One decoded SSE frame. `event` is the event name, `data` the raw data payload. */
export interface SseFrame {
  event: string;
  data: string;
}

/** A comment line. The browser ignores it, so it keeps the connection warm. */
export const SSE_HEARTBEAT = ": ping\n\n";

/**
 * Encode one event as an SSE frame: an `event:` line, a single `data:` line of
 * JSON, then the blank line that dispatches it. Newlines inside the JSON would
 * break the single-line data contract, so they are escaped by JSON.stringify
 * already (it emits \n, never a literal newline).
 */
export function encodeEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * A streaming decoder. Feed it text chunks as they arrive off the reader. It
 * buffers partial frames across chunk boundaries and returns whole frames only.
 * Comment lines (the heartbeat) decode to nothing and are dropped.
 */
export function createSseDecoder(): { push(chunk: string): SseFrame[] } {
  let buffer = "";
  return {
    push(chunk: string): SseFrame[] {
      // Normalise CRLF and lone CR to LF so the frame split is stable across servers.
      buffer += chunk.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const frames: SseFrame[] = [];
      let sep = buffer.indexOf("\n\n");
      while (sep !== -1) {
        const raw = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const frame = parseFrame(raw);
        if (frame) frames.push(frame);
        sep = buffer.indexOf("\n\n");
      }
      return frames;
    },
  };
}

function parseFrame(raw: string): SseFrame | null {
  let event = "message";
  const dataLines: string[] = [];
  let sawField = false;
  for (const line of raw.split("\n")) {
    if (line === "") continue;
    // A line that starts with a colon is a comment (the heartbeat). Drop it.
    if (line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") {
      event = value;
      sawField = true;
    } else if (field === "data") {
      dataLines.push(value);
      sawField = true;
    }
  }
  if (!sawField) return null;
  return { event, data: dataLines.join("\n") };
}
