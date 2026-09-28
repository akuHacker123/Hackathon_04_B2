import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

const users = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    name: "Demo Pengguna A",
    email: "expense.demo.a@example.invalid",
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    name: "Demo Pengguna B",
    email: "expense.demo.b@example.invalid",
  },
] as const;

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed demo hanya boleh dijalankan di development.");
  }
  if (process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Set ALLOW_DEMO_SEED=true untuk mengizinkan penambahan data demo.");
  }

  const password = await bcrypt.hash("ExpenseDemo!2026", 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.createMany({
      data: users.map((user) => ({ ...user, password })),
      skipDuplicates: true,
    });

    const storedUsers = await tx.user.findMany({
      where: { id: { in: users.map((user) => user.id) } },
      select: { id: true, email: true },
    });

    for (const fixture of users) {
      const stored = storedUsers.find((user) => user.id === fixture.id);
      if (stored?.email !== fixture.email) {
        throw new Error(
          `ID fixture ${fixture.id} sudah dipakai data lain; tidak ada data yang diubah.`,
        );
      }
    }

    await tx.transaction.createMany({
      data: [
        { id: "10000000-0000-4000-8000-000000000101", userId: users[0].id, title: "Belanja bulanan", amount: "500000.00", type: "expense", transactionDate: date("2026-09-03") },
        { id: "10000000-0000-4000-8000-000000000102", userId: users[0].id, title: "Transportasi", amount: "300000.00", type: "expense", transactionDate: date("2026-09-10") },
        { id: "10000000-0000-4000-8000-000000000103", userId: users[0].id, title: "Gaji", amount: "5000000.00", type: "income", transactionDate: date("2026-09-01") },
        { id: "10000000-0000-4000-8000-000000000104", userId: users[0].id, title: "Belanja Agustus", amount: "1400000.00", type: "expense", transactionDate: date("2026-08-15") },
        { id: "10000000-0000-4000-8000-000000000105", userId: users[1].id, title: "Belanja pengguna B", amount: "1200000.00", type: "expense", transactionDate: date("2026-09-08") },
      ],
      skipDuplicates: true,
    });

    await tx.monthlyBudget.createMany({
      data: [
        { id: "20000000-0000-4000-8000-000000000101", userId: users[0].id, month: date("2026-09-01"), amount: "2000000.00" },
        { id: "20000000-0000-4000-8000-000000000102", userId: users[0].id, month: date("2026-08-01"), amount: "1000000.00" },
        { id: "20000000-0000-4000-8000-000000000103", userId: users[0].id, month: date("2026-10-01"), amount: "1500000.00" },
        { id: "20000000-0000-4000-8000-000000000104", userId: users[1].id, month: date("2026-09-01"), amount: "1000000.00" },
      ],
      skipDuplicates: true,
    });
  });

  console.info("Seed demo selesai. Akun: expense.demo.a@example.invalid dan expense.demo.b@example.invalid; password: ExpenseDemo!2026");
}

main()
  .catch((error: unknown) => {
    console.error("Seed demo gagal:", error instanceof Error ? error.message : "Kesalahan tidak diketahui");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
