"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSubmitResearch } from "@/lib/hooks/useSubmitResearch";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  topic: z
    .string()
    .min(3, "Please enter at least 3 characters")
    .max(200, "Keep it under 200 characters"),
  notes: z.string().max(500).optional(),
});

export function ResearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { mutateAsync, isPending } = useSubmitResearch();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { topic: "", notes: "" },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    const res = await mutateAsync({ topic: values.topic, notes: values.notes });
    if (res?.id) {
      router.push(`/(dashboard)/research/${res.id}`);
    } else {
      router.push("/(dashboard)/research");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Topic</label>
        <Input
          placeholder="e.g. Impact of quantum computing on cryptography"
          {...form.register("topic")}
        />
        {form.formState.errors.topic && (
          <p className="text-xs text-destructive">
            {form.formState.errors.topic.message}
          </p>
        )}
      </div>
      {!compact && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (optional)</label>
          <Textarea
            rows={4}
            placeholder="Add context or constraints"
            {...form.register("notes")}
          />
          {form.formState.errors.notes && (
            <p className="text-xs text-destructive">
              {form.formState.errors.notes.message}
            </p>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Start Research"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => form.reset()}>
          Reset
        </Button>
      </div>
    </form>
  );
}
