import { createActor } from "@/backend";
import type { ClassroomDuration, ClassroomId } from "@/lib/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Chronological list of classrooms, polled for live presence counts. */
export function useClassrooms() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listClassrooms();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

/** Search classrooms by keyword and/or date (nanosecond timestamp). */
export function useSearchClassrooms(keyword: string, date: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["classrooms", "search", keyword, date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchClassrooms(keyword, date);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Schedule a new classroom with a title and duration. */
export function useCreateClassroom() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      duration,
    }: {
      title: string;
      duration: ClassroomDuration;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createClassroom(title, duration);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}

/** Delete a classroom from the lobby. */
export function useDeleteClassroom() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ClassroomId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteClassroom(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}

/** Resolve the shareable room link for a classroom. */
export function useRoomLink(id: ClassroomId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["roomLink", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getRoomLink(id);
    },
    enabled: !!actor && !isFetching,
  });
}
