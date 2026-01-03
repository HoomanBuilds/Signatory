"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function ChatAgentRedirect({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const router = useRouter();
  const { agentId } = use(params);

  useEffect(() => {
    // Generate a new session ID and redirect
    const newSessionId = uuidv4();
    router.replace(`/chat/${agentId}/${newSessionId}`);
  }, [agentId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Starting new chat session...</p>
      </div>
    </div>
  );
}
