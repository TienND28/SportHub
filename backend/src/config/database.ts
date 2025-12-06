import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon WebSocket
neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true

// Type definitions for global prisma instance
declare global {
    var prisma: PrismaClient | undefined;
}

// Create Neon adapter with connection string
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });

// Create Prisma Client instance with Neon adapter
const prisma = global.prisma || new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
});

// Cache the Prisma Client instance in development to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
    global.prisma = prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;
