// PUBLIC TEST VECTOR ONLY. Never deploy this Ed25519 seed/private key to Cloudflare.
// The canonical RFC 8032 test seed keeps the catalog snapshots byte-for-byte reproducible.
import { createPrivateKey, createPublicKey, sign } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../contracts/catalog/v1/fixtures");
mkdirSync(directory, { recursive: true });
const seed = Buffer.from("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60", "hex");
const privateKey = createPrivateKey({
  key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), seed]),
  format: "der", type: "pkcs8",
});
const publicKey = createPublicKey(privateKey).export({ format: "der", type: "spki" }).subarray(-32);
const keyId = "cat-test-v1";
const write = (name, data) => writeFileSync(path.join(directory, name), `${JSON.stringify(data, null, 2)}\n`);
write("public-key.test.json", { testOnly: true, catalogKeyId: keyId, ed25519PublicKeyBase64url: publicKey.toString("base64url") });

function snapshot(name, payload) {
  const bytes = Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, "utf8");
  const message = Buffer.concat([Buffer.from(`REEDANCE-CATALOG-V1\n${keyId}\n`, "utf8"), bytes]);
  write(`${name}-payload.test.json`, payload);
  write(`${name}-envelope.test.json`, {
    catalogKeyId: keyId,
    payload: bytes.toString("base64url"),
    signature: sign(null, message, privateKey).toString("base64url"),
  });
}
const publishedAt = "2026-11-13T00:00:00Z";
snapshot("languages", {
  catalogVersion: 1, kind: "languages", revision: 1, publishedAt,
  languages: [
    { code: "en", nameFa: "انگلیسی", nameEn: "English" },
    { code: "es", nameFa: "اسپانیایی", nameEn: "Spanish" },
  ],
});
const quietStep = {
  songId: "quiet-step", targetLanguage: "en", title: "Quiet Step (TEST ONLY)",
  artist: "Reedance Contract Tests",
  manifestUrl: "https://content.example.invalid/reedance/en/quiet-step/latest.json",
  coverUrl: "https://content.example.invalid/art/quiet-step.webp",
  level: "A1", durationMs: 4000,
};
snapshot("songs-en-r1", {
  catalogVersion: 1, kind: "songs", revision: 1, publishedAt, language: "en", songs: [quietStep],
});
snapshot("songs-es-r1", {
  catalogVersion: 1, kind: "songs", revision: 1, publishedAt, language: "es", songs: [],
});
snapshot("songs-en-r2", {
  catalogVersion: 1, kind: "songs", revision: 2, publishedAt: "2026-11-13T01:00:00Z", language: "en",
  songs: [quietStep, {
    songId: "new-track", targetLanguage: "en", title: "New Track (TEST ONLY)",
    artist: "Reedance Contract Tests",
    manifestUrl: "https://content.example.invalid/reedance/en/new-track/latest.json",
  }],
});
