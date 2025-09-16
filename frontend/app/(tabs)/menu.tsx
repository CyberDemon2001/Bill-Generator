import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router"; // Using useFocusEffect for consistency
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getMenu,
  createMenu,
  updateMenuCategory,
  updateMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  MenuCategory,
  MenuItem,
  PriceOption,
} from "../../services/menuServices";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- MODERN STYLING CONSTANTS ---
const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  secondary: "#10B981",
  background: "#F8F9FC", // Softer background
  surface: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
};

const FONT_SIZES = {
  h1: 30,
  h2: 22,
  h3: 18,
  body: 16,
  caption: 14,
};

// --- MAIN COMPONENT ---
export default function MenuScreen() {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal visibility states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // 'Add New' Form states
  const [categoryName, setCategoryName] = useState("");
  const [items, setItems] = useState<
    { name: string; sizes: { size: string; amount: string }[] }[]
  >([{ name: "", sizes: [{ size: "", amount: "" }] }]);

  // 'Edit' Modal states
  const [editingTarget, setEditingTarget] = useState<{
    type: "category" | "item";
    data: MenuCategory | MenuItem;
    categoryId?: string;
  } | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

const fetchMenu = async () => {
  try {
    if (!loading) setLoading(true); 
    const data = await getMenu();
    setMenu(data);
  } catch (err) {
    console.error("Failed to fetch menu", err);
    Alert.alert("Error", "Could not load menu");
  } finally {
    setLoading(false);
  }
};

  
  // Refetch data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchMenu();
    }, [])
  );

  const animate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }

  // --- 'ADD NEW' FORM HANDLERS ---
  const handleAddItem = () => {
    animate();
    setItems([...items, { name: "", sizes: [{ size: "", amount: "" }] }]);
  }
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      animate();
      setItems(items.filter((_, i) => i !== index));
    } else {
      Alert.alert("Cannot Remove", "At least one item is required.");
    }
  };
  const handleItemNameChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].name = value;
    setItems(newItems);
  };
  const handleAddSize = (itemIndex: number) => {
    animate();
    const newItems = [...items];
    newItems[itemIndex].sizes.push({ size: "", amount: "" });
    setItems(newItems);
  };
  const handleRemoveSize = (itemIndex: number, sizeIndex: number) => {
    const newItems = [...items];
    if (newItems[itemIndex].sizes.length > 1) {
      animate();
      newItems[itemIndex].sizes = newItems[itemIndex].sizes.filter(
        (_, i) => i !== sizeIndex
      );
      setItems(newItems);
    } else {
      Alert.alert("Cannot Remove", "An item must have at least one size.");
    }
  };
  const handleSizeChange = (
    itemIndex: number,
    sizeIndex: number,
    field: "size" | "amount",
    value: string
  ) => {
    const newItems = [...items];
    newItems[itemIndex].sizes[sizeIndex][field] = value;
    setItems(newItems);
  };

  const resetAddForm = () => {
    setCategoryName("");
    setItems([{ name: "", sizes: [{ size: "", amount: "" }] }]);
  };

  const handleAddMenu = async () => {
  if (submitting) return;

  // --- Validation ---
  if (!categoryName.trim())
    return Alert.alert("Validation Error", "Category name is required.");
  if (items.some((i) => !i.name.trim()))
    return Alert.alert("Validation Error", "All items must have a name.");
  if (
    items.some((i) =>
      i.sizes.some((s) => !s.size.trim() || !s.amount.trim())
    )
  )
    return Alert.alert(
      "Validation Error",
      "All size and amount fields are required."
    );
  if (items.some((i) => i.sizes.some((s) => isNaN(Number(s.amount)))))
    return Alert.alert(
      "Validation Error",
      "Amount must be a valid number."
    );
  // --- End Validation ---

  const newCategory = {
    name: categoryName,
    items: items.map((item) => ({
      name: item.name,
      price: item.sizes.map((s) => ({
        size: s.size,
        amount: Number(s.amount),
      })),
    })),
  };

  setSubmitting(true);
  try {
    // ✅ Send as categories array
    await createMenu({ categories: [newCategory] });

    Alert.alert("Success", "New menu category added!");
    resetAddForm();
    setIsAddModalVisible(false);
    fetchMenu();
  } catch (err) {
    console.error("Failed to add menu", err);
    Alert.alert("Error", "Could not add menu");
  } finally {
    setSubmitting(false);
  }
};


  // --- DELETE HANDLERS ---
  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}" and all its items? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMenuCategory(categoryId);
              Alert.alert("Success", "Category deleted.");
              fetchMenu();
            } catch (error) {
              console.error("Failed to delete category", error);
              Alert.alert("Error", "Could not delete category.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = (
    categoryId: string,
    itemId: string,
    itemName: string
  ) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMenuItem(categoryId, itemId);
              Alert.alert("Success", "Item deleted.");
              fetchMenu();
            } catch (error) {
              console.error("Failed to delete item", error);
              Alert.alert("Error", "Could not delete item.");
            }
          },
        },
      ]
    );
  };

  // --- EDIT MODAL HANDLERS ---
  const openEditModal = (target: {
    type: "category" | "item";
    data: MenuCategory | MenuItem;
    categoryId?: string;
  }) => {
    setEditingTarget(target);
    if (target.type === "category") {
      setEditFormData({ name: (target.data as MenuCategory).name });
    } else {
      const item = target.data as MenuItem;
      setEditFormData({
        ...item,
        price: item.price.map((p) => ({ ...p, amount: String(p.amount) })),
      });
    }
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingTarget || submitting) return;
    setSubmitting(true);
    try {
      if (editingTarget.type === "category") {
        if (!editFormData.name?.trim())
          return Alert.alert("Validation Error", "Category name cannot be empty.");
        await updateMenuCategory(editingTarget.data._id!, {
          name: editFormData.name,
        });
      } else if (editingTarget.type === "item" && editingTarget.categoryId) {
        if (!editFormData.name?.trim())
          return Alert.alert("Validation Error", "Item name is required.");
        if (
          editFormData.price.some(
            (s: any) => !s.size.trim() || !s.amount.trim() || isNaN(Number(s.amount))
          )
        )
          return Alert.alert(
            "Validation Error",
            "All size/amount fields are required and amount must be a number."
          );

        const formattedItem: Partial<MenuItem> = {
          name: editFormData.name,
          price: editFormData.price.map(
            (p: PriceOption & { amount: string }) => ({
              size: p.size,
              amount: Number(p.amount),
            })
          ),
        };
        await updateMenuItem(
          editingTarget.categoryId,
          editingTarget.data._id!,
          formattedItem
        );
      }
      Alert.alert(
        "Success",
        `${
          editingTarget.type.charAt(0).toUpperCase() + editingTarget.type.slice(1)
        } updated successfully.`
      );
      setIsEditModalVisible(false);
      setEditingTarget(null);
      fetchMenu();
    } catch (error) {
      console.error(`Failed to update ${editingTarget.type}`, error);
      Alert.alert("Error", `Could not update ${editingTarget.type}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFormSizeChange = (
    sizeIndex: number,
    field: "size" | "amount",
    value: string
  ) => {
    const newPrices = [...editFormData.price];
    newPrices[sizeIndex][field] = value;
    setEditFormData({ ...editFormData, price: newPrices });
  };
  const handleEditFormAddSize = () => {
    animate();
    setEditFormData({
      ...editFormData,
      price: [...editFormData.price, { size: "", amount: "" }],
    });
  }
  const handleEditFormRemoveSize = (sizeIndex: number) => {
    if (editFormData.price.length > 1) {
      animate();
      setEditFormData({
        ...editFormData,
        price: editFormData.price.filter(
          (_: any, i: number) => i !== sizeIndex
        ),
      });
    } else {
      Alert.alert("Cannot Remove", "An item must have at least one size.");
    }
  };
  
  const renderAddModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isAddModalVisible}
      onRequestClose={() => setIsAddModalVisible(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setIsAddModalVisible(false)}>
        <Pressable style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#ccc" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category Name*</Text>
              <TextInput style={styles.input} placeholder="e.g., Starters, Main Course" value={categoryName} onChangeText={setCategoryName} />
            </View>
            
            {items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.itemBlock}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>Item #{itemIndex + 1}</Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(itemIndex)}>
                    <MaterialCommunityIcons name="delete-outline" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
                <TextInput style={styles.input} placeholder="Item Name" value={item.name} onChangeText={(text) => handleItemNameChange(itemIndex, text)} />

                {item.sizes.map((s, sizeIndex) => (
                  <View key={sizeIndex} style={styles.sizeRow}>
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="Size (e.g., Half)" value={s.size} onChangeText={(text) => handleSizeChange(itemIndex, sizeIndex, "size", text)} />
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="Amount (₹)" keyboardType="numeric" value={s.amount} onChangeText={(text) => handleSizeChange(itemIndex, sizeIndex, "amount", text)} />
                    <TouchableOpacity onPress={() => handleRemoveSize(itemIndex, sizeIndex)}>
                      <MaterialCommunityIcons name="minus-circle-outline" size={26} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
                 <TouchableOpacity style={styles.addSizeButton} onPress={() => handleAddSize(itemIndex)}>
                    <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.addSizeText}>Add Size</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
                <Ionicons name="add-outline" size={22} color={COLORS.secondary} />
                <Text style={styles.addItemText}>Add Another Item</Text>
            </TouchableOpacity>
            
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.buttonSubmit]} onPress={handleAddMenu} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.textStyle}>Save New Category</Text>}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isEditModalVisible}
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setIsEditModalVisible(false)}>
        <Pressable style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit {editingTarget?.type}</Text>
             <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#ccc" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
            {editingTarget?.type === "category" && (
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Category Name*</Text>
                    <TextInput style={styles.input} placeholder="Category Name" value={editFormData.name || ""} onChangeText={(text) => setEditFormData({ name: text })} />
                </View>
            )}
            {editingTarget?.type === "item" && editFormData.price && (
              <>
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Item Name*</Text>
                    <TextInput style={styles.input} placeholder="Item Name" value={editFormData.name || ""} onChangeText={(text) => setEditFormData({ ...editFormData, name: text })} />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Prices*</Text>
                    {editFormData.price.map((p: any, sizeIndex: number) => (
                    <View key={sizeIndex} style={styles.sizeRow}>
                        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Size" value={p.size} onChangeText={(text) => handleEditFormSizeChange(sizeIndex, "size", text)} />
                        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Amount" keyboardType="numeric" value={p.amount} onChangeText={(text) => handleEditFormSizeChange(sizeIndex, "amount", text)} />
                        <TouchableOpacity onPress={() => handleEditFormRemoveSize(sizeIndex)}>
                          <MaterialCommunityIcons name="minus-circle-outline" size={26} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    ))}
                    <TouchableOpacity style={styles.addSizeButton} onPress={handleEditFormAddSize}>
                      <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.addSizeText}>Add Size</Text>
                    </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
          <View style={styles.modalFooter}>
             <TouchableOpacity style={[styles.button, styles.buttonSubmit]} onPress={handleUpdate} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.textStyle}>Save Changes</Text>}
             </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Menu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Manage Menu</Text>

        {menu.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="food-off-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No menu items found.</Text>
            <Text style={styles.emptyStateSubText}>Tap the '+' button to add a new category.</Text>
          </View>
        ) : (
          menu.map((category) => (
            <View key={category._id} style={styles.categoryCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    onPress={() =>
                      openEditModal({ type: "category", data: category })
                    }
                  >
                    <MaterialCommunityIcons name="pencil-outline" size={24} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleDeleteCategory(category._id!, category.name)
                    }
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              {category.items.map((item, itemIndex) => (
                <View key={item._id} style={[styles.itemRow, itemIndex === 0 && { borderTopWidth: 0 }]}>
                    <View style={{ flex: 1}}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.price.map((p, idx) => (
                        <View key={idx} style={styles.priceRow}>
                          <Text style={styles.priceLabel}>{p.size}</Text>
                          <Text style={styles.priceValue}>₹{p.amount.toFixed(2)}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.itemActions}>
                        <TouchableOpacity onPress={() => openEditModal({ type: "item", data: item, categoryId: category._id! })}>
                            <MaterialCommunityIcons name="pencil-outline" size={22} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteItem(category._id!, item._id!, item.name)}>
                            <MaterialCommunityIcons name="trash-can-outline" size={22} color={COLORS.danger} />
                        </TouchableOpacity>
                    </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {renderAddModal()}
      {renderEditModal()}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsAddModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- MODERN STYLESHEET ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: FONT_SIZES.body },
  headerTitle: { fontSize: FONT_SIZES.h1, fontWeight: "bold", color: COLORS.text, marginBottom: 24, },

  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryTitle: { fontSize: FONT_SIZES.h2, fontWeight: "600", color: COLORS.primary },
  
  itemRow: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemName: { fontSize: FONT_SIZES.h3, fontWeight: "600", color: COLORS.text, marginBottom: 8 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginTop: 4 },
  priceLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.caption },
  priceValue: { fontWeight: "600", color: COLORS.text, fontSize: FONT_SIZES.caption },
  
  actionButtons: { flexDirection: "row", gap: 24 },
  itemActions: { flexDirection: 'column', gap: 24, marginLeft: 16 },
  
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  
  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.h2,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", },
  modalView: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: FONT_SIZES.h2,
    fontWeight: "bold",
    color: COLORS.text,
  },
  modalFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
  },
  
  // Form Styles
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
  },
  itemBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: FONT_SIZES.h3,
    fontWeight: "600",
    color: COLORS.primary,
  },
  sizeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8, },
  addSizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    marginTop: 8,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight
  },
  addSizeText: { color: COLORS.primary, fontWeight: "600" },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderStyle: "dashed",
  },
  addItemText: {
    fontWeight: "600",
    color: COLORS.secondary,
    fontSize: FONT_SIZES.body,
  },
  
  // Button Styles
  button: { borderRadius: 12, paddingVertical: 16, elevation: 2, justifyContent: "center", alignItems: "center", },
  buttonSubmit: { backgroundColor: COLORS.primary },
  textStyle: { color: "white", fontWeight: "bold", textAlign: "center", fontSize: FONT_SIZES.body, },
});
