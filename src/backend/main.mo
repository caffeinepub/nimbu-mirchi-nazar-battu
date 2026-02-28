import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";
import Stripe "./stripe/stripe";
import OutCall "./http-outcalls/outcall";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";

persistent actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ==================== TYPES ====================

  public type Category = {
    #home;
    #shop;
    #car;
  };

  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    category : Category;
    inStock : Bool;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #delivered;
    #cancelled;
  };

  public type OrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    priceEach : Nat;
  };

  public type OrderType = {
    #oneTime;
    #subscription;
  };

  public type Order = {
    id : Nat;
    customer : Principal;
    items : [OrderItem];
    deliveryDate : Text;
    status : OrderStatus;
    orderType : OrderType;
    totalAmount : Nat;
    stripeSessionUrl : Text;
    stripeSessionId : Text;
    createdAt : Int;
  };

  public type Subscription = {
    id : Nat;
    customer : Principal;
    items : [OrderItem];
    deliveryDates : [Text];
    status : { #active; #cancelled };
    totalAmount : Nat;
    createdAt : Int;
  };

  public type CmsData = {
    var bannerText : Text;
    var tagline : Text;
    var popupText : Text;
    var popupEnabled : Bool;
  };

  public type DashboardStats = {
    totalOrders : Nat;
    pendingOrders : Nat;
    confirmedOrders : Nat;
    deliveredOrders : Nat;
    cancelledOrders : Nat;
    totalSubscriptions : Nat;
    activeSubscriptions : Nat;
    totalRevenue : Nat;
  };

  // ==================== STATE ====================

  let products = Map.empty<Nat, Product>();
  var productIdCounter : Nat = 0;

  let orders = Map.empty<Nat, Order>();
  var orderIdCounter : Nat = 0;

  let subscriptions = Map.empty<Nat, Subscription>();
  var subscriptionIdCounter : Nat = 0;

  let legalPages = Map.empty<Text, Text>();

  let cmsData : CmsData = {
    var bannerText = "Fresh Nimbu Mirchi delivered to your door every Saturday!";
    var tagline = "Protect your home with nature's shield";
    var popupText = "Get 10% off your first order!";
    var popupEnabled = true;
  };

  let stripeConfig : Stripe.StripeConfiguration = {
    secretKey = "sk_test_placeholder_replace_with_real_key";
    allowedCountries = ["IN"];
  };

  // ==================== TRANSFORM ====================

  public query func transform(args : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(args);
  };

  // ==================== DATE UTILITIES ====================

  func intDaysToDate(totalDays : Int) : Text {
    var d : Int = totalDays;
    var y : Int = 1970;

    label yearLoop loop {
      let diy : Int = if (y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)) { 366 } else { 365 };
      if (d < diy) { break yearLoop };
      d -= diy;
      y += 1;
    };

    let monthDays : [Int] = [31, if (y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)) 29 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var m : Int = 1;
    label monthLoop loop {
      if (m > 12) { break monthLoop };
      let md = monthDays[Int.abs(m - 1)];
      if (d < md) { break monthLoop };
      d -= md;
      m += 1;
    };

    let day : Int = d + 1;
    let yText = (y).toText();
    let mText = if (m < 10) { "0" # (m).toText() } else { (m).toText() };
    let dText = if (day < 10) { "0" # (day).toText() } else { (day).toText() };
    yText # "-" # mText # "-" # dText
  };

  func nextSaturday() : Text {
    let nowInt : Int = Time.now();
    let nowSec : Int = nowInt / 1_000_000_000;
    let daysSinceEpoch : Int = nowSec / 86400;
    // epoch (Jan 1 1970) was a Thursday
    // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
    let weekday : Int = (daysSinceEpoch + 4) % 7;
    let daysUntilSat : Int = if (weekday == 6) { 7 } else { 6 - weekday };
    let satDays : Int = daysSinceEpoch + daysUntilSat;
    intDaysToDate(satDays)
  };

  func fourSaturdays() : [Text] {
    let nowInt : Int = Time.now();
    let nowSec : Int = nowInt / 1_000_000_000;
    let daysSinceEpoch : Int = nowSec / 86400;
    let weekday : Int = (daysSinceEpoch + 4) % 7;
    let daysUntilSat : Int = if (weekday == 6) { 7 } else { 6 - weekday };
    let firstSat : Int = daysSinceEpoch + daysUntilSat;
    [
      intDaysToDate(firstSat),
      intDaysToDate(firstSat + 7),
      intDaysToDate(firstSat + 14),
      intDaysToDate(firstSat + 21),
    ]
  };

  // ==================== PRODUCT CRUD ====================

  public query func getProducts() : async [Product] {
    let result = List.empty<Product>();
    for ((_, p) in products.entries()) {
      result.add(p);
    };
    result.toArray()
  };

  public query func getProductsByCategory(category : Category) : async [Product] {
    let result = List.empty<Product>();
    for ((_, p) in products.entries()) {
      if (p.category == category) {
        result.add(p);
      };
    };
    result.toArray()
  };

  public query func getProduct(id : Nat) : async ?Product {
    products.get(id)
  };

  public shared ({ caller }) func createProduct(
    name : Text,
    description : Text,
    price : Nat,
    imageUrl : Text,
    category : Category,
  ) : async Product {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    productIdCounter += 1;
    let p : Product = {
      id = productIdCounter;
      name;
      description;
      price;
      imageUrl;
      category;
      inStock = true;
    };
    products.add(productIdCounter, p);
    p
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    description : Text,
    price : Nat,
    imageUrl : Text,
    category : Category,
    inStock : Bool,
  ) : async Product {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let p : Product = { id; name; description; price; imageUrl; category; inStock };
        products.add(id, p);
        p
      };
    }
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (products.get(id)) {
      case (null) { false };
      case (?_) {
        products.add(id, { id; name = ""; description = ""; price = 0; imageUrl = ""; category = #home; inStock = false });
        true
      };
    }
  };

  // ==================== ORDER CRUD ====================

  public shared ({ caller }) func createOrder(
    items : [OrderItem],
    orderType : OrderType,
  ) : async Order {
    if (caller.isAnonymous()) { Runtime.trap("Must be logged in") };
    var total : Nat = 0;
    for (item in items.vals()) {
      total += item.priceEach * item.quantity;
    };
    orderIdCounter += 1;
    let o : Order = {
      id = orderIdCounter;
      customer = caller;
      items;
      deliveryDate = nextSaturday();
      status = #pending;
      orderType;
      totalAmount = total;
      stripeSessionUrl = "";
      stripeSessionId = "";
      createdAt = Time.now();
    };
    orders.add(orderIdCounter, o);
    o
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (caller.isAnonymous()) { Runtime.trap("Must be logged in") };
    let result = List.empty<Order>();
    for ((_, o) in orders.entries()) {
      if (o.customer == caller) {
        result.add(o);
      };
    };
    result.toArray()
  };

  public query func getOrder(id : Nat) : async ?Order {
    orders.get(id)
  };

  public shared ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    let result = List.empty<Order>();
    for ((_, o) in orders.entries()) {
      result.add(o);
    };
    result.toArray()
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : OrderStatus) : async Order {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) {
        let updated : Order = {
          o with status;
        };
        orders.add(id, updated);
        updated
      };
    }
  };

  public shared ({ caller }) func cancelOrder(id : Nat) : async Order {
    if (caller.isAnonymous()) { Runtime.trap("Must be logged in") };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) {
        if (o.customer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized");
        };
        if (o.status != #pending) {
          Runtime.trap("Only pending orders can be cancelled");
        };
        let updated : Order = {
          o with status = #cancelled;
        };
        orders.add(id, updated);
        updated
      };
    }
  };

  public shared ({ caller }) func updateOrderStripeSession(
    orderId : Nat,
    sessionUrl : Text,
    sessionId : Text,
  ) : async Order {
    if (caller.isAnonymous()) { Runtime.trap("Must be logged in") };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) {
        if (o.customer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized");
        };
        let updated : Order = {
          o with
          stripeSessionUrl = sessionUrl;
          stripeSessionId = sessionId;
        };
        orders.add(orderId, updated);
        updated
      };
    }
  };

  // ==================== SUBSCRIPTION CRUD ====================

  public shared ({ caller }) func createSubscription(
    items : [OrderItem],
  ) : async Subscription {
    if (caller.isAnonymous()) { Runtime.trap("Must be logged in") };
    var total : Nat = 0;
    for (item in items.vals()) {
      total += item.priceEach * item.quantity;
    };
    let monthlyTotal = total * 4;
    subscriptionIdCounter += 1;
    let s : Subscription = {
      id = subscriptionIdCounter;
      customer = caller;
      items;
      deliveryDates = fourSaturdays();
      status = #active;
      totalAmount = monthlyTotal;
      createdAt = Time.now();
    };
    subscriptions.add(subscriptionIdCounter, s);
    s
  };

  public query ({ caller }) func getMySubscriptions() : async [Subscription] {
    if (caller.isAnonymous()) { Runtime.trap("Must be logged in") };
    let result = List.empty<Subscription>();
    for ((_, s) in subscriptions.entries()) {
      if (s.customer == caller) {
        result.add(s);
      };
    };
    result.toArray()
  };

  public shared ({ caller }) func cancelSubscription(id : Nat) : async Subscription {
    if (caller.isAnonymous()) { Runtime.trap("Must be logged in") };
    switch (subscriptions.get(id)) {
      case (null) { Runtime.trap("Subscription not found") };
      case (?s) {
        if (s.customer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized");
        };
        let updated : Subscription = {
          s with status = #cancelled;
        };
        subscriptions.add(id, updated);
        updated
      };
    }
  };

  public shared ({ caller }) func getAllSubscriptions() : async [Subscription] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    let result = List.empty<Subscription>();
    for ((_, s) in subscriptions.entries()) {
      result.add(s);
    };
    result.toArray()
  };

  // ==================== STRIPE CHECKOUT ====================

  public shared ({ caller }) func createStripeCheckout(
    orderId : Nat,
    items : [Stripe.ShoppingItem],
    successUrl : Text,
    cancelUrl : Text,
  ) : async Text {
    if (caller.isAnonymous()) { Runtime.trap("Must be logged in") };
    let sessionUrl = await Stripe.createCheckoutSession(
      stripeConfig,
      caller,
      items,
      successUrl,
      cancelUrl,
      transform,
    );
    switch (orders.get(orderId)) {
      case (?o) {
        let updated : Order = {
          o with
          stripeSessionUrl = sessionUrl;
        };
        orders.add(orderId, updated);
      };
      case (null) {};
    };
    sessionUrl
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (caller.isAnonymous()) { Runtime.trap("Must be logged in") };
    await Stripe.getSessionStatus(stripeConfig, sessionId, transform);
  };

  // ==================== CMS ====================

  public query func getCmsData() : async { bannerText : Text; tagline : Text; popupText : Text; popupEnabled : Bool } {
    {
      bannerText = cmsData.bannerText;
      tagline = cmsData.tagline;
      popupText = cmsData.popupText;
      popupEnabled = cmsData.popupEnabled;
    }
  };

  public shared ({ caller }) func updateCmsData(
    bannerText : Text,
    tagline : Text,
    popupText : Text,
    popupEnabled : Bool,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    cmsData.bannerText := bannerText;
    cmsData.tagline := tagline;
    cmsData.popupText := popupText;
    cmsData.popupEnabled := popupEnabled;
  };

  // ==================== LEGAL PAGES ====================

  public query func getLegalPage(pageKey : Text) : async ?Text {
    legalPages.get(pageKey)
  };

  public query func getAllLegalPages() : async [(Text, Text)] {
    let result = List.empty<(Text, Text)>();
    for ((k, v) in legalPages.entries()) {
      result.add((k, v));
    };
    result.toArray()
  };

  public shared ({ caller }) func setLegalPage(pageKey : Text, content : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    legalPages.add(pageKey, content);
  };

  // ==================== DASHBOARD ====================

  public shared ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    var totalOrders : Nat = 0;
    var pendingOrders : Nat = 0;
    var confirmedOrders : Nat = 0;
    var deliveredOrders : Nat = 0;
    var cancelledOrders : Nat = 0;
    var totalRevenue : Nat = 0;

    for ((_, o) in orders.entries()) {
      totalOrders += 1;
      switch (o.status) {
        case (#pending) { pendingOrders += 1 };
        case (#confirmed) { confirmedOrders += 1 };
        case (#delivered) {
          deliveredOrders += 1;
          totalRevenue += o.totalAmount;
        };
        case (#cancelled) { cancelledOrders += 1 };
      };
    };

    var totalSubscriptions : Nat = 0;
    var activeSubscriptions : Nat = 0;
    for ((_, s) in subscriptions.entries()) {
      totalSubscriptions += 1;
      if (s.status == #active) {
        activeSubscriptions += 1;
      };
    };

    {
      totalOrders;
      pendingOrders;
      confirmedOrders;
      deliveredOrders;
      cancelledOrders;
      totalSubscriptions;
      activeSubscriptions;
      totalRevenue;
    }
  };

  // ==================== SEED DATA ====================

  public shared ({ caller }) func seedProducts() : async [Product] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    let seedData : [(Text, Text, Nat, Text, Category)] = [
      ("Nimbu Mirchi Bundle - Home", "Traditional 7 nimbu 7 mirchi protection bundle for home entrance", 4900, "/images/nimbu-mirchi-home.jpg", #home),
      ("Nimbu Mirchi Bundle - Shop", "Large 11 nimbu 11 mirchi bundle for shop/office protection", 7900, "/images/nimbu-mirchi-shop.jpg", #shop),
      ("Nimbu Mirchi Bundle - Car", "Compact nimbu mirchi bundle for car windshield protection", 2900, "/images/nimbu-mirchi-car.jpg", #car),
      ("Premium Nimbu Mirchi - Home", "Premium organic nimbu mirchi with extra herbs for home", 8900, "/images/premium-home.jpg", #home),
      ("Premium Nimbu Mirchi - Shop", "Premium large bundle with black thread for commercial use", 12900, "/images/premium-shop.jpg", #shop),
      ("Mini Car Kit", "Mini nimbu mirchi kit with hanger for rear-view mirror", 1900, "/images/mini-car.jpg", #car),
    ];

    let created = List.empty<Product>();
    for ((name, description, price, imageUrl, category) in seedData.vals()) {
      productIdCounter += 1;
      let p : Product = {
        id = productIdCounter;
        name;
        description;
        price;
        imageUrl;
        category;
        inStock = true;
      };
      products.add(productIdCounter, p);
      created.add(p);
    };
    created.toArray()
  };

  // ==================== UTILITY ====================

  public query func getNextSaturday() : async Text {
    nextSaturday()
  };

  public query func getFourSaturdays() : async [Text] {
    fourSaturdays()
  };
}
