import { JWTPayload, SignJWT, jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);
// const jwtExpiration = 60 * 60 * 24 * 7 * 1000;

//Sign JWT
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

//Verity JWT
export async function decrypt(input: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(input, secretKey, {
    algorithms: ["HS256"],
  });
  return payload;
}
