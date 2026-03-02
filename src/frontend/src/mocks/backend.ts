// Mock backend for Nimbu Mirchi Nazar Battu
// Simulates the Motoko canister interface with in-memory + localStorage state

export interface Product {
  id: bigint;
  name: string;
  description: string;
  price: bigint; // in paise
  category: string;
  imageUrl: string;
  isActive: boolean;
}

export interface OrderItem {
  productId: bigint;
  productName: string;
  quantity: bigint;
  price: bigint;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
}

export interface Order {
  id: bigint;
  customerId: string;
  items: OrderItem[];
  total: bigint;
  status: string; // "Pending" | "Confirmed" | "Delivered" | "Cancelled"
  orderType: string; // "OneTime" | "Subscription"
  deliveryDate: bigint; // timestamp
  stripeSessionId: string;
  createdAt: bigint;
  deliveryAddress: DeliveryAddress;
}

export interface Subscription {
  id: bigint;
  customerId: string;
  items: OrderItem[];
  total: bigint;
  status: string; // "Active" | "Cancelled" | "Completed"
  deliveryDates: bigint[]; // 4 Saturday timestamps
  stripeSessionId: string;
  createdAt: bigint;
  deliveryAddress: DeliveryAddress;
}

export interface CmsData {
  bannerTitle: string;
  bannerSubtitle: string;
  tagline: string;
  popupMessage: string;
  popupEnabled: boolean;
}

export interface DashboardStats {
  totalOrders: bigint;
  activeSubscriptions: bigint;
  totalRevenue: bigint;
}

// ─── Serialization helpers (bigint <-> JSON) ───────────────────────────────

function replacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") return { __bigint__: value.toString() };
  return value;
}

function reviver(_key: string, value: unknown): unknown {
  if (
    value !== null &&
    typeof value === "object" &&
    "__bigint__" in (value as object)
  ) {
    return BigInt((value as { __bigint__: string }).__bigint__);
  }
  return value;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data, replacer));
  } catch {
    // storage full or not available — fail silently
  }
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw, reviver) as T;
  } catch {
    return null;
  }
}

// ─── Default seed data ────────────────────────────────────────────────────

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1n,
    name: "Nimbu Mirchi Nazar Kavach - Ghar ke liye",
    description:
      "Pracheen Indian parampara se banaya gaya premium nazar protection kit. Isme 7 hari nimbu, 7 hari mirchi, aur suraksha dhaga shaamil hai jo ghar ke main darwaze par lagate hain. Nazar se bachata hai aur sukh-shanti laata hai.",
    price: 29900n,
    category: "Home",
    imageUrl: "",
    isActive: true,
  },
  {
    id: 2n,
    name: "Dukaan Suraksha Nazar Bundle",
    description:
      "Vyavsayiyon ke liye khas nazar protection pack. Isme nimbu-mirchi mala, hanuman yantra, aur narangi ke patte shaamil hain. Vyapar mein barkat aur buri nazar se suraksha ke liye.",
    price: 49900n,
    category: "Shop",
    imageUrl: "",
    isActive: true,
  },
  {
    id: 3n,
    name: "Gadi Nazar Raksha Kit",
    description:
      "Apni gaadi ko nazar se bachao. Isme nimbu, kala dhaga, teen mirchi, aur sacred black beads shaamil hain. Rear view mirror pe lagao - yaatra surakshit rahegi.",
    price: 19900n,
    category: "Car",
    imageUrl: "",
    isActive: true,
  },
  {
    id: 4n,
    name: "Premium Ghar Nazar Protection Set",
    description:
      "Deluxe home protection kit jisme 14-din ki supply shaamil hai. Nimbu, mirchi, camphor, aur surya yantra ke saath. Ek mahine ki shanti aur samridhi ke liye.",
    price: 79900n,
    category: "Home",
    imageUrl: "",
    isActive: true,
  },
  {
    id: 5n,
    name: "Vyapar Mangal Nazar Toran",
    description:
      "Dukaan ke darwaze ke liye vishesh toran jo nazar se bachata hai. Asli nimbu, mirchi, aur marigold ke phoolon se bana hua. Mahine bhar chalta hai.",
    price: 39900n,
    category: "Shop",
    imageUrl: "",
    isActive: true,
  },
  {
    id: 6n,
    name: "Car Black Thread Nazar Kavach",
    description:
      "Shudh kale dhage aur nimbu se bana gadi ka nazar kavach. Easy-to-install kit with instructions. Har mahine badlein - ek pack mein 4 sets hain.",
    price: 34900n,
    category: "Car",
    imageUrl: "",
    isActive: true,
  },
];

