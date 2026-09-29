import prisma from "../utils/prisma.js";
import { ok, serverError } from "../utils/response.js";

export async function list(_req, res) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return ok(res, categories);
  } catch (e) {
    return serverError(res);
  }
}
