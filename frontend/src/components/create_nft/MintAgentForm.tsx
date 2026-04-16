"use client";

import { useState, useEffect } from "react";
import { Upload, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import {
  uploadAgentAvatar,
  createAgentMetadata,
  PersonalityTraits,
} from "@/lib/agentMetadata";
import { useMintAgent } from "@/hooks/useAgentContract";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import Stepper from "./Stepper";

export default function MintAgentForm() {
  const { address, isConnected } = useAccount();
  const { mintAgent, isPending, isConfirming, isSuccess, receipt, registerPKP } = useMintAgent();

  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pkpRegistering, setPkpRegistering] = useState(false);
  const [pkpAddress, setPkpAddress] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [tone, setTone] = useState("friendly");
  const [style, setStyle] = useState("conversational");
  const [role, setRole] = useState("assistant");
  const [knowledgeFocus, setKnowledgeFocus] = useState("general");
  const [backstory, setBackstory] = useState("");

  useEffect(() => {
    const handlePKPRegistration = async () => {
      if (isSuccess && receipt && address && !pkpRegistering && !pkpAddress) {
        setPkpRegistering(true);

        const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
        let tokenId: number | null = null;

        for (const log of receipt.logs) {
          if (log.topics && log.topics[0] === TRANSFER_TOPIC && log.topics.length >= 4) {
            try {
              const topic = log.topics[3];
              if (topic) {
                tokenId = parseInt(topic, 16);
                if (!isNaN(tokenId)) break;
              }
            } catch {
              continue;
            }
          }
        }

        if (tokenId) {
          const pkpAddr = await registerPKP(tokenId, address);
          if (pkpAddr) {
            setPkpAddress(pkpAddr);
          }
        }
        setPkpRegistering(false);
      }
    };

    handlePKPRegistration();
  }, [isSuccess, receipt, address, pkpRegistering, pkpAddress, registerPKP]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [kbFiles, setKbFiles] = useState<File[]>([]);
  const [kbUploading, setKbUploading] = useState(false);

  const handleKnowledgeBaseUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      setKbFiles(Array.from(e.target.files));
    }
  };

  const handleMint = async () => {
    if (!avatarFile) {
      setError("Please upload an avatar");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const avatarHash = await uploadAgentAvatar(avatarFile);

      let knowledgeBaseId: string | undefined;
      if (kbFiles.length > 0) {
        setKbUploading(true);
        const { v4: uuidv4 } = require("uuid");
        knowledgeBaseId = uuidv4();

        const formData = new FormData();
        formData.append("knowledgeBaseId", knowledgeBaseId!);
        kbFiles.forEach((file) => formData.append("files", file));

        const response = await fetch("/api/knowledge-base/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload knowledge base documents");
        }
        setKbUploading(false);
      }

      const personality: PersonalityTraits = {
        tone,
        style,
        role,
        knowledge_focus: [knowledgeFocus],
        response_pattern: style,
        likes: [],
        dislikes: [],
        backstory,
        example_phrases: [],
      };

      const { metadataHash, metadataUri } = await createAgentMetadata(
        name,
        description,
        avatarHash,
        personality,
        knowledgeBaseId
      );

      setUploading(false);

      await mintAgent(name, metadataUri, metadataHash, parseEther("0.01"));
    } catch (err: any) {
      console.error("Minting error:", err);
      setError(err.message || "Failed to mint agent");
      setUploading(false);
      setKbUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border border-border p-12 bg-secondary text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-foreground" />
          <h2 className="text-2xl font-bold text-foreground mb-3 uppercase tracking-wide">
            Connect Wallet
          </h2>
          <p className="text-muted-foreground">
           to start minting AI agents
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border border-border p-12 bg-secondary text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary flex items-center justify-center">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground mb-3 uppercase tracking-wide">
            Agent Minted!
          </h2>
          <p className="text-muted-foreground mb-8">
            Your AI agent has been created and is ready.
          </p>
          <button
            onClick={() => {
              setStep(1);
              setName("");
              setDescription("");
              setAvatarFile(null);
              setAvatarPreview("");
              setBackstory("");
            }}
            className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  const inputClasses = "w-full px-4 py-4 bg-secondary text-foreground placeholder-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-neon/50 border border-border focus:border-neon/30 transition-all font-mono";
  const labelClasses = "block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground";

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
      <div className="border border-border bg-card p-8">
        <Stepper
          initialStep={1}
          onStepChange={(s) => setStep(s)}
          onFinalStepCompleted={handleMint}
          backButtonText={
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              BACK
            </div>
          }
          nextButtonText={
            <div className="flex items-center gap-2">
              NEXT
              <ArrowRight className="w-4 h-4" />
            </div>
          }
          finishButtonText={
            <div className="flex items-center gap-2">
              {uploading ? (
                <>UPLOADING...</>
              ) : isPending || isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  MINTING...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  MINT AGENT (0.01 TCRO)
                </>
              )}
            </div>
          }
          backButtonProps={{
            className: "px-6 py-4 bg-transparent text-muted-foreground font-bold uppercase tracking-wider hover:text-foreground transition-all border border-border hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed",
            disabled: uploading || isPending || isConfirming || kbUploading
          }}
          nextButtonProps={{
            className: "px-6 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
            disabled: step === 1 ? (!name || !description || !avatarFile) : (uploading || isPending || isConfirming || kbUploading)
          }}
          stepCircleContainerClassName="mb-12"
        >
          {/* Step 1: Identity */}
          <div className="space-y-8">
            <div className="border-b border-border pb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2 uppercase tracking-wide">
                1. Identity
              </h2>
              <p className="text-muted-foreground text-sm">
                Define the core identity of your AI.
              </p>
            </div>

            <div>
              <label className={labelClasses}>Agent Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: ALPHA TRADER"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this agent do?"
                rows={3}
                className={`${inputClasses} resize-none`}
              />
            </div>

            <div>
              <label className={labelClasses}>Avatar</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="block w-full cursor-pointer">
                  {avatarPreview ? (
                    <div className="aspect-square w-full max-w-sm mx-auto bg-secondary border border-border group-hover:border-foreground/30 transition-all overflow-hidden relative">
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-foreground font-bold uppercase">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square w-full max-w-sm mx-auto flex flex-col items-center justify-center bg-secondary border border-dashed border-border group-hover:border-foreground/30 transition-all duration-300">
                      <div className="w-16 h-16 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <p className="text-foreground font-bold uppercase tracking-wider mb-1">
                        Upload Image
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Square format
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Step 2: Personality */}
          <div className="space-y-8">
            <div className="border-b border-border pb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2 uppercase tracking-wide">
                2. Personality
              </h2>
              <p className="text-muted-foreground text-sm">
                Shape the behavior and knowledge.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={`${inputClasses} appearance-none cursor-pointer uppercase text-sm`}
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="energetic">Energetic</option>
                  <option value="calm">Calm</option>
                  <option value="humorous">Humorous</option>
                </select>
              </div>

              <div>
                <label className={labelClasses}>Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className={`${inputClasses} appearance-none cursor-pointer uppercase text-sm`}
                >
                  <option value="conversational">Conversational</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClasses}>Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: ASSISTANT"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Knowledge Focus</label>
              <input
                type="text"
                value={knowledgeFocus}
                onChange={(e) => setKnowledgeFocus(e.target.value)}
                placeholder="Ex: CRYPTO, DEFI"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Backstory (Optional)</label>
              <textarea
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                placeholder="Origin story..."
                rows={4}
                className={`${inputClasses} resize-none`}
              />
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 uppercase tracking-wide">
                <Upload className="w-5 h-5" />
                Knowledge Base
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Upload documents to train your agent.
              </p>

              <div className="relative group">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
                  onChange={handleKnowledgeBaseUpload}
                  className="hidden"
                  id="kb-upload"
                  disabled={kbUploading}
                />
                <label
                  htmlFor="kb-upload"
                  className={`block w-full cursor-pointer ${kbUploading ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <div className="w-full p-6 flex flex-col items-center justify-center bg-secondary border border-dashed border-border group-hover:border-foreground/30 transition-all duration-300">
                    <div className="w-12 h-12 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <p className="text-foreground font-bold uppercase tracking-wider mb-1">
                      {kbUploading ? "UPLOADING..." : "UPLOAD DOCS"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      PDF, TXT, MD
                    </p>
                  </div>
                </label>
              </div>

              {kbFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {kbFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-secondary border border-border"
                    >
                      <span className="text-sm text-foreground/80 truncate max-w-[200px] font-mono">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2 text-xs text-foreground font-bold uppercase">
                    <Check className="w-3 h-3" />
                    <span>
                      {kbFiles.length} document{kbFiles.length > 1 ? "s" : ""}{" "}
                      ready
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Stepper>

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30">
            <p className="text-destructive text-sm font-bold uppercase">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
