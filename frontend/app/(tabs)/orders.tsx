import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getOrders, Order } from "../../services/orderServices";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

// --- MODERN STYLING CONSTANTS ---
const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  background: "#F8F9FC",
  surface: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
};

const FONT_SIZES = {
  h1: 30,
  h2: 22,
  h3: 18,
  body: 16,
  caption: 14,
};

export default function OrdersScreen() {
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Fetch orders logic wrapped in useCallback for optimization
  const fetchOrders = useCallback(async () => {
    if (!loading) setLoading(true);
    try {
      const data = await getOrders(selectedDate);
      setDisplayedOrders(data);
    } catch (error) {
      console.error("Failed to fetch filtered orders:", error);
      Alert.alert("Error", "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Use useFocusEffect to refetch data when the screen is focused or date changes
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const selectedDayRevenue = useMemo(() => {
    return displayedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  }, [displayedOrders]);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const getHeaderTitle = () => {
    if (!selectedDate) return "All Orders";
    const today = new Date();
    if (selectedDate.toDateString() === today.toDateString())
      return "Today's Orders";
    return `${selectedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
    })}`;
  };

  const getSummaryLabel = () => {
    if (!selectedDate) return "Total Revenue";
    const today = new Date();
    if (selectedDate.toDateString() === today.toDateString()) {
      return "Today's Revenue";
    }
    return "Revenue for Day";
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>
        <Text style={styles.totalAmount}>₹{item.totalAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.itemsContainer}>
        {item.items.map((it, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {it.quantity} x {it.name}{" "}
              <Text style={styles.itemSize}>({it.size})</Text>
            </Text>
            <Text style={styles.itemTotal}>
              ₹{((it?.price || 0) * it.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
          <Text style={styles.statusText}>Completed</Text>
        </View>
        <View style={styles.paymentBadge}>
           {/* <MaterialCommunityIcons name={item.paymentMethod === 'Cash' ? 'cash' : 'credit-card-outline'} size={14} color={COLORS.warning} /> */}
           <Text style={styles.paymentText}>{item.paymentMethod}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </Text>
      </View>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.summaryContainer}>
      <MaterialCommunityIcons name="cash-multiple" size={32} color={COLORS.primary} />
      <View style={styles.summaryTextContainer}>
        <Text style={styles.summaryLabel}>{getSummaryLabel()}</Text>
        <Text style={styles.summaryValue}>
          ₹{selectedDayRevenue.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.centeredEmpty}>
      <Text style={styles.emptyText}>No Orders Found</Text>
      <Text style={styles.emptySubText}>
        There were no completed orders for the selected date.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching Orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <TouchableOpacity style={styles.filterButton} onPress={showDatePicker}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.filterButtonText}>Change Date</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedOrders}
        keyExtractor={(order) => order._id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
      />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        maximumDate={new Date()}
      />
    </SafeAreaView>
  );
}

// --- MODERN STYLESHEET ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100, // Pushes the empty state down from the header
  },
  loadingText: {
    marginTop: 12,
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: FONT_SIZES.h2,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h1,
    fontWeight: "bold",
    color: COLORS.text,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  filterButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: FONT_SIZES.caption,
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: FONT_SIZES.h1,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  customerInfo: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: FONT_SIZES.h3,
    fontWeight: "bold",
    color: COLORS.text,
  },
  orderId: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  totalAmount: {
    fontSize: FONT_SIZES.h2,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  itemName: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  itemSize: {
    color: COLORS.textSecondary,
  },
  itemTotal: {
    fontSize: FONT_SIZES.body,
    fontWeight: "500",
    color: COLORS.text,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.success,
    fontWeight: "bold",
    fontSize: FONT_SIZES.caption,
  },
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paymentText: {
     color: COLORS.warning,
     fontWeight: 'bold',
     fontSize: FONT_SIZES.caption,
  },
  date: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
});