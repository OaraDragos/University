import express from "express";
import cors from "cors";
import { PrismaClient, Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: "1mb" }));

function toAgeRangeDb(value) {
  const map = {
    "18-24": "RANGE_18_24",
    "24-30": "RANGE_24_30",
    "30-40": "RANGE_30_40",
    "40-50": "RANGE_40_50",
    "50+": "RANGE_50_PLUS",
  };
  return map[value] || null;
}

function fromAgeRangeDb(value) {
  const map = {
    RANGE_18_24: "18-24",
    RANGE_24_30: "24-30",
    RANGE_30_40: "30-40",
    RANGE_40_50: "40-50",
    RANGE_50_PLUS: "50+",
  };
  return map[value] || value;
}

function makeShareCode() {
  return randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
}

function normalizePage(raw, fallback = 1) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function normalizeLimit(raw, fallback = 10, max = 100) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

function paginateMeta(page, limit, totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    page: Math.min(page, totalPages),
    limit,
    totalItems,
    totalPages,
  };
}

function parseMoney(value, field = "price") {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    const err = new Error(`${field} must be a non-negative number`);
    err.status = 400;
    throw err;
  }
  return new Prisma.Decimal(n.toFixed(2));
}

async function uniqueShareCode() {
  for (let i = 0; i < 25; i += 1) {
    const code = makeShareCode();
    const exists = await prisma.group.findUnique({ where: { shareCode: code } });
    if (!exists) return code;
  }
  throw Object.assign(new Error("Could not generate unique share code"), { status: 500 });
}

function mapMember(member) {
  return {
    id: member.id,
    name: member.name,
    gender: member.gender,
    ageRange: fromAgeRangeDb(member.ageRange),
    drinkLevel: member.drinkLevel,
    foodAppetite: member.foodAppetite,
  };
}

function mapProduct(product) {
  return {
    id: product.id,
    productName: product.productName,
    supermarket: product.supermarket,
    price: Number(product.price),
    quantity: product.quantity ?? undefined,
    unit: product.unit ?? undefined,
    category: product.category,
    photo: product.photo ?? undefined,
    claimedBy: product.claimedById ?? undefined,
    addedBy: product.addedById,
    addedByName: product.addedBy?.name || "",
    votes: {
      thumbsUp: product.votes.filter((v) => v.upVoterId).map((v) => v.upVoterId),
      thumbsDown: product.votes.filter((v) => v.downVoterId).map((v) => v.downVoterId),
    },
  };
}

function mapGroup(group) {
  return {
    id: group.id,
    name: group.name,
    shareCode: group.shareCode,
    joinPassword: group.joinPassword ?? undefined,
    location: {
      lat: group.locationLat,
      lng: group.locationLng,
      address: group.locationAddr,
    },
    cabinDetails: group.cabinDetails,
    createdAt: group.createdAt.toISOString(),
    members: (group.members || []).map(mapMember),
    products: (group.products || []).map(mapProduct),
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/groups", async (req, res, next) => {
  try {
    const { name, joinPassword, location, cabinDetails } = req.body || {};
    if (!name || String(name).trim().length < 3)
      throw Object.assign(new Error("name must be at least 3 chars"), { status: 400 });
    if (!joinPassword || String(joinPassword).trim().length < 4)
      throw Object.assign(new Error("joinPassword must be at least 4 chars"), { status: 400 });
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number" || !location.address) {
      throw Object.assign(new Error("location is invalid"), { status: 400 });
    }
    if (!cabinDetails || String(cabinDetails).trim().length < 3)
      throw Object.assign(new Error("cabinDetails must be at least 3 chars"), { status: 400 });

    const shareCode = await uniqueShareCode();

    const created = await prisma.group.create({
      data: {
        name: String(name).trim(),
        shareCode,
        joinPassword: String(joinPassword).trim(),
        locationLat: location.lat,
        locationLng: location.lng,
        locationAddr: String(location.address).trim(),
        cabinDetails: String(cabinDetails).trim(),
      },
      include: {
        members: true,
        products: {
          include: { addedBy: true, votes: true },
        },
      },
    });

    res.status(201).json(mapGroup(created));
  } catch (error) {
    next(error);
  }
});

