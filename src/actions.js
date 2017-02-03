import { v4 } from 'node-uuid';
import { normalize, arrayOf } from 'normalizr';
import isPlainObject from 'lodash/isPlainObject';
import get from 'lodash/get';


export const CREATE_ENTITY = 'CREATE_ENTITY';

/**
 * Create would be better named as "add", because
 * we are not creating entities, we are just adding
 * them to the store. But the word "create" is kept
 * because resemblance with CRUD operations.
 */
export function createEntity(schema, data, options={}) {
  if ( ! data.hasOwnProperty('id')) {
    data = { ...data, id: v4() };
  }
  return {
    type: CREATE_ENTITY,
    payload: {
      key: schema.getKey(),
      schema: schema,
      data: options.skipNormalization ? data : normalize(data, schema),
      _rawData: data,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export const CREATE_ENTITIES = 'CREATE_ENTITIES';

export function createEntities(schema, data, options={}) {
  let normalizedData;
  if ( ! options.skipNormalization) {
    if (Array.isArray(data)) {
      data = data.map((e) => e.id ? e : { ...e, id: v4() });
      normalizedData = normalize(data, arrayOf(schema));
    }
    else {
      data = data.id ? data : { ...data, id: v4() };
      normalizedData = normalize(data, schema);
    }
  }
  return {
    type: CREATE_ENTITIES,
    payload: {
      key: schema.getKey(),
      schema: schema,
      data: options.skipNormalization ? data : normalizedData,
      _rawData: data,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


/**
 * The "READ" operation from CRUD are
 * the selectors that read from the estate.
 */


export const UPDATE_ENTITY = 'UPDATE_ENTITY';

export function updateEntity(schema, id, data, useDefault) {
  return {
    type: UPDATE_ENTITY,
    payload: {
      key: schema.getKey(),
      schema: schema,
      id,
      data: normalize({ id, ...data }, schema),
      useDefault,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export const UPDATE_ENTITIES = 'UPDATE_ENTITIES';

export function updateEntities(schema, ids, data) {
  const dataAndIds = ids.map(id => ({ ...data, id }));
  return {
    type: UPDATE_ENTITIES,
    payload: {
      key: schema.getKey(),
      schema: schema,
      ids,
      data: normalize(dataAndIds, arrayOf(schema)),
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export const UPDATE_ENTITY_ID = 'UPDATE_ENTITY_ID';

export function updateEntityId(schema, oldId, newId) {
  return {
    type: UPDATE_ENTITY_ID,
    payload: {
      key: schema.getKey(),
      schema,
      oldId,
      newId,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export const DELETE_ENTITY = 'DELETE_ENTITY';

export function deleteEntity(schema, id) {
  if (isPlainObject(id) && id.hasOwnProperty('id')) {
    id = id.id;
  }
  return {
    type: DELETE_ENTITY,
    payload: {
      key: schema.getKey(),
      schema: schema,
      id,
    },
    meta: {
      isEntityAction: true,
    },
  };
}


export default {
  createEntity,
  createEntities,
  updateEntity,
  updateEntities,
  deleteEntity,
  updateEntityId,
};
