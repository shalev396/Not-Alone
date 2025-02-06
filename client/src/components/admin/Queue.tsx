import { useState } from "react";
import { api } from "@/api/api";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

interface SignupRequest {
  _id: string;
  firstName: string;
  lastName: string;
  passport: string;
  email: string;
  phone: string;
  type:
    | "Soldier"
    | "Municipality"
    | "Donor"
    | "Organization"
    | "Business"
    | "Admin";
  approvalStatus: "pending" | "approved" | "denied";
  approvalDate?: Date;
  denialReason?: string;
  createdAt: string;
  updatedAt: string;
  is2FAEnabled: boolean;
}

const fetchSignupRequests = async () => {
  const response = await api.get("/users/pending");
  return response.data.users || [];
};

const QueueSkeleton = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Passport</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Submitted</TableHead>
        <TableHead>Updated</TableHead>
        <TableHead>Action</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-9 w-[100px]" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// const getStatusColor = (status: string) => {
//   switch (status) {
//     case "approved":
//       return "bg-green-500";
//     case "denied":
//       return "bg-red-500";
//     case "pending":
//       return "bg-yellow-500";
//     default:
//       return "bg-gray-500";
//   }
// };

export default function Queue() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt">("createdAt");
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [requestToDeny, setRequestToDeny] = useState<string | null>(null);

  const {
    data: requests = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["signupRequests"],
    queryFn: fetchSignupRequests,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 30,
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/users/approve/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signupRequests"] });
      setSelectedRequest(null);
    },
  });

  const denyMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.post(`/users/deny/${id}`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signupRequests"] });
      setSelectedRequest(null);
    },
  });

  const handleAccept = (id: string) => {
    acceptMutation.mutate(id);
  };

  const handleDeny = (id: string) => {
    setRequestToDeny(id);
    setDenyReason("");
    setShowDenyDialog(true);
  };

  const submitDenial = () => {
    if (requestToDeny && denyReason.trim()) {
      denyMutation.mutate({ id: requestToDeny, reason: denyReason });
      setShowDenyDialog(false);
      setRequestToDeny(null);
      setDenyReason("");
    }
  };

  const filteredAndSortedRequests = requests
    .filter(
      (request: SignupRequest) =>
        request.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort(
      (a: SignupRequest, b: SignupRequest) =>
        new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime()
    );

  if (isLoading) {
    return (
      <>
        <Navbar modes={"admin"} />
        <div className="container mx-auto py-10">
          <h1 className="text-2xl font-bold mb-6">Pending Users Queue</h1>
          <QueueSkeleton />
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-red-500 mb-4">{error.message}</div>}

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(value: "createdAt" | "updatedAt") => setSortBy(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Submitted Date</SelectItem>
            <SelectItem value="updatedAt">Last Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>2FA</TableHead>
              <TableHead>Passport</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRequests.map((request: SignupRequest) => (
              <TableRow key={request._id}>
                <TableCell className="font-medium">
                  {request.firstName} {request.lastName}
                </TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell className="capitalize">{request.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.approvalStatus === "pending"
                        ? "outline"
                        : "secondary"
                    }
                    className="capitalize"
                  >
                    {request.approvalStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={request.is2FAEnabled ? "default" : "destructive"}
                    className="capitalize"
                  >
                    {request.is2FAEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>{request.passport}</TableCell>
                <TableCell>{request.phone}</TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4">
        {filteredAndSortedRequests.map((request: SignupRequest) => (
          <div
            key={request._id}
            className="border rounded-lg p-4 space-y-4 bg-card"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="font-medium">
                  {request.firstName} {request.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {request.email}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(request.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "2-digit",
                  })}
                </div>
              </div>
              <Badge
                variant={
                  request.approvalStatus === "pending" ? "outline" : "secondary"
                }
                className="capitalize"
              >
                {request.approvalStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Type</div>
                <div className="capitalize">{request.type}</div>
              </div>
              <div>
                <div className="text-muted-foreground">2FA</div>
                <Badge
                  variant={request.is2FAEnabled ? "default" : "destructive"}
                  className="capitalize"
                >
                  {request.is2FAEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div>
                <div className="text-muted-foreground">Passport</div>
                <div>{request.passport}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Phone</div>
                <div>{request.phone}</div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedRequest(request)}
            >
              View Details
            </Button>
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Name</div>
                <div>
                  {selectedRequest.firstName} {selectedRequest.lastName}
                </div>
              </div>
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Email</div>
                <div>{selectedRequest.email}</div>
              </div>
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="capitalize">{selectedRequest.type}</div>
              </div>
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Status</div>
                <div>
                  <Badge
                    variant={
                      selectedRequest.approvalStatus === "pending"
                        ? "outline"
                        : "secondary"
                    }
                    className="capitalize"
                  >
                    {selectedRequest.approvalStatus}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">2FA Status</div>
                <div>
                  <Badge
                    variant={
                      selectedRequest.is2FAEnabled ? "default" : "destructive"
                    }
                    className="capitalize"
                  >
                    {selectedRequest.is2FAEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Passport</div>
                <div>{selectedRequest.passport}</div>
              </div>
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Phone</div>
                <div>{selectedRequest.phone}</div>
              </div>
              {selectedRequest.denialReason && (
                <div className="grid gap-1">
                  <div className="text-sm text-muted-foreground">
                    Denial Reason
                  </div>
                  <div>{selectedRequest.denialReason}</div>
                </div>
              )}
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">
                  Submitted On
                </div>
                <div>
                  {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </div>
              </div>
              {selectedRequest.approvalStatus === "pending" && (
                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    onClick={() => handleAccept(selectedRequest._id)}
                    className="w-full bg-primary"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleDeny(selectedRequest._id)}
                    variant="destructive"
                    className="w-full"
                  >
                    Deny
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDenyDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowDenyDialog(false);
            setRequestToDeny(null);
            setDenyReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Provide Denial Reason
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter reason for denial"
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDenyDialog(false);
                setRequestToDeny(null);
                setDenyReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitDenial}
              disabled={!denyReason.trim()}
            >
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
