package com.adhijevan.model;

import com.adhijevan.Enums.BoxType;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "custmize_box")
public class CustomizeBox {


    @Id
    private String id;

    private List<String> sabjiId;//menuId

    private int sabjiCount;//how much sujis are allow

    private BoxType boxType;

    private  Double price;

    private List<String> rotiType;

    private int chapptiCount;

    private Boolean isRice;

    private Boolean isActive;

    private Boolean isDesert;

    private int desertCount;

}
