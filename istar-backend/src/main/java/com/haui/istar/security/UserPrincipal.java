package com.haui.istar.security;

import com.haui.istar.model.User;
import com.haui.istar.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private Long id;
    private String username;
    private String email;
    private String password;
    private boolean enabled;
    private Set<String> roles;
    private Set<String> permissions;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        Set<String> roles = user.getRoleCodes();
        for (String role : roles) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
            if ("ADMIN".equalsIgnoreCase(role)) {
                authorities.add(new SimpleGrantedAuthority("ADMIN"));
            }
        }

        Set<String> permissions = user.getAllPermissionCodes();
        for (String code : permissions) {
            String permAuth = code.startsWith("PERM_") ? code : "PERM_" + code;
            authorities.add(new SimpleGrantedAuthority(permAuth));
            if (!permAuth.equals(code)) {
                authorities.add(new SimpleGrantedAuthority(code));
            }
        }

        boolean enabled = Boolean.TRUE.equals(user.getIsActive());

        return new UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                enabled,
                roles,
                permissions,
                authorities);
    }

    public String getRole() {
        if (roles != null && roles.contains("ADMIN")) {
            return "ADMIN";
        }
        return (roles == null || roles.isEmpty()) ? "MEMBER" : roles.iterator().next();
    }

    public Role getRoleEnum() {
        try {
            return Role.valueOf(getRole());
        } catch (Exception e) {
            return Role.MEMBER;
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
