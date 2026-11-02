package com.adhijevan.controller;

import com.adhijevan.model.CustomizeFruiteBowl;
import com.adhijevan.service.CustomizeFruiteBowlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/fruit-bowl")
@CrossOrigin(origins = "*") // allows frontend apps to call it
public class CustomizeFruiteBowlController {

    @Autowired
    private CustomizeFruiteBowlService fruitBowlService;

    // ✅ Create a new fruit bowl
//    @PostMapping
//    public ResponseEntity<CustomizeFruiteBowl> createFruitBowl(@RequestBody CustomizeFruiteBowl fruitBowl) {
//        CustomizeFruiteBowl savedBowl = fruitBowlService.saveFruitBowl(fruitBowl);
//        return ResponseEntity.ok(savedBowl);
//    }

    // ✅ Get all fruit bowls
    @GetMapping
    public ResponseEntity<List<CustomizeFruiteBowl>> getAllFruitBowls() {
        return ResponseEntity.ok(fruitBowlService.getAllFruitBowls());
    }

    // ✅ Get fruit bowl by ID
    @GetMapping("/{id}")
    public Optional<CustomizeFruiteBowl> getFruitBowlById(@PathVariable String id) {
        return fruitBowlService.getFruitBowlById(id);
    }

    // ✅ Update fruit bowl (basic details + replace fruit list)
    @PutMapping("/{id}")
    public ResponseEntity<CustomizeFruiteBowl> updateFruitBowl(
            @PathVariable String id,
            @RequestBody CustomizeFruiteBowl fruitBowl) {

        System.out.println("✅ Controller reached: " + id);
        System.out.println("Request body: " + fruitBowl);

        CustomizeFruiteBowl updatedBowl = fruitBowlService.updateFruitBowl(id, fruitBowl);
        return ResponseEntity.ok(updatedBowl);
    }


}

