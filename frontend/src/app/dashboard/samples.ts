export interface SampleLog {
  id: string;
  name: string;
  type: "Cisco" | "Linux" | "Windows";
  filename: string;
  content: string;
}

export const SAMPLE_LOGS: SampleLog[] = [
  {
    id: "cisco-firewall",
    name: "Cisco ASA Connection & Deny",
    type: "Cisco",
    filename: "cisco_asa_firewall.log",
    content: `Jun 26 01:10:22 cisco-asa-01 %ASA-6-302013: Built outbound TCP connection 371904 for outside:203.0.113.50/443 (203.0.113.50/443) to inside:192.168.1.100/54322 (192.168.1.100/54322)
Jun 26 01:10:23 cisco-asa-01 %ASA-6-302014: Teardown TCP connection 371904 for outside:203.0.113.50/443 to inside:192.168.1.100/54322 duration 0:00:01 bytes 1243 TCP FIN-WAIT
Jun 26 01:11:05 cisco-asa-01 %ASA-4-106023: Deny tcp src outside:198.51.100.12/55512 dst inside:192.168.10.15/22 by access-group "outside_access_in" [0x0, 0x0]
Jun 26 01:11:08 cisco-asa-01 %ASA-4-106023: Deny tcp src outside:198.51.100.12/55513 dst inside:192.168.10.15/22 by access-group "outside_access_in" [0x0, 0x0]
Jun 26 01:11:11 cisco-asa-01 %ASA-4-106023: Deny tcp src outside:198.51.100.12/55514 dst inside:192.168.10.15/22 by access-group "outside_access_in" [0x0, 0x0]`
  },
  {
    id: "linux-ssh",
    name: "Linux SSH Brute-Force Attempt",
    type: "Linux",
    filename: "linux_auth_ssh.log",
    content: `Jun 26 00:45:12 server1 sshd[28451]: Invalid user admin from 198.51.100.12 port 38241
Jun 26 00:45:12 server1 sshd[28451]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.12
Jun 26 00:45:14 server1 sshd[28451]: Failed password for invalid user admin from 198.51.100.12 port 38241 ssh2
Jun 26 00:45:18 server1 sshd[28453]: Invalid user admin from 198.51.100.12 port 38248
Jun 26 00:45:20 server1 sshd[28453]: Failed password for invalid user admin from 198.51.100.12 port 38248 ssh2
Jun 26 00:45:24 server1 sshd[28455]: Failed password for root from 198.51.100.12 port 38252 ssh2
Jun 26 00:45:26 server1 sshd[28455]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.12  user=root
Jun 26 00:45:28 server1 sshd[28455]: Failed password for root from 198.51.100.12 port 38252 ssh2`
  },
  {
    id: "windows-logon",
    name: "Windows Event ID 4625 Failure",
    type: "Windows",
    filename: "windows_event_4625.txt",
    content: `Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          06/26/2026 01:15:40 AM
Event ID:      4625
Task Category: Logon
Level:         Information
Keywords:      Audit Failure
User:          N/A
Computer:      DESKTOP-SEC-99
Description:
An account failed to log on.

Subject:
    Security ID:      S-1-0-0
    Account Name:     -
    Account Domain:   -
    Logon ID:         0x0

Logon Type:           3

Account For Which Logon Failed:
    Security ID:      S-1-0-0
    Account Name:     Administrator
    Account Domain:   DESKTOP-SEC-99

Failure Information:
    Failure Reason:   Unknown user name or bad password.
    Status:           0xC000006D
    Sub Status:       0xC000006A

Process Information:
    Caller Process ID: 0x0
    Caller Process Name: -

Network Information:
    Workstation Name:  ATTACKER-WS
    Source Network Address: 192.168.10.15
    Source Port:       58902`
  }
];
