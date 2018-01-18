// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import 'bootstrap';

import PropTypes from 'prop-types';
import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import AnnouncementBar from 'components/announcement_bar';
import {reloadIfServerVersionChanged} from 'actions/global_actions.jsx';
import Audits from 'components/admin_console/audits';
import ClientVersionsSettings from 'components/admin_console/client_versions_settings.jsx';
import ClusterSettings from 'components/admin_console/cluster_settings.jsx';
import ComplianceSettings from 'components/admin_console/compliance_settings.jsx';
import ConfigurationSettings from 'components/admin_console/configuration_settings.jsx';
import ConnectionSettings from 'components/admin_console/connection_settings.jsx';
import CustomBrandSettings from 'components/admin_console/custom_brand_settings.jsx';
import CustomEmojiSettings from 'components/admin_console/custom_emoji_settings.jsx';
import CustomIntegrationsSettings from 'components/admin_console/custom_integrations_settings.jsx';
import DataRetentionSettings from 'components/admin_console/data_retention_settings.jsx';
import DatabaseSettings from 'components/admin_console/database_settings.jsx';
import DeveloperSettings from 'components/admin_console/developer_settings.jsx';
import ElasticsearchSettings from 'components/admin_console/elasticsearch_settings.jsx';
import EmailAuthenticationSettings from 'components/admin_console/email_authentication_settings.jsx';
import EmailSettings from 'components/admin_console/email_settings.jsx';
import ExternalServiceSettings from 'components/admin_console/external_service_settings.jsx';
import GitLabSettings from 'components/admin_console/gitlab_settings.jsx';
import LdapSettings from 'components/admin_console/ldap_settings.jsx';
import LegalAndSupportSettings from 'components/admin_console/legal_and_support_settings.jsx';
import LicenseSettings from 'components/admin_console/license_settings.jsx';
import LinkPreviewsSettings from 'components/admin_console/link_previews_settings.jsx';
import LocalizationSettings from 'components/admin_console/localization_settings.jsx';
import LogSettings from 'components/admin_console/log_settings.jsx';
import MessageExportSettings from 'components/admin_console/message_export_settings';
import MetricsSettings from 'components/admin_console/metrics_settings.jsx';
import MfaSettings from 'components/admin_console/mfa_settings.jsx';
import NativeAppLinkSettings from 'components/admin_console/native_app_link_settings.jsx';
import OAuthSettings from 'components/admin_console/oauth_settings.jsx';
import PasswordSettings from 'components/admin_console/password_settings.jsx';
import PluginSettings from 'components/admin_console/plugin_settings.jsx';
import PluginManagement from 'components/admin_console/plugin_management';
import CustomPluginSettings from 'components/admin_console/custom_plugin_settings';
import PolicySettings from 'components/admin_console/policy_settings.jsx';
import PrivacySettings from 'components/admin_console/privacy_settings.jsx';
import PublicLinkSettings from 'components/admin_console/public_link_settings.jsx';
import PushSettings from 'components/admin_console/push_settings.jsx';
import RateSettings from 'components/admin_console/rate_settings.jsx';
import SamlSettings from 'components/admin_console/saml_settings.jsx';
import Logs from 'components/admin_console/server_logs';
import SessionSettings from 'components/admin_console/session_settings.jsx';
import SignupSettings from 'components/admin_console/signup_settings.jsx';
import StorageSettings from 'components/admin_console/storage_settings.jsx';
import SystemUsers from 'components/admin_console/system_users';
import UsersAndTeamsSettings from 'components/admin_console/users_and_teams_settings.jsx';
import WebrtcSettings from 'components/admin_console/webrtc_settings.jsx';
import SystemAnalytics from 'components/analytics/system_analytics.jsx';
import TeamAnalytics from 'components/analytics/team_analytics';
import DiscardChangesModal from 'components/discard_changes_modal.jsx';

import AdminSidebar from './admin_sidebar';

export default class AdminConsole extends React.Component {
    static propTypes = {

        /*
         * Object representing the config file
         */
        config: PropTypes.object.isRequired,

        /*
         * String whether to show prompt to navigate away
         * from unsaved changes
         */
        showNavigationPrompt: PropTypes.bool.isRequired,

        actions: PropTypes.shape({

            /*
             * Function to get the config file
             */
            getConfig: PropTypes.func.isRequired,

            /*
             * Function to block navigation when there are unsaved changes
             */
            setNavigationBlocked: PropTypes.func.isRequired,

            /*
             * Function to confirm navigation
             */
            confirmNavigation: PropTypes.func.isRequired,

            /*
             * Function to cancel navigation away from unsaved changes
             */
            cancelNavigation: PropTypes.func.isRequired
        }).isRequired
    }

    componentWillMount() {
        this.props.actions.getConfig();
        reloadIfServerVersionChanged();
    }

