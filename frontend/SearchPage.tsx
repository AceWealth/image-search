import {
  Box,
  Input,
  Button,
  Loader,
  Heading,
  Dialog,
  Text,
  useViewport,
  useGlobalConfig,
  Select,
} from '@airtable/blocks/ui';
import React, { useState } from 'react';
import CSS from 'csstype';
import _ from 'lodash';
import { BING, BING_API_KEY, IS_BING_ENABLED, FLICKR, FLICKR_API_KEY, IS_FLICKR_ENABLED, useSettings, bingThumbnailUrlFor } from './settings';
import { BingSearchClient } from './BingSearchClient';
import Flickr from 'flickr-sdk';

export function SearchPage({ appState, setAppState }) {
  const viewport = useViewport();
  const settings = useSettings();
  const globalConfig = useGlobalConfig();

  const [isLoading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  let searchProviders = [];
  if (settings.settings[IS_BING_ENABLED]) {
    searchProviders.push({ value: BING, label: _.capitalize(BING) })
  }
  if (settings.settings[IS_FLICKR_ENABLED]) {
    searchProviders.push({ value: FLICKR, label: _.capitalize(FLICKR) });
  }
  const [searchProvider, setSearchProvider] = useState(searchProviders[0].value);

  const [searchText, setSearchText] = useState(_.get(appState, "state.search.text", "cats"));
  const searchBoxStyle: CSS.Properties = {
    cursor: 'text'
  }

  const performSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    switch (searchProvider) {
      case BING:
        const bingApiKey = settings.settings[BING_API_KEY];
        const bing = new BingSearchClient(bingApiKey);
        try {
          const res = await bing.search(searchText);
          setLoading(false);
          if ("error" in res) {
            throw new Error(res.error.message);
          }

          const photos = res.value.map(function (pic) {
            return {
              source: BING,
              id: pic.imageId,
              url: pic.contentUrl,
              title: pic.name,
              thumbnailUrl: bingThumbnailUrlFor(pic),
              sourceUrl: pic.hostPageUrl,
            }
          });

          setAppState({
            index: 2,
            state: {
              search: {
                text: searchText,
                page: 1,
                per_page: photos.length,
              },
              // Transform the results into a consistent format for import
              results: photos,
            }
          });
        } catch (err) {
          setLoading(false);
          setErrorMsg(err.message);
          setIsDialogOpen(true);
        };
        break;
      case FLICKR:
        const flickrApiKey = settings.settings[FLICKR_API_KEY];
        const flickr = new Flickr(flickrApiKey);
        try {
          const res = await flickr.photos.search({
            text: searchText,
            page: 1,
            per_page: 150,
            sort: 'relevance',
            extras: 'owner_name,tags,url_q,url_z,url_o,license',
          });
          setLoading(false);

          const photos = res.body.photos.photo.map(function (pic) {
            return {
              source: FLICKR,
              id: pic.id,
              url: pic.url_o || pic.url_z,
              title: pic.title,
              thumbnailUrl: pic.url_q,
              sourceUrl: `https://www.flickr.com/photos/${pic.owner}/${pic.id}`
            }
          });

          setAppState({
            index: 2,
            state: {
              search: {
                text: searchText,
                page: 1,
                per_page: photos.length,
              },
              results: photos,
            }
          });
        } catch (err) {
          setLoading(false);
          setErrorMsg(err.message);
          setIsDialogOpen(true);
        }
    }
  }

  return (
    // main box
    <form onSubmit={performSearch}>
      <Box
        width={viewport.size.width}
        height={viewport.size.height}
        display="flex"
        flexDirection='column'
        alignItems="center"
        justifyContent="center"
        padding={0}>
        <Heading size="xlarge">Image Search</Heading>
        {
          isLoading &&
          <Box display='block' zIndex={10}><Loader scale={0.5} /></Box>
        }
        {
          isDialogOpen &&
          <Dialog onClose={() => setIsDialogOpen(false)} width="420px">
            <Dialog.CloseButton />
            <Heading>Error</Heading>
            <Text variant="paragraph">{errorMsg}</Text>
            <Heading size="small">Possible Solutions</Heading>
            <ol>
              <li>Check the API Key on the Settings of the block.</li>
            </ol>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </Dialog>
        }
        <Box width={viewport.size.width / 2} paddingTop='12px' paddingBottom='12px' display='flex' justifyContent='space-between'>
          <Select
            options={searchProviders}
            value={searchProvider}
            size="large"
            onChange={newValue => setSearchProvider(newValue)}
            width="19%"
            disabled={isLoading}
          />
          <Input
            value={searchText}
            size="large"
            onChange={e => setSearchText(e.target.value)}
            placeholder="animals"
            style={searchBoxStyle}
            width='80%'
            disabled={isLoading}
          />
        </Box>
        <Box paddingTop='12px' paddingBottom='12px'>
          <Button size="large" icon='search' onClick={performSearch} disabled={isLoading}>Search</Button>
        </Box>
      </Box>
    </form>
  )
}