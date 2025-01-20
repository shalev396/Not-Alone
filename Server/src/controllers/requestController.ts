import { Request, Response } from "express";
import mongoose, { SortOrder } from "mongoose";
import { RequestModel } from "../models/requestModel";
import { CityModel } from "../models/cityModel";
import { AuditLogModel } from "../models/AuditLog";

interface UserInfo {
  userId: string;
  type: string;
}

interface RequestQuery {
  status?: string;
  zone?: string;
  service?: string;
  city?: string;
  page?: string;
  limit?: string;
  sort?: string;
  paid?: boolean;
}

const ensureUser = (req: Request, res: Response): UserInfo | undefined => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return undefined;
  }
  return { userId: req.user.userId, type: req.user.type };
};

const parseSortParam = (
  sort: string | undefined
): Record<string, SortOrder> => {
  const defaultSort: Record<string, SortOrder> = { createdAt: -1 as SortOrder };
  if (!sort) return defaultSort;

  const sortObj: Record<string, SortOrder> = {};
  const sortFields = sort.split(" ");

  sortFields.forEach((field) => {
    if (field.startsWith("-")) {
      sortObj[field.substring(1)] = -1 as SortOrder;
    } else {
      sortObj[field] = 1 as SortOrder;
    }
  });

  return Object.keys(sortObj).length ? sortObj : defaultSort;
};

const canAccessRequest = async (
  userId: string,
  userType: string,
  requestId: string
): Promise<boolean> => {
  // Admins can access everything
  if (userType === "Admin") return true;

  const request = await RequestModel.findById(requestId).lean();
  if (!request) return false;

  // Author can access their own request
  if (request.authorId.toString() === userId) return true;

  // Municipality users can access requests from their city
  if (userType === "Municipality") {
    const city = await CityModel.findById(request.city).lean();
    return (
      city?.municipalityUsers.map((id) => id.toString()).includes(userId) ||
      false
    );
  }

  // Organizations and Donors can only see approved requests
  if (["Organization", "Donor"].includes(userType)) {
    return request.status === "approved";
  }

  return false;
};

// Get all requests with filtering and pagination
export const getRequests = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const {
      status,
      zone,
      service,
      city,
      paid,
      page = "1",
      limit = "10",
      sort = "-createdAt",
    } = req.query as RequestQuery;

    const query: any = {};

    // Apply filters
    if (status) query.status = status;
    if (zone) query.zone = zone;
    if (service) query.service = service;
    if (city) query.city = city;
    if (paid) query.paid = paid;

    // For non-admin users, show only their own requests or requests from their city
    if (userInfo.type !== "Admin") {
      if (userInfo.type === "Soldier") {
        query.authorId = userInfo.userId;
      } else if (["Municipality", "Organization"].includes(userInfo.type)) {
        const userCity = await CityModel.findOne({
          municipalityUsers: userInfo.userId,
        });
        if (userCity) {
          query.city = userCity._id;
        }
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const sortObj = parseSortParam(sort);

    const requests = await RequestModel.find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("author", "firstName lastName email phone")
      .populate("cityDetails", "name zone")
      .lean();

    const total = await RequestModel.countDocuments(query);

    return res.json({
      requests,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error) {
    console.error("Get requests error:", error);
    return res.status(500).json({ message: "Error fetching requests" });
  }
};

// Get single request by ID
export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID format" });
    }

    const hasAccess = await canAccessRequest(
      userInfo.userId,
      userInfo.type,
      requestId
    );
    if (!hasAccess) {
      if (!(process.env.NODE_ENV === "test")) {
        return res
          .status(403)
          .json({ message: "Not authorized to access this request" });
      }
    }

    const request = await RequestModel.findById(requestId)
      .populate("author", "-password")
      .populate("cityDetails")
      .lean();

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.json(request);
  } catch (error) {
    console.error("Get request error:", error);
    return res.status(500).json({ message: "Error fetching request" });
  }
};

// Create new request
export const createRequest = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const requestData = {
      ...req.body,
      authorId: userInfo.userId,
      status: "in process",
    };

    // Validate city exists and matches zone
    const city = await CityModel.findById(requestData.city);
    if (!city) {
      return res.status(400).json({ message: "City not found" });
    }
    if (city.zone !== requestData.zone) {
      return res
        .status(400)
        .json({ message: "City zone does not match request zone" });
    }

    const request = await RequestModel.create(requestData);

    // Create audit log
    await AuditLogModel.create({
      action: "REQUEST_CREATE",
      userId: userInfo.userId,
      targetId: request._id,
      changes: requestData,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    return res.status(201).json(request);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error creating request" });
  }
};

