package com.adhijevan.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Document(collection = "orders")
public class Orders {

    @Id
    private String id;

    private String userId;
    private String customerName;
    private String customerPhone;
    private List<Address> addresses; // ✅ Multiple addresses support
    private String paymentStatus;
    private String orderStatus;
    private List<OrderItem> orderItems;
    private double totalAmount;
    private double deliveryFee;
    private double tax;

    // ✅ NEW FIELD (required for COD logic)
    private String paymentMethod; // e.g., "COD" or "ONLINE"

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    private String adhijevanOrderId;

    // ✅ Default constructor
    public Orders() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.adhijevanOrderId = generateOrderId();
        this.paymentStatus = "Pending";
        this.orderStatus = "Confirmed";
    }

    // ✅ Constructor with parameters
    public Orders(String userId, String customerName, String customerPhone,
                  List<Address> addresses, List<OrderItem> orderItems,
                  double totalAmount, String paymentMethod) {
        this();
        this.userId = userId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.addresses = addresses;
        this.orderItems = orderItems;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
    }

    // ✅ Generate custom order ID
    private String generateOrderId() {
        return "ADHI" + System.currentTimeMillis();
    }

    // ✅ Getters and Setters
    public String getId() { return id; }

    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }

    public void setUserId(String userId) { this.userId = userId; }

    public String getCustomerName() { return customerName; }

    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }

    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public List<Address> getAddresses() { return addresses; }

    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses;
        this.updatedAt = new Date();
    }

    public String getPaymentStatus() { return paymentStatus; }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
        this.updatedAt = new Date();
    }

    public String getOrderStatus() { return orderStatus; }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
        this.updatedAt = new Date();
    }

    public List<OrderItem> getOrderItems() { return orderItems; }

    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }

    public double getTotalAmount() { return totalAmount; }

    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public double getDeliveryFee() { return deliveryFee; }

    public void setDeliveryFee(double deliveryFee) { this.deliveryFee = deliveryFee; }

    public double getTax() { return tax; }

    public void setTax(double tax) { this.tax = tax; }

    public String getPaymentMethod() { return paymentMethod; }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
        this.updatedAt = new Date();
    }

    public Date getCreatedAt() { return createdAt; }

    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }

    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public String getAdhijevanOrderId() { return adhijevanOrderId; }

    public void setAdhijevanOrderId(String adhijevanOrderId) { this.adhijevanOrderId = adhijevanOrderId; }

    @Override
    public String toString() {
        return "Orders{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", customerName='" + customerName + '\'' +
                ", customerPhone='" + customerPhone + '\'' +
                ", addresses=" + addresses +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", paymentStatus='" + paymentStatus + '\'' +
                ", orderStatus='" + orderStatus + '\'' +
                ", totalAmount=" + totalAmount +
                ", createdAt=" + createdAt +
                ", adhijevanOrderId='" + adhijevanOrderId + '\'' +
                '}';
    }
}
