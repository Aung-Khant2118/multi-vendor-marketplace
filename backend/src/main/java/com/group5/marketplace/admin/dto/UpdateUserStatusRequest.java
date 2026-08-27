package com.group5.marketplace.admin.dto;

import com.group5.marketplace.user.entity.Role;
import jakarta.validation.constraints.NotNull;

public class UpdateUserStatusRequest {

    @NotNull(message = "Role is required")
    private Role role;

    public UpdateUserStatusRequest() {}

    public UpdateUserStatusRequest(Role role) {
        this.role = role;
    }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
