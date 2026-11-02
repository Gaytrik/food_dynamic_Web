package com.adhijevan.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "menu_items")
public class MenuItem {

    @Id
    private String id;

    private String menuName;
    private String menuCategory;
    private String menuSubCategory;
    private double price;
    private String description;
    private String imageUrl;
    private boolean available = true;

    private String preparationTime;
    private String spiceLevel;

    // ✅ AVAILABILITY ARRAY ADD KARO
    private List<String> availability;

    // Today's Menu fields
    private Boolean isTodaysSpecial = false;
    private Integer todaysMenuPosition;
    private String todaysMenuDate;
    private List<Reviews> reviews;

    public MenuItem() {}

    public MenuItem(String id, String menuName, String menuCategory, String menuSubCategory,
                    double price, String description, String imageUrl, boolean available,
                    String preparationTime, String spiceLevel, List<String> availability) {
        this.id = id;
        this.menuName = menuName;
        this.menuCategory = menuCategory;
        this.menuSubCategory = menuSubCategory;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.available = available;
        this.preparationTime = preparationTime;
        this.spiceLevel = spiceLevel;
        this.availability = availability; // ✅ ADD THIS
    }

    // ... existing getters & setters ...

    // ✅ AVAILABILITY GETTER & SETTER ADD KARO
    public List<String> getAvailability() {
        return availability;
    }

    public void setAvailability(List<String> availability) {
        this.availability = availability;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMenuName() {
        return menuName;
    }

    public void setMenuName(String menuName) {
        this.menuName = menuName;
    }

    public String getMenuCategory() {
        return menuCategory;
    }

    public void setMenuCategory(String menuCategory) {
        this.menuCategory = menuCategory;
    }

    public String getMenuSubCategory() {
        return menuSubCategory;
    }

    public void setMenuSubCategory(String menuSubCategory) {
        this.menuSubCategory = menuSubCategory;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getPreparationTime() {
        return preparationTime;
    }

    public void setPreparationTime(String preparationTime) {
        this.preparationTime = preparationTime;
    }

    public String getSpiceLevel() {
        return spiceLevel;
    }

    public void setSpiceLevel(String spiceLevel) {
        this.spiceLevel = spiceLevel;
    }

    // Today's Menu getters and setters
    public Boolean getIsTodaysSpecial() {
        return isTodaysSpecial;
    }

    public void setIsTodaysSpecial(Boolean isTodaysSpecial) {
        this.isTodaysSpecial = isTodaysSpecial;
    }

    public Integer getTodaysMenuPosition() {
        return todaysMenuPosition;
    }

    public void setTodaysMenuPosition(Integer todaysMenuPosition) {
        this.todaysMenuPosition = todaysMenuPosition;
    }

    public String getTodaysMenuDate() {
        return todaysMenuDate;
    }

    public void setTodaysMenuDate(String todaysMenuDate) {
        this.todaysMenuDate = todaysMenuDate;
    }

    public Boolean getTodaysSpecial() {
        return isTodaysSpecial;
    }

    public void setTodaysSpecial(Boolean todaysSpecial) {
        isTodaysSpecial = todaysSpecial;
    }

    public List<Reviews> getReviews() {
        return reviews;
    }

    public void setReviews(List<Reviews> reviews) {
        this.reviews = reviews;
    }
}