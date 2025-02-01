import { useEffect, useState } from "react";
import { api } from "@/api/api";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-500";
    case "denied":
      return "bg-red-500";
    case "pending":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

export default function AdminQueue() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt">("createdAt");

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
    const reason = window.prompt("Please provide a reason for denial:");
    if (reason) {
      denyMutation.mutate({ id, reason });
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
    <>
      <Navbar modes={"admin"} />
      <div className="container mx-auto py-4">
        <h1 className="text-2xl font-bold mb-6">Pending Users Queue</h1>
        {error && <div className="text-red-500 mb-4">{error.message}</div>}

        <div className="flex items-center justify-center gap-4 mb-4">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <Select
            value={sortBy}
            onValueChange={(value: "createdAt" | "updatedAt") =>
              setSortBy(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Submitted Date</SelectItem>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isMobile ? (
          <Accordion type="single" collapsible>
            {filteredAndSortedRequests.map((request: SignupRequest) => (
              <AccordionItem
                key={request._id}
                value={request._id}
                className="mb-4"
              >
                <AccordionTrigger className="flex justify-between px-4 py-2 text-left bg-gray-800 rounded-lg">
                  <span>
                    {request.firstName} {request.lastName}
                  </span>
                  <Badge className={getStatusColor(request.approvalStatus)}>
                    {request.approvalStatus}
                  </Badge>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 bg-gray-900 rounded-lg space-y-2">
                    <p>
                      <strong>Email:</strong> {request.email}
                    </p>
                    <p>
                      <strong>Type:</strong> {request.type}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge className={getStatusColor(request.approvalStatus)}>
                        {request.approvalStatus}
                      </Badge>
                    </p>
                    <Button
                      onClick={() => setSelectedRequest(request)}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
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
              {filteredAndSortedRequests.map((request: SignupRequest) => (
                <TableRow key={request._id}>
                  <TableCell>
                    {request.firstName} {request.lastName}
                  </TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.approvalStatus)}>
                      {request.approvalStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.passport}</TableCell>
                  <TableCell>{request.phone}</TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(request.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRequest(request)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <p>
                <strong>Name:</strong> {selectedRequest.firstName}{" "}
                {selectedRequest.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedRequest.email}
              </p>
              <p>
                <strong>Type:</strong> {selectedRequest.type}
              </p>
              <p>
                <strong>Passport:</strong> {selectedRequest.passport}
              </p>
              <p>
                <strong>Phone:</strong> {selectedRequest.phone}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge
                  className={getStatusColor(selectedRequest.approvalStatus)}
                >
                  {selectedRequest.approvalStatus}
                </Badge>
              </p>
              {selectedRequest.denialReason && (
                <p>
                  <strong>Denial Reason:</strong> {selectedRequest.denialReason}
                </p>
              )}
              <p>
                <strong>Submitted On:</strong>{" "}
                {new Date(selectedRequest.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(selectedRequest.updatedAt).toLocaleDateString()}
              </p>
              {selectedRequest.approvalStatus === "pending" && (
                <>
                  <Button
                    onClick={() => handleAccept(selectedRequest._id)}
                    className="w-full"
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
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
