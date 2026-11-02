/**
 * Verifica un Firebase ID token usando la API oficial de Firebase Auth.
 * No requiere una service account: la API key web identifica el proyecto,
 * mientras que la seguridad real la aporta el ID token firmado por Firebase.
 */
export async function verifyAdminToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const idToken = authHeader.slice(7);
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  const user = data.users?.[0];
  if (!user?.localId) return null;

  const allowedUids = (process.env.ADMIN_UIDS ?? "")
    .split(",")
    .map((uid) => uid.trim())
    .filter(Boolean);

  if (!allowedUids.includes(user.localId)) return null;

  return { uid: user.localId as string, email: user.email as string | undefined };
}
