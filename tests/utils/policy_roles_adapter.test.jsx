// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Permissions} from 'mattermost-redux/constants/index';

import {rolesFromPolicies, policyFromRoles} from 'utils/policy_roles_adapter';

describe('PolicyRolesAdapter', function() {
    let roles = {};
    let policies = {};

    beforeEach(() => {
        roles = {
            channel_user: {name: 'channel_user',
                permissions: [
                    Permissions.EDIT_POST,
                    Permissions.DELETE_POST
                ]},
            team_user: {name: 'team_user',
                permissions: [
                    Permissions.DELETE_PUBLIC_CHANNEL,
                    Permissions.INVITE_USER
                ]},
            channel_admin: {name: 'channel_admin', permissions: ['manage_channel_roles']},
            team_admin: {name: 'team_admin',
                permissions: [
                    Permissions.DELETE_POST,
                    Permissions.DELETE_OTHERS_POSTS
                ]},
            system_admin: {name: 'system_admin',
                permissions: [
                    Permissions.DELETE_PUBLIC_CHANNEL,
                    Permissions.INVITE_USER,
                    Permissions.DELETE_POST,
                    Permissions.DELETE_OTHERS_POSTS,
                    Permissions.EDIT_POST
                ]}
        };
        const teamPolicies = {
            restrictTeamInvite: 'all',
            restrictPublicChannelCreation: 'all',
            restrictPrivateChannelCreation: 'all'
        };
        const channelPolicies = {
            restrictPublicChannelManagement: 'all',
            restrictPublicChannelDeletion: 'all',
            restrictPrivateChannelManagement: 'all',
            restrictPrivateChannelManageMembers: 'all',
            restrictPrivateChannelDeletion: 'all'
        };
        const restrictPostDelete = 'all';
        const allowEditPost = 'always';
        policies = {
            ...teamPolicies,
            ...channelPolicies,
            restrictPostDelete,
            allowEditPost
        };
    });

    afterEach(() => {
        roles = {};
    });

    describe('PolicyRolesAdapter.rolesFromPolicies', function() {
        test('teamPolicies update given permissions as expected', function() {
            let updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.team_user.permissions).toEqual(expect.arrayContaining([Permissions.INVITE_USER]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.INVITE_USER]));

            policies.restrictTeamInvite = 'team_admin';
            updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.team_user.permissions).not.toEqual(expect.arrayContaining([Permissions.INVITE_USER]));
            expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.INVITE_USER]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.INVITE_USER]));

            policies.restrictTeamInvite = 'system_admin';
            updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.team_user.permissions).not.toEqual(expect.arrayContaining([Permissions.INVITE_USER]));
            expect(updatedRoles.team_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.INVITE_USER]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.INVITE_USER]));
        });

        test('channelPolicies update given permissions as expected', function() {
            let updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.channel_user.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));

            policies.restrictPublicChannelDeletion = 'channel_admin';
            updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));
            expect(updatedRoles.channel_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));

            policies.restrictPublicChannelDeletion = 'team_admin';
            updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));
            expect(updatedRoles.channel_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));
            expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));

            policies.restrictPublicChannelDeletion = 'system_admin';
            updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));
            expect(updatedRoles.channel_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));
            expect(updatedRoles.team_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_PUBLIC_CHANNEL]));
        });

        test('restrictPostDelete updates expected permissions', function() {
            let updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.channel_user.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            expect(updatedRoles.channel_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.channel_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            policies.restrictPostDelete = 'team_admin';
            updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            expect(updatedRoles.channel_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.channel_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            policies.restrictPostDelete = 'system_admin';
            updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            expect(updatedRoles.channel_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.channel_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            expect(updatedRoles.team_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.team_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));
        });

        test('allowEditPost updates expected permissions', function() {
            let updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.channel_user.permissions).toEqual(expect.arrayContaining([Permissions.EDIT_POST]));
            expect(updatedRoles.system_admin.permissions).toEqual(expect.arrayContaining([Permissions.EDIT_POST]));

            policies.allowEditPost = 'never';
            updatedRoles = rolesFromPolicies(policies, roles);
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.EDIT_POST]));
            expect(updatedRoles.system_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.EDIT_POST]));
        });
    });

    describe('PolicyRolesAdapter.policyFromRoles for team-based', function() {
        test('returns the expected policy value for a team-based policy', function() {
            addPermissionToRole(Permissions.INVITE_USER, roles.team_user);
            let value = policyFromRoles('restrictTeamInvite', roles);
            expect(value).toEqual('all');

            removePermissionFromRole(Permissions.INVITE_USER, roles.team_user);
            addPermissionToRole(Permissions.INVITE_USER, roles.team_admin);
            value = policyFromRoles('restrictTeamInvite', roles);
            expect(value).toEqual('team_admin');

            removePermissionFromRole(Permissions.INVITE_USER, roles.team_user);
            removePermissionFromRole(Permissions.INVITE_USER, roles.team_admin);
            value = policyFromRoles('restrictTeamInvite', roles);
            expect(value).toEqual('system_admin');
        });
    });

    describe('PolicyRolesAdapter.policyFromRoles for channel-based', function() {
        test('returns the expected policy value for a team-based policy', function() {
            addPermissionToRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.channel_user);
            let value = policyFromRoles('restrictPublicChannelDeletion', roles);
            expect(value).toEqual('all');

            removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.channel_user);
            addPermissionToRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.channel_admin);
            addPermissionToRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.team_admin);
            value = policyFromRoles('restrictPublicChannelDeletion', roles);
            expect(value).toEqual('channel_admin');

            removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.channel_user);
            removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.channel_admin);
            addPermissionToRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.team_admin);
            value = policyFromRoles('restrictPublicChannelDeletion', roles);
            expect(value).toEqual('team_admin');

            removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.channel_user);
            removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.channel_admin);
            removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.team_admin);
            value = policyFromRoles('restrictPublicChannelDeletion', roles);
            expect(value).toEqual('system_admin');
        });
    });

    describe('PolicyRolesAdapter.policyFromRoles for allowEditPost', function() {
        test('returns the expected policy value for a team-based policy', function() {
            addPermissionToRole(Permissions.EDIT_POST, roles.channel_user);
            addPermissionToRole(Permissions.EDIT_POST, roles.system_admin);
            let value = policyFromRoles('allowEditPost', roles);
            expect(value).toEqual('always');

            removePermissionFromRole(Permissions.EDIT_POST, roles.channel_user);
            removePermissionFromRole(Permissions.EDIT_POST, roles.system_admin);
            value = policyFromRoles('allowEditPost', roles);
            expect(value).toEqual('never');
        });
    });

    describe('PolicyRolesAdapter.policyFromRoles for restrictPostDelete', function() {
        test('returns the expected policy value for a team-based policy', function() {
            addPermissionToRole(Permissions.DELETE_POST, roles.channel_user);
            addPermissionToRole(Permissions.DELETE_POST, roles.channel_admin);
            addPermissionToRole(Permissions.DELETE_OTHERS_POSTS, roles.channel_admin);
            addPermissionToRole(Permissions.DELETE_POST, roles.team_admin);
            addPermissionToRole(Permissions.DELETE_OTHERS_POSTS, roles.team_admin);
            let value = policyFromRoles('restrictPostDelete', roles);
            expect(value).toEqual('all');

            removePermissionFromRole(Permissions.DELETE_POST, roles.channel_user);
            removePermissionFromRole(Permissions.DELETE_POST, roles.channel_admin);
            removePermissionFromRole(Permissions.DELETE_OTHERS_POSTS, roles.channel_admin);
            addPermissionToRole(Permissions.DELETE_POST, roles.team_admin);
            addPermissionToRole(Permissions.DELETE_OTHERS_POSTS, roles.team_admin);
            value = policyFromRoles('restrictPostDelete', roles);
            expect(value).toEqual('team_admin');

            removePermissionFromRole(Permissions.DELETE_POST, roles.channel_user);
            removePermissionFromRole(Permissions.DELETE_POST, roles.channel_admin);
            removePermissionFromRole(Permissions.DELETE_OTHERS_POSTS, roles.channel_admin);
            removePermissionFromRole(Permissions.DELETE_POST, roles.team_admin);
            removePermissionFromRole(Permissions.DELETE_OTHERS_POSTS, roles.team_admin);
            value = policyFromRoles('restrictPostDelete', roles);
            expect(value).toEqual('system_admin');
        });
    });
});

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