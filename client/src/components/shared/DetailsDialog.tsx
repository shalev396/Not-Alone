import { Donation } from "@/types/Donation";

import { EatUp } from "@/types/EatUps";
import { posts } from "@/tenstack/query";
import { PostDialog } from "./dialogs/PostDialog";
import { DonationDialog } from "./dialogs/DonationDialog";
import { EatUpDialog } from "./dialogs/EatUpDialog";

interface DetailsDialogProps {
  donation?: Donation | null;
  eatup?: EatUp | null;
  type: string;
  post?: posts | null;
}

export function DetailsDialog({
  donation,
  post,
  eatup,
  type,
}: DetailsDialogProps) {
  if (type === "post") {
    return <PostDialog post={post || null} />;
  }

  if (type === "Donations") {
    return <DonationDialog donation={donation || null} />;
  }

  if (type === "EatUp") {
    return <EatUpDialog eatup={eatup || null} />;
  }

  // Handle Residences case or return null
  return null;
}
