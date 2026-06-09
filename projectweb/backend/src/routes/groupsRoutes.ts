import { Router } from "express";
import {
  createGroupHandler,
  deleteGroupHandler,
  getGroupHandler,
  groupStatisticsHandler,
  groupsStatisticsHandler,
  joinGroupHandler,
  listGroupsHandler,
  listUserGroupsHandler,
  updateGroupHandler,
} from "../controllers/groupsController";
import {
  addMemberHandler,
  deleteMemberHandler,
  listMembersHandler,
  updateMemberHandler,
} from "../controllers/membersController";
import {
  addProductHandler,
  deleteProductHandler,
  getProductHandler,
  listProductsHandler,
  productsStatisticsHandler,
  updateProductHandler,
} from "../controllers/productsController";
import { requirePermission } from "../middleware/authMiddleware";

const groupsRouter = Router();

groupsRouter.post("/join", requirePermission("CREATE_ENTITY"), joinGroupHandler);
groupsRouter.post("/", requirePermission("CREATE_ENTITY"), createGroupHandler);
groupsRouter.get("/", requirePermission("READ_ENTITY"), listGroupsHandler);
groupsRouter.get("/statistics", requirePermission("READ_ENTITY"), groupsStatisticsHandler);
groupsRouter.get("/by-user/:authUserId", requirePermission("READ_ENTITY"), listUserGroupsHandler);

groupsRouter.get("/:groupId", requirePermission("READ_ENTITY"), getGroupHandler);
groupsRouter.put("/:groupId", requirePermission("UPDATE_ENTITY"), updateGroupHandler);
groupsRouter.delete("/:groupId", requirePermission("DELETE_ENTITY"), deleteGroupHandler);
groupsRouter.get("/:groupId/statistics", requirePermission("READ_ENTITY"), groupStatisticsHandler);

groupsRouter.get("/:groupId/members", requirePermission("READ_ENTITY"), listMembersHandler);
groupsRouter.post("/:groupId/members", requirePermission("CREATE_ENTITY"), addMemberHandler);
groupsRouter.put("/:groupId/members/:memberId", requirePermission("UPDATE_ENTITY"), updateMemberHandler);
groupsRouter.delete("/:groupId/members/:memberId", requirePermission("DELETE_ENTITY"), deleteMemberHandler);

groupsRouter.get("/:groupId/products", requirePermission("READ_ENTITY"), listProductsHandler);
groupsRouter.post("/:groupId/products", requirePermission("CREATE_ENTITY"), addProductHandler);
groupsRouter.get("/:groupId/products/statistics", requirePermission("READ_ENTITY"), productsStatisticsHandler);
groupsRouter.get("/:groupId/products/:productId", requirePermission("READ_ENTITY"), getProductHandler);
groupsRouter.put("/:groupId/products/:productId", requirePermission("UPDATE_ENTITY"), updateProductHandler);
groupsRouter.delete("/:groupId/products/:productId", requirePermission("DELETE_ENTITY"), deleteProductHandler);

export default groupsRouter;
