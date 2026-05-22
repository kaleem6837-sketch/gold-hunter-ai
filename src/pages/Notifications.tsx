import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function Notifications() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      <Card className="p-10 text-center border-dashed border-border/60 bg-card/60">
        <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">You're all caught up. New signal alerts will appear here.</p>
      </Card>
    </div>
  );
}