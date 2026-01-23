package com.bloom.backend.models;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@RedisHash(value = "refresh_token", timeToLive = 2592000)
public class RefreshToken implements Serializable {

    @Id
    private String id;

    @Indexed
    private String username;

    private Role role;
    private String ipAddr;
    private String deviceInfo;
    private LocalDateTime lastUsedAt;

    public RefreshToken(String id, String username, Role role, String ipAddr, String deviceInfo) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.ipAddr = ipAddr;
        this.deviceInfo = deviceInfo;
        this.lastUsedAt = LocalDateTime.now();
    }
}
