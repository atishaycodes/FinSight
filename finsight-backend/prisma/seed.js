import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Food",          icon: "ti-bowl-spoon",         color: "#c0382b" },
  { name: "Transport",     icon: "ti-bus",                color: "#1a4d8f" },
  { name: "Housing",       icon: "ti-home",               color: "#8f5a1a" },
  { name: "Shopping",      icon: "ti-shopping-bag",       color: "#1a6e3c" },
  { name: "Utilities",     icon: "ti-bolt",               color: "#534AB7" },
  { name: "Health",        icon: "ti-heart-rate-monitor", color: "#0f7a70" },
  { name: "Entertainment", icon: "ti-device-tv",          color: "#8f4a1a" },
  { name: "Education",     icon: "ti-book",               color: "#1a6e8f" },
  { name: "Travel",        icon: "ti-plane",              color: "#6e1a8f" },
  { name: "Income",        icon: "ti-briefcase",          color: "#1a6e3c" },
  { name: "Other",         icon: "ti-dots",               color: "#7a7669" },
];

async function main() {
  console.log("Seeding categories…");
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where:  { name: cat.name },
      update: { icon: cat.icon, color: cat.color },
      create: cat,
    });
  }
  console.log(`✓ ${CATEGORIES.length} categories seeded`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
