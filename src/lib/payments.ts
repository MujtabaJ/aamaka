export type PaymentMethod = "cod" | "bank_transfer" | "card" | "jazzcash" | "easypaisa";

export type PaymentRequest = {
  orderId: string;
  amountPaisa: number;
  currency: string;
  method: PaymentMethod;
  customerEmail: string;
  returnUrl: string;
  metadata?: Record<string, string>;
};

export type PaymentResult =
  | { ok: true; status: "pending" | "paid"; reference: string; provider: string; message: string }
  | { ok: false; error: string; provider: string };

export interface PaymentProvider {
  id: string;
  methods: PaymentMethod[];
  createPayment(req: PaymentRequest): Promise<PaymentResult>;
  verifyWebhook?(payload: string, signature?: string): Promise<PaymentResult>;
}

class CodProvider implements PaymentProvider {
  id = "cod";
  methods: PaymentMethod[] = ["cod"];
  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    return {
      ok: true,
      status: "pending",
      provider: this.id,
      reference: `cod_${req.orderId}`,
      message: "Cash on delivery selected. Pay when the order arrives.",
    };
  }
}

class BankTransferProvider implements PaymentProvider {
  id = "bank_transfer";
  methods: PaymentMethod[] = ["bank_transfer"];
  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    return {
      ok: true,
      status: "pending",
      provider: this.id,
      reference: `bank_${req.orderId}`,
      message:
        process.env.BANK_TRANSFER_INSTRUCTIONS ??
        "Transfer the order total to the AA Maka Production account and include your order number.",
    };
  }
}

class StripeProvider implements PaymentProvider {
  id = "stripe";
  methods: PaymentMethod[] = ["card"];
  async createPayment(): Promise<PaymentResult> {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        ok: false,
        provider: this.id,
        error:
          "Card payments are not configured. Set STRIPE_SECRET_KEY (and the webhook secret) before enabling card checkout.",
      };
    }
    return {
      ok: false,
      provider: this.id,
      error:
        "Stripe keys are present, but the Stripe SDK is not installed in this build. Add the official Stripe adapter before taking live card payments.",
    };
  }
}

class LocalGatewayProvider implements PaymentProvider {
  id = "local_pk";
  methods: PaymentMethod[] = ["jazzcash", "easypaisa"];
  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    const configured =
      (req.method === "jazzcash" && process.env.JAZZCASH_MERCHANT_ID) ||
      (req.method === "easypaisa" && process.env.EASYPAISA_STORE_ID);
    if (!configured) {
      return {
        ok: false,
        provider: this.id,
        error: `${req.method} is not configured. Add merchant credentials in environment variables.`,
      };
    }
    return {
      ok: false,
      provider: this.id,
      error: `${req.method} credentials were found, but the provider adapter still needs to be completed before live charges.`,
    };
  }
}

const providers: PaymentProvider[] = [
  new CodProvider(),
  new BankTransferProvider(),
  new StripeProvider(),
  new LocalGatewayProvider(),
];

export function getPaymentProvider(method: PaymentMethod) {
  return providers.find((p) => p.methods.includes(method));
}

export async function startPayment(req: PaymentRequest): Promise<PaymentResult> {
  const provider = getPaymentProvider(req.method);
  if (!provider) {
    return { ok: false, provider: "none", error: "Unsupported payment method." };
  }
  return provider.createPayment(req);
}

export function availableMethods(options: { hasPhysical: boolean; hasDigital: boolean }) {
  const methods: { id: PaymentMethod; label: string; hint: string; enabled: boolean }[] = [];
  if (options.hasPhysical) {
    methods.push({
      id: "cod",
      label: "Cash on delivery",
      hint: "Pay in cash when your cultural products arrive.",
      enabled: true,
    });
  }
  methods.push({
    id: "bank_transfer",
    label: "Bank transfer",
    hint: "Pay by bank transfer. Access and shipping start after confirmation.",
    enabled: true,
  });
  methods.push({
    id: "card",
    label: "Card",
    hint: process.env.STRIPE_SECRET_KEY
      ? "Pay securely by card."
      : "Card gateway is not configured yet.",
    enabled: Boolean(process.env.STRIPE_SECRET_KEY),
  });
  return methods;
}
