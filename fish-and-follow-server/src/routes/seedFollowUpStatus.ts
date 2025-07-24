import { db } from '../db/client';
import { followUpStatus } from '../db/schema';

async function seed() {
  await db.insert(followUpStatus).values({ number: 1, description: "First contact" });
  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
