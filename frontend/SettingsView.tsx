import {
  Box,
  Text,
  Link,
  FormField,
  Input,
  InputSynced,
  useViewport,
  useGlobalConfig,
  Heading,
  Button,
  Icon,
  Loader,
  SwitchSynced,
  loadCSSFromString,
} from '@airtable/blocks/ui';
import React, { useState, useEffect } from 'react';
import { BING_API_KEY, IS_BING_ENABLED, FLICKR_API_KEY, IS_FLICKR_ENABLED } from './settings';
import { BingSearchClient } from './BingSearchClient'
import Flickr from 'flickr-sdk';
import { runInfo } from '@airtable/blocks';

export function SettingsView({ appState, setAppState, setIsSettingsVisible }) {
  loadCSSFromString(`
    .blur-on-lose-focus:not(:focus) {
      color: transparent;
      text-shadow: 0 0 5px rgba(0,0,0,0.5);
    }
  `)

  const globalConfig = useGlobalConfig();
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isBingEnabled = globalConfig.get(IS_BING_ENABLED) as boolean;
  const isFlickrEnabled = globalConfig.get(IS_FLICKR_ENABLED) as boolean;

  const viewport = useViewport();
  const saveSettings = async (e) => {
    e.preventDefault();
    if (!(isBingEnabled || isFlickrEnabled)) {
      setErrorMessage("Please enable atleast one of the search provider.");
      return;
    }
    const bingApiKeyExists = globalConfig.get(BING_API_KEY) as string;
    if (isBingEnabled && !bingApiKeyExists) {
      setErrorMessage("Please provide API Key to access Cognitive Services for Bing Provider.");
      return;
    }

    const flickrApiKeyExists = globalConfig.get(FLICKR_API_KEY) as string;
    if (isFlickrEnabled && !flickrApiKeyExists) {
      setErrorMessage("Please provide API Key to access Flickr API for Flickr Provider.");
      return;
    }

    setLoading(true);
    if (isBingEnabled) {
      const bingClient = new BingSearchClient(bingApiKeyExists);
      try {
        await bingClient.search("cats");
        setLoading(false);
        setErrorMessage("");
        setIsSettingsVisible(false);
        setAppState({ index: 1 });
      } catch (err) {
        setLoading(false);
        setErrorMessage(err.message);
      }
    }
    if (isFlickrEnabled) {
      const flickr = new Flickr(flickrApiKeyExists);
      try {
        await flickr.test.echo({});
        setLoading(false);
        setErrorMessage("");
        setIsSettingsVisible(false);
        setAppState({ index: 1 });
      } catch (err) {
        setLoading(false);
        setErrorMessage(err.message);
      }
    }
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" border="default" flexDirection="column" width={viewport.size.width} height={viewport.size.height} padding={0}>
      <Box maxWidth='calc(100% - 50px)'>
        <form onSubmit={saveSettings}>
          <Box paddingBottom='10px'>
            <Heading size="xlarge">{runInfo.isFirstRun ? "Welcome to " : ""}Image Search Block</Heading>
          </Box>

          <Box paddingBottom='10px'>
            <Text size='xlarge'>Search and import images from <Link size="xlarge" href="https://www.bing.com/" target="_blank">Bing</Link> or <Link size="xlarge" href="https://www.flickr.com/" target="_blank">Flickr</Link> into your base. </Text>
          </Box>

          <Box>

            <Box paddingBottom='10px'>
              <SwitchSynced
                globalConfigKey={IS_BING_ENABLED}
                label="Use Bing Image Search"
                size="large"
                backgroundColor="transparent"
                width="320px"
              />
            </Box>

            <Box paddingBottom='10px'>
              <Text variant="paragraph">
                To use this block within your base you need to create a <Link href="https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-apis-create-account">Cognitive Services API Account</Link>.
                </Text>
            </Box>
            <Box>
              <FormField label="Cognitive Services API Key">
                <InputSynced disabled={!isBingEnabled} className='blur-on-lose-focus' required={true} globalConfigKey={BING_API_KEY} />
              </FormField>
            </Box>

            <Box paddingBottom='10px'>
              <SwitchSynced
                globalConfigKey={IS_FLICKR_ENABLED}
                label="Use Flickr Image Search"
                size="large"
                backgroundColor="transparent"
                width="320px"
              />
            </Box>

            <Box paddingBottom='10px'>
              <Text variant="paragraph">
                To use this block within your base you need to create an API Key.
                  You can obtain this information from <Link href="https://www.flickr.com/services/apps/create/apply">here</Link>.
                  Depending on the purpose of your usage, you can either create a Non-commercial or Commercial App and use the API Key from that.
                </Text>
            </Box>
            <Box>
              <FormField label="Flickr API Key">
                <InputSynced disabled={!isFlickrEnabled} className='blur-on-lose-focus' required={true} globalConfigKey={FLICKR_API_KEY} />
              </FormField>
            </Box>

          </Box>

          <Box>
            {
              errorMessage !== "" && <Text paddingBottom='5px' textColor='red'>Note: {errorMessage}</Text>
            }
            <Button icon={isLoading && <Loader /> || <Icon name='premium' fillColor='yellow' />} variant="primary" disabled={isLoading} onClick={saveSettings}>Validate Settings</Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
