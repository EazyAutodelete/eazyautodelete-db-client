"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError(
          "Class extends value " + String(b) + " is not a constructor or null"
        );
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
exports.__esModule = true;
var console_1 = require("console");
var chalk_1 = require("chalk");
var Logger = /** @class */ (function (_super) {
  __extends(Logger, _super);
  function Logger() {
    return _super.call(this, process.stdout, process.stderr) || this;
  }
  Logger.prototype.info = function (input, type) {
    if (type === void 0) {
      type = "INFO";
    }
    if (type === "BLANK") {
      return this.log(chalk_1["default"].hidden("-"));
    }
    var mess =
      chalk_1["default"].bold.cyan(this.date() + " - [ " + type + " ] => ") + input;
    _super.prototype.log.call(this, mess);
  };
  Logger.prototype.error = function (input) {
    var mess = chalk_1["default"].bold.redBright(this.date() + " - [ ERR- ] => ") + input;
    _super.prototype.error.call(this, mess);
  };
  Logger.prototype.warn = function (input) {
    var mess = chalk_1["default"].bold.yellow(this.date() + " - [ WARN ] => ") + input;
    _super.prototype.warn.call(this, mess);
  };
  Logger.prototype.date = function (msTimeStamp) {
    if (msTimeStamp === void 0) {
      msTimeStamp = new Date().getTime();
    }
    var date = new Date(msTimeStamp);
    var minutes = "".concat(date.getMinutes());
    if (minutes.length === 1) minutes = "0".concat(minutes);
    var seconds = "".concat(date.getSeconds());
    if (seconds.length === 1) seconds = "0".concat(seconds);
    return "[ "
      .concat(date.getFullYear(), ".")
      .concat(date.getMonth() + 1, ".")
      .concat(date.getDate(), " - ")
      .concat(date.getHours(), ":")
      .concat(minutes, ":")
      .concat(seconds, " ]");
  };
  return Logger;
})(console_1.Console);
exports["default"] = Logger;
