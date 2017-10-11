(function(window) {
  Polymer({

    is: 'px-breadcrumbs',

    behaviors: [
      PxAppBehavior.AssetGraph,
      PxAppBehavior.AssetSelectable,
      Polymer.IronResizableBehavior
    ],

    properties: {
      /**
       * This property holds the dynamically generated items (full or shortened, depending on the display options)
       * that are used for the dom repeat that draws the main path items.
       */
      _mainPathItems: {
        type: Array,
        value: function() {return [];},
        readOnly: true
      },
      /**
       * This property holds the latest clicked main path item.
       */
      _clickPathItem: {
        type: Object,
        value: function() {return {};}
      },
      /**
       * This property holds all the items that are to be shown in the dropdown - these are usually siblings,
       * but can be children if the item is an overflow item.
       */
      _clickedItemChildren: {
        type: Array,
        value: function() { return []; }
      },
      /**
       * This property holds the currently selected item. We start out with no value to avoid have it run through an empty object.
       */
      _selectedItem: {
        type: Object
      },
      /**
       * This property holds the size of the container, against which we make all of our calculations in
       * breadcrumbs display options.
       * The value is auto generated either on page load, or on page resize.
       */
      _ulWidth: {
        type: Number,
        value: 0
      },
      /**
       * This property holds the path to the currently selected item.
       * This is generated dynamically by the graph whenever the _selectedItem prop changes.
       * It is readOnly to ensure that nothing but 1 process changes it.
       */
      _selectedItemPath: {
        type: Array,
        value: function() {return [];},
        readOnly: true
      },
      /**
       * Use this mode if you want a more traditional breadcrumb path, and don't want the dropdowns to show up when a path item is clicked.
       */
      clickOnlyMode: {
        type: Boolean,
        value: false,
        observer: '_getBreadcrumbsObj'
      },
      searchMode: {
        type: Boolean,
        value: false
      },
      _hideNoResultLi: {
        type: Boolean,
        value: true
      },
      _breadcrumbsObj: {
        type: Object
      }
    },

    listeners: {
      'iron-resize': '_onResize',
      'px-app-asset-selected': '_onSelect',
      'px-dropdown-selection-changed': '_dropdownTap',
      'px-app-asset-graph-created': '_getBreadcrumbsObj'
    },
    observers: [
      '_getDisplayMode(_ulWidth, _selectedItemPath, _breadcrumbsObj)'
    ],
    detached() {
      if (this.isDebouncerActive('windowResize')) this.cancelDebouncer('windowResize');
    },
    /**
     * Called by iron-resize. Determines the container size.
     */
    _onResize() {
      this.debounce('windowResize', () => {
        window.requestAnimationFrame(() => {
          var breadcrumbsContainer = Polymer.dom(this.root).querySelector('.container'),
              breadcrumbsUlContainer = Polymer.dom(breadcrumbsContainer).querySelector('ul'),
              bcUlContainerRect = breadcrumbsUlContainer.getBoundingClientRect();
          this.set('_ulWidth', bcUlContainerRect.width);
        });
      },50);
    },
    _getBreadcrumbsObj() {
      var itemPath = this._selectedItemPath || [],
          graph = this._assetGraph,
          clickOnlyMode = this.clickOnlyMode;
      if (!itemPath.length || !graph) return;
      this.set('_breadcrumbsObj', new window.pxBreadcrumbs.Breadcrumbs(this, graph, clickOnlyMode, itemPath));
      this.updateStyles();
    },
    /*
    * In this method, we decide on the display options for the breadcrumbs. We have the following options:
    * 1. Nothing needs to be shortened.
    * 2. Shorten all but the last one.
    * 3. Shorten all, including the last one.
    * 4. Shorten all of them, and include the overflow at the beginning of the array.
    *    The last one is NOT shortened by default, but can be shortened as needed.
    */
    _getDisplayMode() {

      var ulWidth = this._ulWidth,
          itemPath = this._selectedItemPath || [],
          breadcrumbsObj = this._breadcrumbsObj;

      if (!ulWidth || !itemPath || !breadcrumbsObj) return;

      /*
      * Option 1:
      * Check to see if the container (which is sized automatically to fill out the page)
      * can fit all the items in the breadcrumbs.
      */
      if (ulWidth > breadcrumbsObj.sizeOfFullBreadcrumbs) {
        this._set_mainPathItems(itemPath);
        return;
      }

      /*
      * Option 2:
      * Find out if the container can now fit all the
      * shortened items, plus the last item that wasn't shortened.
      */
      if (ulWidth > breadcrumbsObj.sizeOfAllShortenedItemsExcludingLastItem + breadcrumbsObj.sizeOfFullLastItem) {
        let strArrayShortenedWithFullLastItem = breadcrumbsObj.allShortenedItemsExcludingLast.concat(breadcrumbsObj.lastItemFull);
        this._set_mainPathItems(strArrayShortenedWithFullLastItem);
        return;
      }

      /*
      * Option 3:
      * Check if can fit after shortening all the items.
      */
      if (ulWidth > breadcrumbsObj.sizeOfAllShortenedItems) {
        let strArrayShortened = breadcrumbsObj.shortenedItems;
        this._set_mainPathItems(strArrayShortened);
        return;
      }

      /*
      * Option 4:
      * Not all of the shortened options will fit. Have to create an array with overflow.
      */
      this._set_mainPathItems(this._createArrayWithOverflow(itemPath, ulWidth, breadcrumbsObj));

    },

    /*
    * Called once it's established that we need to have an array with overflow.
    * Keep removing the size of each item - starting from the beginning of the array -
    * from the total size of all the items, until we can fit everything, plus the last item that
    * isn't shortened into the container.
    */
    _createArrayWithOverflow(strArray, _ulWidth, breadcrumbsObj) {

      var pointer = 0,
          currentAccumSize = breadcrumbsObj.sizeOfAllShortenedItemsExcludingLastItem,
          sizeOfFullLastItem = breadcrumbsObj.sizeOfFullLastItem,
          sizeOfEllipsis = 36,
          noRoomForFullLastItem = false,
          lastItem = {},
          overflowObj = {"label": "...", "hasChildren": true},
          slicedStrArray = [];

      //keep looping until all the items fit into the container
      while (_ulWidth < sizeOfEllipsis + currentAccumSize + sizeOfFullLastItem) {
        //if we made it to the last item, and it's STILL can't fit, break out of the
        // while loop, to ensure the last items doesn't go into the overflow object.
        if (pointer === strArray.length-1) {
          noRoomForFullLastItem = true;
          break;
        }
        //get the size of the item we are placing into the overflow
        var removedSize = breadcrumbsObj._sizeOfIndividualShortItem(strArray[pointer]);
        // subtract the size from the overall accumulated size
        currentAccumSize -= removedSize;
        //and make sure to manually change our pointer.
        pointer++;
      }

      //create the overflow object, and populate its children with the shortened strings (if necessary)
      overflowObj.children = strArray.slice(0, pointer);

      // clean up - in case the user clicked on the path, there will be a highlighted property set to true.
      // since overflow shouldn't have anything highlighted, we clear is up, just to be sure.
      overflowObj.children.forEach((child) => {
          child.highlighted = false;
      });
      //the last item is usually full size, but, if if it's just the overflow and the last item
      // and the last item is too long, it should shortened.
      lastItem  = (noRoomForFullLastItem) ? breadcrumbsObj.lastItemShort : breadcrumbsObj.lastItemFull;

      //add the overflow obj to the beginning of the array, and follow it up with all the shortened strings,
      //starting with the point we stopped at with the pointer, and going till the last item, which is dynamically determined.
      slicedStrArray = [overflowObj].concat(breadcrumbsObj.shortenedItems.slice(pointer, strArray.length-1)).concat(lastItem);
      return slicedStrArray;

    },
    /**
     * This function is used to determine whether we are on the first item in the array - used by a dom-if to check
     * if we should display the right angle icon.
     */
    _isNotFirstItemInData(index) {
      return index !== 0;
    },
    _onSelect(evt) {
      this._set_selectedItemPath(evt.detail.path);
      this._getBreadcrumbsObj();
    },
    /**
     * This function checks whether the item in question has siblings.
     * If the item is an overflow item, we return a false, since it's not going to be in the graph anyway.
     */
    _doesItemHaveSiblings(itemInPath) {
      var graph = this._assetGraph,
          source = itemInPath.source ? itemInPath.source : itemInPath,
          isItemOverflow = itemInPath.label === '...' ? true : false;

      return isItemOverflow  ? true : graph.hasSiblings(source);
    },
    /**
     * Handles tap events in the dropdown. Checks each item against the currently selected item.
     */
    _dropdownTap(evt) {
      var newSelectItem = {};
      if(evt.target && evt.target.items) {
        evt.target.items.forEach(function(item) {
          if(item.id === evt.target.selected) {
            newSelectItem = item;
          }
        });
      }
      this._changePathFromClick(newSelectItem);
    },
    /**
     * Sets the _selectedItem to the item that was clicked - whether from the main path items, or the dropdown items.
     * This is the only place we change _selectedItem on click.
     */
    _changePathFromClick(item) {
      this.select(item);
      this.fire('px-breadcrumbs-item-changed', item);
      /**
       * This event is fired whenever a click occurs - from a top path item, or dropdown item -
       * that changes the context. The new context is attached as 'item'
       * @event px-breadcrumbs-item-changed
       */
    },
    /*
    * On tap, we need to find out if the clicked item is the same as before.
    * If it is, we empty out the dropdown, hide it, and clear the _clickPathItem (the last item clicked).
    * If it is not the same item that was previously clicked, we save the new clicked item into _clickPathItem and
    * set the siblings according to the item. Sometimes, a top path item has no siblings, at which point we treat
    * the click like a dropdown click - which is to say, we change the path accordingly.
    */
    _onPathTap(evt) {
      var dataItem = evt.model.item.source ? evt.model.item.source : evt.model.item;
      var isClickedItemOverflow = dataItem.label ==='...' ? true : false;

      //if the click only mode is on, just change the path
      if (this.clickOnlyMode && !isClickedItemOverflow) {
        //and change our path.
        this._changePathFromClick(dataItem);
        return;
      }

      // it's important to check if the clicked item is an overflow item, since it's the only one
      // that isn't in our graph - if we send it into getSiblings, the graph won't know what to do with it.
      // instead, if it IS an overflow item, we set the siblings as the children of dataItem.


      if (this._doesItemHaveSiblings(dataItem) || isClickedItemOverflow) {
        var graph = this._assetGraph,
            siblings = !isClickedItemOverflow ? graph.getSiblings(dataItem) : dataItem.children;

        // Need to map the id and label to key and val for use in px-dropdown
        var siblingsCopy = siblings.map((sibling) => {
          return Object.assign({}, sibling, {"key": sibling.id, "val": sibling.label});
        });
        this.set('_clickedItemChildren', siblingsCopy);
        this.set('_clickPathItem', dataItem);

      // the clicked item has no siblings - we reset the contents of the dropdown
      // and change the path accordingly.
    } else {
        this.set('_clickedItemChildren', []);
        this._changePathFromClick(dataItem);
      }
    },
    /**
     * These three methods are used to determine which type of node to render.
     * Returns true if clickOnlyMode is turned on and its not the overflow node.
     */
    _isLabel(item, clickOnlyMode) {
      return (clickOnlyMode && item.label !== "...") || (!clickOnlyMode && !this._doesItemHaveSiblings(item));
    },
    /**
     * These three methods are used to determine which type of node to render.
     * Returns true if clickOnlyMode is turned off and its not the overflow node.
     */
    _isDropdown(item, clickOnlyMode) {
      return !clickOnlyMode && item.label !== "..." && this._doesItemHaveSiblings(item);
    },
    /**
     * These three methods are used to determine which type of node to render.
     * Returns true if this is the overflow node.
     */
    _isOverflow(item) {
      return item.label === "...";
    },
    /**
     * Determines whether to display small or large chevrons based on whether
     * `clickOnlyMode` is enabled.
     */
    _getSeparatorSize(clickOnlyMode) {
      return this.clickOnlyMode ? 'small' : 'large';
    }
  });

  class Breadcrumbs {
    constructor(breadcrumbEl, graph, clickOnlyMode, breadcrumbs = []) {
      this.breadcrumbEl = breadcrumbEl;
      this.graph = graph;
      this.clickOnlyMode = clickOnlyMode;
      this.breadcrumbs = breadcrumbs;
      this.map = new WeakMap();
      this.ctx = this._createCanvas(breadcrumbEl);
      this._preShortenItems(this.breadcrumbs);
      return this;
    }

    /**
     * A getter that returns the size of the breadcrumb items - at full length.
     * It checks to see if it has a value, and if so, returns the cached one, so we don't have to calculate the value again.
     */
    get sizeOfFullBreadcrumbs() {
      this.__sizeOfFullBreadcrumbs = this.__sizeOfFullBreadcrumbs || this._calculateSizeOfBreadcrumbs(this.breadcrumbs);
      return this.__sizeOfFullBreadcrumbs;
    }
    /**
     * A getter that returns the short size of the breadcrumb items excluding the last item.
     */
    get sizeOfAllShortenedItemsExcludingLastItem() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs.slice(0, this.breadcrumbs.length-1), false);
    }
    /**
     * A getter that returns the size of the full last item.
     */
    get sizeOfFullLastItem() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs.slice(-1));
    }
    /**
     * A getter that returns the size of the short last item.
     */
    get sizeOfShortLastItem() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs.slice(-1), false);
    }
    /**
     * A getter that returns the last item in the breadcrumb array.
     */
    get lastItemFull() {
      return this.breadcrumbs.slice(-1)[0];
    }
    /**
     * A getter that returns the short version of the last item in the breadcrumbs array.
     */
    get lastItemShort() {
      return this.shortenedItems.slice(-1)[0];
    }
    /**
     * A getter that returns an array of all the shortened items in the breadcrumbs array.
     */
    get shortenedItems() {
      this.__shortenedItems = this.__shortenedItems ||  this.breadcrumbs.map((item) => {
        var wrapper = {};
        wrapper.source = item;
        wrapper.isTruncated = true;
        wrapper.label = this._getShortenedText(item);
        wrapper.children = item.children;
        wrapper.selectedItem = item.selectedItem;
        wrapper.hasChildren = item.hasChildren;
        return wrapper;
      });
      return this.__shortenedItems;
    }
    /**
     * A getter that returns the size - in pixels - of the overflow ellipsis.
     */
    get sizeOfEllipsis() {
      return 36;
    }
    /**
     * A getter that returns the size - in pixels - of all the shortened breadcrumbs items.
     */
    get sizeOfAllShortenedItems() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs, false);
    }
    /**
     * A getter that returns the size - in pixels - of all the shortened breadcrumbs items excluding the last item.
     */
    get allShortenedItemsExcludingLast() {
      return this.shortenedItems.slice(0, this.shortenedItems.length -1);
    }
    /**
     * Adds the item that is passed in to the weakMap if it is not already there.
     */
    _addToWeakMap(item) {
      const cachedItem = this.map.get(item) || null;
      if (!cachedItem) {
        this.map.set(item, item);
      }
    }
    /**
     * Called when the class is instantiated. it loops through all the passed in items, and calls the _getShortenedText method on
     * each item.
     */
    _preShortenItems(items) {
      for (let item of items) {
        this._getShortenedText(item);
      }
    }
    /**
     * Returns the shortened version of the text in the item that is passed in, as well as add it into the map.
     * Checks for a cached version before it sets it.
     */
    _getShortenedText(item) {
      const cachedItem = this.map.get(item) || {};
      if(!cachedItem.shortText && item.label.length > 13) {
        cachedItem.shortText = `${item.label.substr(0,6)}...${item.label.substr(item.label.length-6)}`;
      }
      else if(!cachedItem.shortText) {
        cachedItem.shortText = item.label;
      }
      this.map.set(item, cachedItem);
      return cachedItem.shortText;
    }
    /**
     * Returns the size - in pixels - of the full size of the text in the passed in item, as well as add that info into the map.
     * Checks for a cached version before setting this value
     */
    _sizeOfIndividualFullItem(item) {
      const cachedItem = this.map.get(item) || {};
      cachedItem.fullSize = (cachedItem.fullSize || parseInt(this.ctx.measureText(item.label).width,10));
      this.map.set(item, cachedItem);
      return cachedItem.fullSize;
    }
    /**
     * Returns the size - in pixels - of the short size of the text in the passed in item, as well as add that info into the map.
     * Checks for a cached version before setting this value
     */
    _sizeOfIndividualShortItem(item) {
      const cachedItem = this.map.get(item) || {};
      cachedItem.shortSize = (cachedItem.shortSize || parseInt(this.ctx.measureText(cachedItem.shortText).width,10));
      this.map.set(item, cachedItem);
      return cachedItem.shortSize;
    }
    /**
     * Loops through the passed in array, and gets the size - in pixels - of all the items.
     * The size can be determined in either short or full text.
     * It takes into account the size of the px-icons, as well as padding on each item, and padding on the container.
     */
    _calculateSizeOfBreadcrumbs(strArray, useFullSize=true) {
      if (strArray) {
        let accum = 0,
            i = 0,
            len = strArray.length,
            sizeOfItem;
        //run through all the items, and get the sizes.
        for (i=0; i<len;i++,sizeOfItem=null) {

          if (useFullSize) {
            sizeOfItem = this._sizeOfIndividualFullItem(strArray[i]);
          } else {
            sizeOfItem = this._sizeOfIndividualShortItem(strArray[i]);
          }
          var source = strArray[i].source ? strArray[i].source : strArray[i];
          //add the size of the of the item into our accumulator
          accum += sizeOfItem;
          //if the item has siblings, we need to add the size of the down chevron.
          if (strArray[i].label !== "..." && this.graph.hasSiblings(source) && !this.clickOnlyMode) {
            accum += 21;
          }
          //padding on each item (10 on each side)
          accum += 20;

          //right angle arrow - the last item doesn't get a right angle.
          if (i !== len-1){
            accum += this.clickOnlyMode ? 30 : 15;
          }
        }
        return accum + 10; // extra padding somewhere? slight miscalculation?
      }
    }
    /**
     * Creates/returns the canvas that we will use to measure the size of the text.
     * We also set the font and font size.
     */
    _createCanvas(breadcrumbEl) {
      var style = window.getComputedStyle(breadcrumbEl, null),
          fontSize = style.getPropertyValue('font-size'),
          fontFamily = style.getPropertyValue('font-family');

      const canvas = document.createElement('canvas');

      canvas.height = 20;
      canvas.width = 9999;

      const ctx = canvas.getContext('2d');
      ctx.font = fontSize + " " + fontFamily;
      return ctx;
    }
  }

  window.pxBreadcrumbs = {};
  window.pxBreadcrumbs.Breadcrumbs = Breadcrumbs;

})(window);
