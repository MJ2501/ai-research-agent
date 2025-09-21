"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value ?? "");
  return (
    <div className="flex w-full max-w-xl items-center gap-2">
      <Input
        value={local}
        placeholder={placeholder}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange?.(e.target.value);
        }}
        onKeyDown={(e) => e.key === "Enter" && onSubmit?.()}
      />
      <Button onClick={onSubmit}>Search</Button>
    </div>
  );
}
