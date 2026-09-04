import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const data = await p.subcontractor.findMany();
  console.log(JSON.stringify(data, null, 2));
  await p.$disconnect();
}
main();
