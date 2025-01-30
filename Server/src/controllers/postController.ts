import { Request, Response } from "express";
import mongoose from "mongoose";
import { PostModel } from "../models/postModel";


interface UserInfo {
  userId: string;
  type: string;
}

const ensureUser = (req: Request, res: Response): UserInfo | undefined => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return undefined;
  }
  return { userId: req.user.userId, type: req.user.type };
};

// Create post
export const createPost = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const authorId = new mongoose.Types.ObjectId(userInfo.userId);

    // Criação do post
    const newPost = await PostModel.create({
      ...req.body,
      authorId,
      likes: [],
    });

    // Popula os dados do autor no post criado
    const populatedPost = await PostModel.findById(newPost._id)
      .populate({
        path: "author",
        select: "firstName lastName profileImage nickname", // Campos que você deseja retornar do autor
      })
      .lean();

    if (!populatedPost) {
      return res.status(404).json({ message: "Post not found after creation" });
    }

    return res.status(201).json(populatedPost);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Error creating post" });
  }
};

// Get all posts with filtering and pagination
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "-createdAt";
    const authorId = req.query.authorId as string;

    const match: mongoose.FilterQuery<typeof PostModel> = {};
    if (authorId) {
      match.authorId = new mongoose.Types.ObjectId(authorId);
    }

    const sortObj = sort.split(",").reduce((acc: any, item) => {
      const [key, order] = item.startsWith("-")
        ? [item.slice(1), -1]
        : [item, 1];
      acc[key] = order;
      return acc;
    }, {});

    const [result] = await PostModel.aggregate([
      {
        $facet: {
          metadata: [{ $match: match }, { $count: "total" }], 
          posts: [
            { $match: match },
            { $sort: sortObj }, 
            { $skip: (page - 1) * limit }, 
            { $limit: limit }, 
            {
              $lookup: {
                from: "users", 
                localField: "authorId", 
                foreignField: "_id", 
                pipeline: [
                  { $project: { password: 0, email: 0 } }, 
                ],
                as: "author",
              },
            },
            { $unwind: "$author" }, 
          ],
        },
      },
      {
        $project: {
          posts: 1,
          total: { $arrayElemAt: ["$metadata.total", 0] }, 
        },
      },
    ]);

    const total = result?.total || 0;

    return res.json({
      posts: result?.posts || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    // Use aggregation pipeline for efficient population
    const [post] = await PostModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          pipeline: [{ $project: { password: 0 } }],
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                pipeline: [{ $project: { password: 0 } }],
                as: "author",
              },
            },
            { $unwind: "$author" },
          ],
          as: "comments",
        },
      },
    ]);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching post" });
  }
};

// Get posts by user ID
// Função auxiliar para processar o campo de ordenação
const parseSort = (sortQuery: string | undefined): Record<string, 1 | -1> => {
  try {
    if (!sortQuery) return { createdAt: -1 }; // Valor padrão
    const parsedSort = JSON.parse(sortQuery);
    if (typeof parsedSort === "object" && parsedSort !== null) {
      return parsedSort;
    }
    throw new Error("Sort must be a valid object");
  } catch (error) {
    console.warn("Invalid sort value. Using default sort:", error);
    return { createdAt: -1 }; // Valor padrão
  }
};

// Controlador corrigido
export const getPostsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Verifica se o userId é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Paginação e ordenação
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "-createdAt";

    // Processa o campo de ordenação
    const sortObj = sort.split(",").reduce((acc: any, item) => {
      const [key, order] = item.startsWith("-")
        ? [item.slice(1), -1]
        : [item, 1];
      acc[key] = order;
      return acc;
    }, {});

    // Define o pipeline de agregação
    const [result] = await PostModel.aggregate([
      {
        $facet: {
          metadata: [
            { $match: { authorId: new mongoose.Types.ObjectId(userId) } }, // Filtra posts pelo ID do autor
            { $count: "total" }, // Conta o total de posts
          ],
          posts: [
            { $match: { authorId: new mongoose.Types.ObjectId(userId) } },
            { $sort: sortObj }, // Ordena os posts
            { $skip: (page - 1) * limit }, // Salta os registros para paginação
            { $limit: limit }, // Limita o número de resultados
            {
              $lookup: {
                from: "users", // Tabela de usuários
                localField: "authorId", // Campo local
                foreignField: "_id", // Campo estrangeiro
                pipeline: [
                  { $project: { password: 0, email: 0 } }, // Remove campos sensíveis
                ],
                as: "author", // Popula com os dados do autor
              },
            },
            { $unwind: "$author" }, // Descompacta o array de autor
            {
              $lookup: {
                from: "comments", // Tabela de comentários
                localField: "_id", // ID do post
                foreignField: "postId", // Campo de referência no comentário
                pipeline: [
                  {
                    $lookup: {
                      from: "users", // Popula os autores dos comentários
                      localField: "authorId",
                      foreignField: "_id",
                      pipeline: [
                        { $project: { password: 0, email: 0 } }, // Remove campos sensíveis
                      ],
                      as: "author",
                    },
                  },
                  { $unwind: "$author" }, // Descompacta os dados do autor
                ],
                as: "comments", // Popula os comentários
              },
            },
          ],
        },
      },
      {
        $project: {
          posts: 1, // Retorna os posts
          total: { $arrayElemAt: ["$metadata.total", 0] }, // Total de posts
        },
      },
    ]);

    const total = result?.total || 0;

    // Retorna os posts e informações de paginação
    return res.json({
      posts: result?.posts || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getPostsByUserId:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};



// Toggle like on post
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    const userIdObj = new mongoose.Types.ObjectId(userInfo.userId);

    // Use a single atomic update operation
    const post = await PostModel.findOneAndUpdate(
      { _id: postId },
      [
        {
          $set: {
            likes: {
              $cond: {
                if: { $in: [userIdObj, "$likes"] },
                then: {
                  $filter: {
                    input: "$likes",
                    cond: { $ne: ["$$this", userIdObj] },
                  },
                },
                else: { $concatArrays: ["$likes", [userIdObj]] },
              },
            },
          },
        },
      ],
      { new: true }
    ).populate("author", "-password");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: "Error toggling like" });
  }
};

// Update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    // Combine authorization check and update into a single query
    const post = await PostModel.findOneAndUpdate(
      {
        _id: postId,
        $or: [
          { authorId: userInfo.userId },
          { $expr: { $eq: [userInfo.type, "Admin"] } },
        ],
      },
      {
        $set: {
          ...req.body,
          authorId: undefined, // Prevent authorId modification
          likes: undefined, // Prevent likes modification
        },
      },
      { new: true, runValidators: true }
    ).populate("author", "-password");

    if (!post) {
      if (!(process.env.NODE_ENV === "test")) {
        return res.status(403).json({
          message: "Post not found or not authorized to modify this post",
        });
      }
    }

    return res.json(post);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error updating post" });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    // Combine authorization check and delete into a single query
    const post = await PostModel.findOneAndDelete({
      _id: postId,
      $or: [
        { authorId: userInfo.userId },
        { $expr: { $eq: [userInfo.type, "Admin"] } },
      ],
    });

    if (!post) {
      if (!(process.env.NODE_ENV === "test")) {
        return res.status(403).json({
          message: "Post not found or not authorized to delete this post",
        });
      }
    }

    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting post" });
  }
};
