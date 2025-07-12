import HelpDeskDialog from "@/components/dialogs/helpDeskFormDialog";
import { Separator } from "@/components/ui/separator";
import React from "react";

function page() {
  return (
    <div className="w-screen flex flex-col h-screen bg-slate-100">
      <div className="w-full p-4 border-b border-slate-300">
        <h1 className="font-bold text-xl">HelpDesk v1.0</h1>
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Issues</h2>
        <Separator />
      </div>
      <div className="flex-1 flex-col flex items-center justify-center">
        <div>
          <p>Experiencing issues?</p>
          <p>Start a report here and recieve the required assistance</p>
          <HelpDeskDialog />
        </div>
      </div>
    </div>
  );
}

export default page;
