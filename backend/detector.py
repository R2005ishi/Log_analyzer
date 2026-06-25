import re

def detect_log_type(log_content: str) -> str:
    """
    Detects whether the log content is Cisco, Linux, or Windows based on rule-based patterns.
    Returns: 'Cisco', 'Linux', 'Windows', or 'Unknown'.
    """
    if not log_content or not log_content.strip():
        return "Unknown"

    cisco_score = 0
    linux_score = 0
    windows_score = 0

    # Split into lines (checking first 50 lines is usually enough and faster)
    lines = log_content.splitlines()[:50]
    
    # 1. Cisco ASA/IOS Patterns
    # Examples: 
    # - %ASA-6-302013: Built outbound TCP connection 371904 for outside:192.168.1.100/443
    # - %SEC-6-IPACCESSLOGP: list 101 denied tcp 10.0.0.1(1234) -> 20.0.0.2(80)
    cisco_regexes = [
        r"%ASA-\d-\d+",  # %ASA-6-302013
        r"%PIX-\d-\d+",  # PIX firewall
        r"%FWSM-\d-\d+", # Firewall Services Module
        r"%IOS-\d-\d+",  # Cisco IOS
        r"Built (outbound|inbound) TCP connection",
        r"Teardown (TCP|UDP) connection",
        r"Deny (inbound|outbound) (TCP|UDP|ICMP)",
        r"IPACCESSLOG",
        r"cisco"
    ]
    
    # 2. Linux Syslog / Auth Log Patterns
    # Examples:
    # - Jun 26 01:23:45 server sshd[1234]: Failed password for root from 192.168.1.50 port 22 ssh2
    # - Jun 26 01:23:45 server CRON[5678]: pam_unix(cron:session): session opened for user root
    linux_regexes = [
        r"sshd\[\d+\]:",
        r"systemd\[\d+\]:",
        r"pam_unix\(",
        r"CRON\[\d+\]:",
        r"sudo:\s+\w+\s+:",
        r"kernel:\s+\[\s*\d+\.\d+\]",
        r"session (opened|closed) for user",
        r"Failed password for",
        r"Accepted publickey for"
    ]

    # 3. Windows Event Log Patterns
    # Examples:
    # - EventID: 4625
    # - Source: Microsoft-Windows-Security-Auditing
    # - Keywords: Audit Failure
    # - Logon Type: 3
    windows_regexes = [
        r"EventID:\s*\d+",
        r"Event ID:\s*\d+",
        r"Security-Auditing",
        r"Microsoft-Windows-Security",
        r"Audit (Success|Failure)",
        r"Logon Type:",
        r"Account Name:",
        r"Account Domain:",
        r"Failure Reason:",
        r"Privilege List:"
    ]

    # Calculate scores based on matches across the first 50 lines
    for line in lines:
        # Cisco
        for regex in cisco_regexes:
            if re.search(regex, line, re.IGNORECASE):
                cisco_score += 1.5 if "%" in regex or "connection" in regex else 1.0

        # Linux
        for regex in linux_regexes:
            if re.search(regex, line, re.IGNORECASE):
                linux_score += 1.5 if "[" in regex or "pam_unix" in regex else 1.0

        # Windows
        for regex in windows_regexes:
            if re.search(regex, line, re.IGNORECASE):
                windows_score += 1.5 if "EventID" in regex or "Security-Auditing" in regex else 1.0

    # Print debug info
    print(f"Log type detection scores - Cisco: {cisco_score}, Linux: {linux_score}, Windows: {windows_score}")

    max_score = max(cisco_score, linux_score, windows_score)
    if max_score < 1.0:
        return "Unknown"
    elif max_score == cisco_score:
        return "Cisco"
    elif max_score == linux_score:
        return "Linux"
    else:
        return "Windows"