const DEMO_ADDRESS: DeliveryAddress = {
  name: "Demo Customer",
  phone: "9876543210",
  addressLine1: "123 Main Street",
  addressLine2: "Near City Center",
  city: "Delhi",
  pincode: "110001",
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: 1n,
    customerId: "demo-user",
    items: [
      {
        productId: 1n,
        productName: "Nimbu Mirchi Nazar Kavach - Ghar ke liye",
        quantity: 2n,
        price: 29900n,
      },
    ],
    total: 59800n,
    status: "Delivered",
    orderType: "OneTime",
    deliveryDate: BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000),
    stripeSessionId: "cs_mock_001",
    createdAt: BigInt(Date.now() - 14 * 24 * 60 * 60 * 1000),
    deliveryAddress: DEMO_ADDRESS,
  },
  {
    id: 2n,
    customerId: "demo-user",
    items: [
      {
        productId: 3n,
        productName: "Gadi Nazar Raksha Kit",
        quantity: 1n,
        price: 19900n,
      },
    ],
    total: 19900n,
    status: "Confirmed",
    orderType: "OneTime",
    deliveryDate: BigInt(Date.now() + 3 * 24 * 60 * 60 * 1000),
    stripeSessionId: "cs_mock_002",
    createdAt: BigInt(Date.now() - 2 * 24 * 60 * 60 * 1000),
    deliveryAddress: DEMO_ADDRESS,
  },
  {
    id: 3n,
    customerId: "demo-user",
    items: [
      {
        productId: 2n,
        productName: "Dukaan Suraksha Nazar Bundle",
        quantity: 1n,
        price: 49900n,
      },
    ],
    total: 49900n,
    status: "Pending",
    orderType: "OneTime",
    deliveryDate: BigInt(Date.now() + 6 * 24 * 60 * 60 * 1000),
    stripeSessionId: "cs_mock_003",
    createdAt: BigInt(Date.now() - 1 * 24 * 60 * 60 * 1000),
    deliveryAddress: DEMO_ADDRESS,
  },
];

// Calculate next 4 Saturdays from today
function getNextSaturdays(count: number): bigint[] {
  const today = new Date();
  const dates: bigint[] = [];
  let current = new Date(today);

  const dayOfWeek = current.getDay();
  const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;
  current.setDate(current.getDate() + daysUntilSaturday);

  for (let i = 0; i < count; i++) {
    dates.push(BigInt(current.getTime()));
    current.setDate(current.getDate() + 7);
  }
  return dates;
}

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 1n,
    customerId: "demo-user",
    items: [
      {
        productId: 1n,
        productName: "Nimbu Mirchi Nazar Kavach - Ghar ke liye",
        quantity: 1n,
        price: 29900n,
      },
    ],
    total: 119600n,
    status: "Active",
    deliveryDates: getNextSaturdays(4),
    stripeSessionId: "cs_sub_mock_001",
    createdAt: BigInt(Date.now() - 3 * 24 * 60 * 60 * 1000),
    deliveryAddress: DEMO_ADDRESS,
  },
];

const DEFAULT_CMS: CmsData = {
  bannerTitle: "Nimbu Mirchi Nazar Battu",
  bannerSubtitle: "Pracheen Indian parampara se bani nazar suraksha",
  tagline:
    "Ghar, Dukaan aur Gaadi ko Nazar se Bachao — Asli Nimbu Mirchi Kavach",
  popupMessage:
    "Nayi arrival! Premium Ghar Nazar Protection Set ab ₹799 mein. Limited stock!",
  popupEnabled: true,
};

