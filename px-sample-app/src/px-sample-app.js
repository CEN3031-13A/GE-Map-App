"use strict";(function(){Polymer({is:"px-sample-app",properties:{/**
       * Used by the px-app-nav to automatically select the first item.
       * @property selected
       */selected:{type:Array,value:function value(){return["dashboard"]}},/**
       * Used by the px-context-browser and px-breadcrumbs as the available items array.
       * @property items
       */items:{type:Array,value:function value(){return[{label:"Europe",id:"Europe"},{label:"North America",id:"North_America",children:[{label:"Canada",id:"Canada"},{label:"Mexico",id:"Mexico"},{label:"United States",id:"United_States",children:[{label:"Arizona",id:"Arizona"},{label:"California",id:"California"},{label:"Colorado",id:"Colorado"},{label:"Idaho",id:"Idaho"},{label:"Montana",id:"Montana"},{label:"Nevada",id:"Nevada",children:[{label:"Reno Plant 1",id:"Reno Plant 1"},{label:"Reno Plant 2",id:"Reno Plant 2",children:[{label:"XY12345",id:"XY12345"},{label:"XY12356",id:"XY12356"},{label:"XY12367",id:"XY12367"},{label:"XY12378",id:"XY12378"},{label:"XY12389",id:"XY12389"}]},{label:"Reno Plant 3",id:"Reno Plant 3"},{label:"Reno Plant 4",id:"Reno Plant 4"},{label:"Vegas Plant 1",id:"Vegas Plant 1"},{label:"Vegas Plant 2",id:"Vegas Plant 2"}]},{label:"New Mexico",id:"New Mexico"},{label:"Oregon",id:"Oregon"},{label:"Texas",id:"Texas"},{label:"Utah",id:"Utah"},{label:"Washington",id:"Washington"},{label:"Wyoming",id:"Wyoming",children:[{label:"Cheyenne Plant 1",id:"Cheyenne Plant 1",children:[{label:"XY12345",id:"XY12345"},{label:"XY12356",id:"XY12356"},{label:"XY12367",id:"XY12367"},{label:"XY12378",id:"XY12378"},{label:"XY12389",id:"XY12389"}]},{label:"Cheyenne Plant 2",id:"Cheyenne Plant 2"},{label:"Cheyenne Plant 3",id:"Cheyenne Plant 3"},{label:"Rock Springs Plant 1",id:"Rock Springs Plant 1"},{label:"Rock Springs Plant 2",id:"Rock Springs Plant 2"}]}]}]},{label:"South America",id:"South_America"}]}},/**
       * Used by the px-context-browser to select an asset in the hierarchy.
       * @property selectedRoute
       */selectedRoute:{type:Array,value:function value(){return["North_America","United_States","Nevada","Reno Plant 2","XY12367"]},observer:"getSelection"},/**
       * Used as the title of the dashboard page.
       * @property selectedAsset
       */selectedAsset:{type:String,value:""}},/**
     * Used by the dom-if to test equality.
     * @param {Array} route
     * @param {String} string
     */isEqual:function isEqual(route,string){return route[0]===string},/**
     * Gets the selected asset from the context browser
     * to use as the title of the dashboard page.
     */getSelection:function getSelection(newValue){this.selectedAsset=this.$.cb.selected.label}})})();
//# sourceMappingURL=px-sample-app.js.map
