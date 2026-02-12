
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const MOCK_REPOSITORY_CONTEXT = `
SYSTEM ARCHITECTURE: "Titanium-Core Global Banking Platform v4.5"

[INFRASTRUCTURE LAYERS]
1. EDGE: Cloudflare Workers handling global routing and DDoS protection.
2. FRONTEND: React SPA (Micro-frontends) hosted on S3 + CloudFront.
3. API GATEWAY: Kong Gateway (Enforces rate limiting: 100 req/sec per user).

[BACKEND MICROSERVICES - GKE CLUSTER]
- Auth Service (Go): Handles OAuth2/OIDC.
- Account Service (Node.js): Manages user profiles.
- Transaction Service (Java Spring Boot): *CRITICAL* Handles money movement.
  - CONSTRAINT: Must strictly adhere to ACID properties. 
  - CONSTRAINT: No direct HTTP calls to external vendors allowed (Must use Event Bus).
- Notification Service (Python): Sends emails/SMS.

[DATA PERSISTENCE]
- Primary DB: CockroachDB (Geo-partitioned).
- Cache: Redis Cluster (Session storage only).
- Analytics: Snowflake (ETL via Debezium).

[EVENT DRIVEN ARCHITECTURE]
- Message Bus: Apache Kafka. Topics: 'tx-created', 'tx-settled', 'fraud-alert'.
- CONSTRAINT: All inter-service communication regarding state changes MUST be asynchronous via Kafka.

[LEGACY CORE (THE BOTTLENECK)]
- System: IBM Mainframe (AS/400).
- Function: Final Ledger Settlement & Compliance Reporting.
- BRIDGE: "Legacy-Connector" Service.
- HARD LIMIT: Max 15 concurrent connections.
- HARD LIMIT: Max 5 Transactions Per Second (TPS).
- VIOLATION CONSEQUENCE: System-wide deadlock.

[SECURITY & COMPLIANCE]
- All service-to-service comms require mTLS.
- PII Data must be encrypted at rest and in transit.
- No direct database access from Frontend (SQL Injection prevention).
`;

// Helper to generate the System Instruction, prioritizing the Visual Blueprint
export const getSystemInstruction = (visualBlueprint?: string) => {
  const sourceOfTruth = visualBlueprint && visualBlueprint.length > 50 
    ? visualBlueprint 
    : MOCK_REPOSITORY_CONTEXT;

  return `You are 'The Living Blueprint', a Senior Technical PM Agent.
--------------------------------------------------
OFFICIAL SYSTEM ARCHITECTURE (SOURCE OF TRUTH):
${sourceOfTruth}
--------------------------------------------------

STRICT VERIFICATION PROTOCOL:
1.  **VAGUE REQUESTS:** If the user's request is vague (e.g., "make it faster", "add a database", "improve security") or lacks specific implementation details, you MUST call the \`request_clarification\` tool. DO NOT GUESS.
2.  **SPECIFIC REQUESTS:** If the request is technical and specific (e.g., "Add a Postgres instance for the User Service", "Cache user sessions in memory"), call \`check_architecture_compliance\`.
3.  Always pass the OFFICIAL SYSTEM ARCHITECTURE text as \`current_system_blueprint\`.
4.  Be terse and professional.`;
};

// Check Microphone Permissions
export async function checkMicrophonePermissions(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop tracks immediately after check to release resource until needed
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    // Explicit log as requested by user
    console.error("ERROR: MICROPHONE_PERMISSION_DENIED");
    return false;
  }
}

// Setup Audio Stream
export async function setupAudioStream(): Promise<{
  stream: MediaStream;
  inputCtx: AudioContext;
  outputCtx: AudioContext;
  processor: ScriptProcessorNode;
  outputNode: GainNode;
}> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  
  const outputNode = outputCtx.createGain();
  outputNode.connect(outputCtx.destination);
  
  const source = inputCtx.createMediaStreamSource(stream);
  const processor = inputCtx.createScriptProcessor(4096, 1, 1);
  
  source.connect(processor);
  processor.connect(inputCtx.destination);

  return { stream, inputCtx, outputCtx, processor, outputNode };
}

// Tool Definition: Check Compliance
export const complianceToolDeclaration: FunctionDeclaration = {
  name: 'check_architecture_compliance',
  description: 'Validates a specific, technical feature proposal against the system blueprint.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      feature_intent: {
        type: Type.STRING,
        description: 'The detailed technical description of the feature.',
      },
      current_system_blueprint: {
        type: Type.STRING,
        description: 'The summary of the current system architecture.',
      },
    },
    required: ['feature_intent', 'current_system_blueprint'],
  },
};

// Tool Definition: Request Clarification
export const requestClarificationToolDeclaration: FunctionDeclaration = {
  name: 'request_clarification',
  description: 'Call this when the user request is too vague to perform a compliance check (e.g., "make it faster", "improve security").',
  parameters: {
    type: Type.OBJECT,
    properties: {
      ambiguity_reason: {
        type: Type.STRING,
        description: 'Why the request is vague (e.g., "Missing technical implementation details").',
      },
      missing_info: {
         type: Type.STRING,
         description: 'What specific information is needed (e.g., "Which specific service needs optimization?").'
      }
    },
    required: ['ambiguity_reason', 'missing_info'],
  },
};

// Response Schema for the "Inner" Compliance Check - Using object literal directly as per guidelines
const complianceResponseSchema = {
  type: Type.OBJECT,
  properties: {
    is_conflict: { type: Type.BOOLEAN },
    conflict_severity: { type: Type.INTEGER, description: "1 to 10 scale" },
    remediation_steps: { type: Type.STRING },
    affected_component: { type: Type.STRING },
    confidence_score: { type: Type.INTEGER, description: "0 to 100 representing certainty of analysis" }
  },
  required: ["is_conflict", "conflict_severity", "remediation_steps", "affected_component", "confidence_score"]
};

export async function analyze_visual_blueprint(base64Image: string, mimeType: string): Promise<string> {
  const ai = getClient();
  const modelId = 'gemini-3-flash-preview'; 

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: "OCR the diagram to identify microservices and security boundaries. Extract all microservices, databases, and security protocols into the system memory."
          }
        ]
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Visual Analysis failed:", error);
    throw error;
  }
}

export async function analyzeDiagram(base64Image: string, mimeType: string): Promise<string> {
  return analyze_visual_blueprint(base64Image, mimeType);
}

// Function to actually execute the compliance check when the tool is called
export async function validateFeatureCompliance(featureIntent: string, blueprint: string): Promise<any> {
  const ai = getClient();
  const modelId = 'gemini-3-flash-preview';

  const prompt = `
    Analyze the following feature request against the existing system blueprint.
    
    Blueprint: ${blueprint}
    
    Feature Request: ${featureIntent}
    
    Determine if this feature introduces Architectural Drift.
    
    Calculate a 'confidence_score' (0-100):
    - 90-100: Clear conflict/compliance based on explicit constraints.
    - 70-89: Likely result, but based on inferred constraints.
    - < 70: Feature request lacks sufficient detail for a definitive ruling.

    Return a JSON object with:
    - is_conflict: boolean
    - conflict_severity: integer (1-10)
    - remediation_steps: string (concise advice)
    - affected_component: string (name of the component most impacted)
    - confidence_score: integer (0-100)
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: complianceResponseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from compliance check");
    return JSON.parse(text);
  } catch (error) {
    console.error("Compliance validation failed:", error);
    return {
      is_conflict: true,
      conflict_severity: 5,
      remediation_steps: "Manual review required due to automated check failure.",
      affected_component: "Unknown",
      confidence_score: 0
    };
  }
}
