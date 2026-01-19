package com.bloom.backend.security;

import com.bloom.backend.models.Role;
import com.bloom.backend.models.User;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class AuthUserDetails implements UserDetails {

    private Long id;
    private String username;
    private String password;
    private boolean isBanned;
    private List<GrantedAuthority> authorities;

    public AuthUserDetails(User user) {
        id = user.getId();
        username = user.getUsername();
        password = user.getPassword();
        isBanned = user.isBanned();
        authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
    }

    public Long getId() {
        return id;
    }

    @Override
    public @NonNull  Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public @Nullable String getPassword() {
        return password;
    }


    @Override
    public @NonNull String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isBanned;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !isBanned;
    }
}