    render() {
        const {config, showNavigationPrompt} = this.props;
        const {setNavigationBlocked, cancelNavigation, confirmNavigation} = this.props.actions;

        if (Object.keys(config).length === 0) {
            return <div/>;
        }
        if (config && Object.keys(config).length === 0 && config.constructor === 'Object') {
            return (
                <div className='admin-console__wrapper'>
                    <AnnouncementBar/>
                    <div className='admin-console'/>
                </div>
            );
        }

        const discardChangesModal = (
            <DiscardChangesModal
                show={showNavigationPrompt}
                onConfirm={confirmNavigation}
                onCancel={cancelNavigation}
            />
        );

        // not every page in the system console will need the config, but the vast majority will
        const extraProps = {config, setNavigationBlocked};
        const SCRoute = ({component: Component, ...rest}) => (
            <Route
                {...rest}
                render={(props) => (
                    <Component
                        {...extraProps}
                        {...props}
                    />
            )}
            />
        );
        return (
            <div className='admin-console__wrapper'>
                <AnnouncementBar/>
                <div className='admin-console'>
                    <AdminSidebar/>
                    <Switch>
                        <SCRoute
                            path={`${this.props.match.url}/system_analytics`}
                            component={SystemAnalytics}
                        />
                        <Route
                            path={`${this.props.match.url}/general`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/configuration`}
                                        component={ConfigurationSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/localization`}
                                        component={LocalizationSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/users_and_teams`}
                                        component={UsersAndTeamsSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/privacy`}
                                        component={PrivacySettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/policy`}
                                        component={PolicySettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/compliance`}
                                        component={ComplianceSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/logging`}
                                        component={LogSettings}
                                    />
                                    <Redirect to={`${props.match.url}/configuration`}/>
                                </Switch>
                        )}
                        />
                        <Route
                            path={`${this.props.match.url}/authentication`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/authentication_email`}
                                        component={EmailAuthenticationSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/gitlab`}
                                        component={GitLabSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/oauth`}
                                        component={OAuthSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/ldap`}
                                        component={LdapSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/saml`}
                                        component={SamlSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/mfa`}
                                        component={MfaSettings}
                                    />
                                    <Redirect to={`${props.match.url}/authentication_email`}/>
                                </Switch>
                        )}
                        />
                        <Route
                            path={`${this.props.match.url}/security`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/sign_up`}
                                        component={SignupSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/password`}
                                        component={PasswordSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/public_links`}
                                        component={PublicLinkSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/sessions`}
                                        component={SessionSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/connections`}
                                        component={ConnectionSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/client_versions`}
                                        component={ClientVersionsSettings}
                                    />
                                    <Redirect to={`${props.match.url}/sign_up`}/>
                                </Switch>
                        )}
                        />
                        <Route
                            path={`${this.props.match.url}/notifications`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/notifications_email`}
                                        component={EmailSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/push`}
                                        component={PushSettings}
                                    />
                                    <Redirect to={`${props.match.url}/notifications_email`}/>
                                </Switch>
                        )}
                        />
                        <Route
                            path={`${this.props.match.url}/integrations`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/custom`}
                                        component={CustomIntegrationsSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/external`}
                                        component={ExternalServiceSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/webrtc`}
                                        component={WebrtcSettings}
                                    />
                                    <Redirect to={`${props.match.url}/custom`}/>
                                </Switch>
                        )}
                        />
                        <Route
                            path={`${this.props.match.url}/plugins`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/configuration`}
                                        component={PluginSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/management`}
                                        component={PluginManagement}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/custom/:plugin_id`}
                                        component={CustomPluginSettings}
                                    />
                                    <Redirect to={`${props.match.url}/configuration`}/>
                                </Switch>
                        )}
                        />
                        <Route
                            path={`${this.props.match.url}/files`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/storage`}
                                        component={StorageSettings}
                                    />
                                    <Redirect to={`${props.match.url}/storage`}/>
                                </Switch>
                        )}
                        />
                        <Route
                            path={`${this.props.match.url}/customization`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/custom_brand`}
                                        component={CustomBrandSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/emoji`}
                                        component={CustomEmojiSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/link_previews`}
                                        component={LinkPreviewsSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/legal_and_support`}
                                        component={LegalAndSupportSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/native_app_links`}
                                        component={NativeAppLinkSettings}
                                    />
                                    <Redirect to={`${props.match.url}/custom_brand`}/>
                                </Switch>
                        )}
                        />
                        <Route
                            path={`${this.props.match.url}/advanced`}
                            render={(props) => (
                                <Switch>
                                    <SCRoute
                                        path={`${props.match.url}/rate`}
                                        component={RateSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/database`}
                                        component={DatabaseSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/dataretention`}
                                        component={DataRetentionSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/message_export`}
                                        component={MessageExportSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/elasticsearch`}
                                        component={ElasticsearchSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/developer`}
                                        component={DeveloperSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/cluster`}
                                        component={ClusterSettings}
                                    />
                                    <SCRoute
                                        path={`${props.match.url}/metrics`}
                                        component={MetricsSettings}
                                    />
                                    <Redirect to={`${props.match.url}/rate`}/>
                                </Switch>
                        )}
                        />
                        <SCRoute
                            path={`${this.props.match.url}/users`}
                            component={SystemUsers}
                        />
                        <SCRoute
                            path={`${this.props.match.url}/team_analytics`}
                            component={TeamAnalytics}
                        />
                        <SCRoute
                            path={`${this.props.match.url}/license`}
                            component={LicenseSettings}
                        />
                        <SCRoute
                            path={`${this.props.match.url}/audits`}
                            component={Audits}
                        />
                        <SCRoute
                            path={`${this.props.match.url}/logs`}
                            component={Logs}
                        />
                        <Redirect to={`${this.props.match.url}/system_analytics`}/>
                    </Switch>
                </div>
                {discardChangesModal}
            </div>
        );
    }
}
