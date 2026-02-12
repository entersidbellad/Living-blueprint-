
import { useState, useRef, useEffect, useCallback } from 'react';
// Correctly import Modality from @google/genai as per guidelines
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { DriftReport } from '../types';
import { base64ToBytes, decodeAudioData, createPcmBlob } from '../services/audioUtils';
import { 
  complianceToolDeclaration, 
  requestClarificationToolDeclaration,
  validateFeatureCompliance, 
  getSystemInstruction,
  checkMicrophonePermissions,
  setupAudioStream
} from '../services/geminiService';

const MODEL_ID = 'gemini-2.5-flash-native-audio-preview-12-2025';
const MAX_RETRIES = 2;

interface UseLiveSessionProps {
  initialContext: string;
  onDriftReport: (report: DriftReport) => void;
}

export function useLiveSession({ initialContext, onDriftReport }: UseLiveSessionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const cleanupAudio = useCallback(() => {
    if (inputContextRef.current) {
        inputContextRef.current.close();
        inputContextRef.current = null;
    }
    if (outputContextRef.current) {
        outputContextRef.current.close();
        outputContextRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    scriptProcessorRef.current = null;
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    let currentRetry = 0;

    const attemptConnection = async () => {
        let audioResources;
        
        try {
            const hasPermission = await checkMicrophonePermissions();
            if (!hasPermission) {
                throw new Error("MICROPHONE_PERMISSION_DENIED");
            }

            audioResources = await setupAudioStream();
            streamRef.current = audioResources.stream;
            inputContextRef.current = audioResources.inputCtx;
            outputContextRef.current = audioResources.outputCtx;
            scriptProcessorRef.current = audioResources.processor;

        } catch (err: any) {
            console.error("Audio Initialization Failed:", err);
            cleanupAudio();
            if (err.message === "MICROPHONE_PERMISSION_DENIED") {
                setError("MICROPHONE_PERMISSION_DENIED");
            } else {
                setError("AUDIO_DEVICE_ERROR");
            }
            return; 
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { processor, outputNode } = audioResources;

            const sessionPromise = ai.live.connect({
                model: MODEL_ID,
                callbacks: {
                    onopen: () => {
                        console.log('Gemini Live Session Opened');
                        setIsConnected(true);
                        setError(null);
                        currentRetry = 0;

                        // CRITICAL: We do not send text/plain via sendRealtimeInput. 
                        // The model context is already seeded via systemInstruction.

                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            
                            let sum = 0;
                            for (let i = 0; i < inputData.length; i++) {
                                sum += inputData[i] * inputData[i];
                            }
                            const rms = Math.sqrt(sum / inputData.length);
                            setVolume(Math.min(1, rms * 10));

                            const pcmBlob = createPcmBlob(inputData);
                            sessionPromise.then((session: any) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.toolCall) {
                            for (const fc of message.toolCall.functionCalls) {
                                if (fc.name === 'check_architecture_compliance') {
                                    setIsProcessing(true);
                                    try {
                                        const { feature_intent, current_system_blueprint } = fc.args as any;
                                        const result = await validateFeatureCompliance(feature_intent, current_system_blueprint);
                                        
                                        if (result.is_conflict) {
                                            const severityMap: Record<number, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
                                                1: 'LOW', 2: 'LOW', 3: 'LOW', 4: 'MEDIUM', 5: 'MEDIUM', 
                                                6: 'MEDIUM', 7: 'HIGH', 8: 'HIGH', 9: 'CRITICAL', 10: 'CRITICAL'
                                            };

                                            onDriftReport({
                                                id: Math.random().toString(36).substr(2, 9),
                                                timestamp: Date.now(),
                                                title: "ARCH_VIOLATION_DETECTED",
                                                severity: severityMap[result.conflict_severity] || 'MEDIUM',
                                                component: result.affected_component || 'System',
                                                description: `Conflict with Feature: "${feature_intent}".`,
                                                suggestion: result.remediation_steps,
                                                confidence: result.confidence_score || 100
                                            });
                                        }

                                        sessionPromise.then(session => {
                                            session.sendToolResponse({
                                                functionResponses: {
                                                    id: fc.id,
                                                    name: fc.name,
                                                    response: { result: result }
                                                }
                                            });
                                        });
                                    } finally {
                                        setIsProcessing(false);
                                    }
                                }

                                if (fc.name === 'request_clarification') {
                                    const { ambiguity_reason, missing_info } = fc.args as any;
                                    onDriftReport({
                                        id: Math.random().toString(36).substr(2, 9),
                                        timestamp: Date.now(),
                                        title: "CLARIFICATION_REQ",
                                        severity: 'INFO',
                                        component: "Architectural Auditor",
                                        description: `Ambiguity detected: ${ambiguity_reason}`,
                                        suggestion: `PLEASE SPECIFY: ${missing_info}`,
                                        confidence: 0
                                    });

                                    sessionPromise.then(session => {
                                        session.sendToolResponse({
                                            functionResponses: {
                                                id: fc.id,
                                                name: fc.name,
                                                response: { result: "Logged. Please notify user via voice." }
                                            }
                                        });
                                    });
                                }
                            }
                        }

                        const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData && outputContextRef.current) {
                            setIsSpeaking(true);
                            const ctx = outputContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            
                            const audioBuffer = await decodeAudioData(base64ToBytes(audioData), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) setIsSpeaking(false);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => s.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setIsSpeaking(false);
                        }
                    },
                    onclose: () => {
                        setIsConnected(false);
                        setVolume(0);
                    },
                    onerror: (e) => {
                        console.error('Session error', e);
                        setError("WEBSOCKET_HANDSHAKE_FAILED");
                        setIsConnected(false);
                    }
                },
                config: {
                    // Must use Modality.AUDIO from @google/genai to fix line 222
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: getSystemInstruction(initialContext),
                    tools: [{ functionDeclarations: [complianceToolDeclaration, requestClarificationToolDeclaration] }]
                }
            });
            sessionPromiseRef.current = sessionPromise;

        } catch (err) {
            console.error("Connection Failed", err);
            cleanupAudio();

            if (currentRetry < MAX_RETRIES) {
                currentRetry++;
                setTimeout(attemptConnection, 500);
            } else {
                setError("WEBSOCKET_HANDSHAKE_FAILED");
                setIsConnected(false);
            }
        }
    };

    attemptConnection();
  }, [initialContext, onDriftReport, cleanupAudio]);

  const disconnect = useCallback(() => {
    cleanupAudio();
    setIsConnected(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setVolume(0);
    sessionPromiseRef.current = null;
  }, [cleanupAudio]);

  return { isConnected, isSpeaking, isProcessing, error, connect, disconnect, volume };
}