app.get("/api/groups", async (req, res, next) => {
  try {
    const page = normalizePage(req.query.page, 1);
    const limit = normalizeLimit(req.query.limit, 5, 50);
    const skip = (page - 1) * limit;

    const [totalItems, data] = await Promise.all([
      prisma.group.count(),
      prisma.group.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          members: true,
          products: { include: { addedBy: true, votes: true } },
        },
      }),
    ]);

    const meta = paginateMeta(page, limit, totalItems);
    res.json({ ...meta, data: data.map(mapGroup) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/groups/:groupId", async (req, res, next) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.groupId },
      include: {
        members: true,
        products: { include: { addedBy: true, votes: true } },
      },
    });
    if (!group) throw Object.assign(new Error("Group not found"), { status: 404 });
    res.json(mapGroup(group));
  } catch (error) {
    next(error);
  }
});

app.put("/api/groups/:groupId", async (req, res, next) => {
  try {
    const existing = await prisma.group.findUnique({ where: { id: req.params.groupId } });
    if (!existing) throw Object.assign(new Error("Group not found"), { status: 404 });

    const payload = req.body || {};
    const data = {};
    if (payload.name !== undefined) {
      if (!String(payload.name).trim() || String(payload.name).trim().length < 3)
        throw Object.assign(new Error("name must be at least 3 chars"), { status: 400 });
      data.name = String(payload.name).trim();
    }
    if (payload.joinPassword !== undefined) {
      if (String(payload.joinPassword).trim().length < 4)
        throw Object.assign(new Error("joinPassword must be at least 4 chars"), { status: 400 });
      data.joinPassword = String(payload.joinPassword).trim();
    }
    if (payload.cabinDetails !== undefined) {
      if (String(payload.cabinDetails).trim().length < 3)
        throw Object.assign(new Error("cabinDetails must be at least 3 chars"), { status: 400 });
      data.cabinDetails = String(payload.cabinDetails).trim();
    }
    if (payload.location !== undefined) {
      if (payload.location.lat !== undefined) data.locationLat = Number(payload.location.lat);
      if (payload.location.lng !== undefined) data.locationLng = Number(payload.location.lng);
      if (payload.location.address !== undefined) data.locationAddr = String(payload.location.address).trim();
    }

    const updated = await prisma.group.update({
      where: { id: req.params.groupId },
      data,
      include: {
        members: true,
        products: { include: { addedBy: true, votes: true } },
      },
    });

    res.json(mapGroup(updated));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/groups/:groupId", async (req, res, next) => {
  try {
    const deleted = await prisma.group.delete({
      where: { id: req.params.groupId },
      include: {
        members: true,
        products: { include: { addedBy: true, votes: true } },
      },
    });
    res.json(mapGroup(deleted));
  } catch (error) {
    if (error?.code === "P2025") return next(Object.assign(new Error("Group not found"), { status: 404 }));
    return next(error);
  }
});

app.post("/api/groups/join", async (req, res, next) => {
  try {
    const shareCode = String(req.body?.shareCode || "").trim().toUpperCase();
    const joinPassword = String(req.body?.joinPassword || "");
    if (shareCode.length !== 6) throw Object.assign(new Error("shareCode must have 6 chars"), { status: 400 });

    const group = await prisma.group.findUnique({
      where: { shareCode },
      include: { members: true, products: { include: { addedBy: true, votes: true } } },
    });

    if (!group) throw Object.assign(new Error("Group not found for this share code"), { status: 404 });
    if ((group.joinPassword || "") !== joinPassword) throw Object.assign(new Error("Invalid group password"), { status: 401 });

    res.json(mapGroup(group));
  } catch (error) {
    next(error);
  }
});

app.get("/api/groups/:groupId/members", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const page = normalizePage(req.query.page, 1);
    const limit = normalizeLimit(req.query.limit, 10, 100);
    const skip = (page - 1) * limit;

    const groupExists = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });
    if (!groupExists) throw Object.assign(new Error("Group not found"), { status: 404 });

    const [totalItems, data] = await Promise.all([
      prisma.member.count({ where: { groupId } }),
      prisma.member.findMany({
        where: { groupId },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const meta = paginateMeta(page, limit, totalItems);
    res.json({ ...meta, data: data.map(mapMember) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/groups/:groupId/members", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const { name, gender, ageRange, drinkLevel, foodAppetite } = req.body || {};
    if (!name || String(name).trim().length < 2)
      throw Object.assign(new Error("name must be at least 2 chars"), { status: 400 });
    if (!["male", "female", "other"].includes(gender)) throw Object.assign(new Error("gender invalid"), { status: 400 });
    const ageRangeDb = toAgeRangeDb(ageRange);
    if (!ageRangeDb) throw Object.assign(new Error("ageRange invalid"), { status: 400 });
    if (!Number.isInteger(drinkLevel) || drinkLevel < 1 || drinkLevel > 5)
      throw Object.assign(new Error("drinkLevel must be 1..5"), { status: 400 });
    if (!Number.isInteger(foodAppetite) || foodAppetite < 1 || foodAppetite > 5)
      throw Object.assign(new Error("foodAppetite must be 1..5"), { status: 400 });

    const groupExists = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });
    if (!groupExists) throw Object.assign(new Error("Group not found"), { status: 404 });

    const created = await prisma.member.create({
      data: {
        groupId,
        name: String(name).trim(),
        gender,
        ageRange: ageRangeDb,
        drinkLevel,
        foodAppetite,
      },
    });

    res.status(201).json(mapMember(created));
  } catch (error) {
    if (error?.code === "P2002")
      return next(Object.assign(new Error("A member with this name already exists in this group"), { status: 409 }));
    return next(error);
  }
});

app.put("/api/groups/:groupId/members/:memberId", async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const payload = req.body || {};
    const data = {};

    if (payload.name !== undefined) {
      if (!String(payload.name).trim() || String(payload.name).trim().length < 2)
        throw Object.assign(new Error("name must be at least 2 chars"), { status: 400 });
      data.name = String(payload.name).trim();
    }
    if (payload.gender !== undefined) {
      if (!["male", "female", "other"].includes(payload.gender))
        throw Object.assign(new Error("gender invalid"), { status: 400 });
      data.gender = payload.gender;
    }
    if (payload.ageRange !== undefined) {
      const ageRangeDb = toAgeRangeDb(payload.ageRange);
      if (!ageRangeDb) throw Object.assign(new Error("ageRange invalid"), { status: 400 });
      data.ageRange = ageRangeDb;
    }
    if (payload.drinkLevel !== undefined) {
      if (!Number.isInteger(payload.drinkLevel) || payload.drinkLevel < 1 || payload.drinkLevel > 5)
        throw Object.assign(new Error("drinkLevel must be 1..5"), { status: 400 });
      data.drinkLevel = payload.drinkLevel;
    }
    if (payload.foodAppetite !== undefined) {
      if (!Number.isInteger(payload.foodAppetite) || payload.foodAppetite < 1 || payload.foodAppetite > 5)
        throw Object.assign(new Error("foodAppetite must be 1..5"), { status: 400 });
      data.foodAppetite = payload.foodAppetite;
    }

    const existing = await prisma.member.findFirst({ where: { id: memberId, groupId } });
    if (!existing) throw Object.assign(new Error("Member not found"), { status: 404 });

    const updated = await prisma.member.update({ where: { id: memberId }, data });
    res.json(mapMember(updated));
  } catch (error) {
    if (error?.code === "P2002")
      return next(Object.assign(new Error("A member with this name already exists in this group"), { status: 409 }));
    return next(error);
  }
});

