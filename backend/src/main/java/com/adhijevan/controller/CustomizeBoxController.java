package com.adhijevan.controller;

import com.adhijevan.model.CustomizeBox;
import com.adhijevan.service.CustomizeBoxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/box")
@CrossOrigin(origins = "*") // allows frontend apps to call it
public class CustomizeBoxController {

    @Autowired
    private CustomizeBoxService customizeBoxService;

    // ✅ Create new box
    @PostMapping
    public ResponseEntity<CustomizeBox> createBox(@RequestBody CustomizeBox customizeBox) {
        CustomizeBox savedBox = customizeBoxService.saveBox(customizeBox);
        return ResponseEntity.ok(savedBox);
    }

    // ✅ Get all boxes
    @GetMapping
    public ResponseEntity<List<CustomizeBox>> getAllBoxes() {
        return ResponseEntity.ok(customizeBoxService.getAllBoxes());
    }

    // ✅ Get box by ID
    @GetMapping("/{id}")
    public Optional<CustomizeBox> getBoxById(@PathVariable String id) {
        return customizeBoxService.getBoxById(id);
    }

    // ✅ Update box (details + merge sabjis)
    @PutMapping("/{id}")
    public ResponseEntity<CustomizeBox> updateBox(
            @PathVariable String id,
            @RequestBody CustomizeBox customizeBox) {
        CustomizeBox updatedBox = customizeBoxService.updateBox(id, customizeBox);
        return ResponseEntity.ok(updatedBox);
    }

    // ✅ Add one or more sabjis to an existing box
    @PatchMapping("/{id}/add")
    public ResponseEntity<CustomizeBox> add(
            @PathVariable String id,
            @RequestBody Map<String, List<String>> requestBody) {

        List<String> sabjiIdsToAdd = requestBody.get("sabjiIdsToAdd");
        CustomizeBox updatedBox = customizeBoxService.addSabjis(id, sabjiIdsToAdd);
        return ResponseEntity.ok(updatedBox);
    }

    // ✅ Delete one or more sabjis from a box
    @PatchMapping("/{id}/remove")
    public ResponseEntity<CustomizeBox> remove(
            @PathVariable String id,
            @RequestBody Map<String, List<String>> requestBody) {

        List<String> sabjiIdsToRemove = requestBody.get("sabjiIdsToRemove");
        CustomizeBox updatedBox = customizeBoxService.deleteSabjis(id, sabjiIdsToRemove);
        return ResponseEntity.ok(updatedBox);
    }
}
