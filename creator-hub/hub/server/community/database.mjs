// Hosted chat always verifies the database server certificate. URL parameters
// must not override pg's TLS configuration (including sslmode=no-verify).
export function communityDatabaseOptions(env = process.env) {
  const url = new URL(env.CHAT_DATABASE_URL);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("Chat requires a PostgreSQL connection URL.");
  }
  for (const key of [
    "sslmode",
    "sslcert",
    "sslkey",
    "sslrootcert",
    "ssl",
    "uselibpqcompat",
  ]) {
    url.searchParams.delete(key);
  }
  return {
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: true,
      ...(env.CHAT_DATABASE_CA ? { ca: env.CHAT_DATABASE_CA } : {}),
    },
  };
}
