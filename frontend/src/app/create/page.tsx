"use client";

import Layout from "@/components/Layout";
import MintAgentForm from "@/components/create_nft/MintAgentForm";
import { motion } from "framer-motion";

export default function CreatePage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-40 mb-3 block">
              The Ritual
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-ink mb-4 uppercase tracking-tighter">
              Create Agent
            </h1>
            <p className="text-lg text-ink-40 max-w-2xl mx-auto font-body-alt">
              Mint a unique AI entity with custom personality traits and knowledge.
            </p>
          </motion.div>

          <MintAgentForm />
        </div>
      </div>
    </Layout>
  );
}
