function importTest(name: string, path: string) {
  describe(name, function () {
    require(path);
  });
}

var common = require("./common.spec");

describe("index", function () {
  beforeEach(function () {
    console.log("running something before each test");
  });
  importTest("auth", "./auth.spec");
  importTest("product", "./product.spec");
  importTest("order", "./order.spec");
  after(function () {
    console.log("after all tests");
  });
});
