package com.adhijevan.service;

import com.adhijevan.model.Delivery;
import com.adhijevan.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    // Create or Update
    public Delivery saveDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }

    // Read all
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    // Read by ID
    public Optional<Delivery> getDeliveryByUserId(String userId) {
        return deliveryRepository.findByUserId();
    }

    // Delete by ID
    public boolean deleteDelivery(String id) {
        if (deliveryRepository.existsById(id)) {
            deliveryRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Update specific delivery
    public Delivery updateDelivery(String id, Delivery updatedDelivery) {
        return deliveryRepository.findById(id).map(existing -> {
            existing.setUserId(updatedDelivery.getUserId());
            existing.setOrderIds(updatedDelivery.getOrderIds());
            existing.setTotalDelivery(updatedDelivery.getTotalDelivery());
            existing.setIsActive(updatedDelivery.getIsActive());
            return deliveryRepository.save(existing);
        }).orElse(null);
    }
}
