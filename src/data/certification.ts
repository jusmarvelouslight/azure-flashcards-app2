import { CertificationConfig } from '../types';

export const AZ900_CONFIG: CertificationConfig = {
  id: 'az-900',
  name: 'AZ-900',
  fullName: 'Microsoft Azure Fundamentals',
  studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900',
  domains: [
    {
      id: 'domain-a',
      name: 'Cloud Concepts',
      weightMin: 25,
      weightMax: 30,
      description: 'Cloud computing fundamentals, deployment models, service types, and the shared responsibility model.',
      topics: [
        { id: 'cloud-computing', name: 'Cloud Computing Basics', description: 'What cloud computing is and its benefits.' },
        { id: 'cloud-models', name: 'Cloud Deployment Models', description: 'Public, private, and hybrid cloud models.' },
        { id: 'service-types', name: 'Service Models', description: 'IaaS, PaaS, SaaS, and serverless computing.' },
        { id: 'shared-responsibility', name: 'Shared Responsibility', description: 'Who is responsible for what in each model.' },
        { id: 'pricing', name: 'Pricing Models', description: 'Consumption-based, CapEx vs OpEx.' },
        { id: 'cloud-benefits', name: 'Cloud Benefits', description: 'HA, scalability, elasticity, reliability, predictability.' },
      ],
    },
    {
      id: 'domain-b',
      name: 'Azure Architecture & Services',
      weightMin: 35,
      weightMax: 40,
      description: 'Core Azure infrastructure, compute, networking, storage, and identity services.',
      topics: [
        { id: 'azure-geography', name: 'Azure Geography', description: 'Regions, region pairs, availability zones, datacenters.' },
        { id: 'resource-management', name: 'Resource Management', description: 'Resources, resource groups, subscriptions, management groups.' },
        { id: 'compute', name: 'Compute Services', description: 'VMs, containers, Functions, web apps.' },
        { id: 'networking', name: 'Networking', description: 'VNets, subnets, peering, DNS, VPN, ExpressRoute.' },
        { id: 'storage', name: 'Storage Services', description: 'Azure Storage, tiers, redundancy, migration tools.' },
        { id: 'identity', name: 'Identity & Security', description: 'Entra ID, MFA, RBAC, Zero Trust, Defender.' },
      ],
    },
    {
      id: 'domain-c',
      name: 'Azure Management & Governance',
      weightMin: 30,
      weightMax: 35,
      description: 'Cost management, governance, monitoring, and management tools.',
      topics: [
        { id: 'cost-management', name: 'Cost Management', description: 'Cost factors, Pricing Calculator, tags, cost analysis.' },
        { id: 'governance', name: 'Governance', description: 'Purview, Azure Policy, resource locks.' },
        { id: 'management-tools', name: 'Management Tools', description: 'Portal, Cloud Shell, CLI, PowerShell, Arc, ARM.' },
        { id: 'monitoring', name: 'Monitoring', description: 'Advisor, Service Health, Monitor, Log Analytics, alerts.' },
      ],
    },
  ],
};

export const STUDY_GUIDE_URL = 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900';
