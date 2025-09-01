import { Router } from "express";
import fs from "fs";
import path from "path";
import * as jose from "jose";

const router = Router();

// Read public key (PEM format)
const publicKeyPath = path.join(__dirname, "../../keys/public.key");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

router.get("/.well-known/jwks.json", async (req, res) => {
  try {
    const key = await jose.importSPKI(publicKey, "RS256");
    const jwk = await jose.exportJWK(key);

    // You need a unique key ID (kid)
    jwk.kid = "auth-service-key-1";
    jwk.alg = "RS256";
    jwk.use = "sig";

    res.json({ keys: [jwk] });
  } catch (err) {
    res.status(500).json({ message: "Failed to expose JWKS", error: err });
  }
});

export default router;
