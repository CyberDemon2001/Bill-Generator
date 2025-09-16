import React, { useState, useMemo, useRef, useCallback } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  
  ActivityIndicator,
  Modal,
  Pressable,
  LayoutChangeEvent,
  Keyboard,
} from "react-native";
import { getMenu } from "../services/menuServices";
import { createOrder } from "../services/orderServices";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// --- INTERFACES (Unchanged) ---
interface PriceInfo {
  _id?: string;
  size: string;
  amount: number;
}

interface MenuItem {
  _id?: string;
  name: string;
  price: PriceInfo[];
  available?: boolean;
}

interface MenuCategory {
  _id?: string;
  name: string;
  items: MenuItem[];
}

interface OrderItemData {
  categoryId: string;
  itemId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface CreateOrderItemPayload {
  menuItemId: string;
  categoryId: string;
  size: string;
  quantity: number;
}

// --- STYLING CONSTANTS (Unchanged) ---
const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  success: "#10B981",
  background: "#F8F9FC",
  surface: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#6B7280",
  white: "#FFFFFF",
  black: "#000000",
  border: "#E5E7EB",
  disabled: "#D1D5DB",
};

const FONT_SIZES = {
  h1: 28,
  h2: 24,
  h3: 18,
  body: 16,
  caption: 14,
  small: 12,
};

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE MANAGEMENT (Unchanged Logic, added searchQuery) ---
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemData[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [cartVisible, setCartVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">(
    "cash"
  );
  const [searchQuery, setSearchQuery] = useState(""); // State for search input

  const scrollViewRef = useRef<ScrollView>(null);
  const categoryLayouts = useRef<{ [key: string]: number }>({});

  // --- DATA FETCHING (Unchanged Logic) ---
  useFocusEffect(
    useCallback(() => {
      const fetchMenuData = async () => {
        try {
          setIsMenuLoading(true);
          const categories = await getMenu();
          setMenu(categories);

          if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]._id ?? null);
          }
        } catch (err) {
          console.error("Failed to fetch menu", err);
          alert("Could not load menu. Please try again later.");
        } finally {
          setIsMenuLoading(false);
        }
      };
      fetchMenuData();
    }, [])
  );

  // --- UI LOGIC & HANDLERS (Unchanged Core Logic) ---
  const handleCategoryLayout = (
    event: LayoutChangeEvent,
    categoryId: string
  ) => {
    categoryLayouts.current[categoryId] = event.nativeEvent.layout.y;
  };

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const y = categoryLayouts.current[categoryId];
    if (scrollViewRef.current && y !== undefined) {
      scrollViewRef.current.scrollTo({ y: y, animated: true });
    }
  };

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { y: number } };
  }) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    let currentCategory = "";
    for (const [categoryId, layoutY] of Object.entries(
      categoryLayouts.current
    )) {
      if (scrollPosition >= layoutY - 5) {
        currentCategory = categoryId;
      }
    }
    if (currentCategory && currentCategory !== activeCategory) {
      setActiveCategory(currentCategory);
    }
  };

  // --- ORDER MANAGEMENT (Unchanged Logic) ---
  const addToOrder = (
    categoryId: string,
    itemId: string,
    name: string,
    size: string,
    price: number
  ) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.itemId === itemId && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.itemId === itemId && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { categoryId, itemId, name, size, price, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, size: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) =>
          i.itemId === itemId && i.size === size
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

