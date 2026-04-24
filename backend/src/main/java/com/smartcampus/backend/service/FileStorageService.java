package com.smartcampus.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file) {
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File dir = new File(uploadDir);

            if (!dir.exists() && !dir.mkdirs()) {
                log.warn("Upload directory could not be created.");
                throw new RuntimeException("File upload failed");
            }

            File destination = new File(dir.getAbsolutePath() + File.separator + fileName);
            file.transferTo(destination);
            return fileName;
        } catch (IOException ex) {
            log.warn("File upload failed due to IO issue: {}", ex.getMessage());
            throw new RuntimeException("File upload failed");
        }
    }
}