app.delete("/api/groups/:groupId/members/:memberId", async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const existing = await prisma.member.findFirst({ where: { id: memberId, groupId } });
    if (!existing) throw Object.assign(new Error("Member not found"), { status: 404 });

    await prisma.product.updateMany({
      where: { groupId, claimedById: memberId },
      data: { claimedById: null },
    });

    await prisma.productVote.deleteMany({
      where: {
        product: { groupId },
        OR: [{ upVoterId: memberId }, { downVoterId: memberId }],
      },
    });

    const deleted = await prisma.member.delete({ where: { id: memberId } });
    res.json(mapMember(deleted));
  } catch (error) {
    next(error);
  }
});

app.get("/api/groups/:groupId/products", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const page = normalizePage(req.query.page, 1);
    const limit = normalizeLimit(req.query.limit, 10, 100);
    const skip = (page - 1) * limit;
    const category = req.query.category ? String(req.query.category) : undefined;
    const claimed = req.query.claimed === "true" ? true : req.query.claimed === "false" ? false : undefined;

    const groupExists = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });
    if (!groupExists) throw Object.assign(new Error("Group not found"), { status: 404 });

    const where = {
      groupId,
      ...(category ? { category } : {}),
      ...(claimed === true ? { claimedById: { not: null } } : {}),
      ...(claimed === false ? { claimedById: null } : {}),
    };

    const [totalItems, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { addedBy: true, votes: true },
      }),
    ]);

    const meta = paginateMeta(page, limit, totalItems);
    res.json({ ...meta, data: data.map(mapProduct) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/groups/:groupId/products/:productId", async (req, res, next) => {
  try {
    const { groupId, productId } = req.params;
    const product = await prisma.product.findFirst({
      where: { id: productId, groupId },
      include: { addedBy: true, votes: true },
    });
    if (!product) throw Object.assign(new Error("Product not found"), { status: 404 });
    res.json(mapProduct(product));
  } catch (error) {
    next(error);
  }
});

