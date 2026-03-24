export type NodeStatus = 'online' | 'offline' | 'recovering' | 'pending';

export interface DataPacketStats {
  accepted: number;
  dropped: number;
  dropReason?: 'queue_full' | 'size_too_big';
  bufferSize: number;
  bufferCapacity: number;
  isRecovering: boolean;
}

export interface Schedule {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  arguments: Record<string, string>;
  lastRun?: string;
  nextRun?: string;
}

export interface ScriptedConnector {
  id: string;
  name: string;
  version: string;
  status: 'running' | 'stopped' | 'error';
  arguments: Record<string, string>;
  schedules: Schedule[];
  bandwidthKbps: number;
  packetStats: DataPacketStats;
  lastError?: string;
  locationId: string; // which location this connector is deployed to
}

export interface EdgeNode {
  id: string;
  name: string;
  locationId: string;
  status: NodeStatus;
  lastPacketReceived: string;
  registeredAt: string;
  approvedAt?: string;
  ipAddress: string;
  version: string;
  bandwidthKbps: number;
  packetStats: DataPacketStats;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  connectors: ScriptedConnector[];
  nodes: EdgeNode[];
}

// Define nodes separately, then group into locations
const brusselsNode: EdgeNode = {
  id: 'node-001',
  name: 'Edge-Brussels-01',
  locationId: 'loc-001',
  status: 'online',
  lastPacketReceived: '2026-03-24T14:32:10Z',
  registeredAt: '2026-01-15T09:00:00Z',
  approvedAt: '2026-01-15T10:30:00Z',
  ipAddress: '10.42.1.100',
  version: '1.4.2',
  bandwidthKbps: 2450,
  packetStats: { accepted: 148230, dropped: 12, bufferSize: 0, bufferCapacity: 10000, isRecovering: false },
};

const amsterdamNode: EdgeNode = {
  id: 'node-002',
  name: 'Edge-Amsterdam-01',
  locationId: 'loc-002',
  status: 'recovering',
  lastPacketReceived: '2026-03-24T13:58:22Z',
  registeredAt: '2026-02-01T08:00:00Z',
  approvedAt: '2026-02-01T09:15:00Z',
  ipAddress: '10.42.2.50',
  version: '1.4.1',
  bandwidthKbps: 4800,
  packetStats: { accepted: 89100, dropped: 342, dropReason: 'queue_full', bufferSize: 3420, bufferCapacity: 10000, isRecovering: true },
};

const munichNode: EdgeNode = {
  id: 'node-003',
  name: 'Edge-Munich-01',
  locationId: 'loc-003',
  status: 'offline',
  lastPacketReceived: '2026-03-23T22:14:55Z',
  registeredAt: '2026-01-20T11:00:00Z',
  approvedAt: '2026-01-20T11:45:00Z',
  ipAddress: '10.42.3.10',
  version: '1.3.8',
  bandwidthKbps: 0,
  packetStats: { accepted: 210400, dropped: 89, bufferSize: 0, bufferCapacity: 10000, isRecovering: false },
};

const brusselsConnectors: ScriptedConnector[] = [
  {
    id: 'sc-001',
    name: 'SNMP Poller',
    version: '2.1.0',
    status: 'running',
    locationId: 'loc-001',
    arguments: { targetIp: '10.42.1.200', community: 'public', port: '161' },
    bandwidthKbps: 1200,
    packetStats: { accepted: 98400, dropped: 3, bufferSize: 0, bufferCapacity: 5000, isRecovering: false },
    schedules: [
      { id: 'sch-001', name: 'Every 5 min', cron: '*/5 * * * *', enabled: true, arguments: { oids: '1.3.6.1.2.1.1' }, lastRun: '2026-03-24T14:30:00Z', nextRun: '2026-03-24T14:35:00Z' },
      { id: 'sch-002', name: 'Hourly deep scan', cron: '0 * * * *', enabled: true, arguments: { oids: '1.3.6.1.2.1', walkDepth: '3' }, lastRun: '2026-03-24T14:00:00Z', nextRun: '2026-03-24T15:00:00Z' },
    ],
  },
  {
    id: 'sc-002',
    name: 'HTTP Health Check',
    version: '1.0.3',
    status: 'running',
    locationId: 'loc-001',
    arguments: { url: 'https://api.internal.local/health', timeout: '5000' },
    bandwidthKbps: 150,
    packetStats: { accepted: 24100, dropped: 0, bufferSize: 0, bufferCapacity: 2000, isRecovering: false },
    schedules: [
      { id: 'sch-003', name: 'Every minute', cron: '* * * * *', enabled: true, arguments: { expectedStatus: '200' }, lastRun: '2026-03-24T14:32:00Z', nextRun: '2026-03-24T14:33:00Z' },
    ],
  },
];

