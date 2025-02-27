# API Reference (v0.3.3)

 - [Reducer](#reducer)
  - [`reducer(schemas, initialState)`](#reducerschemas)
 - [Middleware](#middleware)
  - [`middleware(config)`](#middlewareconfig)
 - [Schema](#schema)
  - [`defineSchema(name, config)`](#defineschemaname-config)
  - [`hasMany(name)`](#hasmanyname)
  - [`generateSchemas(schemas)`](#generateschemasschemas)
 - [Selectors](#selectors)
  - [`getEntities(state, schema)`](#getentitiesstate-schema)
  - [`getEntitiesBy(state, schema, by)`](#getentitiesbystate-schema-by)
  - [`getEntity(state, schema, id)`](#getentitystate-schema-id)
 - [Helpers](#helpers)
  - [`createEntities(schema, dataPath, action)`](#createentitiesschema-datapath-action)
  - [`updateEntities(schema, ids, dataPath, action)`](#updateentitiesschema-ids-datapath-action)
  - [`updateEntityId(schema, oldId, newId, action)`](#updateentityidschema-oldid-newid-action)
  - [`deleteEntities(schema, ids, action)`](#deleteentitiesschema-ids-action)

## Reducer

#### `reducer(schemas, initialState)`

> Creates the reducer that will manage the *entities* slice of the store. It should be mounted at `entities`.

 - **Parameters**
  - `schemas` *Object*: Object containing entity schemas. Usually the output of [`generateSchemas(schemas)`]().
  - `initialState` *Object*: Object containing an initial state for each entity. Each key of this object has to be the name of an entity and
    the value has to be the initial state for that entity.
 - **Returns**
  - *Function*: The reducer that will manage the *entities* slice of the store.

```javascript
import { reducer as entities } from 'entman';
import { combineReducers } from 'redux';
import { schemas } from './schemas';

const topReducer = combineReducers({
  // ...other reducers of the application
  entities: entities(schemas, {
    Group: { 1: { id: 1 } },
  }),
});
```

## Middleware

#### `middleware(config)`

> Creates the entman middleware needed to process the actions generated by the [helpers]().

 - **Parameters**
  - `config` *Object*: An object containing configuration options to pass to the middleware. Currently, the supported options are:
    - `enableBatching`: Enable or disable batching of multiple entman actions into a single action. **Defaults to true**.
 - **Returns**
  - *Function*: A Redux middleware.

```javascript
import { createStore, applyMiddleware } from 'redux';
import { middleware as entman } from 'entman';
import reducer from './reducer';

export default createStore({
  reducer,
  applyMiddleware(entman({ enableBatching: true }),
});
```

## Schema

#### `defineSchema(name, config)`

> Creates an schema definition with the given named to be used in `generateSchemas`.

 - **Parameters**
  - `name` *String*: A string indicating the name of the entity this schema defines.
  - `config` *Object*: An object with the information to define the schema. The attributes are:
    - `attributes`: An object containing information about the relations of this entity to other entities and computed properties to be added to the entity when it's retrieved from the store.
 - **Returns**
  - *Object*: Schema definition of the entity.

```javascript
import { defineSchema } from 'entman';

const userDefinition = defineSchema('User', {
  group: 'Group',  // User belongs to Group

  // Define computed properties as functions
  getGroupName() {
    return this.group.name;
  },
);
```

##### Note

When retrieving users from the store, they will contain defined computed properties. Inside computed properties we can compute data based on the entity and its relations. We can know for sure that in every place we're going to use that entity, the computed properties will be there, saving a lot imports around the application with functions to compute the same data.

#### `hasMany(name)`

> Defines an array like relationship with the entity identified by `name`.

 - **Parameters**
  - `name` *String*: A string indicating the name of the related entity.
 - **Returns**
  - *Object*: A relationship definition.

```javascript
import { defineSchema, hasMany } from 'entman';

const groupDefinition = defineSchema('Group', {
  users: hasMany('User')  // Group has many users
});
```

#### `generateSchemas(schemas)`

> Generates entities schemas from the definitions. The generated result is ready to be passed to the entities reducer.

 - **Parameters**
  - `schemas` *Array*: An array containing schemas definitions.
 - **Returns**
  - *Object*: An object with the schemas of the entities.

```javascript
import { defineSchema, generateSchemas } from 'entman';

const userDefinition = defineSchema('User');

export default generateSchemas([ userDefinition ]);
```

## Selectors

#### `getEntities(state, schema)`

> Get all the entities defined by `schema` from the state. It takes care of populate all the entities relationships and adding the computed properties defined in the schema.

 - **Parameters**
  - `state` *Object*: The global state of the application or an slice that contains the key `entities` on it.
  - `schema` *Object*: The schema of the entities to retrieve.
 - **Returns**
  - *Object*: An array with all the entities of the specified schema.

```javascript
import { getEntities } from 'entman';
import schemas from './schemas';

function getGroups(state) {
  return getEntities(state, schemas.Group);
}

// -----

const groups = getGroups(state);
```

#### `getEntitiesBy(state, schema, by)`

> Get all the entities defined by `schema` from the state that match certain conditions. The conditions are specified by the `by` parameter which is an object that takes attributes of the entities as keys and the values these have to have as values to match. It takes care of populate all the entities relationships and adding the computed properties defined in the schema.

 - **Parameters**
  - `state` *Object*: The global state of the application or an slice that contains the key `entities` on it.
  - `schema` *Object*: The schema of the entities to retrieve.
  - `by` *Object*: An object specifying attributes of the entities and which value do they have to have. All entities matching those values are retrieved.
 - **Returns**
  - *Object*: An array with all the entities of the specified schema that match the conditions specified.

```javascript
import { getEntitiesBy } from 'entman';
import schemas from './schemas';

function getGroupsBy(state, by) {
  return getEntities(state, schemas.Group, by);
}

// -----

const groups = getGroupsBy(state, { name: 'Test' });
```

#### `getEntity(state, schema, id)`

> Get a single entity defined by `schema` with the specified `id` from the state. It takes care of populate all the entity relationships and adding the computed properties defined in the schema.

 - **Parameters**
  - `state` *Object*: The global state of the application or an slice that contains the key `entities` on it.
  - `schema` *Object*: The schema of the entities to retrieve.
  - `id` *String|Number*: The id of the entity to retrieve.
 - **Returns**
  - *Object*: The entity with the specified id.

```javascript
import { getEntity } from 'entman';
import schemas from './schemas';

function getGroup(state, id) {
  return getEntity(state, schemas.Group, id);
}

// -----

const group = getGroup(state, 1);
```

## Helpers

#### `createEntities(schema, dataPath, action)`

> Wraps an action adding the necessary info for entman to understand it has to add entities to the state.

 - **Parameters**:
  - `schema` *Object*: The schema of the entities to be created.
  - `dataPath` *String*: The path in dot notation of where the data of the entities is located in the wrapped action.
  - `action` *Object: The action to wrap. It has to be a valid Redux action.
 - **Returns**:
  - *Object*: The wrapped action.

```javascript
import { createEntities } from 'entman';
import schemas from 'schemas';

export const CREATE_GROUPS = 'CREATE_GROUPS';

export function createGroups(data) {
  return createEntities(schemas.Group, 'payload.data', {
    type: CREATE_GROUPS,
    payload: { data },
  });
}
```

#### `updateEntities(schema, ids, dataPath, action)`

> Wraps an action adding the necessary info for entman to understand it has to update entities in the state.

 - **Parameters**
  - `schema` *Object*: The schema of the entities to be updated.
  - `ids` *Array|Number|String*: The id or ids of the entities to be updated.
  - `dataPath` *String*: The path in dot notation of where the data of the entities is located in the wrapped action.
  - `action` *Object*: The action to wrap. It has to be a valid Redux action.
 - **Returns**:
  - *Object*: The wrapped action.

```javascript
import { updateEntities } from 'entman';
import schemas from 'schemas';

export const UPDATE_GROUP = 'UPDATE_GROUP';

export function updateGroup(1, data) {
  return updateEntities(schemas.Group, 1, 'payload.data', {
    type: UPDATE_GROUP,
    payload: { data },
  });
}
```

#### `updateEntityId(schema, oldId, newId, action)`

> Wraps an action adding the necessary info for entman to understand it has to update the id of an entity in the state.

 - **Parameters**
  - `schema` *Object*: The schema of the entity to be updated.
  - `oldId` *Number|String*: The actual id of the entity.
  - `newId` *Number|String*: The new id of the entity.
  - `action` *Object*: The action to wrap. It has to be a valid Redux action.
 - **Returns**
  - *Object*: The wrapped action.

```javascript
import { updateEntityId } from 'entman';
import schemas from 'schemas';

export const SAVE_GROUP_SUCCESS = 'SAVE_GROUP_SUCCESS';

export function saveGroupSuccess(oldId, newId) {
  return updateEntityId(schemas.Group, oldId, newId, {
    type: SAVE_GROUP_SUCCESS,
  });
}
```

#### `deleteEntities(schema, ids, action)`

> Wraps an action adding the necessary info for entman to understand it has to delete entities from the state.

 - **Parameters**
  - `schema` *Object*: The schema of the entity to be deleted.
  - `ids` *Array|Number|String*: The id or ids of the entities to be deleted.
  - `action` *Object*: The action to wrap. It has to be a valid Redux action.
 - **Returns**
  - *Object*: The wrapped action.

```javascript
import { deleteEntities } from 'entman';
import schemas from 'schemas';

export const DELETE_GROUP = 'DELETE_GROUP';

export function deleteGroup(id) {
  return deleteEntities(schemas.Group, id, {
    type: DELETE_GROUP,
  });
}
```
