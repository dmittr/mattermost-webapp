// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Permissions} from 'mattermost-redux/constants/index';

function teamMapping(permission) {
    return {
        all: {
            team_user: [{permission, shouldHave: true}]
        },
        team_admin: {
            team_user: [{permission, shouldHave: false}],
            team_admin: [{permission, shouldHave: true}]
        },
        system_admin: {
            team_user: [{permission, shouldHave: false}],
            team_admin: [{permission, shouldHave: false}]
        }
    };
}

function channelMapping(permission) {
    return {
        all: {
            channel_user: [{permission, shouldHave: true}]
        },
        channel_admin: {
            channel_user: [{permission, shouldHave: false}],
            channel_admin: [{permission, shouldHave: true}],
            team_admin: [{permission, shouldHave: true}]
        },
        team_admin: {
            channel_user: [{permission, shouldHave: false}],
            channel_admin: [{permission, shouldHave: false}],
            team_admin: [{permission, shouldHave: true}]
        },
        system_admin: {
            channel_user: [{permission, shouldHave: false}],
            channel_admin: [{permission, shouldHave: false}],
            team_admin: [{permission, shouldHave: false}]
        }
    };
}

const mapping = {
    restrictTeamInvite: {...teamMapping(Permissions.INVITE_USER)},
    restrictPublicChannelCreation: {...teamMapping(Permissions.CREATE_PUBLIC_CHANNEL)},
    restrictPrivateChannelCreation: {...teamMapping(Permissions.CREATE_PRIVATE_CHANNEL)},

    restrictPublicChannelManagement: {...channelMapping(Permissions.MANAGE__PUBLICCHANNEL_PROPERTIES)},
    restrictPublicChannelDeletion: {...channelMapping(Permissions.DELETE_PUBLIC_CHANNEL)},
    restrictPrivateChannelManagement: {...channelMapping(Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES)},
    restrictPrivateChannelManageMembers: {...channelMapping(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS)},
    restrictPrivateChannelDeletion: {...channelMapping(Permissions.DELETE_PRIVATE_CHANNEL)},

    allowEditPost: {
        always: {
            channel_user: [{permission: Permissions.EDIT_POST, shouldHave: true}],
            system_admin: [{permission: Permissions.EDIT_POST, shouldHave: true}]
        },
        time_limit: {
            channel_user: [{permission: Permissions.EDIT_POST, shouldHave: true}],
            system_admin: [{permission: Permissions.EDIT_POST, shouldHave: true}]
        },
        never: {
            channel_user: [{permission: Permissions.EDIT_POST, shouldHave: false}],
            system_admin: [{permission: Permissions.EDIT_POST, shouldHave: false}]
        }
    },

    restrictPostDelete: {
        all: {
            channel_user: [{permission: Permissions.DELETE_POST, shouldHave: true}],
            channel_admin: [{permission: Permissions.DELETE_POST, shouldHave: true}, {permission: Permissions.DELETE_OTHERS_POSTS, shouldHave: true}],
            team_admin: [{permission: Permissions.DELETE_POST, shouldHave: true}, {permission: Permissions.DELETE_OTHERS_POSTS, shouldHave: true}]
        },
        team_admin: {
            channel_user: [{permission: Permissions.DELETE_POST, shouldHave: false}],
            channel_admin: [{permission: Permissions.DELETE_POST, shouldHave: false}, {permission: Permissions.DELETE_OTHERS_POSTS, shouldHave: false}],
            team_admin: [{permission: Permissions.DELETE_POST, shouldHave: true}, {permission: Permissions.DELETE_OTHERS_POSTS, shouldHave: true}]
        },
        system_admin: {
            channel_user: [{permission: Permissions.DELETE_POST, shouldHave: false}],
            channel_admin: [{permission: Permissions.DELETE_POST, shouldHave: false}, {permission: Permissions.DELETE_OTHERS_POSTS, shouldHave: false}],
            team_admin: [{permission: Permissions.DELETE_POST, shouldHave: false}, {permission: Permissions.DELETE_OTHERS_POSTS, shouldHave: false}]
        }
    }
};

// Returns an un-saved clone of roles with the permissions updates set as per the given policies
export function rolesFromPolicies(policySettingsState, roles) {
    const rolesClone = JSON.parse(JSON.stringify(roles));

    Object.entries(mapping).forEach(([stateKey, value]) => {
        const policyValue = policySettingsState[stateKey];
        Object.entries(value[policyValue]).forEach(([roleName, permissionAssignmentStates]) => {
            const role = rolesClone[roleName];
            permissionAssignmentStates.forEach((permissionAssignmentState) => {
                if (permissionAssignmentState.shouldHave) {
                    addPermissionToRole(permissionAssignmentState.permission, role);
                } else {
                    removePermissionFromRole(permissionAssignmentState.permission, role);
                }
            });
        });
    });

    return rolesClone;
}

export function policyFromRoles(policyKey, roles) {
    let policyValueToReturn = null;
    const mappingPart = mapping[policyKey];

    Object.entries(mappingPart).forEach((mappingPartItem) => {
        const policyValue = mappingPartItem[0];
        const optionMapping = mappingPartItem[1];
        Object.entries(optionMapping).forEach((optionMappingItem) => {
            const roleName = optionMappingItem[0];
            const permissionAssignmentsArray = optionMappingItem[1];
            const role = roles[roleName];
            const allTrue = permissionAssignmentsArray.every((item) => {
                if (item.shouldHave) {
                    return role.permissions.includes(item.permission);
                }
                return !role.permissions.includes(item.permission);
            });
            if (allTrue && policyValueToReturn === null) {
                policyValueToReturn = policyValue;
            }
        });
    });
    return policyValueToReturn;
}

function addPermissionToRole(permission, role) {
    if (!role.permissions.includes(permission)) {
        role.permissions.push(permission);
    }
}

function removePermissionFromRole(permission, role) {
    const permissionIndex = role.permissions.indexOf(permission);
    if (permissionIndex !== -1) {
        role.permissions.splice(permissionIndex, 1);
    }
}