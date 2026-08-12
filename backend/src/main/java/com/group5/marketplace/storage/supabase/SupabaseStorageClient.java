package com.group5.marketplace.storage.supabase;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;

@Component
public class SupabaseStorageClient {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    @Value("${supabase.bucket:product-images}")
    private String bucket;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private void ensureConfigured() throws IOException {
        if (supabaseUrl == null || supabaseUrl.isBlank() || supabaseKey == null || supabaseKey.isBlank()) {
            throw new IOException("Supabase properties not configured. Set 'supabase.url' and 'supabase.key' in application.properties or as environment variables.");
        }
    }

    // Uploads file and returns public URL
    public String uploadFile(Long productId, MultipartFile file) throws IOException, InterruptedException {
        ensureConfigured();
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String timestamp = String.valueOf(Instant.now().toEpochMilli());
        String path = String.format("products/%d/%s_%s", productId, timestamp, original);

        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, path);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .header("Authorization", "Bearer " + supabaseKey)
                .header("apikey", supabaseKey)
                .header("Content-Type", file.getContentType() == null ? "application/octet-stream" : file.getContentType())
                .PUT(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();

        HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
            throw new IOException("Supabase upload failed: " + resp.statusCode() + " " + resp.body());
        }

        // public URL (assumes bucket is public)
        return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucket, path);
    }

    public void deleteFile(String objectPath) throws IOException, InterruptedException {
        ensureConfigured();
        if (objectPath == null) return;
        // objectPath expected to be the storage path after /public/{bucket}/
        // if full public URL provided, try to extract path
        String path = objectPath;
        int idx = objectPath.indexOf("/storage/v1/object/public/");
        if (idx >= 0) {
            path = objectPath.substring(idx + "/storage/v1/object/public/".length());
            // path contains bucket/.... remove leading bucket/
            if (path.startsWith(bucket + "/")) {
                path = path.substring((bucket + "/").length());
            }
        }

        String deleteUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, path);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(deleteUrl))
                .header("Authorization", "Bearer " + supabaseKey)
                .header("apikey", supabaseKey)
                .DELETE()
                .build();

        HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
            throw new IOException("Supabase delete failed: " + resp.statusCode() + " " + resp.body());
        }
    }
}
