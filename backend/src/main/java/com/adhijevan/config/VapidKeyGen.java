package com.adhijevan.config;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.util.Base64;

public class VapidKeyGen {
    public static void main(String[] args) throws NoSuchAlgorithmException {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("EC");
        keyGen.initialize(256); // EC curve for P-256
        KeyPair keyPair = keyGen.generateKeyPair();

        String publicKey = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(((ECPublicKey) keyPair.getPublic()).getEncoded());
        String privateKey = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(((ECPrivateKey) keyPair.getPrivate()).getEncoded());

        System.out.println("PUBLIC  = " + publicKey);
        System.out.println("PRIVATE = " + privateKey);
    }
}
