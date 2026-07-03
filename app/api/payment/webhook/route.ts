import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyPsbNotification } from "@/lib/psb-payment";
import { sendOrderNotification } from "@/lib/email";

// ПСБ sends POST (application/x-www-form-urlencoded) to BACKREF after each payment.
// RC=00 means success.
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let data: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      for (const pair of text.split("&")) {
        const idx = pair.indexOf("=");
        if (idx > -1) {
          const k = decodeURIComponent(pair.slice(0, idx));
          const v = decodeURIComponent(pair.slice(idx + 1));
          data[k] = v;
        }
      }
    } else {
      data = await req.json();
    }

    console.log("[psb/webhook] received:", JSON.stringify(data));

    // Verify P_SIGN signature
    if (!verifyPsbNotification(data)) {
      console.error("[psb/webhook] invalid P_SIGN — rejecting");
      return new NextResponse("FAIL", { status: 400 });
    }

    const rc = data.RC ?? "";
    const orderId = data.ADDINFO ?? "";

    if (!orderId) {
      console.error("[psb/webhook] missing ADDINFO");
      return new NextResponse("FAIL", { status: 400 });
    }

    const supabase = await createServiceClient();

    if (rc === "00") {
      const { data: order, error } = await supabase
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", orderId)
        .select("*, customers(*), order_items(*)")
        .single();

      if (error) {
        console.error("[psb/webhook] DB update error:", error.message);
        return new NextResponse("FAIL", { status: 500 });
      }

      try {
        await sendOrderNotification({
          id: order.id,
          orderNumber: order.order_number,
          customer: {
            fullName: order.customers?.full_name,
            phone: order.customers?.phone,
            email: order.customers?.email,
            pickupAddress: order.customers?.pickup_address,
          },
          items: (order.order_items ?? []).map((i: any) => ({
            productName: i.product_name,
            quantity: i.quantity,
            price: i.price,
          })),
          totalAmount: order.total_amount,
          paymentStatus: "paid",
          deliveryStatus: order.delivery_status ?? "new",
          createdAt: order.created_at,
        } as any);
      } catch (emailErr) {
        console.error("[psb/webhook] email failed:", emailErr);
      }

      console.log("[psb/webhook] order paid:", order.order_number);
    } else {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", orderId);
      console.log("[psb/webhook] payment failed RC:", rc);
    }

    // ПСБ requires plain-text "OK" to confirm receipt
    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    console.error("[psb/webhook] error:", err);
    return new NextResponse("FAIL", { status: 500 });
  }
}
