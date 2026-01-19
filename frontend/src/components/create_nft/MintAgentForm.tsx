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

  // Form data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Personality traits
  const [tone, setTone] = useState("friendly");
  const [style, setStyle] = useState("conversational");
  const [role, setRole] = useState("assistant");
  const [knowledgeFocus, setKnowledgeFocus] = useState("general");
  const [backstory, setBackstory] = useState("");

  useEffect(() => {
    const handlePKPRegistration = async () => {
      if (isSuccess && receipt && address && !pkpRegistering && !pkpAddress) {
        setPkpRegistering(true);
        
        // ERC721 Transfer event signature
        const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
        let tokenId: number | null = null;
        
        for (const log of receipt.logs) {
          // Check for Transfer event (tokenId is in topics[3])
          if (log.topics && log.topics[0] === TRANSFER_TOPIC && log.topics.length >= 4) {
            try {
              const topic = log.topics[3];
              if (topic) {
                tokenId = parseInt(topic, 16);
                console.log("[PKP] Found Transfer event, tokenId:", tokenId);
                if (!isNaN(tokenId)) break;
              }
            } catch {
              continue;
            }
          }
        }

        if (tokenId) {
          console.log("[PKP] Registering PKP for token:", tokenId);
          const pkpAddr = await registerPKP(tokenId, address);
          if (pkpAddr) {
            setPkpAddress(pkpAddr);
          }
        } else {
          console.error("[PKP] Could not extract token ID from receipt");
        }
        setPkpRegistering(false);
      }
    };

    handlePKPRegistration();
  }, [isSuccess, receipt, address, pkpRegistering, pkpAddress, registerPKP]);

  // Handle avatar upload
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

  // Knowledge Base state
  const [kbFiles, setKbFiles] = useState<File[]>([]);
  const [kbUploading, setKbUploading] = useState(false);

  const handleKnowledgeBaseUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      setKbFiles(Array.from(e.target.files));
    }
  };

  // Mint agent
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
        <div className="glass-panel p-12 rounded-2xl text-center border border-emerald-500/20">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-emerald-300" />
          <h2 className="text-2xl font-bold text-emerald-200 mb-3">
            Connect Wallet to Create
          </h2>
          <p className="text-green-200/70">
            Connect your wallet to start minting AI agents
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-panel p-12 rounded-2xl text-center border border-emerald-500/20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center">
            <Check className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-200 mb-3">
            Agent Minted Successfully!
          </h2>
          <p className="text-green-200/70 mb-8">
            Your AI agent has been created and is now ready to use
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
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-lime-500 text-black font-bold rounded-xl hover:from-emerald-400 hover:to-lime-400 transition-all"
          >
            Create Another Agent
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
      <div className="glass-panel p-8 rounded-2xl border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
        <Stepper
          initialStep={1}
          onStepChange={(s) => setStep(s)}
          onFinalStepCompleted={handleMint}
          backButtonText={
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Back
            </div>
          }
          nextButtonText={
            <div className="flex items-center gap-2">
              Next: Personality
              <ArrowRight className="w-5 h-5" />
            </div>
          }
          finishButtonText={
            <div className="flex items-center gap-2">
              {uploading ? (
                <>Uploading to IPFS...</>
              ) : isPending || isConfirming ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Minting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Mint Agent NFT
                </>
              )}
            </div>
          }
          backButtonProps={{
            className: "px-6 py-4 glass-panel text-emerald-200 font-bold rounded-xl hover:bg-[#0e1518] transition-all border border-emerald-500/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 disabled:opacity-50 disabled:cursor-not-allowed",
            disabled: uploading || isPending || isConfirming || kbUploading
          }}
          nextButtonProps={{
            className: "px-6 py-4 bg-gradient-to-r from-emerald-500 to-lime-500 text-black font-bold rounded-xl hover:from-emerald-400 hover:to-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5",
            disabled: step === 1 ? (!name || !description || !avatarFile) : (uploading || isPending || isConfirming || kbUploading)
          }}
          stepCircleContainerClassName="mb-8"
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-emerald-200 mb-2">
                Basic Information
              </h2>
              <p className="text-green-200/70 text-sm">
                Define your AI agent's identity
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-emerald-200">
                Agent Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alpha Trader"
                className="w-full px-4 py-3 glass-panel rounded-xl text-emerald-200 placeholder-green-200/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all border border-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-emerald-200">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="An expert trading AI that analyzes market trends..."
                rows={3}
                className="w-full px-4 py-3 glass-panel rounded-xl text-emerald-200 placeholder-green-200/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all border border-emerald-500/20 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-emerald-200">
                Avatar Image
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="block w-full cursor-pointer"
                >
                  {avatarPreview ? (
                    <div className="aspect-square w-full max-w-sm mx-auto glass-panel rounded-xl border-2 border-emerald-500/30 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all overflow-hidden relative">
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-medium">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square w-full max-w-sm mx-auto flex flex-col items-center justify-center glass-panel rounded-xl border-2 border-dashed border-emerald-500/30 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5 transition-all duration-300">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-emerald-400" />
                      </div>
                      <p className="text-emerald-200 font-medium mb-1 group-hover:text-emerald-300 transition-colors">
                        Upload Avatar
                      </p>
                      <p className="text-green-200/50 text-sm">
                        PNG, JPG up to 10MB
                      </p>
                      <p className="text-green-200/50 text-xs mt-2">
                        Square images work best
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-emerald-200 mb-2">
                Personality Traits
              </h2>
              <p className="text-green-200/70 text-sm">
                Customize your agent's behavior
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-emerald-200">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 glass-panel rounded-xl text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all border border-emerald-500/20 cursor-pointer bg-[#0e1518]"
                  style={{ colorScheme: "dark" }}
                >
                  <option
                    value="friendly"
                    className="bg-[#0e1518] text-emerald-200"
                  >
                    Friendly
                  </option>
                  <option
                    value="professional"
                    className="bg-[#0e1518] text-emerald-200"
                  >
                    Professional
                  </option>
                  <option
                    value="energetic"
                    className="bg-[#0e1518] text-emerald-200"
                  >
                    Energetic
                  </option>
                  <option
                    value="calm"
                    className="bg-[#0e1518] text-emerald-200"
                  >
                    Calm
                  </option>
                  <option
                    value="humorous"
                    className="bg-[#0e1518] text-emerald-200"
                  >
                    Humorous
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-emerald-200">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-3 glass-panel rounded-xl text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all border border-emerald-500/20 cursor-pointer bg-[#0e1518]"
                  style={{ colorScheme: "dark" }}
                >
                  <option
                    value="conversational"
                    className="bg-[#0e1518] text-emerald-200"
                  >
                    Conversational
                  </option>
                  <option
                    value="formal"
                    className="bg-[#0e1518] text-emerald-200"
                  >
                    Formal
                  </option>
                  <option
                    value="casual"
                    className="bg-[#0e1518] text-emerald-200"
                  >
                    Casual
                  </option>
                  <option
                    value="technical"
                    className="bg-[#0e1518] text-emerald-200"
                  >
                    Technical
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-emerald-200">
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="assistant, teacher, companion..."
                className="w-full px-4 py-3 glass-panel rounded-xl text-emerald-200 placeholder-green-200/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all border border-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-emerald-200">
                Knowledge Focus
              </label>
              <input
                type="text"
                value={knowledgeFocus}
                onChange={(e) => setKnowledgeFocus(e.target.value)}
                placeholder="technology, art, science..."
                className="w-full px-4 py-3 glass-panel rounded-xl text-emerald-200 placeholder-green-200/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all border border-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-emerald-200">
                Backstory (Optional)
              </label>
              <textarea
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                placeholder="Tell the story of your AI agent..."
                rows={4}
                className="w-full px-4 py-3 glass-panel rounded-xl text-emerald-200 placeholder-green-200/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all border border-emerald-500/20 resize-none"
              />
            </div>

            <div className="border-t border-emerald-500/20 pt-6 mt-6">
              <h3 className="text-xl font-bold text-emerald-200 mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Knowledge Base
              </h3>
              <p className="text-green-200/70 text-sm mb-4">
                Upload documents (PDF, TXT, MD) to give your agent specific
                knowledge.
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
                  className={`block w-full cursor-pointer ${kbUploading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                >
                  <div className="w-full p-6 flex flex-col items-center justify-center glass-panel rounded-xl border-2 border-dashed border-emerald-500/30 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-emerald-200 font-medium mb-1 group-hover:text-emerald-300 transition-colors">
                      {kbUploading ? "Uploading..." : "Upload Documents"}
                    </p>
                    <p className="text-green-200/50 text-xs">
                      PDF, TXT, MD up to 10MB
                    </p>
                  </div>
                </label>
              </div>

              {/* File List */}
              {kbFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {kbFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 glass-panel rounded-lg border border-emerald-500/10"
                    >
                      <span className="text-sm text-emerald-200 truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-green-200/50">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400">
                    <Check className="w-3 h-3" />
                    <span>
                      {kbFiles.length} document{kbFiles.length > 1 ? "s" : ""}{" "}
                      ready for indexing
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Stepper>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
