// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AddOAuthApp from 'components/integrations/components/add_oauth_app/add_oauth_app.jsx';

describe('components/integrations/AddOAuthApp', () => {
    const emptyFunction = jest.fn();
    const team = {
        id: 'dbcxd9wpzpbpfp8pad78xj12pr',
        name: 'test'
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <AddOAuthApp
                team={team}
                addOAuthAppRequest={{
                    status: 'not_started',
                    error: null
                }}
                actions={{addOAuthApp: emptyFunction}}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });
});