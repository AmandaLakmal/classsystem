package com.lms.classsystem.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

/**
 * Centralised, hardened file storage service.
 *
 * Responsibilities:
 *  • Sanitize filenames (strip path traversal, replace whitespace)
 *  • Validate allowed MIME types
 *  • Prefix with UUID to prevent collisions
 *  • Save to the configured upload directory
 *  • Return the public URL path for database storage
 *  • Delete physical files on retraction
 */
@Service
public class FileStorageService {

    /** Configured via app.upload.dir in application.properties */
    @Value("${app.upload.dir}")
    private String uploadDir;

    /** Configured via app.upload.profiles.dir in application.properties */
    @Value("${app.upload.profiles.dir}")
    private String profilesUploadDir;

    /** Allowed content types for student submission uploads */
    private static final Set<String> ALLOWED_SUBMISSION_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "image/gif",
            "text/plain"
    );

    /** Allowed content types for profile photos */
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    /**
     * Store an uploaded submission file securely.
     *
     * @param file the incoming MultipartFile from the HTTP request
     * @return the public URL path (e.g. /uploads/submissions/uuid_filename.pdf)
     * @throws IllegalArgumentException if the file is empty or type is not allowed
     * @throws IOException              if the file cannot be written to disk
     */
    public String storeSubmissionFile(MultipartFile file) throws IOException {

        // 1. Reject empty payloads
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload payload cannot be empty.");
        }

        // 2. Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_SUBMISSION_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "File type not permitted: " + contentType +
                    ". Allowed types: PDF, DOCX, DOC, JPEG, PNG, GIF, TXT."
            );
        }

        // 3. Sanitize filename — remove path traversal chars, replace spaces
        String originalName = file.getOriginalFilename();
        String safeName = sanitizeFilename(originalName);

        // 4. Prefix with UUID for collision-proofing
        String uniqueName = UUID.randomUUID().toString().replace("-", "") + "_" + safeName;

        // 5. Ensure the upload directory exists
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        // 6. Write the file (REPLACE_EXISTING is safe because UUID prefix ensures uniqueness)
        Path target = uploadPath.resolve(uniqueName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // 7. Return the public URL path stored in the database
        return "/uploads/submissions/" + uniqueName;
    }

    /**
     * Store a profile photo securely.
     * Only accepts image MIME types. Saves to the profiles sub-directory.
     *
     * @param file the incoming MultipartFile (JPEG, PNG, or WebP)
     * @return the public URL path (e.g. /uploads/profiles/uuid_photo.jpg)
     * @throws IllegalArgumentException if the file is empty or not an allowed image type
     * @throws IOException              if the file cannot be written to disk
     */
    public String storeProfilePhoto(MultipartFile file) throws IOException {

        // 1. Reject empty payloads
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Profile photo cannot be empty.");
        }

        // 2. Validate MIME type — only images permitted
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Profile photo type not permitted: " + contentType +
                    ". Allowed: JPEG, PNG, WebP, GIF."
            );
        }

        // 3. Sanitize filename
        String safeName = sanitizeFilename(file.getOriginalFilename());

        // 4. UUID prefix for collision-proofing
        String uniqueName = UUID.randomUUID().toString().replace("-", "") + "_" + safeName;

        // 5. Ensure profiles directory exists
        Path uploadPath = Paths.get(profilesUploadDir);
        Files.createDirectories(uploadPath);

        // 6. Write to disk
        Path target = uploadPath.resolve(uniqueName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // 7. Return public URL
        return "/uploads/profiles/" + uniqueName;
    }

    /**
     * Delete a previously stored submission file from disk.
     * Silently ignores missing files — safe to call even if the file was
     * already deleted manually or never written.
     *
     * @param fileUrl the stored URL path (e.g. /uploads/submissions/uuid_file.pdf)
     */
    public void deleteSubmissionFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        try {
            // Strip the URL prefix to get just the filename
            String fileName = Paths.get(fileUrl).getFileName().toString();
            Path physicalPath = Paths.get(uploadDir).resolve(fileName);
            Files.deleteIfExists(physicalPath);
        } catch (IOException ex) {
            // Log but never block — DB record deletion must proceed
            System.err.println("[FileStorageService] Could not delete file: " + fileUrl + " — " + ex.getMessage());
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Sanitize a filename by:
     *  1. Taking only the final path component (prevents directory traversal)
     *  2. Replacing whitespace with underscores
     *  3. Removing any remaining non-safe characters (keeps alphanum, dot, dash, underscore)
     */
    private String sanitizeFilename(String rawName) {
        if (rawName == null || rawName.isBlank()) {
            return "upload";
        }
        // Take the basename only (no path components)
        String basename = Paths.get(rawName).getFileName().toString();
        // Replace spaces
        String noSpaces = basename.replace(" ", "_");
        // Strip everything except safe characters
        return noSpaces.replaceAll("[^a-zA-Z0-9._\\-]", "");
    }
}
