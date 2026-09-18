import { prisma } from "@/lib/prisma";
import { notify, templates } from "@/lib/notifications";
import { addMonths, addYears } from "date-fns";

export async function fulfillOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  for (const item of order.items) {
    if (item.kind === "product" && item.productId) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }
    if (item.kind === "album" && item.albumId && order.userId) {
      await prisma.entitlement.create({
        data: {
          userId: order.userId,
          albumId: item.albumId,
          source: "purchase",
          orderId: order.id,
        },
      });
    }
    if (item.kind === "book" && item.bookId) {
      const book = await prisma.book.findUnique({ where: { id: item.bookId } });
      if (book?.format !== "ebook") {
        await prisma.book.update({
          where: { id: item.bookId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      if (book?.format === "ebook" && order.userId) {
        await prisma.entitlement.create({
          data: {
            userId: order.userId,
            bookId: book.id,
            source: "purchase",
            orderId: order.id,
          },
        });
      }
    }
    if (item.kind === "plan" && item.planId && order.userId) {
      const plan = await prisma.membershipPlan.findUnique({ where: { id: item.planId } });
      if (plan) {
        const start = new Date();
        const expires = plan.interval === "annual" ? addYears(start, 1) : addMonths(start, 1);
        await prisma.subscription.create({
          data: {
            userId: order.userId,
            planId: plan.id,
            status: plan.trialDays > 0 ? "trial" : "active",
            startedAt: start,
            expiresAt: expires,
            paymentProvider: order.paymentProvider,
            paymentReference: order.paymentReference,
          },
        });
        await notify({
          ...templates.subscriptionActivated(plan.name),
          userId: order.userId,
        });
      }
    }
  }

  const products = await prisma.product.findMany({ where: { status: "published" } });
  for (const product of products) {
    if (product.stock <= product.lowStockAt) {
      await notify({
        audience: "admin",
        type: "low_stock",
        title: `Low stock: ${product.name}`,
        body: `${product.name} has ${product.stock} remaining.`,
        href: `/admin/products/${product.id}`,
      });
    }
  }

  const books = await prisma.book.findMany({ where: { published: true } });
  for (const book of books) {
    if (book.format !== "ebook" && book.stock <= book.lowStockAt) {
      await notify({
        audience: "admin",
        type: "low_stock",
        title: `Low stock: ${book.title}`,
        body: `${book.title} has ${book.stock} remaining.`,
        href: "/admin/books",
      });
    }
  }
}