app.post("/api/groups/:groupId/products", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const payload = req.body || {};

    if (!payload.productName || String(payload.productName).trim().length < 2)
      throw Object.assign(new Error("productName must be at least 2 chars"), { status: 400 });
    if (!payload.supermarket || String(payload.supermarket).trim().length < 2)
      throw Object.assign(new Error("supermarket must be at least 2 chars"), { status: 400 });
    if (!payload.category || String(payload.category).trim().length < 2)
      throw Object.assign(new Error("category must be at least 2 chars"), { status: 400 });
    if (!payload.addedBy || String(payload.addedBy).trim().length < 1)
      throw Object.assign(new Error("addedBy is required"), { status: 400 });
    if (payload.quantity !== undefined && (!Number.isInteger(payload.quantity) || payload.quantity < 1))
      throw Object.assign(new Error("quantity must be >= 1"), { status: 400 });

    const groupExists = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });
    if (!groupExists) throw Object.assign(new Error("Group not found"), { status: 404 });

    const member = await prisma.member.findFirst({
      where: { id: String(payload.addedBy), groupId },
      select: { id: true, name: true },
    });
    if (!member) throw Object.assign(new Error("AddedBy member not found in group"), { status: 400 });

    const claimedById = payload.claimedBy ? String(payload.claimedBy) : null;
    if (claimedById) {
      const claimant = await prisma.member.findFirst({ where: { id: claimedById, groupId }, select: { id: true } });
      if (!claimant) throw Object.assign(new Error("claimedBy member not found in group"), { status: 400 });
    }

    const created = await prisma.product.create({
      data: {
        groupId,
        productName: String(payload.productName).trim(),
        supermarket: String(payload.supermarket).trim(),
        price: parseMoney(payload.price),
        quantity: payload.quantity ?? null,
        unit: payload.unit ? String(payload.unit).trim() : null,
        category: String(payload.category).trim(),
        photo: payload.photo ? String(payload.photo).trim() : null,
        addedById: member.id,
        claimedById,
      },
      include: { addedBy: true, votes: true },
    });

    if (payload.votes && (Array.isArray(payload.votes.thumbsUp) || Array.isArray(payload.votes.thumbsDown))) {
      const thumbsUp = Array.isArray(payload.votes.thumbsUp) ? payload.votes.thumbsUp : [];
      const thumbsDown = Array.isArray(payload.votes.thumbsDown) ? payload.votes.thumbsDown : [];
      await prisma.productVote.createMany({
        data: [
          ...thumbsUp.map((id) => ({ productId: created.id, upVoterId: String(id), downVoterId: null })),
          ...thumbsDown.map((id) => ({ productId: created.id, upVoterId: null, downVoterId: String(id) })),
        ],
        skipDuplicates: true,
      });
    }

    const withVotes = await prisma.product.findUnique({
      where: { id: created.id },
      include: { addedBy: true, votes: true },
    });

    res.status(201).json(mapProduct(withVotes));
  } catch (error) {
    next(error);
  }
});

