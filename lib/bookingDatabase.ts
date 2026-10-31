import 'server-only';
import postgres from 'postgres';
let connection: ReturnType<typeof postgres> | undefined;
export function bookingDatabase() {
 if (!process.env.DATABASE_URL) throw new Error('Booking database is not configured');
 // Only the connection pool is cached. All booking state lives in PostgreSQL.
 return connection ??= postgres(process.env.DATABASE_URL, { max: 3, prepare: false, ssl: 'require', connect_timeout: 10 });
}
