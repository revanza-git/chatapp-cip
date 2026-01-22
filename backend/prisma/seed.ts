import { PrismaClient, UserRole, DocumentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  let adminUser = null;

  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash('SecureAdmin123!', 10);
    adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@company.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.admin,
        isActive: true
      }
    });
    console.log('✅ Created default admin user: admin / SecureAdmin123!');
  } else {
    adminUser = await prisma.user.findFirst({
      where: { role: UserRole.admin }
    });
  }

  const policyCount = await prisma.policyFile.count();
  if (policyCount > 0) {
    console.log('✅ Policy data already exists');
    return;
  }

  if (!adminUser) {
    adminUser = await prisma.user.findFirst();
  }

  const adminUserId = adminUser?.id ?? null;

  const samplePolicies = [
    {
      name: 'Password Policy',
      content: 'Passwords must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters. Passwords must be changed every 90 days.',
      description: 'Comprehensive password requirements for all company accounts',
      category: 'Authentication',
      documentType: DocumentType.policy,
      tags: ['password', 'security', 'authentication', 'compliance'],
      createdBy: 'IT Security Team'
    },
    {
      name: 'Data Classification Policy',
      content: 'All company data must be classified as Public, Internal, Confidential, or Restricted. Confidential and Restricted data requires encryption at rest and in transit.',
      description: 'Guidelines for classifying and protecting company data',
      category: 'Data Protection',
      documentType: DocumentType.policy,
      tags: ['data', 'classification', 'encryption', 'confidential'],
      createdBy: 'Data Protection Officer'
    },
    {
      name: 'Remote Work Security Policy',
      content: 'Remote workers must use company-approved VPN, enable device encryption, and follow secure Wi-Fi practices. Personal devices require MDM enrollment.',
      description: 'Security requirements for remote work arrangements',
      category: 'Remote Work',
      documentType: DocumentType.policy,
      tags: ['remote', 'vpn', 'encryption', 'mdm', 'wifi'],
      createdBy: 'IT Operations'
    },
    {
      name: 'Incident Response Policy',
      content: 'Security incidents must be reported within 2 hours. Follow the escalation matrix: L1 (Help Desk) -> L2 (Security Team) -> L3 (CISO). Document all actions taken.',
      description: 'Procedures for reporting and handling security incidents',
      category: 'Incident Response',
      documentType: DocumentType.policy,
      tags: ['incident', 'response', 'escalation', 'security', 'reporting'],
      createdBy: 'CISO Office'
    },
    {
      name: 'New Employee Security Onboarding',
      content: 'Welcome to the company! This guide covers essential security practices including password setup, VPN configuration, email security awareness, and device encryption. Please complete all steps within your first week.',
      description: 'Complete security onboarding checklist for new employees',
      category: 'Onboarding',
      documentType: DocumentType.onboarding,
      tags: ['onboarding', 'new-employee', 'checklist', 'setup'],
      createdBy: 'HR Security Team'
    },
    {
      name: 'VPN Setup Guide',
      content: 'Step-by-step instructions for configuring the company VPN on Windows, Mac, and mobile devices. Includes troubleshooting common connection issues.',
      description: 'Technical guide for VPN setup and configuration',
      category: 'Technical Guides',
      documentType: DocumentType.onboarding,
      tags: ['vpn', 'setup', 'configuration', 'troubleshooting', 'guide'],
      createdBy: 'IT Help Desk'
    }
  ];

  await prisma.policyFile.createMany({
    data: samplePolicies.map(policy => ({
      ...policy,
      createdByUserId: adminUserId,
      isActive: true
    }))
  });

  console.log(`✅ Successfully initialized database with ${samplePolicies.length} documents`);
}

main()
  .catch(error => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