app.put("/api/groups/:groupId/products/:productId", async (req, res, next) => {
  try {
    const { groupId, productId } = req.params;
    const payload = req.body || {};

    const existing = await prisma.product.findFirst({
      where: { id: productId, groupId },
      include: { votes: true },
    });
    if (!existing) throw Object.assign(new Error("Product not found"), { status: 404 });

    const data = {};
    if (payload.productName !== undefined) {
      if (!String(payload.productName).trim() || String(payload.productName).trim().length < 2)
        throw Object.assign(new Error("productName must be at least 2 chars"), { status: 400 });
      data.productName = String(payload.productName).trim();
    }
    if (payload.supermarket !== undefined) {
      if (!String(payload.supermarket).trim() || String(payload.supermarket).trim().length < 2)
        throw Object.assign(new Error("supermarket must be at least 2 chars"), { status: 400 });
      data.supermarket = String(payload.supermarket).trim();
    }
    if (payload.price !== undefined) data.price = parseMoney(payload.price);
    if (payload.quantity !== undefined) {
      if (!Number.isInteger(payload.quantity) || payload.quantity < 1)
        throw Object.assign(new Error("quantity must be >= 1"), { status: 400 });
      data.quantity = payload.quantity;
    }
    if (payload.unit !== undefined) data.unit = payload.unit === null ? null : String(payload.unit).trim();
    if (payload.category !== undefined) {
      if (!String(payload.category).trim() || String(payload.category).trim().length < 2)
        throw Object.assign(new Error("category must be at least 2 chars"), { status: 400 });
      data.category = String(payload.category).trim();
    }
    if (payload.photo !== undefined) data.photo = payload.photo === null ? null : String(payload.photo).trim();

    if (payload.claimedBy !== undefined) {
      if (payload.claimedBy === null || payload.claimedBy === "") {
        data.claimedById = null;
      } else {
        const claimant = await prisma.member.findFirst({
          where: { id: String(payload.claimedBy), groupId },
          select: { id: true },
        });
        if (!claimant) throw Object.assign(new Error("claimedBy member not found in group"), { status: 400 });
        data.claimedById = claimant.id;
      }
    }

    await prisma.product.update({
      where: { id: productId },
      data,
    });

    if (payload.votes) {
      const thumbsUp = Array.isArray(payload.votes.thumbsUp) ? payload.votes.thumbsUp.map(String) : [];
      const thumbsDown = Array.isArray(payload.votes.thumbsDown) ? payload.votes.thumbsDown.map(String) : [];

      await prisma.productVote.deleteMany({ where: { productId } });

      const voteRows = [
        ...thumbsUp.map((id) => ({ productId, upVoterId: id, downVoterId: null })),
        ...thumbsDown.map((id) => ({ productId, upVoterId: null, downVoterId: id })),
      ];

      if (voteRows.length) {
        await prisma.productVote.createMany({ data: voteRows, skipDuplicates: true });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id: productId },
      include: { addedBy: true, votes: true },
    });

    res.json(mapProduct(updated));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/groups/:groupId/products/:productId", async (req, res, next) => {
  try {
    const { groupId, productId } = req.params;
    const existing = await prisma.product.findFirst({
      where: { id: productId, groupId },
      include: { addedBy: true, votes: true },
    });
    if (!existing) throw Object.assign(new Error("Product not found"), { status: 404 });

    await prisma.productVote.deleteMany({ where: { productId } });
    const deleted = await prisma.product.delete({
      where: { id: productId },
      include: { addedBy: true, votes: true },
    });

    res.json(mapProduct(deleted));
  } catch (error) {
    next(error);
  }
});

