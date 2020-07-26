import {
    Text,
    initializeBlock,
    useViewport,
    useSettingsButton,
    Box,
} from '@airtable/blocks/ui';
import { viewport, runInfo } from '@airtable/blocks';

import React, { useState, useEffect } from 'react';
import { SettingsView } from './SettingsView';
import { SearchPage } from './SearchPage';
import { SearchResultsView } from './SearchResultsView';
import { ReviewSelection } from './ReviewSelection';
import { ThankYou } from './ThankYouView';
import { useSettings } from './settings';

type AppState = {
    index: number,
    state: object,
}

viewport.addMinSize({ width: 1112 });
viewport.addMaxFullscreenSize({ width: 1112, height: 818 });

function SearchAndImportImagesBlock() {
    const viewport = useViewport();
    const { isValid, message, settings } = useSettings();
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    useSettingsButton(() => {
        setIsSettingsVisible(!isSettingsVisible);
    });

    // Open the SettingsForm whenever the settings are not valid
    useEffect(() => {
        if (!isValid) {
            setIsSettingsVisible(true);
        }
    }, [isValid]);

    const [appState, setAppState] = useState<AppState>({ index: 1, state: {} });

    if (!isValid || isSettingsVisible) {
        return (<SettingsView appState={appState} setAppState={setAppState} setIsSettingsVisible={setIsSettingsVisible} />);
    }

    switch (appState.index) {
        case 1:
            return (<SearchPage appState={appState} setAppState={setAppState} />);
        case 2:
            return (<SearchResultsView appState={appState} setAppState={setAppState} />);
        case 3:
            return (<ReviewSelection appState={appState} setAppState={setAppState} />);
        case 4:
            return (<ThankYou appState={appState} setAppState={setAppState} />);
        default:
            return (<NotFoundPage appState={appState} />);
    }
}

function NotFoundPage({ appState }) {
    return (
        <Text>Invalid App State Index: {appState.index}, State: {JSON.stringify(appState.state)}</Text>
    );
}

initializeBlock(() => <SearchAndImportImagesBlock />);
