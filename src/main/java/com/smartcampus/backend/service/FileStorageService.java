package com.smartcampus.backend.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
@Service
public class FileStorageService {
    @Value("${file.upload-dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file) {

         try {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        File dir = new File(uploadDir);

        System.out.println("UPLOAD DIR: " + dir.getAbsolutePath());
        System.out.println("FILE NAME: " + fileName);

        if (!dir.exists()) {
            dir.mkdirs();
        }

        File destination = new File(dir.getAbsolutePath() + File.separator + fileName);

        file.transferTo(destination);

        return fileName;

    } catch (IOException e) {
        e.printStackTrace();
        throw new RuntimeException("File upload failed");
    }
    }
}
