// components/CollapsibleInstructions.tsx

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface CollapsibleInstructionsProps {
  instructionsArray: { step: number; text: string }[];
  isInstructionsOpen: boolean;
  setIsInstructionsOpen: (open: boolean) => void;
}

export const CollapsibleInstructions = ({
  instructionsArray,
  isInstructionsOpen,
  setIsInstructionsOpen,
}: CollapsibleInstructionsProps) => (
  <Collapsible open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen}>
    <CollapsibleTrigger className="flex items-center justify-between w-full bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
      <span className="font-semibold text-sm">Instructions</span>
      <ChevronDown
        className={`h-5 w-5 transition-transform ${isInstructionsOpen ? "rotate-180" : ""}`}
      />
    </CollapsibleTrigger>

    <CollapsibleContent className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md text-sm text-muted-foreground space-y-2">
      {instructionsArray.length > 0 ? (
        instructionsArray.map((instruction, index) => (
          <p key={index}>
            <strong>Step {instruction.step}:</strong> {instruction.text}
          </p>
        ))
      ) : (
        <p>No instructions provided.</p>
      )}
    </CollapsibleContent>
  </Collapsible>
);
