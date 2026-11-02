
package com.adhijevan.model;

import com.adhijevan.Enums.FruitBowlType;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "fruit_plates")
public class CustomizeFruiteBowl {

    @Id
    private String id;

    private List<String> fruitIds;

    private FruitBowlType type;

    private int fruitCount;

    private Double price;

    private Boolean isActive;
}