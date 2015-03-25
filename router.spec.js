'use strict';

var Router     = require('../router.js'),
    sinon      = require('sinon'),
    assert     = require('node-assertthat');

describe('router', function(){
    var router = {};

    var fakeEmptyResponse = {
        end: function(){},
        writeHead: function(){}
    };

    beforeEach(function() {
        router = new Router({ showLog: false });
    });

    it('should route to defined GET path', function(){
        // given
        var request = {
            url: '/path',
            method: 'GET'
        };

        var callbackSpy = sinon.spy();
        router.httpGet('/path', callbackSpy);

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpy.calledOnce, is.true());
    });

    it('should route to defined POST path', function(){
        // given
        var request = {
            url: '/path',
            method: 'POST'
        };

        var callbackSpyGet = sinon.spy();
        router.httpGet('/path', callbackSpyGet);

        var callbackSpyPost = sinon.spy();
        router.httpPost('/path', callbackSpyPost);

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpyPost.calledOnce, is.true());
        assert.that(callbackSpyGet.calledOnce, is.false());
    });

    it('should route to defined DELETE path', function() {
       // given
        var request = {
            url: '/path',
            method: 'DELETE'
        };

        var callbackSpy = sinon.spy();
        router.httpDelete('/path', callbackSpy);

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpy.calledOnce, is.true());
    });

    it('should route to defined PUT path', function() {
       // given
        var request = {
            url: '/path',
            method: 'PUT'
        };

        var callbackSpy = sinon.spy();
        router.httpPut('/path', callbackSpy);

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpy.calledOnce, is.true());
    });

    it('should not route if path route does not exist', function() {
       // given
        var request = {
            url: '/somefancypath',
            method: 'GET'
        };

        var callbackSpy = sinon.spy();
        router.httpGet('/', callbackSpy);

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpy.calledOnce, is.false());
    });

    it('should end response with 404 if path route does not exist', function() {
       // given
        var request = {
            url: '/somefancypath',
            method: 'GET'
        };

        var writeHeadSpy = sinon.spy();
        var endSpy = sinon.spy();

        var response = {
            writeHead: writeHeadSpy,
            end: endSpy
        };

        var callbackSpy = sinon.spy();
        router.httpGet('/', callbackSpy);

        // when
        router.route(request, response);

        // then
        assert.that(callbackSpy.calledOnce, is.false());
        assert.that(writeHeadSpy.calledWith(404), is.true());
        assert.that(endSpy.calledOnce, is.true());
    });

    it('should override existing GET route if specified again', function() {
        // given
        var callbackSpyMrBond = sinon.spy();
        router.httpGet('/', callbackSpyMrBond);
        router.httpPost('/', callbackSpyMrBond);
        router.httpPut('/', callbackSpyMrBond);
        router.httpDelete('/', callbackSpyMrBond);

        var callbackSpyMrBean = sinon.spy();
        router.httpGet('/', callbackSpyMrBean);
        router.httpPost('/', callbackSpyMrBean);
        router.httpPut('/', callbackSpyMrBean);
        router.httpDelete('/', callbackSpyMrBean);

        var requestGet = {
            url: '/',
            method: 'GET'
        };
        var requestPost = {
            url: '/',
            method: 'POST'
        };
        var requestPut = {
            url: '/',
            method: 'PUT'
        };
        var requestDelete = {
            url: '/',
            method: 'DELETE'
        };

        // when
        router.route(requestGet, {});
        router.route(requestPost, {});
        router.route(requestPut, {});
        router.route(requestDelete, {});

        // then
        assert.that(callbackSpyMrBean.callCount, is.equalTo(4));
        assert.that(callbackSpyMrBean.calledWith(requestGet, {}), is.true());
        assert.that(callbackSpyMrBean.calledWith(requestPost, {}), is.true());
        assert.that(callbackSpyMrBean.calledWith(requestPut, {}), is.true());
        assert.that(callbackSpyMrBean.calledWith(requestDelete, {}), is.true());
    });

    it('should invoke callback with response when routing', function() {
        // given
        var callbackSpy = sinon.spy();
        router.httpGet('/highwayToHell', callbackSpy);

        var requestGet = {
            url: '/highwayToHell',
            method: 'GET'
        };

        // when
        router.route(requestGet, fakeEmptyResponse);

        // then
        assert.that(callbackSpy.calledWith(requestGet, fakeEmptyResponse), is.true());
    });

    it('should route to restful content by using wildcard', function() {
        // given
        var callbackSpy = sinon.spy();
        router.httpGet('/movies/{id}', callbackSpy);

        var request = {
            url: '/movies/1',
            method: 'GET'
        };

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpy.calledWith(request), is.true());
    });

    it('should route to restful content by using wildcard for different http methods', function() {
        // given
        var callbackSpyForGet = sinon.spy();
        router.httpGet('/movies/{id}', callbackSpyForGet);

        var callbackSpyForDelete = sinon.spy();
        router.httpDelete('/movies/{id}', callbackSpyForDelete);

        var requestDelete = {
            url: '/movies/1',
            method: 'DELETE'
        };

        // when
        router.route(requestDelete, fakeEmptyResponse);

        // then
        assert.that(callbackSpyForDelete.calledOnce, is.true());
        assert.that(callbackSpyForGet.calledOnce, is.false());
    });

    it('should pass params object to callback', function() {
        // given
        var callbackSpy = sinon.spy();
        router.httpGet('/movies/{id}', callbackSpy);

        var request = {
            url: '/movies/1',
            method: 'GET'
        };

        var params = {
            id: '1'
        };

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpy.calledWith(request, fakeEmptyResponse, params), is.true());
    });

    it('should have empty params object for non-wildcard routes', function() {
        // given
        var callbackSpy = sinon.spy();

        router.httpGet('/movies', callbackSpy);

        var request = {
            url: '/movies',
            method: 'GET'
        };

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpy.calledWith(request, fakeEmptyResponse, {}), is.true());
    });

    it('should differentiate paths by wildcard type constraints and route with "string" wildcard', function() {
        // given
        var callbackSpyMrBond = sinon.spy();
        router.httpGet('/movies/{id:number}', callbackSpyMrBond);

        var callbackSpyMrBean = sinon.spy();
        router.httpGet('/movies/{name:string}', callbackSpyMrBean);

        var request = {
            url: '/movies/lotr',
            method: 'GET'
        };

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpyMrBean.calledOnce, is.true());
        assert.that(callbackSpyMrBond.calledOnce, is.false());
    });

    it('should differentiate paths by wildcard type constraints and route with "number" wildcard', function() {
        // given
        var callbackSpyMrBond = sinon.spy();
        router.httpGet('/movies/{id:number}', callbackSpyMrBond);

        var callbackSpyMrBean = sinon.spy();
        router.httpGet('/movies/{name:string}', callbackSpyMrBean);

        var request = {
            url: '/movies/1',
            method: 'GET'
        };

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpyMrBean.calledOnce, is.false());
        assert.that(callbackSpyMrBond.calledOnce, is.true());
    });

    it('should take the firstly declared route it finds when the routes are ambiguous', function() {
        // given
        var callbackSpyMrBond = sinon.spy();
        router.httpGet('/movies/{id:string}', callbackSpyMrBond);

        var callbackSpyMrBean = sinon.spy();
        router.httpGet('/movies/{name:string}', callbackSpyMrBean);

        var request = {
            url: '/movies/trololo',
            method: 'GET'
        };

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpyMrBond.calledOnce, is.true());
        assert.that(callbackSpyMrBean.calledOnce, is.false());
    });

    it('should set params from the first route it finds if route with wildcard was used and there are two routes to choose', function() {
        // given
        var callbackSpyMrBond = sinon.spy();
        router.httpGet('/movies/{id:string}', callbackSpyMrBond);

        var callbackSpyMrBean = sinon.spy();
        router.httpGet('/movies/{name:string}', callbackSpyMrBean);

        var request = {
            url: '/movies/trololo',
            method: 'GET'
        };

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpyMrBond.calledWith(request, fakeEmptyResponse, { id: 'trololo' }), is.true());
        assert.that(callbackSpyMrBean.calledOnce, is.false());
    });

    it('should route if request url ends with / and there is regular path for it after trimming this /', function() {
        // given
        var callbackSpy = sinon.spy();
        router.httpGet('/movies', callbackSpy);

        var request = {
            url: '/movies/',
            method: 'GET'
        };

        // when
        router.route(request, fakeEmptyResponse);

        // then
        assert.that(callbackSpy.calledOnce, is.true());
    });

    it('should not route if request url ends with / and there is no regular path for it', function() {
        // given
        // there are no paths in system
        var writeHeadSpy = sinon.spy();

        var request = {
            url: '/movies/',
            method: 'GET'
        };

        var response = {
            end: function(){},
            writeHead: writeHeadSpy
        };

        // when
        router.route(request, response);

        // then
        assert.that(writeHeadSpy.calledWith(404), is.true());
    });

    it('should be possible to assign one callback to more than one path', function(){
        // given
        var request = {
            url: '/path/1',
            method: 'GET'
        };

        var secondRequest = {
            url: '/path2',
            method: 'GET'
        };

        var callbackSpy = sinon.spy();
        router.httpGet(['/path/{id}', '/path2'], callbackSpy);

        // when
        router.route(request, fakeEmptyResponse);
        router.route(secondRequest, fakeEmptyResponse);

        // then
        assert.that(callbackSpy.callCount, is.equalTo(2));
    });
});