app.get("/api/groups/statistics", async (_req, res, next) => {
  try {
    const [totalGroups, totalMembers, totalProducts] = await Promise.all([
      prisma.group.count(),
      prisma.member.count(),
      prisma.product.count(),
    ]);

    const grouped = await prisma.group.groupBy({
      by: ["locationAddr"],
      _count: { _all: true },
    });

    const groupsByAddress = {};
    grouped.forEach((g) => {
      groupsByAddress[g.locationAddr] = g._count._all;
    });

    res.json({
      totalGroups,
      totalMembers,
      totalProducts,
      averageMembersPerGroup: totalGroups === 0 ? 0 : Number((totalMembers / totalGroups).toFixed(2)),
      averageProductsPerGroup: totalGroups === 0 ? 0 : Number((totalProducts / totalGroups).toFixed(2)),
      groupsByAddress,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/groups/:groupId/statistics", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true, name: true } });
    if (!group) throw Object.assign(new Error("Group not found"), { status: 404 });

    const [membersCount, products] = await Promise.all([
      prisma.member.count({ where: { groupId } }),
      prisma.product.findMany({
        where: { groupId },
        include: { addedBy: { select: { name: true } } },
      }),
    ]);

    const claimedItems = products.filter((p) => p.claimedById !== null).length;
    const totalCost = products.reduce((sum, p) => sum + Number(p.price) * (p.quantity || 1), 0);

    const memberContributions = {};
    for (const p of products) {
      const key = p.addedBy?.name || "Unknown";
      memberContributions[key] = (memberContributions[key] || 0) + 1;
    }

    res.json({
      groupId: group.id,
      groupName: group.name,
      membersCount,
      productsCount: products.length,
      claimedItems,
      unclaimedItems: products.length - claimedItems,
      totalEstimatedCost: Number(totalCost.toFixed(2)),
      memberContributions,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/groups/:groupId/products/statistics", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });
    if (!group) throw Object.assign(new Error("Group not found"), { status: 404 });

    const products = await prisma.product.findMany({ where: { groupId } });

    if (!products.length) {
      return res.json({
        totalItems: 0,
        averageItemCost: 0,
        totalEstimatedCost: 0,
        mostExpensive: null,
        cheapest: null,
        itemsByCategory: {},
        claimedVsUnclaimed: { claimed: 0, unclaimed: 0 },
      });
    }

    const totals = products.map((p) => ({
      id: p.id,
      productName: p.productName,
      totalCost: Number(p.price) * (p.quantity || 1),
      category: p.category,
      claimed: p.claimedById !== null,
    }));

    const totalEstimatedCost = totals.reduce((sum, t) => sum + t.totalCost, 0);
    const averageItemCost = totalEstimatedCost / totals.length;

    const sorted = [...totals].sort((a, b) => a.totalCost - b.totalCost);
    const cheapest = sorted[0];
    const mostExpensive = sorted[sorted.length - 1];

    const itemsByCategory = {};
    for (const item of totals) {
      itemsByCategory[item.category] = (itemsByCategory[item.category] || 0) + 1;
    }

    const claimed = totals.filter((t) => t.claimed).length;

    return res.json({
      totalItems: totals.length,
      averageItemCost: Number(averageItemCost.toFixed(2)),
      totalEstimatedCost: Number(totalEstimatedCost.toFixed(2)),
      mostExpensive: {
        id: mostExpensive.id,
        productName: mostExpensive.productName,
        totalCost: Number(mostExpensive.totalCost.toFixed(2)),
      },
      cheapest: {
        id: cheapest.id,
        productName: cheapest.productName,
        totalCost: Number(cheapest.totalCost.toFixed(2)),
      },
      itemsByCategory,
      claimedVsUnclaimed: {
        claimed,
        unclaimed: totals.length - claimed,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  if (error?.status) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error?.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }

  return res.status(500).json({ error: error?.message || "Unexpected server error" });
});

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Bronze server running on http://localhost:${port}`);
});