const amsterdamConnectors: ScriptedConnector[] = [
  {
    id: 'sc-003',
    name: 'Modbus TCP Reader',
    version: '3.0.1',
    status: 'running',
    locationId: 'loc-002',
    arguments: { host: '10.42.2.100', unitId: '1', register: '40001', count: '10' },
    bandwidthKbps: 3200,
    packetStats: { accepted: 67200, dropped: 340, dropReason: 'queue_full', bufferSize: 3200, bufferCapacity: 8000, isRecovering: true },
    schedules: [
      { id: 'sch-004', name: 'Every 10s', cron: '*/10 * * * * *', enabled: true, arguments: { readType: 'holding' }, lastRun: '2026-03-24T14:32:00Z', nextRun: '2026-03-24T14:32:10Z' },
    ],
  },
];

const munichConnectors: ScriptedConnector[] = [
  {
    id: 'sc-004',
    name: 'OPC UA Client',
    version: '1.2.0',
    status: 'error',
    locationId: 'loc-003',
    arguments: { endpoint: 'opc.tcp://10.42.3.50:4840', securityMode: 'None' },
    bandwidthKbps: 0,
    packetStats: { accepted: 105000, dropped: 45, bufferSize: 0, bufferCapacity: 5000, isRecovering: false },
    lastError: 'Connection refused: endpoint unreachable',
    schedules: [
      { id: 'sch-005', name: 'Continuous', cron: '* * * * *', enabled: false, arguments: { nodeIds: 'ns=2;s=Temperature,ns=2;s=Pressure' }, lastRun: '2026-03-23T22:14:00Z' },
    ],
  },
];

export const locations: Location[] = [
  {
    id: 'loc-001',
    name: 'Brussels Data Center',
    description: 'Primary data center in Brussels',
    nodes: [brusselsNode],
    connectors: brusselsConnectors,
  },
  {
    id: 'loc-002',
    name: 'Amsterdam Warehouse',
    description: 'Warehouse monitoring in Amsterdam',
    nodes: [amsterdamNode],
    connectors: amsterdamConnectors,
  },
  {
    id: 'loc-003',
    name: 'Munich Factory Floor',
    description: 'Factory floor monitoring in Munich',
    nodes: [munichNode],
    connectors: munichConnectors,
  },
];

// Convenience accessors
export const allNodes: EdgeNode[] = locations.flatMap(l => l.nodes);
export const allConnectors: ScriptedConnector[] = locations.flatMap(l => l.connectors);

export const getLocation = (id: string) => locations.find(l => l.id === id);
export const getLocationForNode = (nodeId: string) => locations.find(l => l.nodes.some(n => n.id === nodeId));

// Keep backward compat for pending nodes (not yet assigned to a location)
export const pendingNodes: Partial<EdgeNode>[] = [
  {
    id: 'node-pending-001',
    name: 'Edge-NewYork-01',
    status: 'pending',
    registeredAt: '2026-03-24T12:00:00Z',
    ipAddress: '10.42.4.20',
    version: '1.4.2',
  },
  {
    id: 'node-pending-002',
    name: 'Edge-Tokyo-01',
    status: 'pending',
    registeredAt: '2026-03-24T13:45:00Z',
    ipAddress: '10.42.5.10',
    version: '1.4.2',
  },
];

export const mockLogLines = [
  '[2026-03-24 14:30:00.123] [INFO]  SNMP Poller started - target 10.42.1.200:161',
  '[2026-03-24 14:30:00.456] [INFO]  Walking OID tree 1.3.6.1.2.1.1',
  '[2026-03-24 14:30:01.234] [DEBUG] Received 24 varbinds',
  '[2026-03-24 14:30:01.567] [INFO]  Data pushed to buffer - 24 records, 4.2KB',
  '[2026-03-24 14:30:02.001] [INFO]  Buffer flush complete - 24 records sent to DMS',
  '[2026-03-24 14:30:02.100] [DEBUG] DMS acknowledged 24 records',
  '[2026-03-24 14:35:00.089] [INFO]  SNMP Poller started - target 10.42.1.200:161',
  '[2026-03-24 14:35:00.412] [INFO]  Walking OID tree 1.3.6.1.2.1.1',
  '[2026-03-24 14:35:01.198] [DEBUG] Received 24 varbinds',
  '[2026-03-24 14:35:01.502] [WARN]  Slow response from target (>1000ms)',
  '[2026-03-24 14:35:01.890] [INFO]  Data pushed to buffer - 24 records, 4.1KB',
  '[2026-03-24 14:35:02.045] [INFO]  Buffer flush complete - 24 records sent to DMS',
  '[2026-03-24 14:35:02.112] [DEBUG] DMS acknowledged 24 records',
  '[2026-03-24 14:40:00.067] [INFO]  SNMP Poller started - target 10.42.1.200:161',
  '[2026-03-24 14:40:00.398] [ERROR] SNMP timeout - no response from 10.42.1.200',
  '[2026-03-24 14:40:05.001] [INFO]  Retry 1/3 - target 10.42.1.200:161',
  '[2026-03-24 14:40:05.834] [INFO]  Retry successful - received response',
  '[2026-03-24 14:40:06.012] [DEBUG] Received 24 varbinds',
  '[2026-03-24 14:40:06.345] [INFO]  Data pushed to buffer - 24 records, 4.3KB',
];

export const bandwidthHistory = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  bandwidth: Math.floor(Math.random() * 3000 + 500),
  accepted: Math.floor(Math.random() * 800 + 200),
  dropped: Math.floor(Math.random() * 20),
}));
