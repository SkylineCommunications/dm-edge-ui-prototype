export type NodeStatus = 'online' | 'offline' | 'recovering' | 'pending';

export interface DataPacketStats {
  accepted: number;
  dropped: number;
  dropReason?: 'queue_full' | 'size_too_big';
  bufferSize: number;
  bufferCapacity: number;
  isRecovering: boolean;
}

export interface BufferingConfig {
  bufferSizeMB: number;
  bufferFileSizeMB: number;
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
  bufferingConfig?: BufferingConfig;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  connectors: ScriptedConnector[];
  nodes: EdgeNode[];
}

export interface NodeView {
  id: string;
  locationId: string;
  displayName: string;
  description?: string;
  node: EdgeNode;
  connectors: ScriptedConnector[];
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
  bufferingConfig: { bufferSizeMB: 1024, bufferFileSizeMB: 5120 },
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
  bufferingConfig: { bufferSizeMB: 2048, bufferFileSizeMB: 8192 },
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
  bufferingConfig: { bufferSizeMB: 512, bufferFileSizeMB: 2048 },
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
  {
    id: 'sc-005',
    name: 'SNMP Poller',
    version: '2.1.0',
    status: 'running',
    locationId: 'loc-002',
    arguments: { targetIp: '10.42.2.80', community: 'public', port: '161' },
    bandwidthKbps: 980,
    packetStats: { accepted: 45200, dropped: 5, bufferSize: 0, bufferCapacity: 5000, isRecovering: false },
    schedules: [
      { id: 'sch-006', name: 'Every 5 min', cron: '*/5 * * * *', enabled: true, arguments: { oids: '1.3.6.1.2.1.1' }, lastRun: '2026-03-24T14:30:00Z', nextRun: '2026-03-24T14:35:00Z' },
    ],
  },
  {
    id: 'sc-006',
    name: 'HTTP Health Check',
    version: '1.0.3',
    status: 'running',
    locationId: 'loc-002',
    arguments: { url: 'https://warehouse.internal.local/health', timeout: '3000' },
    bandwidthKbps: 85,
    packetStats: { accepted: 12300, dropped: 0, bufferSize: 0, bufferCapacity: 2000, isRecovering: false },
    schedules: [
      { id: 'sch-007', name: 'Every 2 min', cron: '*/2 * * * *', enabled: true, arguments: { expectedStatus: '200' }, lastRun: '2026-03-24T14:32:00Z', nextRun: '2026-03-24T14:34:00Z' },
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

const extraLocationSeeds = [
  { name: 'Paris Hub', description: 'Regional operations hub in Paris' },
  { name: 'London Exchange', description: 'Exchange point monitoring in London' },
  { name: 'Madrid Plant', description: 'Production monitoring in Madrid' },
  { name: 'Milan Facility', description: 'Facility operations in Milan' },
  { name: 'Prague Transit', description: 'Transit systems in Prague' },
  { name: 'Vienna Utility', description: 'Utility telemetry in Vienna' },
  { name: 'Zurich Banking', description: 'Secure branch monitoring in Zurich' },
  { name: 'Copenhagen Port', description: 'Port logistics in Copenhagen' },
  { name: 'Stockholm Grid', description: 'Grid edge monitoring in Stockholm' },
  { name: 'Dublin Office', description: 'Office network observability in Dublin' },
  { name: 'Lisbon Coastal', description: 'Coastal infrastructure in Lisbon' },
  { name: 'Warsaw Metro', description: 'Metro systems telemetry in Warsaw' },
  { name: 'Budapest Depot', description: 'Depot operations in Budapest' },
  { name: 'Athens Terminal', description: 'Terminal operations in Athens' },
];

const extraStatuses: NodeStatus[] = [
  'online',
  'online',
  'recovering',
  'online',
  'offline',
  'online',
  'online',
  'recovering',
  'online',
  'offline',
  'online',
  'online',
  'recovering',
  'online',
];

const TARGET_CONNECTORS_PER_NODE = 10;
const MIN_SCHEDULES_PER_CONNECTOR = 2;

const buildConnectorSet = (
  locationId: string,
  baseConnectors: ScriptedConnector[],
  nodeStatus: NodeStatus,
): ScriptedConnector[] => {
  const isOffline = nodeStatus === 'offline';

  return Array.from({ length: TARGET_CONNECTORS_PER_NODE }, (_, connectorIndex) => {
    const template = baseConnectors[connectorIndex % baseConnectors.length];
    const requiredSchedules = Math.max(MIN_SCHEDULES_PER_CONNECTOR, template.schedules.length || 0);

    const schedules: Schedule[] = Array.from({ length: requiredSchedules }, (_, scheduleIndex) => {
      const scheduleTemplate = template.schedules[scheduleIndex % template.schedules.length] || {
        id: 'template-schedule',
        name: 'Every 5 min',
        cron: '*/5 * * * *',
        enabled: !isOffline,
        arguments: { profile: 'default' },
      };

      return {
        ...scheduleTemplate,
        id: `${locationId}-sch-${String(connectorIndex + 1).padStart(2, '0')}-${String(scheduleIndex + 1).padStart(2, '0')}`,
        enabled: isOffline ? false : scheduleTemplate.enabled,
      };
    });

    return {
      ...template,
      id: `${locationId}-sc-${String(connectorIndex + 1).padStart(2, '0')}`,
      name: `${template.name} ${String(connectorIndex + 1).padStart(2, '0')}`,
      locationId,
      status: isOffline ? 'stopped' : template.status,
      bandwidthKbps: isOffline ? 0 : template.bandwidthKbps + connectorIndex * 20,
      arguments: {
        ...template.arguments,
        instance: String(connectorIndex + 1),
      },
      packetStats: {
        ...template.packetStats,
        accepted: template.packetStats.accepted + connectorIndex * 750,
      },
      schedules,
    };
  });
};

const additionalLocations: Location[] = extraLocationSeeds.map((seed, index) => {
  const number = index + 4;
  const locationId = `loc-${String(number).padStart(3, '0')}`;
  const nodeId = `node-${String(number).padStart(3, '0')}`;
  const connectorId = `sc-${String(number + 6).padStart(3, '0')}`;
  const scheduleId = `sch-${String(number + 7).padStart(3, '0')}`;
  const status = extraStatuses[index];
  const isRecovering = status === 'recovering';
  const isOffline = status === 'offline';

  const node: EdgeNode = {
    id: nodeId,
    name: `Edge-${seed.name.split(' ')[0]}-01`,
    locationId,
    status,
    lastPacketReceived: isOffline ? '2026-03-22T23:10:00Z' : '2026-03-24T14:31:00Z',
    registeredAt: `2026-02-${String((index % 20) + 3).padStart(2, '0')}T08:30:00Z`,
    approvedAt: `2026-02-${String((index % 20) + 3).padStart(2, '0')}T09:00:00Z`,
    ipAddress: `10.42.${number}.20`,
    version: '1.4.2',
    bandwidthKbps: isOffline ? 0 : 900 + index * 120,
    packetStats: {
      accepted: 60000 + index * 3400,
      dropped: isRecovering ? 120 + index * 5 : index % 4,
      dropReason: isRecovering ? 'queue_full' : undefined,
      bufferSize: isRecovering ? 1800 + index * 100 : 0,
      bufferCapacity: 10000,
      isRecovering,
    },
  };

  const connector: ScriptedConnector = {
    id: connectorId,
    name: index % 3 === 0 ? 'SNMP Poller' : index % 3 === 1 ? 'HTTP Health Check' : 'Modbus TCP Reader',
    version: '2.1.0',
    status: isOffline ? 'stopped' : 'running',
    locationId,
    arguments: {
      target: `10.42.${number}.100`,
      timeout: '3000',
    },
    bandwidthKbps: isOffline ? 0 : 500 + index * 80,
    packetStats: {
      accepted: 24000 + index * 1800,
      dropped: isRecovering ? 30 + index : 0,
      dropReason: isRecovering ? 'queue_full' : undefined,
      bufferSize: isRecovering ? 700 + index * 40 : 0,
      bufferCapacity: 5000,
      isRecovering,
    },
    schedules: [
      {
        id: scheduleId,
        name: 'Every 5 min',
        cron: '*/5 * * * *',
        enabled: !isOffline,
        arguments: { profile: 'default' },
        lastRun: isOffline ? '2026-03-22T23:05:00Z' : '2026-03-24T14:30:00Z',
        nextRun: isOffline ? undefined : '2026-03-24T14:35:00Z',
      },
    ],
  };

  return {
    id: locationId,
    name: seed.name,
    description: seed.description,
    nodes: [node],
    connectors: buildConnectorSet(locationId, [connector], status),
  };
});

export const locations: Location[] = [
  {
    id: 'loc-001',
    name: 'Brussels Data Center',
    description: 'Primary data center in Brussels',
    nodes: [brusselsNode],
    connectors: buildConnectorSet('loc-001', brusselsConnectors, brusselsNode.status),
  },
  {
    id: 'loc-002',
    name: 'Amsterdam Warehouse',
    description: 'Warehouse monitoring in Amsterdam',
    nodes: [amsterdamNode],
    connectors: buildConnectorSet('loc-002', amsterdamConnectors, amsterdamNode.status),
  },
  {
    id: 'loc-003',
    name: 'Munich Factory Floor',
    description: 'Factory floor monitoring in Munich',
    nodes: [munichNode],
    connectors: buildConnectorSet('loc-003', munichConnectors, munichNode.status),
  },
  ...additionalLocations,
];

// Convenience accessors
export const allNodes: EdgeNode[] = locations.flatMap(l => l.nodes);
export const allConnectors: ScriptedConnector[] = locations.flatMap(l => l.connectors);

export const nodeViews: NodeView[] = locations.flatMap((location) => {
  const node = location.nodes[0];
  if (!node) return [];

  return [
    {
      id: node.id,
      locationId: location.id,
      displayName: location.name,
      description: location.description,
      node,
      connectors: location.connectors,
    },
  ];
});

export const getLocation = (id: string) => locations.find(l => l.id === id);
export const getLocationForNode = (nodeId: string) => locations.find(l => l.nodes.some(n => n.id === nodeId));
export const getNodeView = (id: string) => nodeViews.find((view) => view.id === id || view.locationId === id);
export const getNodeViewByLocationId = (locationId: string) => nodeViews.find((view) => view.locationId === locationId);

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
