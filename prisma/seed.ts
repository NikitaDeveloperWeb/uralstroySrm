import { PrismaClient } from '@prisma/client';
import { initialProjects } from '../shared/data/projects';
import { initialBrigades } from '../shared/data/brigades';
import { initialWarehouseItems } from '../shared/data/warehouse';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed: Starting...');

  // Brigades
  for (const b of initialBrigades) {
    await prisma.brigade.upsert({
      where: { id: b.id },
      update: {},
      create: {
        name: b.name,
        leaderId: b.leaderId,
        memberIds: JSON.stringify(b.memberIds),
        skills: JSON.stringify(b.skills),
      },
    });
  }
  console.log(`✓ Created ${initialBrigades.length} brigades`);

  // Projects
  for (const p of initialProjects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {},
      create: {
        name: p.name,
        area: p.area,
        address: p.address,
        type: p.type,
        cost: Number(p.cost),
        deadline: new Date(p.date),
        complexity: p.complexity,
        status: p.status,
        code: p.code,
        brigadeId: p.brigadeId,
      },
    });
  }
  console.log(`✓ Created ${initialProjects.length} projects`);

  // Warehouse Items
  for (const w of initialWarehouseItems) {
    await prisma.warehouseItem.upsert({
      where: { id: w.id },
      update: {},
      create: {
        name: w.name,
        category: w.category,
        quantity: w.quantity,
        unit: w.unit,
        location: w.location,
        lastUpdate: new Date(w.lastUpdate),
        status: w.status,
      },
    });
  }
  console.log(`✓ Created ${initialWarehouseItems.length} warehouse items`);

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'low-stock',
        message: 'Цемент М500 заканчивается',
        priority: 'medium',
        link: '/warehouse',
        date: new Date(),
        itemId: 2,
      },
      {
        type: 'out-of-stock',
        message: 'Арматура А500С отсутствует',
        priority: 'high',
        link: '/warehouse',
        date: new Date(),
        itemId: 4,
      },
      {
        type: 'low-stock',
        message: 'Профнастил С8 на исходе',
        priority: 'medium',
        link: '/warehouse',
        date: new Date(),
        itemId: 8,
      },
      {
        type: 'overdue',
        message: 'Проект "Баня на берегу" просрочен',
        priority: 'high',
        link: '/projects/7',
        date: new Date(),
        projectId: 7,
      },
    ],

  });
  console.log('✓ Created notifications');

  // Payment Categories (default)
  const defaultCategories = [
    { name: 'Цех', percentage: 30 },
    { name: 'Монтажники', percentage: 25 },
    { name: 'Премия цеха', percentage: 10 },
    { name: 'Социальный фонд', percentage: 15 },
  ];

  for (const cat of defaultCategories) {
    await prisma.paymentCategory.create({
      data: cat,
    });
  }
  console.log(`✓ Created ${defaultCategories.length} payment categories`);

  // ===== Системные шаблоны материалов =====
  const systemMaterials = [
    { name: 'Доска обрезная 50x150x6000', quantity: '100 м³', cost: 1800000, category: 'Пиломатериалы', isSystem: true },
    { name: 'Доска обрезная 50x200x6000', quantity: '50 м³', cost: 950000, category: 'Пиломатериалы', isSystem: true },
    { name: 'Брус 150x150x6000', quantity: '30 м³', cost: 600000, category: 'Пиломатериалы', isSystem: true },
    { name: 'Брус 200x200x6000', quantity: '20 м³', cost: 480000, category: 'Пиломатериалы', isSystem: true },
    { name: 'Фанера ФСФ 18мм', quantity: '40 листов', cost: 120000, category: 'Обшивка', isSystem: true },
    { name: 'ОSB-3 12мм', quantity: '50 листов', cost: 95000, category: 'Обшивка', isSystem: true },
    { name: 'Утеплитель минвата 150мм', quantity: '80 м²', cost: 64000, category: 'Утеплитель', isSystem: true },
    { name: 'Утеплитель минвата 200мм', quantity: '60 м²', cost: 54000, category: 'Утеплитель', isSystem: true },
    { name: 'Гидроизоляция (мембрана)', quantity: '200 м²', cost: 80000, category: 'Гидроизоляция', isSystem: true },
    { name: 'Ветроизоляция (мембрана)', quantity: '200 м²', cost: 60000, category: 'Гидроизоляция', isSystem: true },
    { name: 'Кровля металлочерепица', quantity: '150 м²', cost: 225000, category: 'Кровля', isSystem: true },
    { name: 'Кровля мягкая (гибкая черепица)', quantity: '150 м²', cost: 180000, category: 'Кровля', isSystem: true },
    { name: 'Винтовая крыша', quantity: '100 м²', cost: 150000, category: 'Кровля', isSystem: true },
    { name: 'Вагонка стен', quantity: '120 м²', cost: 72000, category: 'Отделка', isSystem: true },
    { name: 'Потолок (натяжной/обшивка)', quantity: '80 м²', cost: 64000, category: 'Отделка', isSystem: true },
    { name: 'Пол (черновой)', quantity: '80 м²', cost: 48000, category: 'Отделка', isSystem: true },
    { name: 'Пол (чистовой)', quantity: '80 м²', cost: 56000, category: 'Отделка', isSystem: true },
    { name: 'Крепёж (саморезы, гвозди, уголки)', quantity: '1 комплект', cost: 35000, category: 'Крепёж', isSystem: true },
    { name: 'Антисептик древесный', quantity: '10 л', cost: 8000, category: 'Обработка', isSystem: true },
    { name: 'Огнебиозащита', quantity: '10 л', cost: 6500, category: 'Обработка', isSystem: true },
  ];

  for (const mat of systemMaterials) {
    await prisma.materialTemplate.create({
      data: mat,
    });
  }
  console.log(`✓ Created ${systemMaterials.length} system material templates`);

  // ===== Системные шаблоны работ =====
  const systemWorks = [
    { name: 'Фундамент (устройство)', quantity: '100 м²', cost: 150000, category: 'Фундамент', isSystem: true },
    { name: 'Стены (монтаж каркаса)', quantity: '100 м²', cost: 120000, category: 'Стены', isSystem: true },
    { name: 'Стены (обшивка)', quantity: '100 м²', cost: 60000, category: 'Стены', isSystem: true },
    { name: 'Кровля (стропильная система)', quantity: '150 м²', cost: 90000, category: 'Кровля', isSystem: true },
    { name: 'Кровля (покрытие)', quantity: '150 м²', cost: 75000, category: 'Кровля', isSystem: true },
    { name: 'Утепление стен', quantity: '100 м²', cost: 50000, category: 'Утепление', isSystem: true },
    { name: 'Утепление кровли', quantity: '150 м²', cost: 60000, category: 'Утепление', isSystem: true },
    { name: 'Электромонтажные работы', quantity: '100 м²', cost: 45000, category: 'Инженерия', isSystem: true },
    { name: 'Сантехнические работы', quantity: '100 м²', cost: 55000, category: 'Инженерия', isSystem: true },
    { name: 'Внутренняя отделка', quantity: '100 м²', cost: 80000, category: 'Отделка', isSystem: true },
    { name: 'Наружная отделка (фасад)', quantity: '100 м²', cost: 65000, category: 'Отделка', isSystem: true },
    { name: 'Монтаж окон', quantity: '5 шт', cost: 35000, category: 'Окна и двери', isSystem: true },
    { name: 'Монтаж дверей', quantity: '3 шт', cost: 21000, category: 'Окна и двери', isSystem: true },
    { name: 'Монтаж цокольного сайдинга', quantity: '100 м²', cost: 50000, category: 'Отделка', isSystem: true },
    { name: 'Установка водостока', quantity: '50 м', cost: 25000, category: 'Инженерия', isSystem: true },
  ];

  for (const work of systemWorks) {
    await prisma.workTemplate.create({
      data: work,
    });
  }
  console.log(`✓ Created ${systemWorks.length} system work templates`);

  // ===== Системные шаблоны общих расходов =====
  const systemOverheads = [
    { name: 'Транспортные расходы (доставка)', cost: 15000, category: 'Транспорт', isSystem: true },
    { name: 'Транспортные расходы (вывоз мусора)', cost: 8000, category: 'Транспорт', isSystem: true },
    { name: 'Аренда техники', cost: 25000, category: 'Аренда', isSystem: true },
    { name: 'Аренда инструмента', cost: 5000, category: 'Аренда', isSystem: true },
    { name: 'Амортизация инструмента', cost: 3000, category: 'Амортизация', isSystem: true },
    { name: 'Электроэнергия (строительная)', cost: 4500, category: 'Инженерные расходы', isSystem: true },
    { name: 'Вывоз строительного мусора', cost: 12000, category: 'Транспорт', isSystem: true },
    { name: 'Налоги (страховые взносы)', cost: 20000, category: 'Налоги', isSystem: true },
    { name: 'Представительство (подъём/спуск)', cost: 7000, category: 'Прочее', isSystem: true },
    { name: 'Временное водоснабжение', cost: 3500, category: 'Инженерные расходы', isSystem: true },
    { name: 'Охрана объекта', cost: 10000, category: 'Прочее', isSystem: true },
    { name: 'СИЗ (средства индивидуальной защиты)', cost: 5000, category: 'Прочее', isSystem: true },
  ];

  for (const oh of systemOverheads) {
    await prisma.projectOverheadTemplate.create({
      data: oh,
    });
  }
  console.log(`✓ Created ${systemOverheads.length} system overhead templates`);

  console.log('✅ Seed: Completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
