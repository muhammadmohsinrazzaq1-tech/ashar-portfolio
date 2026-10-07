"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Small client trigger for the resume page's print action. */
export default function PrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      Print / Save as PDF
    </Button>
  );
}
