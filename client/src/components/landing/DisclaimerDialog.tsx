import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function DisclaimerDialog() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Show dialog when component mounts
    setOpen(true);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Development Notice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-lg font-medium text-red-500">
            ⚠️ This website is currently under heavy development
          </div>

          <div className="text-foreground">
            Please be aware that all information, numbers, statistics, and
            features presented on this website are for demonstration purposes
            only and do not reflect real data or actual services.
          </div>

          <div className="border-l-4 border-yellow-400 pl-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded">
            <div className="text-sm text-muted-foreground">
              Legal Disclaimer: This is a development version of the website.
              All content, including but not limited to statistics, user counts,
              donation amounts, and service availability, is simulated and not
              intended for public use. We make no warranties or guarantees
              regarding the accuracy, reliability, or accessibility of the
              information presented. By continuing to use this website, you
              acknowledge that you understand this is a development environment
              and agree not to rely on any information or services provided
              herein for any purpose.
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="destructive" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Just Looking Around
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
