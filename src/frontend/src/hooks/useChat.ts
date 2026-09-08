import { createActor } from "@/backend";
import type { FileRef } from "@/lib/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Live chat messages, polled for instant delivery. */
export function useChatMessages() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["chat"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listChatMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

/** Send a chat message, optionally with an attached file. */
export function useSendChatMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      text,
      file,
    }: {
      text: string;
      file: FileRef | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.sendChatMessage(text, file);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

/** Floating reaction events, polled for the whole class. */
export function useReactions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["reactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listReactions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

/** Send a floating reaction emoji. */
export function useSendReaction() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.sendReaction(symbol);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reactions"] });
    },
  });
}
