"use strict"

if (process.env.NODE_ENV === "production") {
  module.exports = require("./rxjs-state.cjs.production.min.js")
} else {
  module.exports = require("./rxjs-state.cjs.development.js")
}
