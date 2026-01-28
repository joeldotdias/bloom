package com.bloom.backend.services;

import com.bloom.backend.models.User;
import com.bloom.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final S3Service s3Service;

    public UserService(UserRepository userRepository, S3Service s3Service) {
        this.userRepository = userRepository;
        this.s3Service = s3Service;
    }

    public String uploadPfp(Long userId, MultipartFile file) {
        try {
            String s3Key = s3Service.uploadProfilePicture(file, userId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("user not found"));
            user.setPfp(s3Key);
            userRepository.save(user);

            return s3Service.createPresignedUrl(s3Key);
        } catch (IOException e) {
            throw new RuntimeException("couldn't to upload image to S3", e);
        }
    }
}
