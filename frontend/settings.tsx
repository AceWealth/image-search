import {
  useGlobalConfig,
} from '@airtable/blocks/ui';
import { isEmpty, isNotEmpty } from './utils';

export const BING = "bing";
export const BING_API_KEY = "bingApiKey";
export const IS_BING_ENABLED = "isBingEnabled";

export const FLICKR = "flickr";
export const FLICKR_API_KEY = "flickrApiKey";
export const IS_FLICKR_ENABLED = "isFlickrEnabled";

export const FIXED_THUMBNAIL_HEIGHT = 150;
export const FIXED_THUMBNAIL_WIDTH = 150;

export function bingThumbnailUrlFor(pic) {
  return pic.thumbnailUrl + "&c=7&h=" + FIXED_THUMBNAIL_HEIGHT + "&w=" + FIXED_THUMBNAIL_WIDTH + "&dpr=2";
}

export function useSettings() {
  const globalConfig = useGlobalConfig();

  let settings = {};
  const isBingEnabled = globalConfig.get(IS_BING_ENABLED) as boolean;
  settings[IS_BING_ENABLED] = isBingEnabled;
  if (isBingEnabled) {
    const bingApiKey = globalConfig.get(BING_API_KEY) as string;
    settings[BING_API_KEY] = bingApiKey;
  }
  const isFlickrEnabled = globalConfig.get(IS_FLICKR_ENABLED) as boolean;
  settings[IS_FLICKR_ENABLED] = isFlickrEnabled;
  if (isFlickrEnabled) {
    const flickrApiKey = globalConfig.get(FLICKR_API_KEY) as string;
    settings[FLICKR_API_KEY] = flickrApiKey;
  }

  if (!isBingEnabled && !isFlickrEnabled) {
    return {
      isValid: false,
      message: 'Enable atleast one of the image search provider to use the block',
      settings,
    };
  }
  return {
    isValid: true,
    settings,
  };
}
