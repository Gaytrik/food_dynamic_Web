package com.adhijevan.service;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Utils;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;

@Service
public class PushNotificationService {

    @Value("${vapid.public.key}")  private String publicKey;
    @Value("${vapid.private.key}") private String privateKey;
    @Value("${vapid.subject}")     private String subject;

    public void sendNotification(String endpoint, String p256dh, String auth, String payload)
            throws GeneralSecurityException, IOException, JoseException,
            java.util.concurrent.ExecutionException, InterruptedException {
        PushService pushService = new PushService();
        pushService.setPublicKey(Utils.loadPublicKey(publicKey));
        pushService.setPrivateKey(Utils.loadPrivateKey(privateKey));
        pushService.setSubject(subject);

        Notification notification = new Notification(endpoint, p256dh, auth, payload.getBytes());
        pushService.send(notification);
    }

}