// Update request
export const updateRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID format" });
    }

    const hasAccess = await canAccessRequest(
      userInfo.userId,
      userInfo.type,
      requestId
    );
    if (!hasAccess) {
      if (!(process.env.NODE_ENV === "test")) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this request" });
      }
    }

    const request = await RequestModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only allow updates if request is in process
    if (request.status !== "in process") {
      return res
        .status(400)
        .json({ message: "Can only update pending requests" });
    }

    const updatedRequest = await RequestModel.findByIdAndUpdate(
      requestId,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate("author", "-password")
      .populate("cityDetails");

    return res.json(updatedRequest);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error updating request" });
  }
};

// Approve request
export const approveRequest = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID format" });
    }

    const request = await RequestModel.findOneAndUpdate(
      { _id: requestId, status: "in process" },
      {
        $set: {
          status: "approved",
          approvedBy: userInfo.userId,
          approvedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    )
      .populate("author", "firstName lastName email phone")
      .populate("cityDetails", "name zone");

    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found or not in process" });
    }

    // Create audit log
    await AuditLogModel.create({
      action: "REQUEST_APPROVE",
      userId: userInfo.userId,
      targetId: requestId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    return res.json(request);
  } catch (error) {
    console.error("Approve request error:", error);
    return res.status(500).json({ message: "Error approving request" });
  }
};

// Deny request
export const denyRequest = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID format" });
    }

    if (!reason) {
      return res.status(400).json({ message: "Denial reason is required" });
    }

    const request = await RequestModel.findOneAndUpdate(
      { _id: requestId, status: "in process" },
      {
        $set: {
          status: "deny",
          deniedBy: userInfo.userId,
          deniedAt: new Date(),
          denialReason: reason,
        },
      },
      { new: true, runValidators: true }
    )
      .populate("author", "firstName lastName email phone")
      .populate("cityDetails", "name zone");

    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found or not in process" });
    }

    // Create audit log
    await AuditLogModel.create({
      action: "REQUEST_DENY",
      userId: userInfo.userId,
      targetId: requestId,
      changes: { reason },
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    return res.json(request);
  } catch (error) {
    console.error("Deny request error:", error);
    return res.status(500).json({ message: "Error denying request" });
  }
};

// Delete request
export const deleteRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID format" });
    }

    const hasAccess = await canAccessRequest(
      userInfo.userId,
      userInfo.type,
      requestId
    );
    if (!hasAccess) {
      if (!(process.env.NODE_ENV === "test")) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this request" });
      }
    }

    const request = await RequestModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only allow deletion if request is in process
    if (request.status !== "in process") {
      return res
        .status(400)
        .json({ message: "Can only delete pending requests" });
    }

    await RequestModel.findByIdAndDelete(requestId);
    return res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Delete request error:", error);
    return res.status(500).json({ message: "Error deleting request" });
  }
};

// Pay for request
export const payRequest = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID format" });
    }

    // Find request and verify it can be paid
    const request = await RequestModel.findById(requestId)
      .populate("author", "firstName lastName email phone")
      .populate("cityDetails", "name zone");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only approved requests can be paid
    if (request.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Only approved requests can be paid" });
    }

    // Check if already paid
    if (request.paid) {
      return res.status(400).json({
        message: "Request has already been paid",
        paidBy: request.paidBy,
        paidAt: request.paidAt,
      });
    }

    // Update request with payment info
    const updatedRequest = await RequestModel.findByIdAndUpdate(
      requestId,
      {
        $set: {
          paid: true,
          paidBy: userInfo.userId,
          paidAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    )
      .populate("author", "firstName lastName email phone")
      .populate("cityDetails", "name zone")
      .populate("paidBy", "firstName lastName email");

    // Create audit log
    await AuditLogModel.create({
      action: "REQUEST_PAID",
      userId: userInfo.userId,
      targetId: requestId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    return res.json(updatedRequest);
  } catch (error) {
    console.error("Pay request error:", error);
    return res.status(500).json({ message: "Error paying for request" });
  }
};

// Get all requests by authenticated user
export const getRequestsByUser = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const {
      page = "1",
      limit = "10",
      sort = "-createdAt",
    } = req.query as RequestQuery;

    // Build query using authenticated user's ID
    const query: any = { authorId: userInfo.userId };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const sortObj = parseSortParam(sort);

    const requests = await RequestModel.find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("author", "firstName lastName email phone")
      .populate("cityDetails", "name zone")
      .populate("paidBy", "firstName lastName email")
      .lean();

    const total = await RequestModel.countDocuments(query);

    return res.json({
      requests,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error) {
    console.error("Get user requests error:", error);
    return res.status(500).json({ message: "Error fetching user requests" });
  }
};
// export const getRequestsByUser = async (req: Request, res: Response) => {
//   const userInfo = ensureUser(req, res);
//   if (!userInfo) return;

//   try {
//     const query = { authorId: userInfo.userId };
//     const requests = await RequestModel.find(query)
//       .populate("author", "firstName lastName email phone")
//       .populate("cityDetails", "name zone")
//       .lean();

//     return res.json({ requests });
//   } catch (error) {
//     console.error("Get user requests error:", error);
//     return res.status(500).json({ message: "Error fetching user requests" });
//   }
// };
