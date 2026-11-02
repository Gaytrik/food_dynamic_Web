package com.adhijevan.service;

import com.adhijevan.model.Address;
import com.adhijevan.model.OrderItem;
import com.adhijevan.model.Orders;
//import com.adhijevan.model.OrderItem;
import com.adhijevan.model.User;
import com.adhijevan.repository.OrderRepository;
import com.adhijevan.repository.UserRepo;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AppSettingsService appSettingsService;

    @Autowired
    private UserRepo userRepository;


    // ✅ Better approach: Use @Value annotation from application.properties
    @Value("${razorpay.key.id:rzp_test_2x3TAXgAqcLvUs}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:6u4MaZQesQK3oUVwcPDdfiJW}")
    private String razorpaySecret;

    // ✅ Create new normal order (without payment) - UPDATED
    public Orders createOrder(Orders order) {
        try {
            double subtotal = calculateSubtotal(order);
            double tax = appSettingsService.getGstAmount(subtotal);
            double deliveryFee = appSettingsService.getDeliveryCharge(subtotal);
            double totalAmount = subtotal + tax + deliveryFee;

            order.setTotalAmount(totalAmount);
            order.setDeliveryFee(deliveryFee);
            order.setTax(tax);
            order.setOrderStatus("Confirmed");

            // ✅ Fix: Payment status depends on payment method
            if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
                order.setPaymentStatus("COD");
            } else {
                order.setPaymentStatus("Paid");
            }

            if (order.getCreatedAt() == null) order.setCreatedAt(new Date());
            order.setUpdatedAt(new Date());
            if (order.getAdhijevanOrderId() == null)
                order.setAdhijevanOrderId(generateCustomOrderId());

            Orders savedOrder = orderRepository.save(order);
            updateUserPurchaseHistory(savedOrder);
            return savedOrder;

        } catch (Exception e) {
            throw new RuntimeException("Error creating order: " + e.getMessage(), e);
        }
    }



    private void updateUserPurchaseHistory(Orders order) {
        System.out.println("==============================================================");
        System.out.println("🧩 [updateUserPurchaseHistory] STARTED");

        if (order == null) {
            System.out.println("❌ Order is NULL. Cannot update user purchase history.");
            System.out.println("==============================================================");
            return;
        }

        if (order.getUserId() == null) {
            System.out.println("❌ order.getUserId() is NULL. Skipping update.");
            System.out.println("==============================================================");
            return;
        }

        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            System.out.println("❌ No order items found for order ID: " + order.getId());
            System.out.println("==============================================================");
            return;
        }

        System.out.println("🔍 User ID: " + order.getUserId());
        System.out.println("🧾 Order ID: " + order.getId());
        System.out.println("🛒 Items count: " + order.getOrderItems().size());

        userRepository.findById(order.getUserId()).ifPresentOrElse(user -> {
            System.out.println("✅ Found user: " + user.getEmail());
            System.out.println("📦 Current purchase history size: " + user.getPurchaseHistories().size());

            List<User.PurchaseHistory> histories = user.getPurchaseHistories();
            if (histories == null) {
                System.out.println("ℹ️ Histories list is null, initializing new one...");
                histories = new ArrayList<>();
                user.setPurchaseHistories(histories);
            }

            for (OrderItem item : order.getOrderItems()) {
                System.out.println("--------------------------------------------------------------");
                System.out.println("🍽 Processing item: " + item.getName());
                System.out.println("📦 menuItemId: " + item.getMenuItemId());
                System.out.println("🔢 quantity: " + item.getQuantity());

                String menuId = item.getMenuItemId();
                int quantity = item.getQuantity();

                if (menuId == null || menuId.trim().isEmpty()) {
                    System.out.println("⚠️ Skipping item — menuItemId is NULL or blank.");
                    continue;
                }

                User.PurchaseHistory existing = histories.stream()
                        .filter(ph -> ph.getMenuId().equals(menuId))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    System.out.println("🟡 Existing menuId found: " + existing.getMenuId());
                    System.out.println("🔄 Increasing purchase count from "
                            + existing.getPurchaseCount() + " ➜ " + (existing.getPurchaseCount() + quantity));
                    existing.setPurchaseCount(existing.getPurchaseCount() + quantity);
                } else {
                    System.out.println("🆕 Adding new menuId to purchase history: " + menuId);
                    User.PurchaseHistory newHistory = new User.PurchaseHistory();
                    newHistory.setMenuId(menuId);
                    newHistory.setPurchaseCount(quantity);
                    histories.add(newHistory);
                }
            }

            user.setPurchaseHistories(new ArrayList<>(histories));
            System.out.println("💾 Saving user: " + user.getEmail());
            userRepository.save(user);
            System.out.println("✅ User purchase history updated successfully!");
            System.out.println("📊 Final purchase history size: " + user.getPurchaseHistories().size());
            System.out.println("==============================================================");

        }, () -> {
            System.out.println("❌ No user found for userId: " + order.getUserId());
            System.out.println("==============================================================");
        });
    }



    // ✅ Create Razorpay payment order (for online payments) - UPDATED
    public Map<String, Object> createPaymentOrder(Orders order) throws Exception {
        try {
            // Calculate totals with dynamic settings
            double subtotal = calculateSubtotal(order);
            double tax = appSettingsService.getGstAmount(subtotal);
            double deliveryFee = appSettingsService.getDeliveryCharge(subtotal);
            double totalAmount = subtotal + tax + deliveryFee;

            // Initialize Razorpay client
            RazorpayClient client = new RazorpayClient(razorpayKeyId.trim(), razorpaySecret.trim());

            // Razorpay order options
            JSONObject options = new JSONObject();
            options.put("amount", (int) (totalAmount * 100)); // amount in paise
            options.put("currency", "INR");
            options.put("receipt", "order_rcpt_" + System.currentTimeMillis());
            options.put("payment_capture", 1); // Auto capture payment

            // Create Razorpay order
            Order razorpayOrder = client.orders.create(options);

            // Save local order with proper details
            order.setTotalAmount(totalAmount);
            order.setDeliveryFee(deliveryFee);
            order.setTax(tax);
            order.setOrderStatus("Payment Initiated");
            order.setPaymentStatus("Pending");

            // ✅ SET DATES AND CUSTOM ORDER ID
            if (order.getCreatedAt() == null) {
                order.setCreatedAt(new Date());
            }
            order.setUpdatedAt(new Date());

            if (order.getAdhijevanOrderId() == null) {
                order.setAdhijevanOrderId(generateCustomOrderId());
            }

            Orders savedOrder = orderRepository.save(order);

            // Prepare response for frontend
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", razorpayOrder.get("id"));
            response.put("amount", razorpayOrder.get("amount"));
            response.put("currency", razorpayOrder.get("currency"));
            response.put("status", razorpayOrder.get("status"));
            response.put("key", razorpayKeyId.trim());
            response.put("adhijevanOrderId", savedOrder.getAdhijevanOrderId());
            response.put("databaseOrderId", savedOrder.getId());
            response.put("totalAmount", totalAmount);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Error creating payment order: " + e.getMessage(), e);
        }
    }

    // ✅ Verify Razorpay payment signature and update order - UPDATED
    public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId,
                                 String razorpaySignature, String orderId) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(razorpaySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            StringBuilder generatedSignature = new StringBuilder();
            for (byte b : hash) {
                generatedSignature.append(String.format("%02x", b));
            }

            boolean isValid = generatedSignature.toString().equals(razorpaySignature);
            System.out.println("💳 [verifyPayment] Razorpay signature validation = " + isValid);

            // ✅ If valid payment, update order and user purchase history
            if (isValid) {
                Orders paidOrder = updateOrderPaymentStatus(orderId, "Paid", "Confirmed");
                if (paidOrder != null) {
                    System.out.println("💰 Payment confirmed for order: " + paidOrder.getId());
                    updateUserPurchaseHistory(paidOrder); // ✅ this updates the user now
                } else {
                    System.out.println("⚠️ Order not found for ID: " + orderId);
                }
            } else {
                System.out.println("❌ Invalid Razorpay signature for order ID: " + orderId);
            }

            return isValid;

        } catch (Exception e) {
            System.out.println("❌ [verifyPayment] Error verifying payment: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }


    // ✅ Update order payment status - NEW METHOD
    public Orders updateOrderPaymentStatus(String orderId, String paymentStatus, String orderStatus) {
        try {
            Orders order = orderRepository.findById(orderId).orElse(null);
            if (order != null) {
                order.setPaymentStatus(paymentStatus);
                order.setOrderStatus(orderStatus);
                order.setUpdatedAt(new Date());
                return orderRepository.save(order);
            }
            return null;
        } catch (Exception e) {
            throw new RuntimeException("Error updating order status: " + e.getMessage(), e);
        }
    }

    // ✅ Calculate subtotal from order items
    private double calculateSubtotal(Orders order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return 0.0;
        }
        return order.getOrderItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    // ✅ Generate custom order ID - NEW METHOD
    private String generateCustomOrderId() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf(new Random().nextInt(900) + 100); // 3-digit random
        return "ADHI" + timestamp.substring(timestamp.length() - 8) + random;
    }

    // ✅ Get all orders - UPDATED with sorting
    public List<Orders> getAllOrders() {
        List<Orders> orders = orderRepository.findAll();
        // Sort by creation date (newest first)
        orders.sort((o1, o2) -> {
            Date date1 = o1.getCreatedAt() != null ? o1.getCreatedAt() : new Date(0);
            Date date2 = o2.getCreatedAt() != null ? o2.getCreatedAt() : new Date(0);
            return date2.compareTo(date1); // Descending order
        });
        return orders;
    }

    // ✅ Get orders by user ID - NEW METHOD
    public List<Orders> getOrdersByUserId(String userId) {
        List<Orders> orders = orderRepository.findByUserId(userId);
        // Sort by creation date (newest first)
        orders.sort((o1, o2) -> {
            Date date1 = o1.getCreatedAt() != null ? o1.getCreatedAt() : new Date(0);
            Date date2 = o2.getCreatedAt() != null ? o2.getCreatedAt() : new Date(0);
            return date2.compareTo(date1); // Descending order
        });
        return orders;
    }

    // ✅ Get order by ID
    public Orders getOrderById(String id) {
        return orderRepository.findById(id).orElse(null);
    }

    // ✅ Get order by Adhijevan Order ID - NEW METHOD
    public Orders getOrderByAdhijevanId(String adhijevanOrderId) {
        return orderRepository.findByAdhijevanOrderId(adhijevanOrderId);
    }

    // ✅ Delete order
    public void deleteOrder(String id) {
        orderRepository.deleteById(id);
    }

    // ✅ Update order status
    public Orders updateOrderStatus(String id, String status) {
        Orders order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setOrderStatus(status);
            order.setUpdatedAt(new Date());
            return orderRepository.save(order);
        }
        return null;
    }

    // ✅ Get orders by status - NEW METHOD
    public List<Orders> getOrdersByStatus(String status) {
        return orderRepository.findByOrderStatus(status);
    }

    // ✅ Get orders count by user - NEW METHOD
    public long getOrdersCountByUser(String userId) {
        return orderRepository.findByUserId(userId).size();
    }

    // ✅ Cancel order with validation - NEW METHOD
    public Orders cancelOrder(String orderId, String userId) {
        try {
            System.out.println("🔄 Attempting to cancel order: " + orderId + " for user: " + userId);

            // Find the order
            Orders order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                System.out.println("❌ Order not found: " + orderId);
                throw new RuntimeException("Order not found");
            }

            // Check if user owns the order
            if (!order.getUserId().equals(userId)) {
                System.out.println("❌ User " + userId + " not authorized to cancel order: " + orderId);
                throw new RuntimeException("Not authorized to cancel this order");
            }

            // Check if order can be cancelled (within 20 minutes)
            Date orderDate = order.getCreatedAt() != null ? order.getCreatedAt() : new Date();
            Date currentTime = new Date();
            long timeDifference = (currentTime.getTime() - orderDate.getTime()) / (1000 * 60); // minutes

            System.out.println("⏰ Order time: " + orderDate + ", Current time: " + currentTime);
            System.out.println("⏰ Time difference: " + timeDifference + " minutes");

            if (timeDifference > 20) {
                System.out.println("❌ Order cancellation time expired: " + timeDifference + " minutes passed");
                throw new RuntimeException("Order can only be cancelled within 20 minutes of placement");
            }

            // Check if order is in cancellable status
            String currentStatus = order.getOrderStatus();
            List<String> cancellableStatuses = Arrays.asList("Pending", "Payment Initiated", "Preparing", "Confirmed");

            if (!cancellableStatuses.contains(currentStatus)) {
                System.out.println("❌ Order cannot be cancelled in current status: " + currentStatus);
                throw new RuntimeException("Order cannot be cancelled in current status: " + currentStatus);
            }

            // Update order status
            order.setOrderStatus("Cancelled");
            order.setPaymentStatus("Cancelled");
            order.setUpdatedAt(new Date());

            Orders cancelledOrder = orderRepository.save(order);
            System.out.println("✅ Order cancelled successfully: " + orderId);

            return cancelledOrder;

        } catch (Exception e) {
            System.out.println("❌ Error cancelling order: " + e.getMessage());
            throw new RuntimeException("Error cancelling order: " + e.getMessage(), e);
        }
    }

    // ✅ Check if order can be cancelled - NEW METHOD (Utility method)
    public Map<String, Object> checkOrderCancellable(String orderId, String userId) {
        try {
            Orders order = orderRepository.findById(orderId).orElse(null);
            Map<String, Object> response = new HashMap<>();

            if (order == null) {
                response.put("cancellable", false);
                response.put("message", "Order not found");
                return response;
            }

            // Check ownership
            if (!order.getUserId().equals(userId)) {
                response.put("cancellable", false);
                response.put("message", "Not authorized");
                return response;
            }

            // Check time (20 minutes limit)
            Date orderDate = order.getCreatedAt() != null ? order.getCreatedAt() : new Date();
            Date currentTime = new Date();
            long timeDifference = (currentTime.getTime() - orderDate.getTime()) / (1000 * 60);

            // Check status
            String currentStatus = order.getOrderStatus();
            List<String> cancellableStatuses = Arrays.asList("Pending", "Payment Initiated", "Preparing", "Confirmed");

            boolean isCancellable = timeDifference <= 20 && cancellableStatuses.contains(currentStatus);

            response.put("cancellable", isCancellable);
            response.put("timeRemaining", 20 - timeDifference);
            response.put("currentStatus", currentStatus);
            response.put("orderTime", orderDate);
            response.put("currentTime", currentTime);

            if (!isCancellable) {
                if (timeDifference > 20) {
                    response.put("message", "Order can only be cancelled within 20 minutes of placement");
                } else {
                    response.put("message", "Order cannot be cancelled in current status: " + currentStatus);
                }
            } else {
                response.put("message", "Order can be cancelled");
            }

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("cancellable", false);
            errorResponse.put("message", "Error checking order status: " + e.getMessage());
            return errorResponse;
        }
    }

    public Orders updateOrderAddress(String orderId, Address newAddress) {
        // Fetch the existing order
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Initialize list if null
        if (order.getAddresses() == null) {
            order.setAddresses(new ArrayList<>());
        }

        // Mark previous address' updatedAt if exists
        if (!order.getAddresses().isEmpty()) {
            Address lastAddress = order.getAddresses().get(order.getAddresses().size() - 1);
            lastAddress.setUpdatedAt(new Date());
        }

        // Set createdAt for new address
//        newAddress.setCreatedAt(new Date());
//        newAddress.setUpdatedAt(new Date());

        // Add new address to the list
        order.getAddresses().add(newAddress);

        // Update main updatedAt timestamp for order
        order.setUpdatedAt(new Date());

        // Save and return updated order
        return orderRepository.save(order);
    }


    public Page<Orders> getAllPaged(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    public Page<Orders> getOrdersByStatusPaged(String status, Pageable pageable) {
        return orderRepository.findByOrderStatusIgnoreCase(status, pageable);
    }

    public Page<Orders> searchOrdersPaged(String search, Pageable pageable) {
        return orderRepository.findByCustomerNameContainingIgnoreCaseOrCustomerPhoneContainingIgnoreCaseOrAdhijevanOrderIdContainingIgnoreCase(
                search, search, search, pageable);
    }

    public Page<Orders> getOrdersByDateRangePaged(String dateFrom, String dateTo, Pageable pageable) {
        LocalDate from = (dateFrom != null && !dateFrom.isEmpty()) ? LocalDate.parse(dateFrom) : LocalDate.MIN;
        LocalDate to = (dateTo != null && !dateTo.isEmpty()) ? LocalDate.parse(dateTo) : LocalDate.now();
        return orderRepository.findByCreatedAtBetween(from.atStartOfDay(), to.atTime(23, 59, 59), pageable);
    }



}
