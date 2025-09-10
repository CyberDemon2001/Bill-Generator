// services/printService.ts
import { NetPrinter } from "react-native-thermal-receipt-printer";

export const connectToNetPrinter = async () => {
  try {
    // Replace with your printer IP & port (default is usually 9100)
    await NetPrinter.init();
    await NetPrinter.connectPrinter("192.168.1.100", 9100);
    console.log("✅ Connected to printer");
  } catch (err) {
    console.error("❌ Printer connection failed", err);
  }
};

export const printOrder = async (order: any) => {
  try {
    let receipt = "";
    receipt += "=== Restaurant Bill ===\n";
    receipt += `Customer: ${order.customerName}\n`;
    receipt += `Date: ${new Date(order.createdAt).toLocaleString()}\n`;
    receipt += "----------------------------\n";

    order.items.forEach((it: any) => {
      receipt += `${it.name} (${it.size}) x${it.quantity}  ₹${it.total}\n`;
    });

    receipt += "----------------------------\n";
    receipt += `Subtotal: ₹${order.subtotal}\n`;
    receipt += `Tax: ₹${order.tax}\n`;
    receipt += `Total: ₹${order.totalAmount}\n`;
    receipt += "============================\n";
    receipt += "  Thank you, Visit again!\n";
    receipt += "\n\n\n";

    await NetPrinter.printText(receipt, {});
    console.log("✅ Bill printed");
  } catch (err) {
    console.error("❌ Print failed", err);
  }
};
