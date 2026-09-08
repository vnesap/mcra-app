import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Principals currently online in a room, polled for live presence. */
export function useOnline(roomCode: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["online", roomCode],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOnline(roomCode);
    },
    enabled: !!actor && !isFetching && !!roomCode,
    refetchInterval: 3000,
  });
}

/** Join a room so the participant appears in the presence list. */
export function useJoinRoom() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomCode: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.joinRoom(roomCode);
    },
    onSuccess: (_data, roomCode) => {
      void queryClient.invalidateQueries({ queryKey: ["online", roomCode] });
    },
  });
}

/** Leave a room so the participant drops out of the presence list. */
export function useLeaveRoom() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomCode: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.leaveRoom(roomCode);
    },
    onSuccess: (_data, roomCode) => {
      void queryClient.invalidateQueries({ queryKey: ["online", roomCode] });
    },
  });
}