const DEFAULT_LEGAL: Record<string, string> = {
  terms: `# Niyam aur Shartein (Terms & Conditions)

## 1. Sweekriti
Nimbu Mirchi Nazar Battu ki website use karke aap hamare niyam aur sharton se sehmat hote hain.

## 2. Utpaad (Products)
Hamare saare utpaad pracheen Indian parampara par aadharit hain. Yeh kewal dharmic aur pauranic manyataon ke liye hain.

## 3. Payment
Payment Stripe ke through secure tarike se ki jaati hai. Hamare paas aapki card details nahi rehti.

## 4. Delivery
Delivery har Shanivar ko hoti hai. Order karne ke baad agla Shanivar delivery date hogi.

## 5. Refund Policy
Agar utpaad kharab aayi toh 48 ghante mein humse sampark karein. Refund policy alag page par available hai.

Last updated: January 2025`,

  privacy: `# Privacy Policy

## 1. Jaankari
Hum sirf delivery ke liye zaruri jaankari collect karte hain.

## 2. Internet Identity
Hum Internet Computer ki Internet Identity use karte hain. Hamare paas aapka password nahi hota.

## 3. Data Sharing
Aapka data kisi third party ko nahi diya jata, sirf delivery partners ko delivery address.

## 4. Cookies
Hum zaroori cookies hi use karte hain website chalane ke liye.

Last updated: January 2025`,

  refund: `# Refund aur Wapsi Niti (Refund Policy)

## 1. Wapsi ki Shart
- Utpaad aane ke 48 ghante mein shikayat karni hogi
- Kharab ya tooti hui cheezein waapas li jaayengi
- Used products return nahi honge

## 2. Refund Process
- Approved refund 5-7 business days mein account mein aayega
- Stripe ke through payment wapas hogi

## 3. Subscription Cancel
- Subscription cancel karne par agle delivery se rukh jaayegi
- Pehle ki deliveries ka refund nahi hoga

## 4. Contact
Refund ke liye: support@nimbumirchi.in

Last updated: January 2025`,
};

// ─── Storage keys ────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  products: "nmnb_products",
  orders: "nmnb_orders",
  subscriptions: "nmnb_subscriptions",
  cms: "nmnb_cms",
  legal: "nmnb_legal",
  nextProductId: "nmnb_next_product_id",
  nextOrderId: "nmnb_next_order_id",
  nextSubId: "nmnb_next_sub_id",
} as const;

// ─── Load persisted state (or fall back to defaults) ─────────────────────

let products: Product[] =
  loadFromStorage<Product[]>(STORAGE_KEYS.products) ?? [...DEFAULT_PRODUCTS];

let orders: Order[] =
  loadFromStorage<Order[]>(STORAGE_KEYS.orders) ?? [...DEFAULT_ORDERS];

let subscriptions: Subscription[] =
  loadFromStorage<Subscription[]>(STORAGE_KEYS.subscriptions) ??
  [...DEFAULT_SUBSCRIPTIONS];

let cmsData: CmsData =
  loadFromStorage<CmsData>(STORAGE_KEYS.cms) ?? { ...DEFAULT_CMS };

let legalPages: Record<string, string> =
  loadFromStorage<Record<string, string>>(STORAGE_KEYS.legal) ??
  { ...DEFAULT_LEGAL };

let nextProductId: bigint =
  loadFromStorage<bigint>(STORAGE_KEYS.nextProductId) ?? 7n;

let nextOrderId: bigint =
  loadFromStorage<bigint>(STORAGE_KEYS.nextOrderId) ?? 4n;

let nextSubId: bigint =
  loadFromStorage<bigint>(STORAGE_KEYS.nextSubId) ?? 2n;

// Ensure nextIds are always higher than existing data
function recalcNextIds() {
  const maxProductId = products.reduce(
    (m, p) => (p.id > m ? p.id : m),
    0n,
  );
  const maxOrderId = orders.reduce((m, o) => (o.id > m ? o.id : m), 0n);
  const maxSubId = subscriptions.reduce(
    (m, s) => (s.id > m ? s.id : m),
    0n,
  );
  if (nextProductId <= maxProductId) nextProductId = maxProductId + 1n;
  if (nextOrderId <= maxOrderId) nextOrderId = maxOrderId + 1n;
  if (nextSubId <= maxSubId) nextSubId = maxSubId + 1n;
}
recalcNextIds();

