'use strict';

/**
 px.dealer Object providing API for dealer

 #### Usage
 ```
 var deckDefinition = {
    'sample-cards': {
    name: 'SampleCards',
    url: 'views/sample-cards.html'
    },
    'fetch-data': {
    name: 'FetchData',
    url: 'views/fetch-data.html'
    },
    'card-to-card': {
    name: 'CardToCard',
    url: 'views/card-to-card.html'
    }
    };

 var decksByClassification = {
    'dashboard1': {
    '/classification/country': ['sample-cards', 'fetch-data'],
    '/classification/state': ['card-to-card'],
    '/classification/county': ['sample-cards', 'card-to-card', 'fetch-data']
    },
    'dashboard2': {
    '/classification/country': ['sample-cards', 'fetch-data'],
    '/classification/state': ['card-to-card'],
    '/classification/county': ['sample-cards', 'card-to-card', 'fetch-data']
    }
    };

 window.px.dealer.init(deckDefinition, decksByClassification);

 $scope.$apply(function () {

    $scope.context = {
        name: 'newContextName'
    }; //new context could be set by opening up a context in context browser, please see Predix seed app for integration with Predix Asset

    window.px.dealer.getDecksByClassification('dashboard1', $scope.context.classification).then(function(decks){
    $scope.decks = decks;

    if ($scope.decks.length) {
    $scope.selectedDeck = $scope.decks[0].url;
    }
    });
    });

 ```

 #### px.dealer api

 ##### methods

 ```
 getData: function (url) {
    //get data from web resources by url
    },
 ```
 ```
 init: function (deckDefinitions, decksByClassifications) {
    //instantiate the dealer by setting up deck definition and deckByClassification for getDecksByClassification look up
    },
 ```
 ```
 getDecksByClassification: function (dashboardId, classification) {
    //get a list of decks by dashboard Id and classification
    },
 ```
 ```
 getDeck: function (url) {
    //get the deck markup by url
    }
 ```
 **/


(function () {

    window.px = window.px || {};

    function makePoint(item) {
        if (item && item.length >= 2) {
            return {x: item[0], y: item[1]};
        }
        throw new Error('Invalid time series point format');
    }

    function makeSeries(result) {
        if (result.name && result.values && result.values.constructor === Array) {
            var values = result.values;
            var data = values.map(makePoint);
            return {name: result.name, data: data};
        }
        throw new Error('Invalid time series data format');
    }

    function transform(rawData) {
        if (rawData && rawData.constructor === Array) {
            var result = [];
            rawData.forEach(function (query) {
                if (query.results && query.results.constructor === Array) {
                    result = result.concat(query.results.map(makeSeries));
                }
                else {
                    throw new Error('Invalid time series data format');
                }
            });
            return result;
        }
        throw new Error('Invalid time series data format');
    }

    window.px.timeseries = window.px.timeseries || {};
    window.px.timeseries.adapter = window.px.timeseries.adapter || {};
    window.px.timeseries.adapter.kairosdb = window.px.timeseries.adapter.kairosdb || {};

    window.px.timeseries.adapter.kairosdb = {
        transform: transform
    };

    window.px.timeseries.dataTransformer = function(option){
        this.option = {
            getSeriesName: function (tagname, groups) {
                var groupName = "";
                if (groups && groups.constructor === Array) {
                    groups.forEach(function (group) {
                        groupName = groupName + '_' + group.name;

                        if (group.values && group.values.constructor === Array) {
                            group.values.forEach(function (value) {
                                groupName = groupName + '_' + value;
                            });
                        }

                    });
                }
                return tagname + groupName;
            }
        };

        //overwrite default
        if (option && option.getSeriesName && typeof option.getSeriesName === 'function'){
            this.option.getSeriesName = option.getSeriesName;
        }
    };

    window.px.timeseries.dataTransformer.prototype.transform = function (tags) {
        if (tags && tags.constructor === Array) {
            var result = [];
            var self = this;
            tags.forEach(function (tag) {
                if (tag.name && tag.results && tag.results.constructor === Array) {

                    //add tag name
                    tag.results.map(self.makeSeries).forEach(function(series){
                        series.name = self.option.getSeriesName(tag.name, series._groups);
                        delete series._groups;
                        result = result.concat(series);
                    });
                }
                else {
                    throw new Error('Invalid time series data format');
                }
            });
            return result;
        }
        throw new Error('Invalid time series data format');
    };

    window.px.timeseries.dataTransformer.prototype.makeSeries = function(result) {
        if (result.datapoints && result.datapoints.constructor === Array) {
            var data = result.datapoints.map(makePoint);
            return {_groups: result.groups, data: data};
        }
        throw new Error('Invalid time series data format');
    };





    window.addEventListener('px-deck-ready', function (e) {
        e.target.init();
    });

    //angular implementation of px-dealer
    window.px.dealer = {
        /**
         * set http provider for px-dealer, useful for injecting $http during unit test with angular
         * @param httpProvider
         */
        setHttpProvider: function(httpProvider){
           this.httpProvider = httpProvider;
        },
        /**
         * get the $http Object set in the setHttpProvider or return angular.element('body').injector().get('$http'); by default
         * @returns {http Object}
         */
        getHttpProvider: function(){
            var $http = null;
            if (this.httpProvider){
                return this.httpProvider;
            }
            if (window.angular){
                $http = angular.element('body').injector().get('$http');
            }
            return $http;
        },
        getData: function (url, httpConfig) {
            if (httpConfig === null || typeof httpConfig !== 'object') {
                httpConfig = {};
            }
            // check url for JSONP callback
            if (/callback=/.test(url)) {
                httpConfig.method = 'JSONP';

            } else {
                httpConfig.method = 'GET';
            }
            httpConfig.url = url;
            return this.httpRequest(httpConfig);
        },
        httpRequest: function (httpConfig) {
            var $http = this.getHttpProvider();
            if ($http) {
                return new Promise(function (resolve, reject) {
                    var successCallback = function (data) {
                        resolve(data);
                    };
                    var errorCallback = function (data) {
                        reject(data);
                    };
                    $http(httpConfig)
                        .success(successCallback)
                        .error(errorCallback);
                });
            }
        },
        init: function (deckDefintions, decksByClassifications) {
            this.deckDefinitions = deckDefintions;
            this.decksByClassification = decksByClassifications;
        },
        getDecksByClassification: function (dashboardId, classification) {
            var decks = [];
            var self = this;
            if (dashboardId && this.decksByClassification && dashboardId in this.decksByClassification) {
                var decksInDashboard = this.decksByClassification[dashboardId];

                if (classification in decksInDashboard) {
                    decksInDashboard[classification].forEach(function (deckId) {
                        if (self.deckDefinitions[deckId]) {
                            decks.push(self.deckDefinitions[deckId]);
                        }
                    });
                }
            }

            return new Promise(function (resolve, reject) {
                resolve(decks);
            });
        },

        getDeck: function (url) {
            return this.getData(url);
        }

    };

    window.px.isInt = function (n) {
        return Number(n) === n && n % 1 === 0;
    };

    window.px.isFloat = function (n) {
        return n === Number(n) && n % 1 !== 0;
    };

    window.px.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };

    window.px.isNumber = function(n) {
      return ((n || n === 0) && n.toString() !== "true") ? (+n === +n) : false;
    };

    window.px.slugify = function(propName){
        var noCapitals = propName.replace(/([a-z])([A-Z])/g, '$1 $2');
        var allLowercase = noCapitals.toLowerCase();
        var attributeName = allLowercase.replace(/\s/g, '-');
        return attributeName;
    };

})();
