import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create permissions
  const modules = [
    'customers', 'internet_accounts', 'packages', 'subscriptions',
    'payments', 'routers', 'sessions', 'reports', 'audit_logs',
    'admin_users', 'settings', 'radius', 'notifications',
  ];
  const actions = ['read', 'create', 'update', 'delete', 'manage'];

  const permissions = [];
  for (const mod of modules) {
    for (const action of actions) {
      const perm = await prisma.permission.upsert({
        where: { name: `${mod}.${action}` },
        update: {},
        create: {
          name: `${mod}.${action}`,
          module: mod,
          action,
          description: `${action} ${mod}`,
        },
      });
      permissions.push(perm);
    }
  }

  // Additional permissions
  await prisma.permission.upsert({
    where: { name: 'sessions.disconnect' },
    update: {},
    create: {
      name: 'sessions.disconnect',
      module: 'sessions',
      action: 'disconnect',
      description: 'Disconnect active sessions',
    },
  });

  await prisma.permission.upsert({
    where: { name: 'payments.refund' },
    update: {},
    create: {
      name: 'payments.refund',
      module: 'payments',
      action: 'refund',
      description: 'Refund payments',
    },
  });

  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      displayName: 'مدير النظام',
      description: 'Full system access',
    },
  });

  const branchAdminRole = await prisma.role.upsert({
    where: { name: 'branch_admin' },
    update: {},
    create: {
      name: 'branch_admin',
      displayName: 'مدير فرع',
      description: 'Branch management access',
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      displayName: 'موظف',
      description: 'Basic employee access',
    },
  });

  const accountantRole = await prisma.role.upsert({
    where: { name: 'accountant' },
    update: {},
    create: {
      name: 'accountant',
      displayName: 'محاسب',
      description: 'Financial access only',
    },
  });

  const supportRole = await prisma.role.upsert({
    where: { name: 'support' },
    update: {},
    create: {
      name: 'support',
      displayName: 'دعم فني',
      description: 'Support access',
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: {
      name: 'viewer',
      displayName: 'مشاهد',
      description: 'Read-only access',
    },
  });

  // Assign all permissions to super_admin
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Assign employee permissions
  const employeePermissions = permissions.filter(
    (p) =>
      ['customers', 'internet_accounts', 'packages', 'subscriptions', 'sessions'].includes(p.module) &&
      ['read', 'create', 'update'].includes(p.action),
  );
  for (const perm of employeePermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: employeeRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: employeeRole.id, permissionId: perm.id },
    });
  }

  // Assign viewer permissions (read only)
  const viewerPermissions = permissions.filter((p) => p.action === 'read');
  for (const perm of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: viewerRole.id, permissionId: perm.id },
    });
  }

  // Create default admin user
  const passwordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@isp-manager.local',
      fullName: 'مدير النظام',
      passwordHash,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: superAdminRole.id,
    },
  });

  // Create default packages
  const packages = [
    { name: 'Basic 5M', downloadSpeed: 5, uploadSpeed: 1, price: 15, durationDays: 30, mikrotikRateLimit: '5M/1M' },
    { name: 'Standard 10M', downloadSpeed: 10, uploadSpeed: 2, price: 25, durationDays: 30, mikrotikRateLimit: '10M/2M' },
    { name: 'Premium 25M', downloadSpeed: 25, uploadSpeed: 5, price: 40, durationDays: 30, mikrotikRateLimit: '25M/5M' },
    { name: 'Ultra 50M', downloadSpeed: 50, uploadSpeed: 10, price: 60, durationDays: 30, mikrotikRateLimit: '50M/10M' },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { id: pkg.name }, // Will fail first time, that's ok
      update: {},
      create: pkg,
    }).catch(() => {
      return prisma.package.create({ data: pkg });
    });
  }

  // Create default system settings
  const settings = [
    { key: 'company_name', value: '"ISP Manager"', description: 'Company name' },
    { key: 'default_currency', value: '"USD"', description: 'Default currency' },
    { key: 'expiration_grace_period_hours', value: '0', description: 'Grace period after expiration' },
    { key: 'notify_before_expiration_days', value: '3', description: 'Days before expiration to notify' },
    { key: 'default_radius_session_timeout', value: '86400', description: 'Default session timeout in seconds' },
    { key: 'invoice_prefix', value: '"INV"', description: 'Invoice number prefix' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: JSON.parse(setting.value),
        description: setting.description,
      },
    });
  }

  // Sync packages to RADIUS groups
  const allPackages = await prisma.package.findMany();
  for (const pkg of allPackages) {
    const groupname = `pkg_${pkg.name.toLowerCase().replace(/\s+/g, '_')}`;
    await prisma.radgroupreply.deleteMany({ where: { groupname } });
    await prisma.radgroupreply.create({
      data: {
        groupname,
        attribute: 'Mikrotik-Rate-Limit',
        op: ':=',
        value: pkg.mikrotikRateLimit,
      },
    });
  }

  console.log('Seeding completed!');
  console.log('Default admin: admin / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
