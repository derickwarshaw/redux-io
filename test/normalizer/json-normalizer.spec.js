import _ from 'lodash';
import { expect } from 'chai';
import { normalizeItem, normalizeCollection } from '../../src';
import {
  STATUS,
  createStatus,
  updateStatus,
} from '../../src/status';

const expectedNormalizedItem = {
  id: 1,
  type: 'app.test',
  attributes: {
    address: 'address1',
    numOfPeople: 22,
  },
  relationships: {
    owners: {
      data: [
        {
          id: 1,
          type: 'app.owner',
        },
        {
          id: 2,
          type: 'app.owner',
        },
      ],
    },
    parent: {
      data: {
        id: 'a',
        type: 'app.owner',
      },
    },
  },
};
const transformation = {
  relationships: {
    owners: { type: 'app.owner' },
    parent: { type: 'app.owner' },
  },
};

describe('json-normalizer', () => {
  it('normalize item', () => {
    const denormalizedItem = {
      id: 1,
      type: 'app.test',
      address: 'address1',
      numOfPeople: 22,
      owners: [
        {
          id: 1,
          type: 'app.owner',
          name: 'a',
        },
        {
          id: 2,
          type: 'app.owner',
          name: 'b',
        },
      ],
      parent: {
        id: 'a',
        type: 'app.owner',
        name: 'c',
      },
    };
    denormalizedItem[STATUS] = updateStatus(
      createStatus(),
      {
        transformation,
      }
    );

    const normalizedItem = normalizeItem(denormalizedItem);
    expect(normalizedItem).to.be.deep.equal(expectedNormalizedItem);
  });

  it('normalize item with picks', () => {
    const denormalizedItem = {
      id: 1,
      type: 'app.test',
      address: 'address1',
      numOfPeople: 22,
      owners: [
        {
          id: 1,
          type: 'app.owner',
          name: 'a',
        },
        {
          id: 2,
          type: 'app.owner',
          name: 'b',
        },
      ],
      parent: {
        id: 'a',
        type: 'app.owner',
        name: 'c',
      },
    };
    denormalizedItem[STATUS] = updateStatus(
      createStatus(),
      {
        transformation,
      }
    );

    const normalizedItem = normalizeItem(denormalizedItem, ['address', 'owners']);
    const expectedNormalizedItemPicks = {
      id: 1,
      type: 'app.test',
      attributes: {
        address: 'address1',
      },
      relationships: {
        owners: {
          data: [
            {
              id: 1,
              type: 'app.owner',
            },
            {
              id: 2,
              type: 'app.owner',
            },
          ],
        },
      },
    };
    expect(normalizedItem).to.be.deep.equal(expectedNormalizedItemPicks);
  });

  it('normalize item with empty picks', () => {
    const denormalizedItem = {
      id: 1,
      type: 'app.test',
      address: 'address1',
      numOfPeople: 22,
      owners: [
        {
          id: 1,
          type: 'app.owner',
          name: 'a',
        },
        {
          id: 2,
          type: 'app.owner',
          name: 'b',
        },
      ],
      parent: {
        id: 'a',
        type: 'app.owner',
        name: 'c',
      },
    };
    denormalizedItem[STATUS] = updateStatus(
      createStatus(),
      {
        transformation,
      }
    );

    const normalizedItem = normalizeItem(denormalizedItem, []);
    const expectedNormalizedItemPicks = {
      id: 1,
      type: 'app.test',
      attributes: {
      },
      relationships: {
      },
    };
    expect(normalizedItem).to.be.deep.equal(expectedNormalizedItemPicks);
  });

  it('normalize item with conflicting picks', () => {
    const denormalizedItem = {
      id: 1,
      type: 'app.test',
      address: 'address1',
      numOfPeople: 22,
      owners: [
        {
          id: 1,
          type: 'app.owner',
          name: 'a',
        },
        {
          id: 2,
          type: 'app.owner',
          name: 'b',
        },
      ],
      parent: {
        id: 'a',
        type: 'app.owner',
        name: 'c',
      },
    };
    denormalizedItem[STATUS] = updateStatus(
      createStatus(),
      {
        transformation,
      }
    );

    const normalizedItem = normalizeItem(denormalizedItem, ['id', 'type']);
    const expectedNormalizedItemPicks = {
      id: 1,
      type: 'app.test',
      attributes: {
      },
      relationships: {
      },
    };
    expect(normalizedItem).to.be.deep.equal(expectedNormalizedItemPicks);
  });

  it('normalize item with missing relationship data', () => {
    const denormalizedItem = {
      id: 1,
      type: 'app.test',
      address: 'address1',
      numOfPeople: 22,
      owners: [
        {
          id: 1,
          type: 'app.owner',
          name: 'a',
        },
        {
          id: 2,
          type: 'app.owner',
          name: 'b',
        },
      ],
      parent: {
        id: 'a',
        type: 'app.owner',
        name: 'c',
      },
    };
    denormalizedItem[STATUS] = updateStatus(
      createStatus(),
      {
        transformation: {
          relationships: {
            owners: { type: 'app.owner' },
            parent: { type: 'app.owner' },
            children: { type: 'app.owner' },
          },
        },
      }
    );

    const normalizedItem = normalizeItem(denormalizedItem);
    expect(normalizedItem).to.be.deep.equal(expectedNormalizedItem);
  });

  it('normalize collection', () => {
    const denormalizedItem = {
      id: 1,
      type: 'app.test',
      address: 'address1',
      numOfPeople: 22,
      owners: [
        {
          id: 1,
          type: 'app.owner',
          name: 'a',
        },
        {
          id: 2,
          type: 'app.owner',
          name: 'b',
        },
      ],
      parent: {
        id: 'a',
        type: 'app.owner',
        name: 'c',
      },
    };
    const denormalizedList = [
      Object.assign({}, denormalizedItem),
      Object.assign({}, denormalizedItem),
      Object.assign({}, denormalizedItem),
    ];

    denormalizedList.map(item => (
      item[STATUS] = updateStatus(
        createStatus(),
        {
          transformation: {
            relationships: {
              owners: { type: 'app.owner' },
              parent: { type: 'app.owner' },
            },
          },
        }
      )
    ));

    const normalizedList = normalizeCollection(denormalizedList);
    const expectedNormalizedList = [
      Object.assign({}, expectedNormalizedItem),
      Object.assign({}, expectedNormalizedItem),
      Object.assign({}, expectedNormalizedItem),
    ];
    delete normalizedList[STATUS];
    normalizedList.map(x => delete x[STATUS]);
    expect(normalizedList).to.be.deep.equal(expectedNormalizedList);
  });
});
