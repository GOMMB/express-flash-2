var assert = require('chai').assert;
var util = require('util');
var flashMiddleware = require('../lib/flash');

function MockRequest() {
  this.session = {};
}

function MockRequestWithoutSession() {
}

function MockResponse(req) {
  this.locals = {};
  this.req=req;
}

describe('flash', function(){
  describe('middleware', function(){
    var flash = null;
    beforeEach(function(){
      flash = flashMiddleware();
    });
    describe('when handling a request', function(){
      var req = null;
      var res = null;
      var errFromNext = null;
      beforeEach(function(done){
        req = new MockRequest();
        res = new MockResponse(req);
        process.nextTick(function(){
          flash(req, res, function(err){
            errFromNext = err;
            done();
          });
        });
      });

      it('should not error', function(){
        assert.isUndefined(errFromNext);
      });

      it('should add a flash function', function(){
        assert.isFunction(req.flash);
      });

      it('should set flash message', function(){
       var count = req.flash('error', 'Something went wrong');
        assert.equal(count, 1);
        assert.lengthOf(Object.keys(req.session.flash), 1);
        assert.lengthOf(req.session.flash['error'], 1);
      });

      it('should set a formatted flash message', function(){
       var count = req.flash('error', '%s went wrong', 'cell phone');
        assert.equal(count, 1);
        assert.lengthOf(Object.keys(req.session.flash), 1);
        assert.lengthOf(req.session.flash['error'], 1);
        assert.equal(req.session.flash['error'], 'cell phone went wrong');
      });

      it('should set a flash message array', function(){
        var count = req.flash('error', ['name was wrong', 'age was wrong']);
        assert.equal(count, 2);
        assert.lengthOf(Object.keys(req.session.flash), 1);
        assert.lengthOf(req.session.flash['error'], 2);
      });

      it('should set two flash messages with same type', function(){
        req.flash('error', 'name was wrong');
        var count = req.flash('error', 'age was wrong');
        assert.equal(count, 2);
        assert.lengthOf(Object.keys(req.session.flash), 1);
        assert.lengthOf(req.session.flash['error'], 2);
      });

      it('should set two flash messages with different types', function(){
        req.flash('error', 'name was wrong');
        req.flash('info', 'success');
        assert.lengthOf(Object.keys(req.session.flash), 2);
        assert.lengthOf(req.session.flash['error'], 1);
        assert.lengthOf(req.session.flash['info'], 1);
      });

       it('should get and clear previously set flash message', function(done){
        req.flash('error', 'Something went wrong');
         process.nextTick(function(){
          flash(req, res, function(err){
            assert.lengthOf(Object.keys(res.locals.flash), 1);
            assert.equal(res.locals.flash['error'], 'Something went wrong');
            assert.lengthOf(Object.keys(req.session.flash), 0);
            done();
          });
        });
      });
    });
  });
});
