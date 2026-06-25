import os
import json
import re
from typing import List
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv(override=True)

# Define the structured output model using Pydantic
class LogAnalysis(BaseModel):
    log_type: str = Field(description="The detected type of the log (e.g. Cisco, Linux, Windows, or Unknown)")
    severity: str = Field(description="Severity classification: Critical, High, Medium, or Low")
    summary: str = Field(description="A concise one-line summary of what occurred in the log")
    explanation: str = Field(description="A clear, plain-English explanation of the log details, what they mean, and why they are important for a security analyst or IT admin")
    possible_causes: List[str] = Field(description="A list of possible causes that could have triggered this log event")
    recommended_actions: List[str] = Field(description="A list of recommended actions/remediation steps to resolve or investigate the issue")

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        # Initialize Google GenAI client
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Error initializing Gemini client: {e}")
        return None

def analyze_log_with_gemini(log_content: str, detected_type: str) -> dict:
    """
    Analyzes the log content using Gemini API.
    If GEMINI_API_KEY is not set, falls back to the local mock analyzer.
    """
    client = get_gemini_client()
    
    if not client:
        print("GEMINI_API_KEY not found or client init failed. Falling back to Mock Analyzer.")
        return generate_mock_analysis(log_content, detected_type)
        
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    prompt = f"""
    You are an expert Cybersecurity Incident Responder and SOC Analyst.
    Analyze the following raw log content. 

    The pre-detected log type is: {detected_type}. (If this detection is wrong, specify the correct one in your output log_type field).

    Please provide a detailed structured analysis of this log in JSON format.
    Make sure your explanation is written in plain English, explaining technical terms so a junior admin can understand it.

    Raw Log Content:
    {log_content}
    """
    
    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LogAnalysis,
                temperature=0.2,
            ),
        )
        # Parse the JSON response
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini API request failed: {e}. Falling back to Mock Analyzer.")
        return generate_mock_analysis(log_content, detected_type)

