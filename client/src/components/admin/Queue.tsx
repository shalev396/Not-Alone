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
import {
  Search,
  SortAsc,
  User2,
  Mail,
  UserCog,
  ShieldCheck,
  KeyRound,
  CreditCard,
  Phone,
  Calendar,
  AlertCircle,
} from "lucide-react";

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

// Add a helper function for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

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
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(value: "createdAt" | "updatedAt") => setSortBy(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SortAsc className="mr-2 h-4 w-4 text-muted-foreground" />
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
              <TableHead>
                <div className="flex items-center justify-center gap-2">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                  Name
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-2">
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                  Type
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Status
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  2FA
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Passport
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Submitted
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center gap-2">
                  Actions
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRequests.map((request: SignupRequest) => (
              <TableRow key={request._id}>
                <TableCell className="text-center">
                  {request.firstName} {request.lastName}
                </TableCell>
                <TableCell className="text-center">{request.email}</TableCell>
                <TableCell className="text-center capitalize">
                  {request.type}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
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
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Badge
                      variant={request.is2FAEnabled ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {request.is2FAEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {request.passport}
                </TableCell>
                <TableCell className="text-center">{request.phone}</TableCell>
                <TableCell className="text-center">
                  {formatDate(request.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      View Details
                    </Button>
                  </div>
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
                  {formatDate(request.createdAt)}
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
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary bg-clip-text text-transparent">
                User Details
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                <User2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary/80 mb-2" />
                <h2 className="text-lg sm:text-xl font-semibold text-center">
                  {selectedRequest.firstName} {selectedRequest.lastName}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground capitalize text-center">
                  {selectedRequest.type} Account
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium text-sm sm:text-base break-all">
                    {selectedRequest.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    Status
                  </div>
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

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <KeyRound className="h-4 w-4" />
                    2FA Status
                  </div>
                  <Badge
                    variant={
                      selectedRequest.is2FAEnabled ? "default" : "destructive"
                    }
                    className="capitalize"
                  >
                    {selectedRequest.is2FAEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    Passport
                  </div>
                  <p className="font-medium text-sm sm:text-base">
                    {selectedRequest.passport}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <p className="font-medium text-sm sm:text-base">
                    {selectedRequest.phone}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Submitted On
                  </div>
                  <p className="font-medium text-sm sm:text-base">
                    {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>
              </div>

              {selectedRequest.denialReason && (
                <div className="space-y-1 p-2 sm:p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Denial Reason
                  </div>
                  <p className="text-destructive text-sm sm:text-base">
                    {selectedRequest.denialReason}
                  </p>
                </div>
              )}

              {selectedRequest.approvalStatus === "pending" && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                  <Button
                    onClick={() => handleAccept(selectedRequest._id)}
                    className="bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleDeny(selectedRequest._id)}
                    variant="destructive"
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
