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

function toString(objId) {
  return objId.toString();
}

function toObjectId(input) {
  const inputType = typeof input;
  switch(inputType) {
  case 'string':
    return bson.ObjectId.createFromHexString(input);
  case 'object':
    if (!Array.isArray(input)) {
      throw new Error('Expected Array type but failed Array.isArray');
    }
    return input.map(toObjectId);
  }
  throw new Error(`Unexpected input type ${inputType}`);
}

function iterableWrapper(itr) {
  const origNext = itr.next.bind(itr);

  itr.next = () => {
    const result = origNext();
    if (result.done) return result;
    result.value = toObjectId(result.value);
    return result;
  }

  return itr;
}

class ObjectIdSet extends Set {
  add(objectId) {
    return super.add(toString(objectId));
  }

  delete(objectId) {
    return super.delete(toString(objectId));
  }

  has(objectId) {
    return super.has(toString(objectId));
  }

  entries() {
    return iterableWrapper(super.entries());
  }

  forEach(cb, ths) {
    super.forEach(val => cb.call(ths, toObjectId(val)));
  }

  values() {
    return iterableWrapper(super.values());
  }
}

ObjectIdSet.prototype.keys = ObjectIdSet.prototype.values;
ObjectIdSet.prototype[Symbol.iterator] = ObjectIdSet.prototype.values;

module.exports = ObjectIdSet;
