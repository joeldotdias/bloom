package com.bloom.backend.services;

import com.bloom.backend.dto.UpdateProfileRequest;
import com.bloom.backend.dto.UserProfile;
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

    public UserProfile getUserProfile(String username, Long currentUserId) {
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("user not found: " + username));

        boolean isOwner = user.getId().equals(currentUserId);
        String pfpUrl = s3Service.createPresignedUrl(user.getPfp());

        return UserProfile.fromEntity(
                user,
                isOwner,
                pfpUrl
        );
    }

    public UserProfile updateProfileDetails(Long userId, UpdateProfileRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("user not found"));

        if (updateRequest.name() != null) user.setName(updateRequest.name());
        if (updateRequest.bio() != null) user.setBio(updateRequest.bio());
        if (updateRequest.location() != null) user.setLocation(updateRequest.location());

        User updatedUser = userRepository.save(user);

        return getUserProfile(updatedUser.getUsername(), userId);
    }
}
