Object.defineProperty(exports, "__esModule", {
  value: true
});

var test1 = '1';
var test2 = '2';
var test3 = '3';

exports.test1 = test1;

Object.defineProperty(exports, "test2", {
  enumerable: true,
  get: function get() {
    return test2;
  }
});

module.exports = {
  test3: test3
};