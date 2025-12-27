import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.maintenanceRequest.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.category.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const manager = await prisma.user.create({
    data: {
      email: 'manager@gearguard.com',
      passwordHash: hashedPassword,
      name: 'John Manager',
      role: 'MANAGER',
    },
  });

  const alice = await prisma.user.create({
    data: {
      email: 'alice@gearguard.com',
      passwordHash: hashedPassword,
      name: 'Alice Technician',
      role: 'USER',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@gearguard.com',
      passwordHash: hashedPassword,
      name: 'Bob Engineer',
      role: 'USER',
    },
  });

  console.log('✅ Created 3 users');

  // Create categories
  const itCategory = await prisma.category.create({ data: { name: 'IT Equipment' } });
  const machineryCategory = await prisma.category.create({ data: { name: 'Machinery' } });
  const vehiclesCategory = await prisma.category.create({ data: { name: 'Vehicles' } });
  const officeCategory = await prisma.category.create({ data: { name: 'Office Equipment' } });

  console.log('✅ Created 4 categories');

  // Create teams
  const itTeam = await prisma.team.create({
    data: {
      name: 'IT Support Team',
      members: { connect: [{ id: alice.id }] },
    },
  });

  const mechanicalTeam = await prisma.team.create({
    data: {
      name: 'Mechanical Team',
      members: { connect: [{ id: bob.id }] },
    },
  });

  const electricalTeam = await prisma.team.create({
    data: {
      name: 'Electrical Team',
      members: { connect: [{ id: alice.id }, { id: bob.id }] },
    },
  });

  console.log('✅ Created 3 teams');

  // Create stages
  const newStage = await prisma.stage.create({
    data: { name: 'New', code: 'new', sequence: 1 },
  });

  const inProgressStage = await prisma.stage.create({
    data: { name: 'In Progress', code: 'in_progress', sequence: 2 },
  });

  const repairedStage = await prisma.stage.create({
    data: { name: 'Repaired', code: 'repaired', sequence: 3, fold: true },
  });

  const scrapStage = await prisma.stage.create({
    data: { name: 'Scrap', code: 'scrap', sequence: 4, fold: true },
  });

  console.log('✅ Created 4 stages');

  // Create equipment
  const laptop = await prisma.equipment.create({
    data: {
      name: 'Laptop Dell XPS 15',
      serialNumber: 'DL-XPS-001',
      categoryId: itCategory.id,
      department: 'Engineering',
      teamId: itTeam.id,
      technicianId: alice.id,
      purchaseDate: new Date('2023-06-15'),
      warrantyExpiry: new Date('2026-06-15'),
      location: 'Office Floor 2',
    },
  });

  const printer = await prisma.equipment.create({
    data: {
      name: 'HP LaserJet Pro',
      serialNumber: 'HP-LJ-002',
      categoryId: itCategory.id,
      department: 'Administration',
      teamId: itTeam.id,
      location: 'Office Floor 1',
    },
  });

  const cncMachine = await prisma.equipment.create({
    data: {
      name: 'CNC Milling Machine',
      serialNumber: 'CNC-ML-003',
      categoryId: machineryCategory.id,
      department: 'Production',
      teamId: mechanicalTeam.id,
      technicianId: bob.id,
      purchaseDate: new Date('2022-03-10'),
      location: 'Factory Floor A',
    },
  });

  const forklift = await prisma.equipment.create({
    data: {
      name: 'Toyota Forklift',
      serialNumber: 'TY-FK-004',
      categoryId: vehiclesCategory.id,
      employeeName: 'Mike Operator',
      teamId: mechanicalTeam.id,
      location: 'Warehouse',
    },
  });

  const acUnit = await prisma.equipment.create({
    data: {
      name: 'AC Unit - Conference Room',
      serialNumber: 'AC-CR-005',
      categoryId: officeCategory.id,
      teamId: electricalTeam.id,
      location: 'Conference Room 1',
    },
  });

  console.log('✅ Created 5 equipment items');

  // Create maintenance requests
  await prisma.maintenanceRequest.create({
    data: {
      name: 'Laptop screen flickering',
      description: 'Screen flickers intermittently when plugged in',
      requestType: 'CORRECTIVE',
      equipmentId: laptop.id,
      categoryId: itCategory.id,
      teamId: itTeam.id,
      technicianId: alice.id,
      stageId: inProgressStage.id,
      scheduledDate: new Date(),
      priority: 'HIGH',
      createdById: manager.id,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      name: 'Printer paper jam',
      description: 'Paper gets stuck in tray 2',
      requestType: 'CORRECTIVE',
      equipmentId: printer.id,
      categoryId: itCategory.id,
      teamId: itTeam.id,
      stageId: newStage.id,
      priority: 'NORMAL',
      createdById: manager.id,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      name: 'CNC monthly inspection',
      description: 'Routine preventive maintenance',
      requestType: 'PREVENTIVE',
      equipmentId: cncMachine.id,
      categoryId: machineryCategory.id,
      teamId: mechanicalTeam.id,
      technicianId: bob.id,
      stageId: newStage.id,
      scheduledDate: new Date('2025-01-15T10:00:00'),
      priority: 'NORMAL',
      createdById: manager.id,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      name: 'Forklift brake inspection',
      description: 'Brakes feel soft',
      requestType: 'CORRECTIVE',
      equipmentId: forklift.id,
      categoryId: vehiclesCategory.id,
      teamId: mechanicalTeam.id,
      stageId: newStage.id,
      scheduledDate: new Date('2024-12-20T09:00:00'),
      priority: 'VERY_HIGH',
      createdById: manager.id,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      name: 'AC filter replacement',
      description: 'Quarterly maintenance',
      requestType: 'PREVENTIVE',
      equipmentId: acUnit.id,
      teamId: electricalTeam.id,
      stageId: repairedStage.id,
      scheduledDate: new Date('2024-12-01'),
      duration: 1.5,
      priority: 'LOW',
      createdById: manager.id,
    },
  });

  console.log('✅ Created 5 maintenance requests');
  console.log('\n🎉 Seed complete!');
  console.log('\n📧 Test Credentials:');
  console.log('   Manager: manager@gearguard.com / password123');
  console.log('   User 1:  alice@gearguard.com / password123');
  console.log('   User 2:  bob@gearguard.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
