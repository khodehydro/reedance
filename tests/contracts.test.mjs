import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash, createDecipheriv, createPublicKey, verify } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

// A consumer of the test-only golden vector, not a production ZIP/security
// implementation. Desktop and Android must supply their own hardened parsers.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = path.join(root, "contracts/v1/fixtures");
const readJson = (name) => JSON.parse(readFileSync(path.join(fixture, name), "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const keys = readJson("keys.test.json");
const envelope = readJson("latest.json");
const payloadBytes = Buffer.from(envelope.payload, "base64url");
const payload = JSON.parse(payloadBytes.toString("utf8"));
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const schema = (name) => JSON.parse(readFileSync(path.join(root, "contracts/v1", `${name}.schema.json`), "utf8"));
// Draft and published lesson share vocabulary/grammar/quiz definitions, but
// have intentionally different rules for media and lyric timing.
ajv.addSchema(schema("lesson"));
const validates = Object.fromEntries(
  ["lesson", "draft", "manifest-payload", "manifest-envelope", "bootstrap-catalog"].map((name) => [name, name === "lesson" ? ajv.getSchema("urn:reedance:lesson:v1") : ajv.compile(schema(name))]),
);
const valid = (name, value) => {
  const result = validates[name](value);
  assert.equal(result, true, `${name}: ${ajv.errorsText(validates[name].errors)}`);
};

const crcTable = Array.from({ length: 256 }, (_, i) => {
  let c = i;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function unpackFixtureZip(zip) {
  const eocd = zip.length - 22;
  assert.equal(zip.readUInt32LE(eocd), 0x06054b50);
  const count = zip.readUInt16LE(eocd + 10);
  assert.equal(count, 2); // final pack only; the raw JSON draft is never zipped
  assert.equal(zip.readUInt32LE(eocd + 12) + zip.readUInt32LE(eocd + 16), eocd);
  let at = zip.readUInt32LE(eocd + 16);
  const files = new Map();
  for (let i = 0; i < count; i++) {
    assert.equal(zip.readUInt32LE(at), 0x02014b50);
    assert.equal(zip.readUInt16LE(at + 10), 0); // STORE fixture
    assert.equal(zip.readUInt16LE(at + 30), 0); // no extra field
    assert.equal(zip.readUInt16LE(at + 32), 0); // no comment
    const size = zip.readUInt32LE(at + 24);
    const nameLength = zip.readUInt16LE(at + 28);
    const name = zip.subarray(at + 46, at + 46 + nameLength).toString("ascii");
    assert.match(name, /^(?:audio\.wav|lesson\.json)$/);
    assert.equal(files.has(name), false);
    const local = zip.readUInt32LE(at + 42);
    assert.equal(zip.readUInt32LE(local), 0x04034b50);
    assert.equal(zip.readUInt16LE(local + 26), nameLength);
    assert.equal(zip.readUInt16LE(local + 28), 0);
    const start = local + 30 + nameLength;
    const data = zip.subarray(start, start + size);
    assert.equal(data.length, size);
    assert.equal(crc32(data), zip.readUInt32LE(at + 16));
    files.set(name, data);
    at += 46 + nameLength;
  }
  assert.equal(at, eocd);
  return files;
}
function unwrapPack(pack) {
  assert.deepEqual(pack.subarray(0, 8), Buffer.from("RDPACK1\0", "ascii"));
  const length = pack.readUInt8(8);
  assert.ok(length >= 1 && length <= 32);
  const keyId = pack.subarray(9, 9 + length).toString("ascii");
  assert.equal(keyId, payload.package.encryptionKeyId);
  const headerLength = 29 + length;
  const header = pack.subarray(0, headerLength);
  const nonce = pack.subarray(9 + length, 21 + length);
  const plaintextLength = Number(pack.readBigUInt64BE(21 + length));
  assert.equal(pack.length, 45 + length + plaintextLength);
  const decipher = createDecipheriv("aes-256-gcm", Buffer.from(keys.aes256KeyBase64url, "base64url"), nonce, { authTagLength: 16 });
  decipher.setAAD(header);
  decipher.setAuthTag(pack.subarray(-16));
  return Buffer.concat([decipher.update(pack.subarray(headerLength, -16)), decipher.final()]);
}

// The fixture's public key is 32 raw RFC 8032 bytes. Node expects an SPKI
// wrapper; Android uses the corresponding raw public key in its pin set.
const spki = Buffer.concat([
  Buffer.from("302a300506032b6570032100", "hex"),
  Buffer.from(keys.ed25519PublicKeyBase64url, "base64url"),
]);
const publicKey = createPublicKey({ key: spki, format: "der", type: "spki" });
const signedMessage = () => Buffer.concat([
  Buffer.from(`REEDANCE-MANIFEST-V1\n${envelope.signatureKeyId}\n`, "utf8"),
  payloadBytes,
]);

test("v1 schemas accept the real golden fixtures and reject malformed lessons", () => {
  assert.equal(keys.testOnly, true);
  valid("lesson", readJson("lesson.json"));
  valid("draft", readJson("quiet-step.rddraft.json"));
  valid("manifest-payload", payload);
  valid("manifest-envelope", envelope);
  valid("bootstrap-catalog", readJson("bootstrap-catalog.test.json"));
  assert.equal(payloadBytes.toString("utf8"), readFileSync(path.join(fixture, "manifest-payload.json"), "utf8"));
  const missingTranslation = readJson("lesson.json");
  delete missingTranslation.lyrics[0].translationFa;
  assert.equal(validates.lesson(missingTranslation), false);
  const invalidAnswer = readJson("lesson.json");
  invalidAnswer.questions[0].type = "unexpected";
  assert.equal(validates.lesson(invalidAnswer), false);
});

test("the Ed25519 signed manifest binds the exact payload bytes and key id", () => {
  valid("manifest-envelope", envelope);
  assert.equal(envelope.signatureKeyId, keys.signatureKeyId);
  assert.equal(Buffer.from(envelope.signature, "base64url").toString("base64url"), envelope.signature);
  assert.equal(Buffer.from(envelope.payload, "base64url").toString("base64url"), envelope.payload);
  assert.equal(verify(null, signedMessage(), publicKey, Buffer.from(envelope.signature, "base64url")), true);
  assert.equal(verify(null, Buffer.concat([signedMessage(), Buffer.from(" ")]), publicKey, Buffer.from(envelope.signature, "base64url")), false);
  assert.equal(verify(null, Buffer.concat([Buffer.from("REEDANCE-MANIFEST-V1\nsig-other\n"), payloadBytes]), publicKey, Buffer.from(envelope.signature, "base64url")), false);
});

test("the encrypted package contains the one lesson and one audio file", () => {
  const pack = readFileSync(path.join(fixture, payload.package.fileName));
  assert.deepEqual(readdirSync(fixture).filter((name) => name.endsWith(".rdpack")), [payload.package.fileName]);
  assert.equal(pack.length, payload.package.sizeBytes);
  assert.equal(sha256(pack), payload.package.sha256);
  assert.equal(payload.package.fileName, `v${String(payload.contentVersionCode).padStart(6, "0")}-${sha256(pack)}.rdpack`);
  const zip = unpackFixtureZip(unwrapPack(pack));
  assert.deepEqual([...zip.keys()], ["audio.wav", "lesson.json"]);
  assert.deepEqual(zip.get("lesson.json"), readFileSync(path.join(fixture, "lesson.json")));
  assert.deepEqual(zip.get("audio.wav"), readFileSync(path.join(fixture, "audio.wav")));
  const lesson = JSON.parse(zip.get("lesson.json").toString("utf8"));
  valid("lesson", lesson);
  assert.equal(lesson.songId, payload.songId);
  assert.equal(lesson.targetLanguage, payload.targetLanguage);
  assert.equal(lesson.schemaVersion, payload.lessonSchemaVersion);
  assert.equal(lesson.media.audio.sha256, sha256(zip.get("audio.wav")));
  assert.equal(zip.get("audio.wav").toString("ascii", 0, 4), "RIFF");
  assert.deepEqual(lesson.questions.map((q) => q.type), ["choice", "match", "order", "typing"]);
  const tampered = Buffer.from(pack);
  tampered[tampered.length - 1] ^= 0x01;
  assert.throws(() => unwrapPack(tampered));
  const changedHeader = Buffer.from(pack);
  changedHeader[9 + keys.encryptionKeyId.length] ^= 0x01;
  assert.throws(() => unwrapPack(changedHeader));
});

test("the agent's single raw JSON is content-only; Windows adds local audio and timeline marks", () => {
  const raw = readFileSync(path.join(fixture, "quiet-step.rddraft.json"));
  const draft = JSON.parse(raw.toString("utf8"));
  const lesson = readJson("lesson.json");
  valid("draft", draft);
  valid("lesson", lesson);
  assert.ok(raw.length < 4 * 1024 * 1024);
  assert.equal(draft.songId, lesson.songId);
  assert.equal(draft.targetLanguage, lesson.targetLanguage);
  assert.deepEqual(Object.keys(draft.sources).sort(), ["lesson", "lyrics"]);
  assert.equal("media" in draft, false);
  assert.equal("audio" in draft.credits, false);
  assert.equal(draft.lyrics.every((line) => !("startMs" in line) && !("endMs" in line)), true);
  assert.deepEqual(draft.vocabulary, lesson.vocabulary);
  assert.deepEqual(draft.grammar, lesson.grammar);
  assert.deepEqual(draft.questions, lesson.questions);
  assert.deepEqual(draft.lyrics, lesson.lyrics.map(({ startMs, endMs, ...line }) => line));
  assert.deepEqual(lesson.lyrics.map((line) => line.startMs), [0, 2000]);
  assert.equal(sha256(readFileSync(path.join(fixture, "audio.wav"))), lesson.media.audio.sha256);
  assert.equal(validates.lesson(draft), false); // unsynced draft is not a published lesson
  const missingArtistInDraft = structuredClone(draft);
  delete missingArtistInDraft.artist;
  delete missingArtistInDraft.level;
  valid("draft", missingArtistInDraft); // Windows supplies unknown metadata before export
  const fakeTimedDraft = structuredClone(draft);
  fakeTimedDraft.lyrics[0].startMs = 0;
  assert.equal(validates.draft(fakeTimedDraft), false);
  const fakeAudioDraft = structuredClone(draft);
  fakeAudioDraft.media = lesson.media;
  assert.equal(validates.draft(fakeAudioDraft), false);
  const missingSync = structuredClone(lesson);
  delete missingSync.lyrics[1].startMs;
  assert.equal(validates.lesson(missingSync), false);
  const missingAudio = structuredClone(lesson);
  delete missingAudio.media;
  assert.equal(validates.lesson(missingAudio), false);
});
