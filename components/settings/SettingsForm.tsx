"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SettingsFormProps {
  userId: string;
  initialFullName: string;
  initialOrganization: string;
}

export function SettingsForm({
  userId,
  initialFullName,
  initialOrganization,
}: SettingsFormProps) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(initialFullName);
  const [organization, setOrganization] = useState(initialOrganization);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();

      // Update the profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), organization: organization.trim() })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Keep auth metadata in sync so Navbar initials update immediately
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim(), organization: organization.trim() },
      });

      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch {
      toast({
        title: "Save failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Priya Sharma"
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">
          Organization{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="organization"
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Axis NBFC, DSA Partners…"
          autoComplete="organization"
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
