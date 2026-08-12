"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubredditPicker } from "@/components/onboarding/subreddit-picker";
import { TagInput } from "@/components/tag-input";
import type { Project } from "@/lib/types";

const HOURS = Array.from({ length: 24 }, (_, h) => h);

export function ProjectSettingsForm({ project }: { project: Project }) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [subreddits, setSubreddits] = useState(project.subreddits);
  const [keywords, setKeywords] = useState(project.keywords);
  const [frequency, setFrequency] = useState(project.frequency);
  const [deliveryHour, setDeliveryHour] = useState(project.deliveryHour);
  const [paused, setPaused] = useState(project.paused);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast.success("Project settings saved", {
      description: "Demo build — changes aren't persisted after a refresh.",
    });
  }

  async function handleDelete() {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 500));
    setDeleting(false);
    toast("Project deleted", { description: "Demo build — nothing was actually removed." });
    router.push("/dashboard");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Basic project details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="settings-name">Project name</Label>
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Tracked subreddits</Label>
            <SubredditPicker value={subreddits} onChange={setSubreddits} />
          </div>

          <div className="space-y-1.5">
            <Label>Tracked keywords</Label>
            <TagInput value={keywords} onChange={setKeywords} placeholder="Add a keyword…" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Digest delivery</CardTitle>
          <CardDescription>When and how often you get emailed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => v && setFrequency(v as Project["frequency"])}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(v: Project["frequency"]) => (v === "DAILY" ? "Daily" : "Twice daily")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="TWICE_DAILY">Twice daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Delivery time</Label>
              <Select value={String(deliveryHour)} onValueChange={(v) => v && setDeliveryHour(Number(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => `${v.padStart(2, "0")}:00`}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {h.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Pause this project</p>
              <p className="text-xs text-muted-foreground">Stops scanning and digest emails until resumed.</p>
            </div>
            <Switch checked={paused} onCheckedChange={setPaused} aria-label="Pause project" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
          <CardDescription>Deleting a project removes its leads and digest history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-1.5">
                <Trash2 className="size-4" />
                Delete project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete &ldquo;{project.name}&rdquo;?</DialogTitle>
                <DialogDescription>
                  This permanently deletes the project, its tracked leads, and digest history. This
                  can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-1.5">
                  {deleting && <Loader2 className="size-4 animate-spin" />}
                  Delete permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