def generate_mock_analysis(log_content: str, detected_type: str) -> dict:
    """
    Generates realistic log analysis locally if the Gemini API is unavailable.
    """
    log_content_lower = log_content.lower()

    # Detect specific sample matches first
    
    # 1. Cisco ASA Outbound/Deny Sample Check
    if "%asa-" in log_content_lower or "cisco" in log_content_lower:
        if "deny" in log_content_lower or "denied" in log_content_lower:
            return {
                "log_type": "Cisco",
                "severity": "High",
                "summary": "Firewall blocked unauthorized inbound traffic attempt",
                "explanation": "The Cisco ASA firewall intercepted and dropped an inbound packet. The connection was blocked because it did not match any permitted Access Control List (ACL) rules. This is typical firewall behavior defending the perimeter, but repetitive blocks from the same source can indicate scanning.",
                "possible_causes": [
                    "External vulnerability scanner or bot scanning public-facing ports",
                    "Misconfigured external client trying to access a decommissioned service",
                    "Active reconnaissance attack targeting internal network ports"
                ],
                "recommended_actions": [
                    "Verify if the source IP is a known malicious scanner using threat intelligence tools (e.g. VirusTotal)",
                    "Monitor for a high rate of denied connections from the same source IP, which may require temporary blocking at the ISP/upstream router",
                    "Ensure internal hosts are fully patched in case any perimeter protections fail"
                ]
            }
        else:
            return {
                "log_type": "Cisco",
                "severity": "Low",
                "summary": "Outbound network connection successfully established via Cisco ASA",
                "explanation": "A internal client successfully initiated an outbound network connection which was authorized by the firewall. The Cisco ASA firewall logged the session creation, translating the internal source IP to a public external IP (NAT) and creating a connection state. This represents normal web browsing or API communication.",
                "possible_causes": [
                    "User visiting a secure website (HTTPS/443)",
                    "Internal software calling an external API service or pulling updates",
                    "Background operating system updates or telemetry"
                ],
                "recommended_actions": [
                    "No direct actions needed as the connection is compliant with firewall security policies",
                    "If the source host is a critical database or sensitive server, verify if outbound web browsing should be restricted"
                ]
            }

    # 2. Linux SSH Authentication Failure Check
    elif "sshd" in log_content_lower or "pam_unix" in log_content_lower or "failed password" in log_content_lower:
        # Extract IP and User if possible
        ip_match = re.search(r"from\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", log_content)
        user_match = re.search(r"for\s+(invalid user\s+)?(\w+)\s+from", log_content)
        
        src_ip = ip_match.group(1) if ip_match else "an external IP"
        user = user_match.group(2) if user_match else "admin/root"
        
        return {
            "log_type": "Linux",
            "severity": "High",
            "summary": f"Multiple failed SSH password attempts for user '{user}'",
            "explanation": f"The Linux SSH server (sshd) rejected authentication attempts for user account '{user}' originating from the IP address {src_ip}. This signature of multiple rapid failures indicates an automated brute-force attack or dictionary attack attempting to guess credentials to log in remotely.",
            "possible_causes": [
                f"Automated credential brute-force script scanning internet-accessible SSH services",
                "Misconfigured administrative script attempting automated backups with expired passwords",
                "Authorized administrator entering incorrect password repeatedly"
            ],
            "recommended_actions": [
                f"Block source IP {src_ip} immediately using iptables, UFW, or fail2ban",
                "Disable SSH password-based login and enforce SSH key-based authentication only",
                "Configure a rate limit or change the default SSH port (22) to a non-standard port to reduce automated noise",
                f"Confirm with the owner of the user '{user}' account if they were performing login attempts"
            ]
        }

    # 3. Windows Security Auditing Logon Failure (4625) Check
    elif "4625" in log_content or "security-auditing" in log_content_lower or "eventid: 4625" in log_content_lower:
        user_match = re.search(r"Account Name:\s*([^\s]+)", log_content)
        ip_match = re.search(r"Source Network Address:\s*([^\s]+)", log_content)
        
        user = user_match.group(1) if user_match else "Administrator"
        src_ip = ip_match.group(1) if ip_match else "a network host"

        return {
            "log_type": "Windows",
            "severity": "Critical",
            "summary": f"Failed Local Logon Attempt - Event ID 4625 for account '{user}'",
            "explanation": f"Windows logged a logon failure (Event ID 4625) for the user account '{user}'. The event details specify a Logon Type of 3 (Network Logon) or 2 (Interactive), originating from {src_ip}. This means someone or something attempted to authenticate remotely but provided an invalid password. Brute-forcing the local Administrator account is a common lateral movement or initial access vector.",
            "possible_causes": [
                "Credential stuffing attack targeting local Windows accounts",
                "Domain password policy lockout triggered by active credential guessing",
                "An automated service, script, or mounted network drive running with expired cached credentials"
            ],
            "recommended_actions": [
                f"Identify the system at {src_ip} to determine if it is infected or hosting a malicious script",
                "Enable logon failure account lockouts (e.g. lock account for 30 minutes after 5 failed attempts)",
                "Ensure the local Administrator account is renamed or disabled, and enforce strong, unique passwords via LAPS (Local Administrator Password Solution)",
                "Audit Active Directory controller logs for widespread failure events indicating network-wide scanning"
            ]
        }

    # Generic Fallback for unclassified custom logs
    else:
        # Simple dynamic heuristics
        sev = "Low"
        summary = "Generic log entry analyzed"
        explanation = "The analyzer processed a general system or network log message. The log did not trigger specific Cisco, Linux, or Windows high-severity signatures. It contains standard operational information."
        
        if any(w in log_content_lower for w in ["error", "fail", "unable", "denied", "invalid", "reject"]):
            sev = "Medium"
            summary = "Error or failure event detected in log"
            explanation = "The analyzer identified an error, failure, or permission-denied signature in the log text. This indicates an application, service, or connection did not complete successfully and may require troubleshooting."
        if any(w in log_content_lower for w in ["critical", "fatal", "panic", "exploit", "unauthorized"]):
            sev = "High"
            summary = "Critical status or unauthorized access indicator"
            explanation = "A critical keyword or unauthorized activity signature was detected. This implies an application crash, severe hardware state, or potential policy violation that demands immediate review by an administrator."

        return {
            "log_type": detected_type,
            "severity": sev,
            "summary": summary,
            "explanation": explanation,
            "possible_causes": [
                "Operational exception, configuration mismatch, or backend server outage",
                "User input or external command that caused a non-success response code",
                "Network timeout or communication breakdown between distributed components"
            ],
            "recommended_actions": [
                "Inspect surrounding log entries to establish a timeline of events leading up to this log",
                "Cross-reference any error codes or transaction IDs mentioned in the log with vendor documentation",
                "Ensure resource levels (CPU, memory, disk space) on the host server are within acceptable limits"
            ]
        }