// ─── Persist helpers ─────────────────────────────────────────────────────

function persistProducts() { saveToStorage(STORAGE_KEYS.products, products); }
function persistOrders() { saveToStorage(STORAGE_KEYS.orders, orders); }
function persistSubscriptions() { saveToStorage(STORAGE_KEYS.subscriptions, subscriptions); }
function persistCms() { saveToStorage(STORAGE_KEYS.cms, cmsData); }
function persistLegal() { saveToStorage(STORAGE_KEYS.legal, legalPages); }
function persistNextIds() {
  saveToStorage(STORAGE_KEYS.nextProductId, nextProductId);
  saveToStorage(STORAGE_KEYS.nextOrderId, nextOrderId);
  saveToStorage(STORAGE_KEYS.nextSubId, nextSubId);
}

// ─── Mock "is admin" state ─────────────────────────────────────────────────

let _isAdmin = false;

// ─── Public API ───────────────────────────────────────────────────────────

export const mockBackend = {
  // Auth
  _initializeAccessControlWithSecret: async (_token: string) => {},

  isCallerAdmin: async (): Promise<boolean> => {
    return _isAdmin;
  },

  setAdminMode: (value: boolean) => {
    _isAdmin = value;
  },

  getCallerUserRole: async () => {
    return { user: null } as { user: null };
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    await delay(300);
    return [...products.filter((p) => p.isActive)];
  },

  getAllProductsAdmin: async (): Promise<Product[]> => {
    await delay(300);
    return [...products];
  },

  getProductsByCategory: async (cat: string): Promise<Product[]> => {
    await delay(200);
    return products.filter((p) => p.isActive && p.category === cat);
  },

  getProduct: async (id: bigint): Promise<[] | [Product]> => {
    await delay(200);
    const product = products.find((p) => p.id === id);
    return product ? [product] : [];
  },

  createProduct: async (
    name: string,
    description: string,
    price: bigint,
    category: string,
    imageUrl: string,
  ): Promise<Product> => {
    await delay(300);
    const product: Product = {
      id: nextProductId++,
      name,
      description,
      price,
      category,
      imageUrl,
      isActive: true,
    };
    products.push(product);
    persistProducts();
    persistNextIds();
    return product;
  },

  updateProduct: async (
    id: bigint,
    name: string,
    description: string,
    price: bigint,
    category: string,
    imageUrl: string,
    isActive: boolean,
  ): Promise<[] | [Product]> => {
    await delay(300);
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return [];
    products[idx] = {
      ...products[idx],
      name,
      description,
      price,
      category,
      imageUrl,
      isActive,
    };
    persistProducts();
    return [products[idx]];
  },

  deleteProduct: async (id: bigint): Promise<boolean> => {
    await delay(200);
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    products[idx] = { ...products[idx], isActive: false };
    persistProducts();
    return true;
  },

  seedProducts: async (): Promise<boolean> => {
    await delay(500);
    return true;
  },

  // Orders
  createOrder: async (
    items: OrderItem[],
    total: bigint,
    orderType: string,
    deliveryDate: bigint,
    deliveryAddress: DeliveryAddress,
  ): Promise<Order> => {
    await delay(400);
    const order: Order = {
      id: nextOrderId++,
      customerId: "current-user",
      items,
      total,
      status: "Pending",
      orderType,
      deliveryDate,
      stripeSessionId: "",
      createdAt: BigInt(Date.now()),
      deliveryAddress,
    };
    orders.push(order);
    persistOrders();
    persistNextIds();
    return order;
  },

  updateOrderStripeSession: async (
    id: bigint,
    sessionId: string,
  ): Promise<boolean> => {
    await delay(200);
    const order = orders.find((o) => o.id === id);
    if (order) {
      order.stripeSessionId = sessionId;
      persistOrders();
    }
    return true;
  },

  getMyOrders: async (): Promise<Order[]> => {
    await delay(300);
    return [...orders].sort((a, b) => Number(b.createdAt - a.createdAt));
  },

  getOrder: async (id: bigint): Promise<[] | [Order]> => {
    await delay(200);
    const order = orders.find((o) => o.id === id);
    return order ? [order] : [];
  },

  getAllOrders: async (): Promise<Order[]> => {
    await delay(300);
    return [...orders].sort((a, b) => Number(b.createdAt - a.createdAt));
  },

  updateOrderStatus: async (
    id: bigint,
    status: string,
  ): Promise<[] | [Order]> => {
    await delay(300);
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return [];
    orders[idx] = { ...orders[idx], status };
    persistOrders();
    return [orders[idx]];
  },

  // Subscriptions
  createSubscription: async (
    items: OrderItem[],
    total: bigint,
    deliveryDates: bigint[],
    deliveryAddress: DeliveryAddress,
  ): Promise<Subscription> => {
    await delay(400);
    const sub: Subscription = {
      id: nextSubId++,
      customerId: "current-user",
      items,
      total,
      status: "Active",
      deliveryDates,
      stripeSessionId: "",
      createdAt: BigInt(Date.now()),
      deliveryAddress,
    };
    subscriptions.push(sub);
    persistSubscriptions();
    persistNextIds();
    return sub;
  },

  updateSubscriptionStripeSession: async (
    id: bigint,
    sessionId: string,
  ): Promise<boolean> => {
    await delay(200);
    const sub = subscriptions.find((s) => s.id === id);
    if (sub) {
      sub.stripeSessionId = sessionId;
      persistSubscriptions();
    }
    return true;
  },

  getMySubscriptions: async (): Promise<Subscription[]> => {
    await delay(300);
    return [...subscriptions].sort(
      (a, b) => Number(b.createdAt - a.createdAt),
    );
  },

  cancelSubscription: async (id: bigint): Promise<boolean> => {
    await delay(300);
    const sub = subscriptions.find((s) => s.id === id);
    if (sub) {
      sub.status = "Cancelled";
      persistSubscriptions();
    }
    return true;
  },

  getAllSubscriptions: async (): Promise<Subscription[]> => {
    await delay(300);
    return [...subscriptions].sort(
      (a, b) => Number(b.createdAt - a.createdAt),
    );
  },

  // Stripe (mock - returns demo URL)
  createStripeCheckout: async (
    _orderId: bigint,
    _amount: bigint,
    _items: OrderItem[],
  ): Promise<string> => {
    await delay(500);
    return "https://checkout.stripe.com/pay/mock_session_demo#fidkdWxOYHwnPyd1blpxYHZxWjA0S2hwdV1haGp8anZtMUxKcXFLVmlpfTd9Z0pNbl1hJ3BsZGRiY2tgV3N8";
  },

  createStripeSubscriptionCheckout: async (
    _subId: bigint,
    _amount: bigint,
    _items: OrderItem[],
  ): Promise<string> => {
    await delay(500);
    return "https://checkout.stripe.com/pay/mock_subscription_session_demo";
  },

  // CMS
  getCmsData: async (): Promise<CmsData> => {
    await delay(200);
    return { ...cmsData };
  },

  updateCmsData: async (data: Partial<CmsData>): Promise<boolean> => {
    await delay(300);
    cmsData = { ...cmsData, ...data };
    persistCms();
    return true;
  },

  // Legal
  getLegalPage: async (slug: string): Promise<[] | [string]> => {
    await delay(200);
    const content = legalPages[slug];
    return content ? [content] : [];
  },

  setLegalPage: async (slug: string, content: string): Promise<boolean> => {
    await delay(300);
    legalPages[slug] = content;
    persistLegal();
    return true;
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(300);
    const activeOrders = orders.filter((o) => o.status !== "Cancelled");
    const activeSubs = subscriptions.filter((s) => s.status === "Active");
    const totalRevenue = [...orders, ...subscriptions].reduce(
      (sum, item) => sum + item.total,
      0n,
    );
    return {
      totalOrders: BigInt(activeOrders.length),
      activeSubscriptions: BigInt(activeSubs.length),
      totalRevenue,
    };
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
