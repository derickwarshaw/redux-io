import _ from 'lodash';
import { RSAA } from 'redux-api-middleware';
import {
  LOAD_REQUEST,
  LOAD_SUCCESS,
  LOAD_ERROR,
} from './../middleware';
import { JSON_API_SOURCE } from './..';
import { APPEND_MODE } from './../reducers/collection';
import { buildEndpoint, resolveConfig } from './../schemaConfig';

function buildRSAAConfig(config) {
  const rsaaConfig = {
    endpoint: config.request.endpoint,
    headers: config.request.headers,
    types: config.request.types,
    method: config.request.method,
  };

  return _.omitBy(rsaaConfig, _.isNil);
}
function applyMetaOptions(meta, options) {
  const appendMode = _.get(options, APPEND_MODE);
  if (appendMode) {
    // eslint-disable-next-line no-param-reassign
    meta[APPEND_MODE] = true;
  }
}
/**
 * Action creator used to fetch data from api (GET). Find function expects schema name of
 * data which correspond with storage reducer or schema configuration object. In both cases
 * rio resolves schema with registered schema configurations, and in case of schema
 * configuration passed in argument it merges two configuration objects. Schema configuration
 * object holds config.request attribute which is configuration based on RSAA
 * configuration from redux-api-middleware, allowing full customization expect types
 * part of configuration. Tag arg is optional, but when used allows your collections with same
 * tag value to respond on received data.
 * Options are used to configure reducers behaviors while updating state.
 * @param schema
 * @param tag
 * @param params
 * @param options - {appendMode}
 * @returns action
 */
export default (schema, tag = '', params = {}, options = {}) => {
  const config = resolveConfig(schema);
  if (!config) {
    const schemaName = schema && _.isObject(schema) ? schema.schema : schema;
    throw new Error(`Couldn't resolve schema ${schemaName} in function find.`);
  }
  if (!_.isString(tag)) {
    throw new Error('Tag isn\'t string.');
  }

  const meta = {
    source: config.request.resourceType || JSON_API_SOURCE,
    schema: config.schema,
    tag,
  };
  applyMetaOptions(meta, options);

  const rsaaConfig = buildRSAAConfig(config);
  const endpoint = buildEndpoint(rsaaConfig.endpoint, params);

  return {
    [RSAA]: {
      method: 'GET',
      ...rsaaConfig,
      endpoint,
      types: [
        {
          type: LOAD_REQUEST,
          meta,
        },
        {
          type: LOAD_SUCCESS,
          meta,
        },
        {
          type: LOAD_ERROR,
          meta,
        },
      ],
    },
  };
};