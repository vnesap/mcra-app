import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The teacher-configured countdown timer, polled every second. */
export function useTimer() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["timer"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTimer();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 1000,
  });
}

/** Configure the countdown timer duration (seconds). */
export function useSetTimer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (durationSec: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setTimer(durationSec);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["timer"] });
    },
  });
}
