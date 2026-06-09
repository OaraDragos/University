import { Request, Response } from "express";
import {
  addProduct,
  deleteProduct,
  getProduct,
  getProductsStatistics,
  listProducts,
  updateProduct,
} from "../services/groupsService";
import { normalizeLimit, normalizePage } from "../utils/pagination";
import { validateBody } from "../utils/validation";
import { createProductSchema, updateProductSchema } from "../validators/productValidators";
import { broadcastGroupEvent } from "../websocket/realtimeHub";

export function listProductsHandler(req: Request, res: Response): void {
  const page = normalizePage(req.query.page, 1);
  const limit = normalizeLimit(req.query.limit, 10, 100);
  const result = listProducts(req.params.groupId, page, limit);
  res.json(result);
}

export function getProductHandler(req: Request, res: Response): void {
  const product = getProduct(req.params.groupId, req.params.productId);
  res.json(product);
}

export function addProductHandler(req: Request, res: Response): void {
  const payload = validateBody(createProductSchema, req.body);
  const product = addProduct(req.params.groupId, payload);
  broadcastGroupEvent(req.params.groupId, {
    type: "product_created",
    payload: {
      groupId: req.params.groupId,
      product,
    },
  });
  res.status(201).json(product);
}

export function updateProductHandler(req: Request, res: Response): void {
  const payload = validateBody(updateProductSchema, req.body);
  const product = updateProduct(req.params.groupId, req.params.productId, payload);
  broadcastGroupEvent(req.params.groupId, {
    type: "product_updated",
    payload: {
      groupId: req.params.groupId,
      product,
    },
  });
  res.json(product);
}

export function deleteProductHandler(req: Request, res: Response): void {
  const deleted = deleteProduct(req.params.groupId, req.params.productId);
  broadcastGroupEvent(req.params.groupId, {
    type: "product_deleted",
    payload: {
      groupId: req.params.groupId,
      productId: req.params.productId,
    },
  });
  res.json(deleted);
}

export function productsStatisticsHandler(req: Request, res: Response): void {
  res.json(getProductsStatistics(req.params.groupId));
}
