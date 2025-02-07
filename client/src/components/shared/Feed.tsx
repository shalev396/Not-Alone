"use strict";

import { PostFeed } from "./feeds/PostFeed";
import { DonationFeed } from "./feeds/DonationFeed";
import { EatUpFeed } from "./feeds/EatUpFeed";
import { ResidenceFeed } from "./feeds/ResidenceFeed";

export function Feed({ mode }: { mode: string }) {
  return (
    <div className="flex-1 p-6 bg-background text-foreground">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">
          Active {mode}
        </h2>

        {mode === "post" && <PostFeed />}
        {mode === "Donations" && <DonationFeed />}
        {mode === "EatUp" && <EatUpFeed />}
        {mode === "Residences" && <ResidenceFeed />}
      </div>
    </div>
  );
}
