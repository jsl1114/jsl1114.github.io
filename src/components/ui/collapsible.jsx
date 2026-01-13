import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

import { cn } from "@/lib/utils";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

const CollapsibleContent = ({ className, ...props }) => (
  <CollapsiblePrimitive.Content
    className={cn(
      "overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className,
    )}
    {...props}
  />
);

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
