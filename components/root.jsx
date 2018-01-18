// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
require('perfect-scrollbar/jquery')($);

import PropTypes from 'prop-types';
import React from 'react';
import {IntlProvider} from 'react-intl';
import FastClick from 'fastclick';
import {Route, Switch, Redirect} from 'react-router-dom';
import {getClientConfig, getLicenseConfig, setUrl} from 'mattermost-redux/actions/general';
import {Client4} from 'mattermost-redux/client';

import {trackLoadTime} from 'actions/diagnostics_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import BrowserStore from 'stores/browser_store.jsx';
import ErrorStore from 'stores/error_store.jsx';
import LocalizationStore from 'stores/localization_store.jsx';
import UserStore from 'stores/user_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import {loadMeAndConfig} from 'actions/user_actions.jsx';
import * as I18n from 'i18n/i18n.jsx';
import {initializePlugins} from 'plugins';
import Constants, {StoragePrefixes} from 'utils/constants.jsx';
import {HFTRoute, LoggedInHFTRoute} from 'components/header_footer_template_route';
import {makeAsyncComponent, AsyncComponent} from 'components/async_load';
import ErrorPage from 'bundle-loader?lazy!components/error_page';
import LoginController from 'bundle-loader?lazy!components/login/login_controller';
import AdminConsole from 'bundle-loader?lazy!components/admin_console';
import loadLoggedIn from 'bundle-loader?lazy!components/logged_in';
import PasswordResetSendLink from 'bundle-loader?lazy!components/password_reset_send_link';
import PasswordResetForm from 'bundle-loader?lazy!components/password_reset_form';
import SignupController from 'bundle-loader?lazy!components/signup/signup_controller';
import SignupEmail from 'bundle-loader?lazy!components/signup/components/signup_email';
import SignupLdap from 'bundle-loader?lazy!components/signup/components/signup_ldap';
import ShouldVerifyEmail from 'bundle-loader?lazy!components/should_verify_email';
import DoVerifyEmail from 'bundle-loader?lazy!components/do_verify_email';
import ClaimController from 'bundle-loader?lazy!components/claim/claim_controller';
import HelpController from 'bundle-loader?lazy!components/help/help_controller';
import GetIosApp from 'bundle-loader?lazy!components/get_ios_app/get_ios_app';
import GetAndroidApp from 'bundle-loader?lazy!components/get_android_app/get_android_app';
import NeedsTeam from 'components/needs_team';
import SelectTeam from 'bundle-loader?lazy!components/select_team';
import Authorize from 'bundle-loader?lazy!components/authorize';
import CreateTeam from 'bundle-loader?lazy!components/create_team/create_team_controller';
import Mfa from 'bundle-loader?lazy!components/mfa/mfa_controller';
import store from 'stores/redux_store.jsx';

const LoggedIn = (props) => (
    <AsyncComponent
        doLoad={loadLoggedIn}
        {...props}
    />
);

const LoggedInRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={(props) => (
            <LoggedIn {...props}>
                <Component {...props}/>
            </LoggedIn>
    )}
    />
);

export default class Root extends React.Component {
    constructor(props) {
        super(props);
        this.localizationChanged = this.localizationChanged.bind(this);
        this.redirectIfNecessary = this.redirectIfNecessary.bind(this);
        this.onConfigLoaded = this.onConfigLoaded.bind(this);

        // Redux
        setUrl(window.location.origin);

        // Force logout of all tabs if one tab is logged out
        $(window).bind('storage', (e) => {
            // when one tab on a browser logs out, it sets __logout__ in localStorage to trigger other tabs to log out
            if (e.originalEvent.key === StoragePrefixes.LOGOUT && e.originalEvent.storageArea === localStorage && e.originalEvent.newValue) {
                // make sure it isn't this tab that is sending the logout signal (only necessary for IE11)
                if (BrowserStore.isSignallingLogout(e.originalEvent.newValue)) {
                    return;
                }

                console.log('detected logout from a different tab'); //eslint-disable-line no-console
                GlobalActions.emitUserLoggedOutEvent('/', false);
            }

            if (e.originalEvent.key === StoragePrefixes.LOGIN && e.originalEvent.storageArea === localStorage && e.originalEvent.newValue) {
                // make sure it isn't this tab that is sending the logout signal (only necessary for IE11)
                if (BrowserStore.isSignallingLogin(e.originalEvent.newValue)) {
                    return;
                }

                console.log('detected login from a different tab'); //eslint-disable-line no-console
                location.reload();
            }
        });

        // Prevent drag and drop files from navigating away from the app
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Fastclick
        FastClick.attach(document.body);

        // Loading page so reset connection failure count
        ErrorStore.setConnectionErrorCount(0);

        this.state = {
            configLoaded: false,
            locale: LocalizationStore.getLocale(),
            translations: LocalizationStore.getTranslations()
        };
    }

    onConfigLoaded() {
        const segmentKey = Constants.DIAGNOSTICS_SEGMENT_KEY;

        /*eslint-disable */
        if (segmentKey != null && segmentKey !== '' && window.mm_config.DiagnosticsEnabled === 'true') {
            !function(){var analytics=global.window.analytics=global.window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","group","track","ready","alias","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="3.0.1";
                analytics.load(segmentKey);

                analytics.page('ApplicationLoaded', {
                        path: '',
                        referrer: '',
                        search: '',
                        title: '',
                        url: '',
                    },
                    {
                        context: {
                            ip: '0.0.0.0'
                        },
                        anonymousId: '00000000000000000000000000'
                    });
            }}();
        }
        /*eslint-enable */

