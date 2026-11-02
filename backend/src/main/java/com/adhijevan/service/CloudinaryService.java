package com.adhijevan.service;



import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }



    public String uploadFile(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        return uploadResult.get("secure_url").toString();
    }

    // Delete by URL
    public void deleteByUrls(String url) throws IOException {
        String publicId = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    // Upload a single file (safe version)
    public String uploadImage(MultipartFile file) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    // Upload multiple files and return URLs
    public List<String> uploadFiles(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                try {
                    urls.add(uploadFile(file));
                } catch (IOException e) {
                }
            }
        }
        return urls;
    }

    // Upload an image from external URL to Cloudinary
    public String uploadImageFromUrl(String imageUrl) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(imageUrl, ObjectUtils.emptyMap());
        return uploadResult.get("secure_url").toString();
    }


//     Delete an image from Cloudinary by its secure URL
    public void deleteByUrl(String secureUrl) {
        if (secureUrl == null || secureUrl.isEmpty()) return;
        try {
            // Extract public_id from URL: .../upload/(v123/)?<public_id>.<ext>
            // This keeps folder paths in public_id.
            String marker = "/upload/";
            int idx = secureUrl.indexOf(marker);
            if (idx == -1) return;
            String after = secureUrl.substring(idx + marker.length());
            // Remove version prefix like v123/
            if (after.startsWith("v")) {
                int slash = after.indexOf('/');
                if (slash != -1) after = after.substring(slash + 1);
            }
            // Strip file extension
            int dot = after.lastIndexOf('.');
            String publicId = dot != -1 ? after.substring(0, dot) : after;

            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete image from Cloudinary", e);
        }
    }
}