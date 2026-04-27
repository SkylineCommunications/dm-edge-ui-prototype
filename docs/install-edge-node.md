---
uid: install_edge_node
---

# Install Edge Node

Follow these steps to install and register a new DataMiner Edge Node.

## Step 1: Download the installer

Choose the installer for your target platform.

### Linux (DEB) — Debian / Ubuntu

Download the Debian package:

```
https://downloads.dataminer.services/edge/dataminer-edge_latest_amd64.deb
```

Install it with:

```bash
sudo dpkg -i dataminer-edge_latest_amd64.deb
```

### Windows (MSI) — Windows Server

Download the Windows installer:

```
https://downloads.dataminer.services/edge/DataMinerEdge_latest.msi
```

Run the MSI installer and follow the setup wizard. Administrative privileges are required.

### Docker

Pull the DataMiner Edge container image from the registry:

```bash
docker pull dataminer/edge:latest
```

---

## Step 2: Choose how the Edge Node connects

There are two connection modes. Use **Organisation Key** unless you have a specific need for a direct connection.

### Option A: Organisation Key (recommended)

**Default route via dataminer.services**

Use an Organisation Key when the Edge Node connects to the DataMiner System through dataminer.services. This is the default onboarding flow.

The Edge Node only needs outbound access to `dataminer.services`.

**Where to find the key**

1. Log in to [admin.dataminer.services](https://admin.dataminer.services).
2. Under *DataMiner Systems*, expand the target DataMiner System and navigate to **Keys**.
3. Copy an existing Primary Key or generate a new one.

> [!NOTE]
> **Key rotation without downtime:** Configure a second Organisation Key on the Edge Node from the location detail page in the Edge Management UI. Once the node starts using the new key, the old key can be released via [admin.dataminer.services](https://admin.dataminer.services).

### Option B: Direct DMS Key

**Direct route to the DMS**

Use this alternative only when needed: the Edge Node connects directly to the DataMiner System with a local key instead of using the recommended dataminer.services route.

This option requires IP connectivity between the Edge Node and the DMS.

**How to prepare direct onboarding**

1. Confirm the first direct DMS key in Settings.
2. Confirm the saved DMS endpoint in Settings.
3. Copy the ready-made configuration below to the Edge Node.

---

## Step 3: Add the key to the configuration

### Linux (DEB) — Organisation Key

Configuration file: `/etc/dataminer/edge.conf`

```ini
# /etc/dataminer/edge.conf
[General]
OrganisationKey=<YOUR_ORGANISATION_KEY>

[Connection]
DmsEndpoint=wss://dataminer.services
BufferSize=10000

# After installation, restart the service:
# sudo systemctl restart dataminer-edge
```

Replace `<YOUR_ORGANISATION_KEY>` with the key from Step 2.

### Windows (MSI) — Organisation Key

Configuration file: `C:\Program Files\DataMiner Edge\edge.conf`

```ini
; C:\Program Files\DataMiner Edge\edge.conf
[General]
OrganisationKey=<YOUR_ORGANISATION_KEY>

[Connection]
DmsEndpoint=wss://dataminer.services
BufferSize=10000

; After installation, restart via Services or:
; net stop DataMinerEdge && net start DataMinerEdge
```

Replace `<YOUR_ORGANISATION_KEY>` with the key from Step 2.

### Docker — Organisation Key

```bash
docker run -d \
  -e DM_ORGANISATION_KEY=<YOUR_ORGANISATION_KEY> \
  -e DM_DMS_ENDPOINT=wss://dataminer.services \
  -e DM_BUFFER_SIZE=10000 \
  --name dataminer-edge \
  dataminer/edge:latest
```

Or in `docker-compose.yml`:

```yaml
services:
  edge:
    image: dataminer/edge:latest
    environment:
      DM_ORGANISATION_KEY: <YOUR_ORGANISATION_KEY>
      DM_DMS_ENDPOINT: wss://dataminer.services
```

Replace `<YOUR_ORGANISATION_KEY>` with the key from Step 2.

### Linux (DEB) — Direct DMS Key

Configuration file: `/etc/dataminer/edge.conf`

```ini
# /etc/dataminer/edge.conf
[General]
DmsKey=<YOUR_DMS_KEY>

[Connection]
DmsEndpoint=<YOUR_DMS_ENDPOINT>
BufferSize=10000

# After installation, restart the service:
# sudo systemctl restart dataminer-edge
```

### Windows (MSI) — Direct DMS Key

Configuration file: `C:\Program Files\DataMiner Edge\edge.conf`

```ini
; C:\Program Files\DataMiner Edge\edge.conf
[General]
DmsKey=<YOUR_DMS_KEY>

[Connection]
DmsEndpoint=<YOUR_DMS_ENDPOINT>
BufferSize=10000

; After installation, restart via Services or:
; net stop DataMinerEdge && net start DataMinerEdge
```

### Docker — Direct DMS Key

```bash
docker run -d \
  -e DM_DMS_KEY=<YOUR_DMS_KEY> \
  -e DM_DMS_ENDPOINT=<YOUR_DMS_ENDPOINT> \
  -e DM_BUFFER_SIZE=10000 \
  --name dataminer-edge \
  dataminer/edge:latest
```

Or in `docker-compose.yml`:

```yaml
services:
  edge:
    image: dataminer/edge:latest
    environment:
      DM_DMS_KEY: <YOUR_DMS_KEY>
      DM_DMS_ENDPOINT: <YOUR_DMS_ENDPOINT>
```

---

## What happens next?

1. The Edge Node starts and **registers itself** with the DataMiner System.
2. The node appears on the **Pending Approvals** page in the Edge Management UI.
3. An administrator **approves** the node and assigns it a **location name**.
4. Once approved, you can **deploy Scripted Connectors** to the location from the [DataMiner Catalog](https://catalog.dataminer.services).