        const afterIntl = () => {
            initializePlugins();
            I18n.doAddLocaleData();

            // Setup localization listener
            LocalizationStore.addChangeListener(this.localizationChanged);

            // Get our localizaiton
            GlobalActions.loadCurrentLocale();
            this.setState({configLoaded: true});
        };
        if (global.Intl) {
            afterIntl();
        } else {
            I18n.safariFix(afterIntl);
        }
    }

    localizationChanged() {
        const locale = LocalizationStore.getLocale();

        Client4.setAcceptLanguage(locale);
        this.setState({locale, translations: LocalizationStore.getTranslations()});
    }

    redirectIfNecessary(props) {
        const experimentalPrimaryTeam = global.mm_config.ExperimentalPrimaryTeam;
        const primaryTeam = TeamStore.getByName(experimentalPrimaryTeam);
        if (props.location.pathname === '/') {
            if (UserStore.getNoAccounts()) {
                this.props.history.push('/signup_user_complete');
            } else if (UserStore.getCurrentUser() && primaryTeam) {
                this.props.history.push(`/${primaryTeam.name}/channels/${Constants.DEFAULT_CHANNEL}`);
            } else if (UserStore.getCurrentUser()) {
                GlobalActions.redirectUserToDefaultTeam();
            } else {
                this.props.history.push('/login' + window.location.search);
            }
        }
    }

    componentWillReceiveProps(newProps) {
        this.redirectIfNecessary(newProps);
    }

    componentDidMount() {
        // Load config
        if (document.cookie.indexOf('MMUSERID=') > -1) {
            loadMeAndConfig(this.onConfigLoaded);
        } else {
            getClientConfig()(store.dispatch, store.getState).then(
                ({data: config}) => {
                    global.window.mm_config = config;

                    getLicenseConfig()(store.dispatch, store.getState).then(
                        ({data: license}) => {
                            global.window.mm_license = license;
                            this.onConfigLoaded();
                        }
                    );
                }
            );
        }

        trackLoadTime();
    }

    componentWillUnmount() {
        LocalizationStore.removeChangeListener(this.localizationChanged);
    }

    render() {
        if (this.state.translations == null || this.state.configLoaded === false) {
            return <div/>;
        }

        return (
            <IntlProvider
                locale={this.state.locale}
                messages={this.state.translations}
                key={this.state.locale}
            >
                <Switch>
                    <Route
                        path={'/error'}
                        component={makeAsyncComponent(ErrorPage)}
                    />
                    <HFTRoute
                        path={'/login'}
                        component={makeAsyncComponent(LoginController)}
                    />
                    <HFTRoute
                        path={'/reset_password'}
                        component={makeAsyncComponent(PasswordResetSendLink)}
                    />
                    <HFTRoute
                        path={'/reset_password_complete'}
                        component={makeAsyncComponent(PasswordResetForm)}
                    />
                    <HFTRoute
                        path={'/signup_user_complete'}
                        component={makeAsyncComponent(SignupController)}
                    />
                    <HFTRoute
                        path={'/signup_email'}
                        component={makeAsyncComponent(SignupEmail)}
                    />
                    <HFTRoute
                        path={'/signup_ldap'}
                        component={makeAsyncComponent(SignupLdap)}
                    />
                    <HFTRoute
                        path={'/should_verify_email'}
                        component={makeAsyncComponent(ShouldVerifyEmail)}
                    />
                    <HFTRoute
                        path={'/do_verify_email'}
                        component={makeAsyncComponent(DoVerifyEmail)}
                    />
                    <HFTRoute
                        path={'/claim'}
                        component={makeAsyncComponent(ClaimController)}
                    />
                    <HFTRoute
                        path={'/help'}
                        component={makeAsyncComponent(HelpController)}
                    />
                    <Route
                        path={'/get_ios_app'}
                        component={makeAsyncComponent(GetIosApp)}
                    />
                    <Route
                        path={'/get_android_app'}
                        component={makeAsyncComponent(GetAndroidApp)}
                    />
                    <LoggedInRoute
                        path={'/admin_console'}
                        component={makeAsyncComponent(AdminConsole)}
                    />
                    <LoggedInHFTRoute
                        path={'/select_team'}
                        component={makeAsyncComponent(SelectTeam)}
                    />
                    <LoggedInHFTRoute
                        path={'/oauth/authorize'}
                        component={makeAsyncComponent(Authorize)}
                    />
                    <LoggedInHFTRoute
                        path={'/create_team'}
                        component={makeAsyncComponent(CreateTeam)}
                    />
                    <LoggedInRoute
                        path={'/mfa'}
                        component={makeAsyncComponent(Mfa)}
                    />
                    <LoggedInRoute
                        path={'/:team'}
                        component={NeedsTeam}
                    />
                    <Redirect to={'/login'}/>
                </Switch>
            </IntlProvider>
        );
    }
}

Root.defaultProps = {
};

Root.propTypes = {
    children: PropTypes.object
};
