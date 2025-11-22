// bootstrap-env.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env trước khi bất kỳ import nào khác
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Export giá trị cần thiết
export const WORKER_CONCURRENCY = parseInt(
  process.env.WORKER_CONCURRENCY || '3',
  10,
);