const handleSubmit = async () => {
  if (!customerName.trim()) return alert("Please enter a customer name.");
  if (orderItems.length === 0) return alert("Please add items to your order.");
  setLoading(true);

  try {
    await createOrder({
      customerName,
      paymentMethod,
      items: orderItems.map((i) => ({
        menuItemId: i.itemId,
        categoryId: i.categoryId,
        size: i.size,
        quantity: i.quantity,
      })),
    });

    // ✅ Create HTML bill
const billHtml = `
<html>
  <head>
    <style>
      body {
        font-family: monospace, sans-serif;
        font-size: 12px;
        margin: 0;
        padding: 5px;
        width: 280px; /* ~88mm */
      }
      .center { text-align: center; }
      .right { text-align: right; }
      .line {
        border-top: 1px dashed #000;
        margin: 4px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 4px;
      }
      td, th {
        padding: 2px 0;
      }
      th {
        font-weight: bold;
        border-bottom: 1px dashed #000;
      }
    </style>
  </head>
  <body>
    <div class="center">
      <h2>Restaurant Name</h2>
      <p>123 Street, City</p>
      <p>+91-9876543210</p>
    </div>

    <div class="line"></div>

    <p><strong>Customer:</strong> ${customerName}</p>
    <p><strong>Payment:</strong> ${paymentMethod}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>

    <div class="line"></div>

    <table>
      <thead>
        <tr>
          <th style="text-align:left;">Item</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${orderItems
          .map(
            (i) => `
          <tr>
            <td>${i.name} (${i.size})</td>
            <td class="center">${i.quantity}</td>
            <td class="right">₹${(i.price * i.quantity).toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="line"></div>

    <p class="right"><strong>Total: ₹${totalOrderAmount.toFixed(2)}</strong></p>

    <div class="line"></div>

    <div class="center">
      <p>Thank you for dining with us!</p>
      <p>Visit Again 🙏</p>
    </div>
  </body>
</html>
`;


    // ✅ Print the bill (on device)
    const { uri } = await Print.printToFileAsync({ html: billHtml });
    console.log("Bill saved to:", uri);

    // ✅ Share or Print
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      await Print.printAsync({ uri });
    }

    // Reset form
    setCustomerName("");
    setOrderItems([]);
    setCartVisible(false);
  } catch (err) {
    console.error("Failed to create order", err);
    alert("Failed to create order.");
  } finally {
    setLoading(false);
  }
};

  // --- MEMOIZED VALUES (Unchanged) ---
  const totalOrderAmount = useMemo(
    () =>
      orderItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [orderItems]
  );
  const totalOrderItems = useMemo(
    () => orderItems.reduce((total, item) => total + item.quantity, 0),
    [orderItems]
  );

  // --- NEW: Client-side search filtering ---
  const filteredMenu = useMemo(() => {
    if (!searchQuery.trim()) {
      return menu;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return menu
      .map((category) => {
        const filteredItems = category.items.filter((item) =>
          item.name.toLowerCase().includes(lowercasedQuery)
        );
        return { ...category, items: filteredItems };
      })
      .filter((category) => category.items.length > 0);
  }, [menu, searchQuery]);

  // --- RENDER LOGIC ---
  if (isMenuLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Menu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Order</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/menu")}
          accessibilityLabel="Manage Menu"
        >
          <Ionicons name="book-outline" size={26} color={COLORS.text} />
        </Pressable>
      </View>

      {/* NEW: Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={22}
          color={COLORS.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search for dishes..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={22}
              color={COLORS.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {/* Category Navigation (Hidden when searching) */}
      {!searchQuery.trim() && (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryNav}
          >
            {menu.map((cat) => (
              <Pressable
                key={cat._id}
                style={[
                  styles.categoryChip,
                  activeCategory === cat._id && styles.categoryChipActive,
                ]}
                onPress={() => scrollToCategory(cat._id!)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    activeCategory === cat._id && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Menu List */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        onScroll={!searchQuery.trim() ? handleScroll : undefined}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {filteredMenu.length > 0 ? (
          filteredMenu.map((category) => (
            <View
              key={category._id}
              style={styles.categoryBlock}
              onLayout={(event) => handleCategoryLayout(event, category._id!)}
            >
              <Text style={styles.categoryTitle}>{category.name}</Text>
              {category.items
                .filter((item) => item.available !== false)
                .map((item) => (
                  <View key={item._id} style={styles.itemCard}>
                    
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.price.map((p) => {
                        const existingItem = orderItems.find(
                          (i) => i.itemId === item._id && i.size === p.size
                        );
                        return (
                          <View
                            key={`${item._id}-${p.size}`}
                            style={styles.priceRow}
                          >
                            <View>
                              <Text style={styles.priceLabel}>{p.size}</Text>
                              <Text style={styles.priceAmount}>
                                ₹{p.amount.toFixed(2)}
                              </Text>
                            </View>
                            {existingItem ? (
                              <View style={styles.menuQtyControls}>
                                <Pressable
                                  onPress={() =>
                                    updateQuantity(item._id!, p.size, -1)
                                  }
                                  accessibilityLabel={`Decrease quantity for ${item.name} ${p.size}`}
                                >
                                  <Ionicons
                                    name="remove-circle-outline"
                                    size={32}
                                    color={COLORS.primary}
                                  />
                                </Pressable>
                                <Text style={styles.menuQtyText}>
                                  {existingItem.quantity}
                                </Text>
                                <Pressable
                                  onPress={() =>
                                    updateQuantity(item._id!, p.size, 1)
                                  }
                                  accessibilityLabel={`Increase quantity for ${item.name} ${p.size}`}
                                >
                                  <Ionicons
                                    name="add-circle"
                                    size={32}
                                    color={COLORS.primary}
                                  />
                                </Pressable>
                              </View>
                            ) : (
                              <Pressable
                                style={styles.addButton}
                                onPress={() =>
                                  addToOrder(
                                    category._id!,
                                    item._id!,
                                    item.name,
                                    p.size,
                                    p.amount
                                  )
                                }
                                accessibilityLabel={`Add ${item.name} ${p.size} to cart`}
                              >
                                <Ionicons
                                  name="add-outline"
                                  size={24}
                                  color={COLORS.primary}
                                />
                              </Pressable>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
            </View>
          ))
        ) : (
          // NEW: Empty State for No Results
          <View style={styles.centered}>
            <Ionicons name="fast-food-outline" size={60} color={COLORS.disabled} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? `No dishes found for "${searchQuery}"` : "No menu items available."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Cart Button (Unchanged) */}
      {orderItems.length > 0 && (
        <Pressable
          style={styles.cartButton}
          onPress={() => setCartVisible(true)}
        >
          <View style={styles.cartButtonContent}>
            <Ionicons name="cart" size={24} color={COLORS.white} />
            <Text style={styles.cartButtonText}>
              {totalOrderItems} {totalOrderItems > 1 ? "Items" : "Item"}
            </Text>
          </View>
          <Text style={styles.cartButtonTotal}>
            View Cart - ₹{totalOrderAmount.toFixed(2)}
          </Text>
        </Pressable>
      )}

      {/* Cart Modal (Unchanged) */}
      <Modal
        visible={cartVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCartVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCartVisible(false)}
        >
          <Pressable style={styles.cartDrawer}>
            <View style={styles.drawerHandleBar} />
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Confirm Order</Text>
              <Pressable
                onPress={() => setCartVisible(false)}
                accessibilityLabel="Close cart"
              >
                <Ionicons
                  name="close-circle"
                  size={30}
                  color={COLORS.disabled}
                />
              </Pressable>
            </View>

            <View style={styles.customerInputContainer}>
              <Ionicons
                name="person-outline"
                size={22}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Customer Name*"
                value={customerName}
                onChangeText={setCustomerName}
                style={styles.customerInput}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentOptions}>
                {(["cash", "card", "upi"] as const).map((method) => (
                  <Pressable
                    key={method}
                    style={[
                      styles.paymentOption,
                      paymentMethod === method && styles.paymentOptionActive,
                    ]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Ionicons
                      name={
                        method === "cash"
                          ? "cash-outline"
                          : method === "card"
                          ? "card-outline"
                          : "qr-code-outline"
                      }
                      size={22}
                      color={
                        paymentMethod === method
                          ? COLORS.white
                          : COLORS.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.paymentOptionText,
                        paymentMethod === method &&
                          styles.paymentOptionTextActive,
                      ]}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 250 }}>
              {orderItems.map((item) => (
                <View
                  key={`${item.itemId}-${item.size}`}
                  style={styles.cartRow}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemDetails}>
                      {item.size} - ₹{item.price.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <Pressable
                      onPress={() => updateQuantity(item.itemId, item.size, -1)}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={28}
                        color={COLORS.primary}
                      />
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable
                      onPress={() => updateQuantity(item.itemId, item.size, 1)}
                    >
                      <Ionicons
                        name="add-circle"
                        size={28}
                        color={COLORS.primary}
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.cartItemTotal}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
              {orderItems.length === 0 && (
                <Text style={styles.emptyCartText}>Your cart is empty.</Text>
              )}
            </ScrollView>

            <View style={styles.drawerFooter}>
              <Pressable
                style={[
                  styles.submitButton,
                  (loading ||
                    orderItems.length === 0 ||
                    !customerName.trim()) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={
                  loading || orderItems.length === 0 || !customerName.trim()
                }
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Place Order</Text>
                    <Text style={styles.submitButtonTotal}>
                      ₹{totalOrderAmount.toFixed(2)}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// --- MODERN STYLESHEET ---
const styles = StyleSheet.create({
  // Main Layout
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 120 },
  emptyStateText: {
    marginTop: 16,
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h1,
    fontWeight: "bold",
    color: COLORS.text,
  },

  // NEW: Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
  },

  // Category Navigation
  categoryNav: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    marginRight: 10,
  },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryChipText: { color: COLORS.primary, fontWeight: "600" },
  categoryChipTextActive: { color: COLORS.white },

  // Menu List
  categoryBlock: { paddingTop: 8, paddingBottom: 16 },
  categoryTitle: {
    fontSize: FONT_SIZES.h2,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: "row",
    overflow: 'hidden'
  },
  // NEW: Image Placeholder Style
  itemImagePlaceholder: {
    width: 100,
    height: '100%',
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // NEW: Item Details Container
  itemDetails: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    fontSize: FONT_SIZES.h3,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary },
  priceAmount: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: FONT_SIZES.body,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuQtyControls: { flexDirection: "row", alignItems: "center", gap: 16 },
  menuQtyText: {
    fontSize: FONT_SIZES.h3,
    fontWeight: "bold",
    color: COLORS.text,
    minWidth: 24,
    textAlign: "center",
  },

  // Floating Cart Button
  cartButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  cartButtonContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  cartButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZES.body,
  },
  cartButtonTotal: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZES.body,
  },

  // Cart Drawer (Modal)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  cartDrawer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "90%",
    paddingHorizontal: 20,
  },
  drawerHandleBar: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
  },
  drawerTitle: { fontSize: FONT_SIZES.h2, fontWeight: "bold" },
  customerInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  inputIcon: { paddingHorizontal: 12 },
  customerInput: { flex: 1, padding: 16, fontSize: FONT_SIZES.body },

  // Cart Items
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  cartItemName: {
    fontSize: FONT_SIZES.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  cartItemDetails: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cartItemTotal: {
    fontSize: FONT_SIZES.body,
    fontWeight: "bold",
    width: 80,
    textAlign: "right",
    color: COLORS.text,
  },
  emptyCartText: {
    textAlign: "center",
    marginVertical: 40,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.body,
  },

  // Cart Quantity Controls
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginHorizontal: 12,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    minWidth: 20,
    textAlign: "center",
  },

  // Drawer Footer & Submit
  drawerFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30, // Extra padding for home bar
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButtonDisabled: { backgroundColor: COLORS.disabled },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZES.body,
  },
  submitButtonTotal: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZES.body,
  },
  paymentSection: {
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: FONT_SIZES.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  paymentOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentOptionText: {
    fontSize: FONT_SIZES.body,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  paymentOptionTextActive: {
    color: COLORS.white,
  },
});