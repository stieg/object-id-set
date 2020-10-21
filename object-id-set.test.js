/**
 * MIT License
 *
 * Copyright (c) 2020 Andrew Stiegmann (stieg)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const bson = require('bson');

const ObjectIdSet = require('../objectid-set');

const objectIds = Array(10).fill(0).map(d => new bson.ObjectId());

let set;
beforeEach(() => {
  set = new ObjectIdSet();
});

describe('constructor', () => {
  it.each([null, undefined])('is successful when parameter is %s ', (value) => {
    expect(new ObjectIdSet(value)).toBeDefined();
  });

  it('successfully handles an iterable', () => {
    const set = new ObjectIdSet(objectIds);
    expect(Array.from(set)).toEqual(objectIds);
  });
})

describe('.add', () => {
  it('adds the expected value to the set', () => {
    expect(set.size).toBe(0);
    set.add(objectIds[0]);
    expect(set.size).toBe(1);
  });
});

describe('.delete', () => {
  it('removes objectid as expected', () => {
    set.add(objectIds[0]);
    expect(set.size).toBe(1);
    set.delete(objectIds[0]);
    expect(set.size).toBe(0);
  });

  it('takes no action if objectid not in set', () => {
    expect(set.size).toBe(0);
    set.delete(objectIds[0]);
    expect(set.size).toBe(0);
  });
});

describe('.has', () => {
  it('is true if it has the objectId', () => {
    expect(set.has(objectIds[0])).toBe(false);
    set.add(objectIds[0]);
    expect(set.has(objectIds[0])).toBe(true);
  });

  it('is false if it does not have the objectId', () => {
    expect(set.has(objectIds[0])).toBe(false);
    set.add(objectIds[0]);
    expect(set.has(objectIds[1])).toBe(false);
  });
});

describe('.entries', () => {
  it('returns an array with two object ids', () => {
    set.add(objectIds[0]);
    const itr = set.entries();
    const data = itr.next();
    expect(data.value).toHaveLength(2);
    expect(data.value).toEqual([objectIds[0], objectIds[0]]);
    expect(data.done).toBe(false);

    const data2 = itr.next();
    expect(data2.done).toBe(true);
  });
});

describe('.forEach', () => {
  it('wraps the callback corectly', (done) => {
    set.add(objectIds[0]);
    set.forEach((obj) => {
      expect(obj).toBeInstanceOf(bson.ObjectId);
      expect(obj.equals(objectIds[0])).toBe(true);
      done();
    });
  });

  it('passes this as expected', (done) => {
    const fakeThis = { foo: 'bar' };
    set.add(objectIds[0]);
    set.forEach(function(obj) {
      expect(this).toEqual(fakeThis);
      done();
    }, fakeThis);
  });
});

describe.each([
  ['[@@iterator]', ObjectIdSet.prototype[Symbol.iterator]],
  ['.keys', ObjectIdSet.prototype.keys],
  ['.values', ObjectIdSet.prototype.values]
])('%s', (_title, func) => {
  it('returns an iterator that behaves as expected', () => {
    set.add(objectIds[0]);
    const itr = func.call(set);

    const data = itr.next();
    expect(data.done).toBe(false);

    const obj = data.value;
    expect(obj).toBeInstanceOf(bson.ObjectId);
    expect(obj.equals(objectIds[0])).toBe(true);

    const data2 = itr.next();
    expect(data2.done).toBe(true);
  });
});

describe('Array.from', () => {
  it('produced the expected array', () => {
    const set = new ObjectIdSet();
    objectIds.forEach(id => set.add(id));
    expect(Array.from(set)).toEqual(objectIds);
  });
});
