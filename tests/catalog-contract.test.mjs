import test from "node:test";
import assert from "node:assert/strict";
import { createHash, createPublicKey, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

// Contract fixtures, not a production JSON parser or Android/Worker implementation.
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../contracts/catalog/v1");
const from = (name) => JSON.parse(readFileSync(path.join(dir, "fixtures", `${name}.test.json`), "utf8"));
const schema = (name) => JSON.parse(readFileSync(path.join(dir, `${name}.schema.json`), "utf8"));
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = {
  envelope: ajv.compile(schema("catalog-envelope")),
  languages: ajv.compile(schema("languages-payload")),
  songs: ajv.compile(schema("songs-payload")),
};
const publicFixture = from("public-key");
const publicKey = createPublicKey({
  key: Buffer.concat([
    Buffer.from("302a300506032b6570032100", "hex"),
    Buffer.from(publicFixture.ed25519PublicKeyBase64url, "base64url"),
  ]), format: "der", type: "spki",
});
function base64url(value, maxBytes) {
  assert.match(value, /^[A-Za-z0-9_-]+$/);
  const bytes = Buffer.from(value, "base64url");
  assert.ok(bytes.length <= maxBytes);
  assert.equal(bytes.toString("base64url"), value);
  return bytes;
}
function verified(name, kind, language) {
  const envelope = from(`${name}-envelope`);
  assert.ok(validate.envelope(envelope), ajv.errorsText(validate.envelope.errors));
  assert.equal(envelope.catalogKeyId, publicFixture.catalogKeyId);
  const bytes = base64url(envelope.payload, 128 * 1024);
  const signature = base64url(envelope.signature, 64);
  assert.equal(signature.length, 64);
  const prefix = Buffer.from(`REEDANCE-CATALOG-V1\n${envelope.catalogKeyId}\n`, "utf8");
  assert.equal(verify(null, Buffer.concat([prefix, bytes]), publicKey, signature), true);
  const payload = JSON.parse(bytes.toString("utf8"));
  assert.deepEqual(payload, from(`${name}-payload`));
  assert.equal(payload.kind, kind);
  assert.ok(validate[kind](payload), ajv.errorsText(validate[kind].errors));
  if (language) assert.equal(payload.language, language);
  return { envelope, bytes, payload, prefix, signature };
}
function approvedUrl(raw, name, host = "content.example.invalid") {
  const url = new URL(raw);
  assert.equal(url.href, raw); // reject ambiguous/normalized input and explicit default ports
  assert.equal(url.protocol, "https:");
  assert.equal(url.hostname, host); // app/worker-configured host, NEVER from the catalog
  assert.equal(url.port, "");
  assert.equal(url.username, "");
  assert.equal(url.password, "");
  assert.equal(url.search, "");
  assert.equal(url.hash, "");
  assert.match(url.pathname, /^\/(?:[A-Za-z0-9._~-]+\/)*[A-Za-z0-9._~-]+$/);
  assert.ok(url.pathname.split("/").every((segment) => segment !== "." && segment !== ".."));
  if (name) assert.equal(url.pathname.split("/").at(-1), name);
  else assert.match(url.pathname, /\.(?:jpg|png|webp)$/);
}
function semanticSongs(payload) {
  const ids = new Set();
  for (const song of payload.songs) {
    assert.equal(song.targetLanguage, payload.language);
    assert.equal(ids.has(song.songId), false);
    ids.add(song.songId);
    approvedUrl(song.manifestUrl, "latest.json");
    if (song.coverUrl) approvedUrl(song.coverUrl);
  }
}

test("catalog fixture signatures, strict schemas and scopes are independent of the package manifest", () => {
  assert.equal(publicFixture.testOnly, true);
  const languages = verified("languages", "languages").payload;
  const codes = languages.languages.map((row) => row.code);
  assert.equal(new Set(codes).size, codes.length);
  const r1 = verified("songs-en-r1", "songs", "en").payload;
  const emptySpanish = verified("songs-es-r1", "songs", "es").payload;
  const r2 = verified("songs-en-r2", "songs", "en").payload;
  for (const result of [r1, emptySpanish, r2]) {
    semanticSongs(result);
    assert.ok(codes.includes(result.language));
  }
  assert.deepEqual(emptySpanish.songs, []);
  assert.equal(emptySpanish.revision, languages.revision);
  assert.deepEqual(r1.songs.map((song) => song.songId), ["quiet-step"]);
  assert.deepEqual(r2.songs.map((song) => song.songId), ["quiet-step", "new-track"]);
  assert.equal(r2.revision, r1.revision + 1);
  assert.equal(r1.songs[0].manifestUrl, "https://content.example.invalid/reedance/en/quiet-step/latest.json");
  // No lesson/audio/image bytes in either document: URLs alone are permitted.
  for (const forbidden of ["audio", "lesson", "image", "pack", "encryptionKey", "signatureKeyId"]) {
    assert.equal(forbidden in r2.songs[0], false);
  }
});

test("a replayed or mutated snapshot cannot replace a newer authenticated observation", () => {
  const r1 = verified("songs-en-r1", "songs", "en");
  const r2 = verified("songs-en-r2", "songs", "en");
  const seen = { revision: r2.payload.revision, payloadSha256: createHash("sha256").update(r2.bytes).digest("hex") };
  const accept = (snapshot) => snapshot.payload.revision > seen.revision ||
    (snapshot.payload.revision === seen.revision && createHash("sha256").update(snapshot.bytes).digest("hex") === seen.payloadSha256);
  assert.equal(accept(r1), false);
  assert.equal(accept(r2), true);
  const alternate = Buffer.from(`${JSON.stringify({ ...r2.payload, publishedAt: "2026-11-13T02:00:00Z" })}\n`);
  assert.equal(accept({ payload: r2.payload, bytes: alternate }), false);
});

test("tampering, manifest-domain confusion, noncanonical base64 and extra metadata are rejected", () => {
  const { envelope, bytes, prefix, signature, payload } = verified("songs-en-r1", "songs", "en");
  const changed = Buffer.from(bytes);
  changed[20] ^= 1;
  assert.equal(verify(null, Buffer.concat([prefix, changed]), publicKey, signature), false);
  assert.equal(verify(null, Buffer.concat([Buffer.from(`REEDANCE-MANIFEST-V1\n${envelope.catalogKeyId}\n`), bytes]), publicKey, signature), false);
  assert.equal(verify(null, Buffer.concat([Buffer.from("REEDANCE-CATALOG-V1\ncat-other\n"), bytes]), publicKey, signature), false);
  assert.equal(validate.envelope({ ...envelope, payload: `${envelope.payload}=` }), false);
  assert.equal(validate.envelope({ ...envelope, manifestUrl: "https://evil.invalid/latest.json" }), false);
  assert.equal(validate.songs({ ...payload, audio: "base64" }), false);
  assert.equal(validate.songs({ ...payload, kind: "languages" }), false);
  assert.equal(validate.songs({ ...payload, songs: [{ ...payload.songs[0], manifestUrl: "http://content.example.invalid/latest.json" }] }), false);
  assert.equal(validate.languages({ ...payload, kind: "languages" }), false);
  assert.throws(() => verified("songs-en-r1", "songs", "es")); // route scope matters even with a valid signature
  assert.throws(() => verified("languages", "songs", "en")); // endpoint kind is bound after verification
  assert.equal(validate.songs({ ...payload, songs: Array(101).fill(payload.songs[0]) }), false);
});

test("semantic checks block URL tricks, duplicates, and a wrong target language (schema alone is insufficient)", () => {
  const payload = verified("songs-en-r1", "songs", "en").payload;
  const withSong = (patch) => ({ ...payload, songs: [{ ...payload.songs[0], ...patch }] });
  for (const url of [
    "http://content.example.invalid/reedance/en/quiet-step/latest.json",
    "https://evil.invalid/reedance/en/quiet-step/latest.json",
    "https://user@content.example.invalid/reedance/en/quiet-step/latest.json",
    "https://content.example.invalid/reedance/en/quiet-step/latest.json?token=1",
    "https://content.example.invalid/reedance/en/quiet-step/latest.json#part",
    "https://content.example.invalid/reedance/en/%2fquiet-step/latest.json",
    "https://content.example.invalid/reedance//en/quiet-step/latest.json",
    "https://content.example.invalid/reedance/en/quiet-step/latest.json/extra",
    "https://content.example.invalid:443/reedance/en/quiet-step/latest.json",
  ]) assert.throws(() => semanticSongs(withSong({ manifestUrl: url })));
  assert.throws(() => semanticSongs(withSong({ targetLanguage: "es" })));
  assert.throws(() => semanticSongs({ ...payload, songs: [payload.songs[0], payload.songs[0]] }));
  assert.throws(() => semanticSongs(withSong({ coverUrl: "https://images.evil.invalid/cover.webp" })));
  const spanish = verified("songs-es-r1", "songs", "es").payload;
  const conflict = { ...spanish, songs: [{ ...payload.songs[0], targetLanguage: "es" }] };
  semanticSongs(conflict); // each document alone is structurally valid
  const observed = new Map(payload.songs.map((song) => [song.songId, song.targetLanguage]));
  assert.throws(() => {
    for (const song of conflict.songs) if (observed.has(song.songId) && observed.get(song.songId) !== song.targetLanguage) throw Error("cross-language songId reuse");
  });
});
