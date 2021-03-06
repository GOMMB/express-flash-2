/**
 * Module dependencies.
 */
var format = require('util').format;
var isArray = require('util').isArray;

/**
 * Expose `flash()` function on responses.
 *
 * @return {Function}
 * @api public
 */
module.exports = function flash(options) {
  options = options || {};
  var safe = (options.unsafe === undefined) ? true : !options.unsafe;
  
  return function(req, res, next) {
    if (!(req.flash && safe))
    {
      req.flash = _flash;
    }
    // put the flash into res.locals
    var flash = res.req.session.flash || {};
    res.req.session.flash = {};
    res.locals.flash = flash;
    next();
  }
}

/**
 * Queue flash `msg` of the given `type`.
 *
 * Examples:
 *
 *      req.flash('info', 'email sent');
 *      req.flash('error', 'email delivery failed');
 *      req.flash('info', 'email re-sent');
 *      // => 2
 *
 *
 * Formatting:
 *
 * Flash notifications also support arbitrary formatting support.
 * For example you may pass variable arguments to `req.flash()`
 * and use the %s specifier to be replaced by the associated argument:
 *
 *     req.flash('info', 'email has been sent to %s.', userName);
 *
 * Formatting uses `util.format()`, which is available on Node 0.6+.
 *
 * @param {String} type
 * @param {String} msg
 * @return {Number}
 * @api public
 */
function _flash(type, msg) {
  var session = this.session;
  if (session === undefined) throw Error('res.flash() requires sessions');
  var msgs = session.flash = session.flash || {};
  if (type && msg) {
    // util.format is available in Node.js 0.6+
    if (arguments.length > 2 && format) {
      var args = Array.prototype.slice.call(arguments, 1);
      msg = format.apply(undefined, args);
    } else if (isArray(msg)) {
      msg.forEach(function(val){
        (msgs[type] = msgs[type] || []).push(val);
      });
      return msgs[type].length;
    }
    return (msgs[type] = msgs[type] || []).push(msg);
  } 
}
