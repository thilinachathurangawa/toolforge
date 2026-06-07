# SPEC: Port Checker Tool
**File:** `docs/specs/tools/network/PORT_CHECKER.md`  
**Status:** Pending  
**Slug:** `port-checker`  
**Category:** network

---

## SEO

- **Title:** `Port Checker — Test Open Ports & Network Services | ToolForge`
- **Description:** `Check if a port is open or closed on any server. Test common ports (80, 443, 22, 21, etc.) or custom ports. Free port scanner.`
- **Primary Keyword:** port checker
- **Secondary Keywords:** open port scanner, port test, network port check, TCP port checker

---

## Functional Requirements

- [ ] Host/IP input field
- [ ] Port input field (single port or range)
- [ ] Quick select buttons for common ports (80, 443, 22, 21, 3306, etc.)
- [ ] Check port button
- [ ] Display port status (open/closed/filtered)
- [ ] Display response time
- [ ] Display service name (if known)
- [ ] Support multiple port checking
- [ ] Show results in table format
- [ ] Use browser-based port check (WebSocket/fetch attempts)

---

## Library

No external library needed — use fetch/WebSocket with timeout

---

## UI Layout

```
┌─────────────────────────────────┐
│  Host: [example.com    ]        │
│  Port: [443]                    │
│                                 │
│  Common Ports:                  │
│  [80] [443] [22] [21] [3306]    │
│  [8080] [25] [53] [110] [143]   │
│                                 │
│  [Check Port]                   │
├─────────────────────────────────┤
│  Port 443 on example.com:       │
│  Status: ✅ Open                │
│  Service: HTTPS                 │
│  Response Time: 45ms            │
│                                 │
│  Results History:               │
│  443 - Open (45ms)              │
│  80 - Open (52ms)               │
│  22 - Closed (timeout)          │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface PortResult {
  port: number;
  status: 'open' | 'closed' | 'filtered' | 'timeout';
  service: string;
  responseTime: number;
}

state: {
  host: string;
  port: string;
  isChecking: boolean;
  currentResult: PortResult | null;
  history: PortResult[];
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Enter a hostname or IP address
2. Enter a port number or select a common port
3. Click "Check Port" to test if the port is open
4. View the status, service name, and response time
5. Check multiple ports to build a results history

---

## About Content (for SEO section)

Our port checker tests if specific ports are open or closed on any server. The tool attempts to connect to the specified port and reports the status along with response time. Quick-select buttons for common ports (HTTP, HTTPS, SSH, FTP, MySQL, etc.) make it easy to check standard services. Perfect for network administrators, developers, and anyone troubleshooting firewall or connectivity issues.
