package com.adhijevan.controller;

import com.adhijevan.model.Address;
import com.adhijevan.model.Orders;
import com.adhijevan.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // 🧾 Create new order (COD orders)
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Orders order) {
        try {
            Orders createdOrder = orderService.createOrder(order);
            return ResponseEntity.ok(createdOrder);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 📜 Get all orders (sorted by date - newest first)
    @GetMapping
    public ResponseEntity<List<Orders>> getAllOrders() {
        try {
            List<Orders> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 👤 Get orders by user ID (NEW ADDED)
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable String userId) {
        try {
            List<Orders> orders = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch user orders");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 🔍 Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable String id) {
        try {
            Orders order = orderService.getOrderById(id);
            if (order != null) {
                return ResponseEntity.ok(order);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Order not found");
                errorResponse.put("message", "Order with ID " + id + " not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 🔍 Get order by Adhijevan Order ID (NEW ADDED)
    @GetMapping("/adhijevan/{adhijevanOrderId}")
    public ResponseEntity<?> getOrderByAdhijevanId(@PathVariable String adhijevanOrderId) {
        try {
            Orders order = orderService.getOrderByAdhijevanId(adhijevanOrderId);
            if (order != null) {
                return ResponseEntity.ok(order);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Order not found");
                errorResponse.put("message", "Order with ID " + adhijevanOrderId + " not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ❌ Delete order
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable String id) {
        try {
            orderService.deleteOrder(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Order deleted successfully with ID: " + id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 🔄 Update order status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestParam String status) {
        try {
            Orders updatedOrder = orderService.updateOrderStatus(id, status);
            if (updatedOrder != null) {
                return ResponseEntity.ok(updatedOrder);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Order not found");
                errorResponse.put("message", "Order with ID " + id + " not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update order status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 💳 Update payment status (NEW ADDED)
    @PutMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable String id, 
                                               @RequestParam String paymentStatus,
                                               @RequestParam(required = false) String orderStatus) {
        try {
            Orders updatedOrder = orderService.updateOrderPaymentStatus(id, paymentStatus, orderStatus);
            if (updatedOrder != null) {
                return ResponseEntity.ok(updatedOrder);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Order not found");
                errorResponse.put("message", "Order with ID " + id + " not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update payment status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 💰 Create Razorpay payment order
    @PostMapping("/create-payment")
    public ResponseEntity<?> createPaymentOrder(@RequestBody Orders order) {
        try {
            Map<String, Object> paymentOrder = orderService.createPaymentOrder(order);
            return ResponseEntity.ok(paymentOrder);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create payment order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ✅ Verify Razorpay payment signature (UPDATED)
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            String razorpayOrderId = data.get("razorpay_order_id");
            String razorpayPaymentId = data.get("razorpay_payment_id");
            String razorpaySignature = data.get("razorpay_signature");
            String orderId = data.get("order_id"); // ✅ ADDED: Database order ID

            if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Missing payment verification data");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // ✅ UPDATED: Pass orderId to update database
            boolean isValid = orderService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", isValid);
            response.put("message", isValid ? "Payment verified successfully" : "Payment verification failed");
            
            if (isValid) {
                response.put("orderStatus", "Confirmed");
                response.put("paymentStatus", "Paid");
            }

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Payment verification error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 📊 Get orders count by user (NEW ADDED)
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<?> getOrdersCountByUser(@PathVariable String userId) {
        try {
            long count = orderService.getOrdersCountByUser(userId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get orders count");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 📊 Get orders by status (NEW ADDED)
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            List<Orders> orders = orderService.getOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch orders by status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 🏠 Health check endpoint (NEW ADDED)
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Order Service");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }
 // ❌ Cancel order - NEW ENDPOINT (CORS FIXED)
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
        @PathVariable String orderId, 
        @RequestHeader(value = "userId", required = false) String userId,
        @RequestBody(required = false) Map<String, String> requestBody) {
        
        try {
            System.out.println("🎯 Cancel order request - Order: " + orderId + ", User: " + userId);
            
            // Alternative: Get userId from request body if header doesn't work
            if (userId == null && requestBody != null) {
                userId = requestBody.get("userId");
            }
            
            if (userId == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "User ID is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Orders cancelledOrder = orderService.cancelOrder(orderId, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order cancelled successfully");
            response.put("order", cancelledOrder);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Cancel order error: " + e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to cancel order");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @PutMapping("/{orderId}/address")
    public ResponseEntity<?> updateOrderAddress(
            @PathVariable String orderId,
            @RequestBody Address newAddress) {

        try {
            if (newAddress == null) {
                return ResponseEntity.badRequest().body("Address data is missing");
            }

            Orders updatedOrder = orderService.updateOrderAddress(orderId, newAddress);

            return ResponseEntity.ok().body(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating address: " + e.getMessage());
        }
    }

    @GetMapping("/paged")
    public ResponseEntity<?> getPagedOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {

        final String LOG_PREFIX = "[getPagedOrders] ";
        try {
            log.info("{}Fetching page {} with size {}", LOG_PREFIX, page, size);

            // ✅ Always sort by newest first
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

            Page<Orders> orders;

            if (status != null && !status.isEmpty()) {
                log.info("{}Filtering by status: {}", LOG_PREFIX, status);
                orders = orderService.getOrdersByStatusPaged(status, pageable);
            } else if (search != null && !search.isEmpty()) {
                log.info("{}Filtering by search: {}", LOG_PREFIX, search);
                orders = orderService.searchOrdersPaged(search, pageable);
            } else if (dateFrom != null || dateTo != null) {
                log.info("{}Filtering by date range: {} - {}", LOG_PREFIX, dateFrom, dateTo);
                orders = orderService.getOrdersByDateRangePaged(dateFrom, dateTo, pageable);
            } else {
                orders = orderService.getAllPaged(pageable);
            }

            log.info("{}Fetched {} orders (page {} of {})", LOG_PREFIX,
                    orders.getNumberOfElements(), orders.getNumber() + 1, orders.getTotalPages());

            Map<String, Object> response = new HashMap<>();
            response.put("content", orders.getContent());
            response.put("totalElements", orders.getTotalElements());
            response.put("totalPages", orders.getTotalPages());
            response.put("pageNumber", orders.getNumber());
            response.put("pageSize", orders.getSize());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("{}Error fetching paged orders: {}", LOG_PREFIX, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch orders", "message", e.getMessage()));
        }
    }



}