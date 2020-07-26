import {
  Heading,
  Box,
  Button,
  Link,
  Text,
  useViewport,
  useBase,
  Loader,
} from '@airtable/blocks/ui';
import _ from 'lodash';
import React, { useState, PureComponent } from 'react';
import CSS from 'csstype';
import { FieldType } from '@airtable/blocks/models';
import { createRecordsInBatches } from './utils';
import { bingThumbnailUrlFor, FIXED_THUMBNAIL_HEIGHT, FIXED_THUMBNAIL_WIDTH } from './settings';

export function ReviewSelection({ appState, setAppState }) {
  const viewport = useViewport();
  const base = useBase();
  const [isLoading, setLoading] = useState(false);

  const itemsToReview = appState.state.selection;

  const topbarStyle: CSS.Properties = {
    position: 'fixed',
    backgroundColor: 'white',
    zIndex: 10,
  }
  const imageTitleTextStyle: CSS.Properties = {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '300px',
    overflow: 'hidden',
  }

  const settingsSidebarStyle: CSS.Properties = {
    flexFlow: 'column wrap',
    marginTop: '5px',
    marginBottom: '5px',
    justifyContent: "left",
    width: '500px',
    height: '100vh',
  }

  const backToSearch = () => {
    const updatedAppState = { ...appState };
    updatedAppState.index = 2;
    setAppState(updatedAppState);
  }

  const importImages = async () => {
    setLoading(true);
    const nameOfTable = "Image Dataset" // Make this configurable with a sensible default
    const fields = [
      { name: 'Image Id', type: FieldType.SINGLE_LINE_TEXT },
      { name: 'Source', type: FieldType.SINGLE_LINE_TEXT },
      { name: 'Source URL', type: FieldType.URL },
      { name: 'Title', type: FieldType.SINGLE_LINE_TEXT },
      { name: 'Image URL', type: FieldType.URL },
      { name: 'Image', type: FieldType.MULTIPLE_ATTACHMENTS },
      { name: 'Thumbnail URL', type: FieldType.URL },
      { name: 'Thumbnail', type: FieldType.MULTIPLE_ATTACHMENTS },
    ]

    let table = base.getTableByNameIfExists(nameOfTable);

    if (!table) {
      // TODO: Do this check upfront when the app is starting, to display relevant error message.
      if (base.unstable_hasPermissionToCreateTable(nameOfTable, fields)) {
        await base.unstable_createTableAsync(nameOfTable, fields);
      }
      table = base.getTableByName(nameOfTable);
    }

    const createUnknownRecordCheckResult = table.checkPermissionsForCreateRecord();
    if (!createUnknownRecordCheckResult.hasPermission) {
      alert("You don't have permissions to insert new records to " + nameOfTable + ".");
      return;
    }

    const newRecords = itemsToReview.map(pic => {
      return {
        fields: {
          'Image Id': pic.id,
          'Source': pic.source,
          'Source URL': pic.sourceUrl,
          'Title': pic.title,
          'Image URL': pic.url,
          'Image': [{ url: pic.url }],
          'Thumbnail URL': pic.thumbnailUrl,
          'Thumbnail': [{ url: pic.thumbnailUrl }],
        },
      }
    });
    createRecordsInBatches(table, newRecords);

    setLoading(false);
    const updatedAppState = { ...appState };
    updatedAppState.index = 4;
    setAppState(updatedAppState);
  }

  return (
    <Box>
      <Box display="flex" height={50} borderBottom='thick' width={viewport.size.width} justifyContent="space-between" alignItems="center" style={topbarStyle}>
        <Box paddingLeft='10px'>
          <Heading>Review Selection of {itemsToReview.length} item(s)</Heading>
        </Box>
        <Box display="flex" justifyContent="right">
          <Box paddingRight='10px'>
            <Button variant="danger" size="large" onClick={backToSearch}>Back to Results</Button>
          </Box>
          <Box paddingRight='10px'>
            <Button
              variant="primary"
              size="large"
              icon={isLoading ? <Loader fillColor="#fff" /> : "download"}
              disabled={_.isEmpty(itemsToReview) || isLoading}
              onClick={importImages}>
              Import{isLoading && "ing..."}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box display="flex" paddingTop='50px' marginLeft='10px' marginRight='10px'>
        <Box display="flex" overflow='auto' justifyContent="right">
          <Box display="flex" flexWrap="wrap">
            {
              itemsToReview.map(pic => {
                return (
                  <Box key={pic.id} border="thick" width='100%' display="flex" justifyContent="space-between" marginTop='5px' marginBottom='5px'>
                    <Box paddingTop='10px' paddingLeft='10px' display="block" justifyContent="left">
                      <Heading size="xsmall">{pic.title}</Heading>
                      <Box display="flex" marginTop='3px'>
                        <Box display='block' width='400px' paddingRight='5px'>
                          <Heading variant="caps" size="xsmall" textColor="light">Image Id</Heading>
                          <Text>{pic.id || "N/A"}</Text>
                        </Box>

                        <Box display='block' width={300} paddingBottom='10px'>
                          <Heading variant="caps" size="xsmall" textColor="light">Source</Heading>
                          <Box display="flex" flexWrap="wrap">
                            {_.capitalize(pic.source)}
                          </Box>
                        </Box>

                        <Box display='block' width={viewport.size.width - (1000)} paddingBottom='10px'>
                          <Heading variant="caps" size="xsmall" textColor="light">Source URL</Heading>
                          <Box display="flex" flexWrap="wrap">
                            <Link href={pic.sourceUrl} target="_blank">{pic.sourceUrl}</Link>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Box display="flex" justifyContent="right" alignItems='center'>
                      <img src={pic.thumbnailUrl} height={FIXED_THUMBNAIL_HEIGHT} width={FIXED_THUMBNAIL_WIDTH} />
                    </Box>
                  </Box>
                );
              })
            }
          </Box>
        </Box>
      </Box>
    </Box>
  );
}