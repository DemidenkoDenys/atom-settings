'use babel';

var _bind = Function.prototype.bind;

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x6, _x7, _x8) {
  var _again = true;_function: while (_again) {
    var object = _x6,
        property = _x7,
        receiver = _x8;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x6 = parent;_x7 = property;_x8 = receiver;_again = true;desc = parent = undefined;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;
  } else {
    return Array.from(arr);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {
      var callNext = step.bind(null, 'next');var callThrow = step.bind(null, 'throw');function step(key, arg) {
        try {
          var info = gen[key](arg);var value = info.value;
        } catch (error) {
          reject(error);return;
        }if (info.done) {
          resolve(value);
        } else {
          Promise.resolve(value).then(callNext, callThrow);
        }
      }callNext();
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _ = require('underscore-plus');
var url = require('url');
var path = require('path');

var _require = require('event-kit');

var Emitter = _require.Emitter;
var Disposable = _require.Disposable;
var CompositeDisposable = _require.CompositeDisposable;

var fs = require('fs-plus');

var _require2 = require('pathwatcher');

var Directory = _require2.Directory;

var Grim = require('grim');
var DefaultDirectorySearcher = require('./default-directory-searcher');
var Dock = require('./dock');
var Model = require('./model');
var StateStore = require('./state-store');
var TextEditor = require('./text-editor');
var Panel = require('./panel');
var PanelContainer = require('./panel-container');
var Task = require('./task');
var WorkspaceCenter = require('./workspace-center');
var WorkspaceElement = require('./workspace-element');

var STOPPED_CHANGING_ACTIVE_PANE_ITEM_DELAY = 100;
var ALL_LOCATIONS = ['center', 'left', 'right', 'bottom'];

// Essential: Represents the state of the user interface for the entire window.
// An instance of this class is available via the `atom.workspace` global.
//
// Interact with this object to open files, be notified of current and future
// editors, and manipulate panes. To add panels, use {Workspace::addTopPanel}
// and friends.
//
// ## Workspace Items
//
// The term "item" refers to anything that can be displayed
// in a pane within the workspace, either in the {WorkspaceCenter} or in one
// of the three {Dock}s. The workspace expects items to conform to the
// following interface:
//
// ### Required Methods
//
// #### `getTitle()`
//
// Returns a {String} containing the title of the item to display on its
// associated tab.
//
// ### Optional Methods
//
// #### `getElement()`
//
// If your item already *is* a DOM element, you do not need to implement this
// method. Otherwise it should return the element you want to display to
// represent this item.
//
// #### `destroy()`
//
// Destroys the item. This will be called when the item is removed from its
// parent pane.
//
// #### `onDidDestroy(callback)`
//
// Called by the workspace so it can be notified when the item is destroyed.
// Must return a {Disposable}.
//
// #### `serialize()`
//
// Serialize the state of the item. Must return an object that can be passed to
// `JSON.stringify`. The state should include a field called `deserializer`,
// which names a deserializer declared in your `package.json`. This method is
// invoked on items when serializing the workspace so they can be restored to
// the same location later.
//
// #### `getURI()`
//
// Returns the URI associated with the item.
//
// #### `getLongTitle()`
//
// Returns a {String} containing a longer version of the title to display in
// places like the window title or on tabs their short titles are ambiguous.
//
// #### `onDidChangeTitle`
//
// Called by the workspace so it can be notified when the item's title changes.
// Must return a {Disposable}.
//
// #### `getIconName()`
//
// Return a {String} with the name of an icon. If this method is defined and
// returns a string, the item's tab element will be rendered with the `icon` and
// `icon-${iconName}` CSS classes.
//
// ### `onDidChangeIcon(callback)`
//
// Called by the workspace so it can be notified when the item's icon changes.
// Must return a {Disposable}.
//
// #### `getDefaultLocation()`
//
// Tells the workspace where your item should be opened in absence of a user
// override. Items can appear in the center or in a dock on the left, right, or
// bottom of the workspace.
//
// Returns a {String} with one of the following values: `'center'`, `'left'`,
// `'right'`, `'bottom'`. If this method is not defined, `'center'` is the
// default.
//
// #### `getAllowedLocations()`
//
// Tells the workspace where this item can be moved. Returns an {Array} of one
// or more of the following values: `'center'`, `'left'`, `'right'`, or
// `'bottom'`.
//
// #### `isPermanentDockItem()`
//
// Tells the workspace whether or not this item can be closed by the user by
// clicking an `x` on its tab. Use of this feature is discouraged unless there's
// a very good reason not to allow users to close your item. Items can be made
// permanent *only* when they are contained in docks. Center pane items can
// always be removed. Note that it is currently still possible to close dock
// items via the `Close Pane` option in the context menu and via Atom APIs, so
// you should still be prepared to handle your dock items being destroyed by the
// user even if you implement this method.
//
// #### `save()`
//
// Saves the item.
//
// #### `saveAs(path)`
//
// Saves the item to the specified path.
//
// #### `getPath()`
//
// Returns the local path associated with this item. This is only used to set
// the initial location of the "save as" dialog.
//
// #### `isModified()`
//
// Returns whether or not the item is modified to reflect modification in the
// UI.
//
// #### `onDidChangeModified()`
//
// Called by the workspace so it can be notified when item's modified status
// changes. Must return a {Disposable}.
//
// #### `copy()`
//
// Create a copy of the item. If defined, the workspace will call this method to
// duplicate the item when splitting panes via certain split commands.
//
// #### `getPreferredHeight()`
//
// If this item is displayed in the bottom {Dock}, called by the workspace when
// initially displaying the dock to set its height. Once the dock has been
// resized by the user, their height will override this value.
//
// Returns a {Number}.
//
// #### `getPreferredWidth()`
//
// If this item is displayed in the left or right {Dock}, called by the
// workspace when initially displaying the dock to set its width. Once the dock
// has been resized by the user, their width will override this value.
//
// Returns a {Number}.
//
// #### `onDidTerminatePendingState(callback)`
//
// If the workspace is configured to use *pending pane items*, the workspace
// will subscribe to this method to terminate the pending state of the item.
// Must return a {Disposable}.
//
// #### `shouldPromptToSave()`
//
// This method indicates whether Atom should prompt the user to save this item
// when the user closes or reloads the window. Returns a boolean.
module.exports = (function (_Model) {
  _inherits(Workspace, _Model);

  function Workspace(params) {
    _classCallCheck(this, Workspace);

    _get(Object.getPrototypeOf(Workspace.prototype), 'constructor', this).apply(this, arguments);

    this.updateWindowTitle = this.updateWindowTitle.bind(this);
    this.updateDocumentEdited = this.updateDocumentEdited.bind(this);
    this.didDestroyPaneItem = this.didDestroyPaneItem.bind(this);
    this.didChangeActivePaneOnPaneContainer = this.didChangeActivePaneOnPaneContainer.bind(this);
    this.didChangeActivePaneItemOnPaneContainer = this.didChangeActivePaneItemOnPaneContainer.bind(this);
    this.didActivatePaneContainer = this.didActivatePaneContainer.bind(this);
    this.didHideDock = this.didHideDock.bind(this);

    this.enablePersistence = params.enablePersistence;
    this.packageManager = params.packageManager;
    this.config = params.config;
    this.project = params.project;
    this.notificationManager = params.notificationManager;
    this.viewRegistry = params.viewRegistry;
    this.grammarRegistry = params.grammarRegistry;
    this.applicationDelegate = params.applicationDelegate;
    this.assert = params.assert;
    this.deserializerManager = params.deserializerManager;
    this.textEditorRegistry = params.textEditorRegistry;
    this.styleManager = params.styleManager;
    this.draggingItem = false;
    this.itemLocationStore = new StateStore('AtomPreviousItemLocations', 1);

    this.emitter = new Emitter();
    this.openers = [];
    this.destroyedItemURIs = [];
    this.stoppedChangingActivePaneItemTimeout = null;

    this.defaultDirectorySearcher = new DefaultDirectorySearcher();
    this.consumeServices(this.packageManager);

    this.paneContainers = {
      center: this.createCenter(),
      left: this.createDock('left'),
      right: this.createDock('right'),
      bottom: this.createDock('bottom')
    };
    this.activePaneContainer = this.paneContainers.center;

    this.panelContainers = {
      top: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'top' }),
      left: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'left', dock: this.paneContainers.left }),
      right: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'right', dock: this.paneContainers.right }),
      bottom: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'bottom', dock: this.paneContainers.bottom }),
      header: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'header' }),
      footer: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'footer' }),
      modal: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'modal' })
    };

    this.subscribeToEvents();
  }

  _createClass(Workspace, [{
    key: 'getElement',
    value: function getElement() {
      if (!this.element) {
        this.element = new WorkspaceElement().initialize(this, {
          config: this.config,
          project: this.project,
          viewRegistry: this.viewRegistry,
          styleManager: this.styleManager
        });
      }
      return this.element;
    }
  }, {
    key: 'createCenter',
    value: function createCenter() {
      return new WorkspaceCenter({
        config: this.config,
        applicationDelegate: this.applicationDelegate,
        notificationManager: this.notificationManager,
        deserializerManager: this.deserializerManager,
        viewRegistry: this.viewRegistry,
        didActivate: this.didActivatePaneContainer,
        didChangeActivePane: this.didChangeActivePaneOnPaneContainer,
        didChangeActivePaneItem: this.didChangeActivePaneItemOnPaneContainer,
        didDestroyPaneItem: this.didDestroyPaneItem
      });
    }
  }, {
    key: 'createDock',
    value: function createDock(location) {
      return new Dock({
        location: location,
        config: this.config,
        applicationDelegate: this.applicationDelegate,
        deserializerManager: this.deserializerManager,
        notificationManager: this.notificationManager,
        viewRegistry: this.viewRegistry,
        didHide: this.didHideDock,
        didActivate: this.didActivatePaneContainer,
        didChangeActivePane: this.didChangeActivePaneOnPaneContainer,
        didChangeActivePaneItem: this.didChangeActivePaneItemOnPaneContainer,
        didDestroyPaneItem: this.didDestroyPaneItem
      });
    }
  }, {
    key: 'reset',
    value: function reset(packageManager) {
      this.packageManager = packageManager;
      this.emitter.dispose();
      this.emitter = new Emitter();

      this.paneContainers.center.destroy();
      this.paneContainers.left.destroy();
      this.paneContainers.right.destroy();
      this.paneContainers.bottom.destroy();

      _.values(this.panelContainers).forEach(function (panelContainer) {
        panelContainer.destroy();
      });

      this.paneContainers = {
        center: this.createCenter(),
        left: this.createDock('left'),
        right: this.createDock('right'),
        bottom: this.createDock('bottom')
      };
      this.activePaneContainer = this.paneContainers.center;

      this.panelContainers = {
        top: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'top' }),
        left: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'left', dock: this.paneContainers.left }),
        right: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'right', dock: this.paneContainers.right }),
        bottom: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'bottom', dock: this.paneContainers.bottom }),
        header: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'header' }),
        footer: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'footer' }),
        modal: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'modal' })
      };

      this.originalFontSize = null;
      this.openers = [];
      this.destroyedItemURIs = [];
      this.element = null;
      this.consumeServices(this.packageManager);
    }
  }, {
    key: 'subscribeToEvents',
    value: function subscribeToEvents() {
      this.project.onDidChangePaths(this.updateWindowTitle);
      this.subscribeToFontSize();
      this.subscribeToAddedItems();
      this.subscribeToMovedItems();
    }
  }, {
    key: 'consumeServices',
    value: function consumeServices(_ref) {
      var _this = this;

      var serviceHub = _ref.serviceHub;

      this.directorySearchers = [];
      serviceHub.consume('atom.directory-searcher', '^0.1.0', function (provider) {
        return _this.directorySearchers.unshift(provider);
      });
    }

    // Called by the Serializable mixin during serialization.
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        deserializer: 'Workspace',
        packagesWithActiveGrammars: this.getPackageNamesWithActiveGrammars(),
        destroyedItemURIs: this.destroyedItemURIs.slice(),
        // Ensure deserializing 1.17 state with pre 1.17 Atom does not error
        // TODO: Remove after 1.17 has been on stable for a while
        paneContainer: { version: 2 },
        paneContainers: {
          center: this.paneContainers.center.serialize(),
          left: this.paneContainers.left.serialize(),
          right: this.paneContainers.right.serialize(),
          bottom: this.paneContainers.bottom.serialize()
        }
      };
    }
  }, {
    key: 'deserialize',
    value: function deserialize(state, deserializerManager) {
      var packagesWithActiveGrammars = state.packagesWithActiveGrammars != null ? state.packagesWithActiveGrammars : [];
      for (var packageName of packagesWithActiveGrammars) {
        var pkg = this.packageManager.getLoadedPackage(packageName);
        if (pkg != null) {
          pkg.loadGrammarsSync();
        }
      }
      if (state.destroyedItemURIs != null) {
        this.destroyedItemURIs = state.destroyedItemURIs;
      }

      if (state.paneContainers) {
        this.paneContainers.center.deserialize(state.paneContainers.center, deserializerManager);
        this.paneContainers.left.deserialize(state.paneContainers.left, deserializerManager);
        this.paneContainers.right.deserialize(state.paneContainers.right, deserializerManager);
        this.paneContainers.bottom.deserialize(state.paneContainers.bottom, deserializerManager);
      } else if (state.paneContainer) {
        // TODO: Remove this fallback once a lot of time has passed since 1.17 was released
        this.paneContainers.center.deserialize(state.paneContainer, deserializerManager);
      }

      this.updateWindowTitle();
    }
  }, {
    key: 'getPackageNamesWithActiveGrammars',
    value: function getPackageNamesWithActiveGrammars() {
      var _this2 = this;

      var packageNames = [];
      var addGrammar = function addGrammar() {
        var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var includedGrammarScopes = _ref2.includedGrammarScopes;
        var packageName = _ref2.packageName;

        if (!packageName) {
          return;
        }
        // Prevent cycles
        if (packageNames.indexOf(packageName) !== -1) {
          return;
        }

        packageNames.push(packageName);
        for (var scopeName of includedGrammarScopes != null ? includedGrammarScopes : []) {
          addGrammar(_this2.grammarRegistry.grammarForScopeName(scopeName));
        }
      };

      var editors = this.getTextEditors();
      for (var editor of editors) {
        addGrammar(editor.getGrammar());
      }

      if (editors.length > 0) {
        for (var grammar of this.grammarRegistry.getGrammars()) {
          if (grammar.injectionSelector) {
            addGrammar(grammar);
          }
        }
      }

      return _.uniq(packageNames);
    }
  }, {
    key: 'didActivatePaneContainer',
    value: function didActivatePaneContainer(paneContainer) {
      if (paneContainer !== this.getActivePaneContainer()) {
        this.activePaneContainer = paneContainer;
        this.didChangeActivePaneItem(this.activePaneContainer.getActivePaneItem());
        this.emitter.emit('did-change-active-pane-container', this.activePaneContainer);
        this.emitter.emit('did-change-active-pane', this.activePaneContainer.getActivePane());
        this.emitter.emit('did-change-active-pane-item', this.activePaneContainer.getActivePaneItem());
      }
    }
  }, {
    key: 'didChangeActivePaneOnPaneContainer',
    value: function didChangeActivePaneOnPaneContainer(paneContainer, pane) {
      if (paneContainer === this.getActivePaneContainer()) {
        this.emitter.emit('did-change-active-pane', pane);
      }
    }
  }, {
    key: 'didChangeActivePaneItemOnPaneContainer',
    value: function didChangeActivePaneItemOnPaneContainer(paneContainer, item) {
      if (paneContainer === this.getActivePaneContainer()) {
        this.didChangeActivePaneItem(item);
        this.emitter.emit('did-change-active-pane-item', item);
      }
    }
  }, {
    key: 'didChangeActivePaneItem',
    value: function didChangeActivePaneItem(item) {
      var _this3 = this;

      this.updateWindowTitle();
      this.updateDocumentEdited();
      if (this.activeItemSubscriptions) this.activeItemSubscriptions.dispose();
      this.activeItemSubscriptions = new CompositeDisposable();

      var modifiedSubscription = undefined,
          titleSubscription = undefined;

      if (item != null && typeof item.onDidChangeTitle === 'function') {
        titleSubscription = item.onDidChangeTitle(this.updateWindowTitle);
      } else if (item != null && typeof item.on === 'function') {
        titleSubscription = item.on('title-changed', this.updateWindowTitle);
        if (titleSubscription == null || typeof titleSubscription.dispose !== 'function') {
          titleSubscription = new Disposable(function () {
            item.off('title-changed', _this3.updateWindowTitle);
          });
        }
      }

      if (item != null && typeof item.onDidChangeModified === 'function') {
        modifiedSubscription = item.onDidChangeModified(this.updateDocumentEdited);
      } else if (item != null && typeof item.on === 'function') {
        modifiedSubscription = item.on('modified-status-changed', this.updateDocumentEdited);
        if (modifiedSubscription == null || typeof modifiedSubscription.dispose !== 'function') {
          modifiedSubscription = new Disposable(function () {
            item.off('modified-status-changed', _this3.updateDocumentEdited);
          });
        }
      }

      if (titleSubscription != null) {
        this.activeItemSubscriptions.add(titleSubscription);
      }
      if (modifiedSubscription != null) {
        this.activeItemSubscriptions.add(modifiedSubscription);
      }

      this.cancelStoppedChangingActivePaneItemTimeout();
      this.stoppedChangingActivePaneItemTimeout = setTimeout(function () {
        _this3.stoppedChangingActivePaneItemTimeout = null;
        _this3.emitter.emit('did-stop-changing-active-pane-item', item);
      }, STOPPED_CHANGING_ACTIVE_PANE_ITEM_DELAY);
    }
  }, {
    key: 'cancelStoppedChangingActivePaneItemTimeout',
    value: function cancelStoppedChangingActivePaneItemTimeout() {
      if (this.stoppedChangingActivePaneItemTimeout != null) {
        clearTimeout(this.stoppedChangingActivePaneItemTimeout);
      }
    }
  }, {
    key: 'didHideDock',
    value: function didHideDock() {
      this.getCenter().activate();
    }
  }, {
    key: 'setDraggingItem',
    value: function setDraggingItem(draggingItem) {
      _.values(this.paneContainers).forEach(function (dock) {
        dock.setDraggingItem(draggingItem);
      });
    }
  }, {
    key: 'subscribeToAddedItems',
    value: function subscribeToAddedItems() {
      var _this4 = this;

      this.onDidAddPaneItem(function (_ref3) {
        var item = _ref3.item;
        var pane = _ref3.pane;
        var index = _ref3.index;

        if (item instanceof TextEditor) {
          (function () {
            var subscriptions = new CompositeDisposable(_this4.textEditorRegistry.add(item), _this4.textEditorRegistry.maintainGrammar(item), _this4.textEditorRegistry.maintainConfig(item), item.observeGrammar(_this4.handleGrammarUsed.bind(_this4)));
            item.onDidDestroy(function () {
              subscriptions.dispose();
            });
            _this4.emitter.emit('did-add-text-editor', { textEditor: item, pane: pane, index: index });
          })();
        }
      });
    }
  }, {
    key: 'subscribeToMovedItems',
    value: function subscribeToMovedItems() {
      var _this5 = this;

      var _loop = function _loop(paneContainer) {
        paneContainer.observePanes(function (pane) {
          pane.onDidAddItem(function (_ref4) {
            var item = _ref4.item;

            if (typeof item.getURI === 'function' && _this5.enablePersistence) {
              var uri = item.getURI();
              if (uri) {
                var _location = paneContainer.getLocation();
                var defaultLocation = undefined;
                if (typeof item.getDefaultLocation === 'function') {
                  defaultLocation = item.getDefaultLocation();
                }
                defaultLocation = defaultLocation || 'center';
                if (_location === defaultLocation) {
                  _this5.itemLocationStore['delete'](item.getURI());
                } else {
                  _this5.itemLocationStore.save(item.getURI(), _location);
                }
              }
            }
          });
        });
      };

      for (var paneContainer of this.getPaneContainers()) {
        _loop(paneContainer);
      }
    }

    // Updates the application's title and proxy icon based on whichever file is
    // open.
  }, {
    key: 'updateWindowTitle',
    value: function updateWindowTitle() {
      var itemPath = undefined,
          itemTitle = undefined,
          projectPath = undefined,
          representedPath = undefined;
      var appName = 'Atom';
      var left = this.project.getPaths();
      var projectPaths = left != null ? left : [];
      var item = this.getActivePaneItem();
      if (item) {
        itemPath = typeof item.getPath === 'function' ? item.getPath() : undefined;
        var longTitle = typeof item.getLongTitle === 'function' ? item.getLongTitle() : undefined;
        itemTitle = longTitle == null ? typeof item.getTitle === 'function' ? item.getTitle() : undefined : longTitle;
        projectPath = _.find(projectPaths, function (projectPath) {
          return itemPath === projectPath || (itemPath != null ? itemPath.startsWith(projectPath + path.sep) : undefined);
        });
      }
      if (itemTitle == null) {
        itemTitle = 'untitled';
      }
      if (projectPath == null) {
        projectPath = itemPath ? path.dirname(itemPath) : projectPaths[0];
      }
      if (projectPath != null) {
        projectPath = fs.tildify(projectPath);
      }

      var titleParts = [];
      if (item != null && projectPath != null) {
        titleParts.push(itemTitle, projectPath);
        representedPath = itemPath != null ? itemPath : projectPath;
      } else if (projectPath != null) {
        titleParts.push(projectPath);
        representedPath = projectPath;
      } else {
        titleParts.push(itemTitle);
        representedPath = '';
      }

      if (process.platform !== 'darwin') {
        titleParts.push(appName);
      }

      document.title = titleParts.join(' — ');
      this.applicationDelegate.setRepresentedFilename(representedPath);
    }

    // On macOS, fades the application window's proxy icon when the current file
    // has been modified.
  }, {
    key: 'updateDocumentEdited',
    value: function updateDocumentEdited() {
      var activePaneItem = this.getActivePaneItem();
      var modified = activePaneItem != null && typeof activePaneItem.isModified === 'function' ? activePaneItem.isModified() || false : false;
      this.applicationDelegate.setWindowDocumentEdited(modified);
    }

    /*
    Section: Event Subscription
    */

  }, {
    key: 'onDidChangeActivePaneContainer',
    value: function onDidChangeActivePaneContainer(callback) {
      return this.emitter.on('did-change-active-pane-container', callback);
    }

    // Essential: Invoke the given callback with all current and future text
    // editors in the workspace.
    //
    // * `callback` {Function} to be called with current and future text editors.
    //   * `editor` An {TextEditor} that is present in {::getTextEditors} at the time
    //     of subscription or that is added at some later time.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeTextEditors',
    value: function observeTextEditors(callback) {
      for (var textEditor of this.getTextEditors()) {
        callback(textEditor);
      }
      return this.onDidAddTextEditor(function (_ref5) {
        var textEditor = _ref5.textEditor;
        return callback(textEditor);
      });
    }

    // Essential: Invoke the given callback with all current and future panes items
    // in the workspace.
    //
    // * `callback` {Function} to be called with current and future pane items.
    //   * `item` An item that is present in {::getPaneItems} at the time of
    //      subscription or that is added at some later time.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observePaneItems',
    value: function observePaneItems(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.observePaneItems(callback);
      })))))();
    }

    // Essential: Invoke the given callback when the active pane item changes.
    //
    // Because observers are invoked synchronously, it's important not to perform
    // any expensive operations via this method. Consider
    // {::onDidStopChangingActivePaneItem} to delay operations until after changes
    // stop occurring.
    //
    // * `callback` {Function} to be called when the active pane item changes.
    //   * `item` The active pane item.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidChangeActivePaneItem',
    value: function onDidChangeActivePaneItem(callback) {
      return this.emitter.on('did-change-active-pane-item', callback);
    }

    // Essential: Invoke the given callback when the active pane item stops
    // changing.
    //
    // Observers are called asynchronously 100ms after the last active pane item
    // change. Handling changes here rather than in the synchronous
    // {::onDidChangeActivePaneItem} prevents unneeded work if the user is quickly
    // changing or closing tabs and ensures critical UI feedback, like changing the
    // highlighted tab, gets priority over work that can be done asynchronously.
    //
    // * `callback` {Function} to be called when the active pane item stopts
    //   changing.
    //   * `item` The active pane item.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidStopChangingActivePaneItem',
    value: function onDidStopChangingActivePaneItem(callback) {
      return this.emitter.on('did-stop-changing-active-pane-item', callback);
    }

    // Essential: Invoke the given callback with the current active pane item and
    // with all future active pane items in the workspace.
    //
    // * `callback` {Function} to be called when the active pane item changes.
    //   * `item` The current active pane item.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeActivePaneItem',
    value: function observeActivePaneItem(callback) {
      callback(this.getActivePaneItem());
      return this.onDidChangeActivePaneItem(callback);
    }

    // Essential: Invoke the given callback whenever an item is opened. Unlike
    // {::onDidAddPaneItem}, observers will be notified for items that are already
    // present in the workspace when they are reopened.
    //
    // * `callback` {Function} to be called whenever an item is opened.
    //   * `event` {Object} with the following keys:
    //     * `uri` {String} representing the opened URI. Could be `undefined`.
    //     * `item` The opened item.
    //     * `pane` The pane in which the item was opened.
    //     * `index` The index of the opened item on its pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidOpen',
    value: function onDidOpen(callback) {
      return this.emitter.on('did-open', callback);
    }

    // Extended: Invoke the given callback when a pane is added to the workspace.
    //
    // * `callback` {Function} to be called panes are added.
    //   * `event` {Object} with the following keys:
    //     * `pane` The added pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidAddPane',
    value: function onDidAddPane(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidAddPane(callback);
      })))))();
    }

    // Extended: Invoke the given callback before a pane is destroyed in the
    // workspace.
    //
    // * `callback` {Function} to be called before panes are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `pane` The pane to be destroyed.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onWillDestroyPane',
    value: function onWillDestroyPane(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onWillDestroyPane(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a pane is destroyed in the
    // workspace.
    //
    // * `callback` {Function} to be called panes are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `pane` The destroyed pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidDestroyPane',
    value: function onDidDestroyPane(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidDestroyPane(callback);
      })))))();
    }

    // Extended: Invoke the given callback with all current and future panes in the
    // workspace.
    //
    // * `callback` {Function} to be called with current and future panes.
    //   * `pane` A {Pane} that is present in {::getPanes} at the time of
    //      subscription or that is added at some later time.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observePanes',
    value: function observePanes(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.observePanes(callback);
      })))))();
    }

    // Extended: Invoke the given callback when the active pane changes.
    //
    // * `callback` {Function} to be called when the active pane changes.
    //   * `pane` A {Pane} that is the current return value of {::getActivePane}.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidChangeActivePane',
    value: function onDidChangeActivePane(callback) {
      return this.emitter.on('did-change-active-pane', callback);
    }

    // Extended: Invoke the given callback with the current active pane and when
    // the active pane changes.
    //
    // * `callback` {Function} to be called with the current and future active#
    //   panes.
    //   * `pane` A {Pane} that is the current return value of {::getActivePane}.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeActivePane',
    value: function observeActivePane(callback) {
      callback(this.getActivePane());
      return this.onDidChangeActivePane(callback);
    }

    // Extended: Invoke the given callback when a pane item is added to the
    // workspace.
    //
    // * `callback` {Function} to be called when pane items are added.
    //   * `event` {Object} with the following keys:
    //     * `item` The added pane item.
    //     * `pane` {Pane} containing the added item.
    //     * `index` {Number} indicating the index of the added item in its pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidAddPaneItem',
    value: function onDidAddPaneItem(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidAddPaneItem(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a pane item is about to be
    // destroyed, before the user is prompted to save it.
    //
    // * `callback` {Function} to be called before pane items are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `item` The item to be destroyed.
    //     * `pane` {Pane} containing the item to be destroyed.
    //     * `index` {Number} indicating the index of the item to be destroyed in
    //       its pane.
    //
    // Returns a {Disposable} on which `.dispose` can be called to unsubscribe.
  }, {
    key: 'onWillDestroyPaneItem',
    value: function onWillDestroyPaneItem(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onWillDestroyPaneItem(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a pane item is destroyed.
    //
    // * `callback` {Function} to be called when pane items are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `item` The destroyed item.
    //     * `pane` {Pane} containing the destroyed item.
    //     * `index` {Number} indicating the index of the destroyed item in its
    //       pane.
    //
    // Returns a {Disposable} on which `.dispose` can be called to unsubscribe.
  }, {
    key: 'onDidDestroyPaneItem',
    value: function onDidDestroyPaneItem(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidDestroyPaneItem(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a text editor is added to the
    // workspace.
    //
    // * `callback` {Function} to be called panes are added.
    //   * `event` {Object} with the following keys:
    //     * `textEditor` {TextEditor} that was added.
    //     * `pane` {Pane} containing the added text editor.
    //     * `index` {Number} indicating the index of the added text editor in its
    //        pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidAddTextEditor',
    value: function onDidAddTextEditor(callback) {
      return this.emitter.on('did-add-text-editor', callback);
    }

    /*
    Section: Opening
    */

    // Essential: Opens the given URI in Atom asynchronously.
    // If the URI is already open, the existing item for that URI will be
    // activated. If no URI is given, or no registered opener can open
    // the URI, a new empty {TextEditor} will be created.
    //
    // * `uri` (optional) A {String} containing a URI.
    // * `options` (optional) {Object}
    //   * `initialLine` A {Number} indicating which row to move the cursor to
    //     initially. Defaults to `0`.
    //   * `initialColumn` A {Number} indicating which column to move the cursor to
    //     initially. Defaults to `0`.
    //   * `split` Either 'left', 'right', 'up' or 'down'.
    //     If 'left', the item will be opened in leftmost pane of the current active pane's row.
    //     If 'right', the item will be opened in the rightmost pane of the current active pane's row. If only one pane exists in the row, a new pane will be created.
    //     If 'up', the item will be opened in topmost pane of the current active pane's column.
    //     If 'down', the item will be opened in the bottommost pane of the current active pane's column. If only one pane exists in the column, a new pane will be created.
    //   * `activatePane` A {Boolean} indicating whether to call {Pane::activate} on
    //     containing pane. Defaults to `true`.
    //   * `activateItem` A {Boolean} indicating whether to call {Pane::activateItem}
    //     on containing pane. Defaults to `true`.
    //   * `pending` A {Boolean} indicating whether or not the item should be opened
    //     in a pending state. Existing pending items in a pane are replaced with
    //     new pending items when they are opened.
    //   * `searchAllPanes` A {Boolean}. If `true`, the workspace will attempt to
    //     activate an existing item for the given URI on any pane.
    //     If `false`, only the active pane will be searched for
    //     an existing item for the same URI. Defaults to `false`.
    //   * `location` (optional) A {String} containing the name of the location
    //     in which this item should be opened (one of "left", "right", "bottom",
    //     or "center"). If omitted, Atom will fall back to the last location in
    //     which a user has placed an item with the same URI or, if this is a new
    //     URI, the default location specified by the item. NOTE: This option
    //     should almost always be omitted to honor user preference.
    //
    // Returns a {Promise} that resolves to the {TextEditor} for the file URI.
  }, {
    key: 'open',
    value: _asyncToGenerator(function* (itemOrURI) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var uri = undefined,
          item = undefined;
      if (typeof itemOrURI === 'string') {
        uri = this.project.resolvePath(itemOrURI);
      } else if (itemOrURI) {
        item = itemOrURI;
        if (typeof item.getURI === 'function') uri = item.getURI();
      }

      if (!atom.config.get('core.allowPendingPaneItems')) {
        options.pending = false;
      }

      // Avoid adding URLs as recent documents to work-around this Spotlight crash:
      // https://github.com/atom/atom/issues/10071
      if (uri && (!url.parse(uri).protocol || process.platform === 'win32')) {
        this.applicationDelegate.addRecentDocument(uri);
      }

      var pane = undefined,
          itemExistsInWorkspace = undefined;

      // Try to find an existing item in the workspace.
      if (item || uri) {
        if (options.pane) {
          pane = options.pane;
        } else if (options.searchAllPanes) {
          pane = item ? this.paneForItem(item) : this.paneForURI(uri);
        } else {
          // If an item with the given URI is already in the workspace, assume
          // that item's pane container is the preferred location for that URI.
          var container = undefined;
          if (uri) container = this.paneContainerForURI(uri);
          if (!container) container = this.getActivePaneContainer();

          // The `split` option affects where we search for the item.
          pane = container.getActivePane();
          switch (options.split) {
            case 'left':
              pane = pane.findLeftmostSibling();
              break;
            case 'right':
              pane = pane.findRightmostSibling();
              break;
            case 'up':
              pane = pane.findTopmostSibling();
              break;
            case 'down':
              pane = pane.findBottommostSibling();
              break;
          }
        }

        if (pane) {
          if (item) {
            itemExistsInWorkspace = pane.getItems().includes(item);
          } else {
            item = pane.itemForURI(uri);
            itemExistsInWorkspace = item != null;
          }
        }
      }

      // If we already have an item at this stage, we won't need to do an async
      // lookup of the URI, so we yield the event loop to ensure this method
      // is consistently asynchronous.
      if (item) yield Promise.resolve();

      if (!itemExistsInWorkspace) {
        item = item || (yield this.createItemForURI(uri, options));
        if (!item) return;

        if (options.pane) {
          pane = options.pane;
        } else {
          var _location2 = options.location;
          if (!_location2 && !options.split && uri && this.enablePersistence) {
            _location2 = yield this.itemLocationStore.load(uri);
          }
          if (!_location2 && typeof item.getDefaultLocation === 'function') {
            _location2 = item.getDefaultLocation();
          }

          var allowedLocations = typeof item.getAllowedLocations === 'function' ? item.getAllowedLocations() : ALL_LOCATIONS;
          _location2 = allowedLocations.includes(_location2) ? _location2 : allowedLocations[0];

          var container = this.paneContainers[_location2] || this.getCenter();
          pane = container.getActivePane();
          switch (options.split) {
            case 'left':
              pane = pane.findLeftmostSibling();
              break;
            case 'right':
              pane = pane.findOrCreateRightmostSibling();
              break;
            case 'up':
              pane = pane.findTopmostSibling();
              break;
            case 'down':
              pane = pane.findOrCreateBottommostSibling();
              break;
          }
        }
      }

      if (!options.pending && pane.getPendingItem() === item) {
        pane.clearPendingItem();
      }

      this.itemOpened(item);

      if (options.activateItem === false) {
        pane.addItem(item, { pending: options.pending });
      } else {
        pane.activateItem(item, { pending: options.pending });
      }

      if (options.activatePane !== false) {
        pane.activate();
      }

      var initialColumn = 0;
      var initialLine = 0;
      if (!Number.isNaN(options.initialLine)) {
        initialLine = options.initialLine;
      }
      if (!Number.isNaN(options.initialColumn)) {
        initialColumn = options.initialColumn;
      }
      if (initialLine >= 0 || initialColumn >= 0) {
        if (typeof item.setCursorBufferPosition === 'function') {
          item.setCursorBufferPosition([initialLine, initialColumn]);
        }
      }

      var index = pane.getActiveItemIndex();
      this.emitter.emit('did-open', { uri: uri, pane: pane, item: item, index: index });
      return item;
    })

    // Essential: Search the workspace for items matching the given URI and hide them.
    //
    // * `itemOrURI` (optional) The item to hide or a {String} containing the URI
    //   of the item to hide.
    //
    // Returns a {boolean} indicating whether any items were found (and hidden).
  }, {
    key: 'hide',
    value: function hide(itemOrURI) {
      var foundItems = false;

      // If any visible item has the given URI, hide it
      for (var container of this.getPaneContainers()) {
        var isCenter = container === this.getCenter();
        if (isCenter || container.isVisible()) {
          for (var pane of container.getPanes()) {
            var activeItem = pane.getActiveItem();
            var foundItem = activeItem != null && (activeItem === itemOrURI || typeof activeItem.getURI === 'function' && activeItem.getURI() === itemOrURI);
            if (foundItem) {
              foundItems = true;
              // We can't really hide the center so we just destroy the item.
              if (isCenter) {
                pane.destroyItem(activeItem);
              } else {
                container.hide();
              }
            }
          }
        }
      }

      return foundItems;
    }

    // Essential: Search the workspace for items matching the given URI. If any are found, hide them.
    // Otherwise, open the URL.
    //
    // * `itemOrURI` (optional) The item to toggle or a {String} containing the URI
    //   of the item to toggle.
    //
    // Returns a Promise that resolves when the item is shown or hidden.
  }, {
    key: 'toggle',
    value: function toggle(itemOrURI) {
      if (this.hide(itemOrURI)) {
        return Promise.resolve();
      } else {
        return this.open(itemOrURI, { searchAllPanes: true });
      }
    }

    // Open Atom's license in the active pane.
  }, {
    key: 'openLicense',
    value: function openLicense() {
      return this.open(path.join(process.resourcesPath, 'LICENSE.md'));
    }

    // Synchronously open the given URI in the active pane. **Only use this method
    // in specs. Calling this in production code will block the UI thread and
    // everyone will be mad at you.**
    //
    // * `uri` A {String} containing a URI.
    // * `options` An optional options {Object}
    //   * `initialLine` A {Number} indicating which row to move the cursor to
    //     initially. Defaults to `0`.
    //   * `initialColumn` A {Number} indicating which column to move the cursor to
    //     initially. Defaults to `0`.
    //   * `activatePane` A {Boolean} indicating whether to call {Pane::activate} on
    //     the containing pane. Defaults to `true`.
    //   * `activateItem` A {Boolean} indicating whether to call {Pane::activateItem}
    //     on containing pane. Defaults to `true`.
  }, {
    key: 'openSync',
    value: function openSync() {
      var uri_ = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var initialLine = options.initialLine;
      var initialColumn = options.initialColumn;

      var activatePane = options.activatePane != null ? options.activatePane : true;
      var activateItem = options.activateItem != null ? options.activateItem : true;

      var uri = this.project.resolvePath(uri_);
      var item = this.getActivePane().itemForURI(uri);
      if (uri && item == null) {
        for (var _opener of this.getOpeners()) {
          item = _opener(uri, options);
          if (item) break;
        }
      }
      if (item == null) {
        item = this.project.openSync(uri, { initialLine: initialLine, initialColumn: initialColumn });
      }

      if (activateItem) {
        this.getActivePane().activateItem(item);
      }
      this.itemOpened(item);
      if (activatePane) {
        this.getActivePane().activate();
      }
      return item;
    }
  }, {
    key: 'openURIInPane',
    value: function openURIInPane(uri, pane) {
      return this.open(uri, { pane: pane });
    }

    // Public: Creates a new item that corresponds to the provided URI.
    //
    // If no URI is given, or no registered opener can open the URI, a new empty
    // {TextEditor} will be created.
    //
    // * `uri` A {String} containing a URI.
    //
    // Returns a {Promise} that resolves to the {TextEditor} (or other item) for the given URI.
  }, {
    key: 'createItemForURI',
    value: function createItemForURI(uri, options) {
      if (uri != null) {
        for (var _opener2 of this.getOpeners()) {
          var item = _opener2(uri, options);
          if (item != null) return Promise.resolve(item);
        }
      }

      try {
        return this.openTextFile(uri, options);
      } catch (error) {
        switch (error.code) {
          case 'CANCELLED':
            return Promise.resolve();
          case 'EACCES':
            this.notificationManager.addWarning('Permission denied \'' + error.path + '\'');
            return Promise.resolve();
          case 'EPERM':
          case 'EBUSY':
          case 'ENXIO':
          case 'EIO':
          case 'ENOTCONN':
          case 'UNKNOWN':
          case 'ECONNRESET':
          case 'EINVAL':
          case 'EMFILE':
          case 'ENOTDIR':
          case 'EAGAIN':
            this.notificationManager.addWarning('Unable to open \'' + (error.path != null ? error.path : uri) + '\'', { detail: error.message });
            return Promise.resolve();
          default:
            throw error;
        }
      }
    }
  }, {
    key: 'openTextFile',
    value: function openTextFile(uri, options) {
      var _this6 = this;

      var filePath = this.project.resolvePath(uri);

      if (filePath != null) {
        try {
          fs.closeSync(fs.openSync(filePath, 'r'));
        } catch (error) {
          // allow ENOENT errors to create an editor for paths that dont exist
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
      }

      var fileSize = fs.getSizeSync(filePath);

      var largeFileMode = fileSize >= 2 * 1048576; // 2MB
      if (fileSize >= this.config.get('core.warnOnLargeFileLimit') * 1048576) {
        // 20MB by default
        var choice = this.applicationDelegate.confirm({
          message: 'Atom will be unresponsive during the loading of very large files.',
          detailedMessage: 'Do you still want to load this file?',
          buttons: ['Proceed', 'Cancel']
        });
        if (choice === 1) {
          var error = new Error();
          error.code = 'CANCELLED';
          throw error;
        }
      }

      return this.project.bufferForPath(filePath, options).then(function (buffer) {
        return _this6.textEditorRegistry.build(Object.assign({ buffer: buffer, largeFileMode: largeFileMode, autoHeight: false }, options));
      });
    }
  }, {
    key: 'handleGrammarUsed',
    value: function handleGrammarUsed(grammar) {
      if (grammar == null) {
        return;
      }
      return this.packageManager.triggerActivationHook(grammar.packageName + ':grammar-used');
    }

    // Public: Returns a {Boolean} that is `true` if `object` is a `TextEditor`.
    //
    // * `object` An {Object} you want to perform the check against.
  }, {
    key: 'isTextEditor',
    value: function isTextEditor(object) {
      return object instanceof TextEditor;
    }

    // Extended: Create a new text editor.
    //
    // Returns a {TextEditor}.
  }, {
    key: 'buildTextEditor',
    value: function buildTextEditor(params) {
      var editor = this.textEditorRegistry.build(params);
      var subscriptions = new CompositeDisposable(this.textEditorRegistry.maintainGrammar(editor), this.textEditorRegistry.maintainConfig(editor));
      editor.onDidDestroy(function () {
        subscriptions.dispose();
      });
      return editor;
    }

    // Public: Asynchronously reopens the last-closed item's URI if it hasn't already been
    // reopened.
    //
    // Returns a {Promise} that is resolved when the item is opened
  }, {
    key: 'reopenItem',
    value: function reopenItem() {
      var uri = this.destroyedItemURIs.pop();
      if (uri) {
        return this.open(uri);
      } else {
        return Promise.resolve();
      }
    }

    // Public: Register an opener for a uri.
    //
    // When a URI is opened via {Workspace::open}, Atom loops through its registered
    // opener functions until one returns a value for the given uri.
    // Openers are expected to return an object that inherits from HTMLElement or
    // a model which has an associated view in the {ViewRegistry}.
    // A {TextEditor} will be used if no opener returns a value.
    //
    // ## Examples
    //
    // ```coffee
    // atom.workspace.addOpener (uri) ->
    //   if path.extname(uri) is '.toml'
    //     return new TomlEditor(uri)
    // ```
    //
    // * `opener` A {Function} to be called when a path is being opened.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to remove the
    // opener.
    //
    // Note that the opener will be called if and only if the URI is not already open
    // in the current pane. The searchAllPanes flag expands the search from the
    // current pane to all panes. If you wish to open a view of a different type for
    // a file that is already open, consider changing the protocol of the URI. For
    // example, perhaps you wish to preview a rendered version of the file `/foo/bar/baz.quux`
    // that is already open in a text editor view. You could signal this by calling
    // {Workspace::open} on the URI `quux-preview://foo/bar/baz.quux`. Then your opener
    // can check the protocol for quux-preview and only handle those URIs that match.
  }, {
    key: 'addOpener',
    value: function addOpener(opener) {
      var _this7 = this;

      this.openers.push(opener);
      return new Disposable(function () {
        _.remove(_this7.openers, opener);
      });
    }
  }, {
    key: 'getOpeners',
    value: function getOpeners() {
      return this.openers;
    }

    /*
    Section: Pane Items
    */

    // Essential: Get all pane items in the workspace.
    //
    // Returns an {Array} of items.
  }, {
    key: 'getPaneItems',
    value: function getPaneItems() {
      return _.flatten(this.getPaneContainers().map(function (container) {
        return container.getPaneItems();
      }));
    }

    // Essential: Get the active {Pane}'s active item.
    //
    // Returns an pane item {Object}.
  }, {
    key: 'getActivePaneItem',
    value: function getActivePaneItem() {
      return this.getActivePaneContainer().getActivePaneItem();
    }

    // Essential: Get all text editors in the workspace.
    //
    // Returns an {Array} of {TextEditor}s.
  }, {
    key: 'getTextEditors',
    value: function getTextEditors() {
      return this.getPaneItems().filter(function (item) {
        return item instanceof TextEditor;
      });
    }

    // Essential: Get the active item if it is an {TextEditor}.
    //
    // Returns an {TextEditor} or `undefined` if the current active item is not an
    // {TextEditor}.
  }, {
    key: 'getActiveTextEditor',
    value: function getActiveTextEditor() {
      var activeItem = this.getActivePaneItem();
      if (activeItem instanceof TextEditor) {
        return activeItem;
      }
    }

    // Save all pane items.
  }, {
    key: 'saveAll',
    value: function saveAll() {
      this.getPaneContainers().forEach(function (container) {
        container.saveAll();
      });
    }
  }, {
    key: 'confirmClose',
    value: function confirmClose(options) {
      return this.getPaneContainers().map(function (container) {
        return container.confirmClose(options);
      }).every(function (saved) {
        return saved;
      });
    }

    // Save the active pane item.
    //
    // If the active pane item currently has a URI according to the item's
    // `.getURI` method, calls `.save` on the item. Otherwise
    // {::saveActivePaneItemAs} # will be called instead. This method does nothing
    // if the active item does not implement a `.save` method.
  }, {
    key: 'saveActivePaneItem',
    value: function saveActivePaneItem() {
      this.getActivePane().saveActiveItem();
    }

    // Prompt the user for a path and save the active pane item to it.
    //
    // Opens a native dialog where the user selects a path on disk, then calls
    // `.saveAs` on the item with the selected path. This method does nothing if
    // the active item does not implement a `.saveAs` method.
  }, {
    key: 'saveActivePaneItemAs',
    value: function saveActivePaneItemAs() {
      this.getActivePane().saveActiveItemAs();
    }

    // Destroy (close) the active pane item.
    //
    // Removes the active pane item and calls the `.destroy` method on it if one is
    // defined.
  }, {
    key: 'destroyActivePaneItem',
    value: function destroyActivePaneItem() {
      return this.getActivePane().destroyActiveItem();
    }

    /*
    Section: Panes
    */

    // Extended: Get the most recently focused pane container.
    //
    // Returns a {Dock} or the {WorkspaceCenter}.
  }, {
    key: 'getActivePaneContainer',
    value: function getActivePaneContainer() {
      return this.activePaneContainer;
    }

    // Extended: Get all panes in the workspace.
    //
    // Returns an {Array} of {Pane}s.
  }, {
    key: 'getPanes',
    value: function getPanes() {
      return _.flatten(this.getPaneContainers().map(function (container) {
        return container.getPanes();
      }));
    }

    // Extended: Get the active {Pane}.
    //
    // Returns a {Pane}.
  }, {
    key: 'getActivePane',
    value: function getActivePane() {
      return this.getActivePaneContainer().getActivePane();
    }

    // Extended: Make the next pane active.
  }, {
    key: 'activateNextPane',
    value: function activateNextPane() {
      return this.getActivePaneContainer().activateNextPane();
    }

    // Extended: Make the previous pane active.
  }, {
    key: 'activatePreviousPane',
    value: function activatePreviousPane() {
      return this.getActivePaneContainer().activatePreviousPane();
    }

    // Extended: Get the first pane container that contains an item with the given
    // URI.
    //
    // * `uri` {String} uri
    //
    // Returns a {Dock}, the {WorkspaceCenter}, or `undefined` if no item exists
    // with the given URI.
  }, {
    key: 'paneContainerForURI',
    value: function paneContainerForURI(uri) {
      return this.getPaneContainers().find(function (container) {
        return container.paneForURI(uri);
      });
    }

    // Extended: Get the first pane container that contains the given item.
    //
    // * `item` the Item that the returned pane container must contain.
    //
    // Returns a {Dock}, the {WorkspaceCenter}, or `undefined` if no item exists
    // with the given URI.
  }, {
    key: 'paneContainerForItem',
    value: function paneContainerForItem(uri) {
      return this.getPaneContainers().find(function (container) {
        return container.paneForItem(uri);
      });
    }

    // Extended: Get the first {Pane} that contains an item with the given URI.
    //
    // * `uri` {String} uri
    //
    // Returns a {Pane} or `undefined` if no item exists with the given URI.
  }, {
    key: 'paneForURI',
    value: function paneForURI(uri) {
      for (var _location3 of this.getPaneContainers()) {
        var pane = _location3.paneForURI(uri);
        if (pane != null) {
          return pane;
        }
      }
    }

    // Extended: Get the {Pane} containing the given item.
    //
    // * `item` the Item that the returned pane must contain.
    //
    // Returns a {Pane} or `undefined` if no pane exists for the given item.
  }, {
    key: 'paneForItem',
    value: function paneForItem(item) {
      for (var _location4 of this.getPaneContainers()) {
        var pane = _location4.paneForItem(item);
        if (pane != null) {
          return pane;
        }
      }
    }

    // Destroy (close) the active pane.
  }, {
    key: 'destroyActivePane',
    value: function destroyActivePane() {
      var activePane = this.getActivePane();
      if (activePane != null) {
        activePane.destroy();
      }
    }

    // Close the active pane item, or the active pane if it is empty,
    // or the current window if there is only the empty root pane.
  }, {
    key: 'closeActivePaneItemOrEmptyPaneOrWindow',
    value: function closeActivePaneItemOrEmptyPaneOrWindow() {
      if (this.getActivePaneItem() != null) {
        this.destroyActivePaneItem();
      } else if (this.getCenter().getPanes().length > 1) {
        this.destroyActivePane();
      } else if (this.config.get('core.closeEmptyWindows')) {
        atom.close();
      }
    }

    // Increase the editor font size by 1px.
  }, {
    key: 'increaseFontSize',
    value: function increaseFontSize() {
      this.config.set('editor.fontSize', this.config.get('editor.fontSize') + 1);
    }

    // Decrease the editor font size by 1px.
  }, {
    key: 'decreaseFontSize',
    value: function decreaseFontSize() {
      var fontSize = this.config.get('editor.fontSize');
      if (fontSize > 1) {
        this.config.set('editor.fontSize', fontSize - 1);
      }
    }

    // Restore to the window's original editor font size.
  }, {
    key: 'resetFontSize',
    value: function resetFontSize() {
      if (this.originalFontSize) {
        this.config.set('editor.fontSize', this.originalFontSize);
      }
    }
  }, {
    key: 'subscribeToFontSize',
    value: function subscribeToFontSize() {
      var _this8 = this;

      return this.config.onDidChange('editor.fontSize', function (_ref6) {
        var oldValue = _ref6.oldValue;

        if (_this8.originalFontSize == null) {
          _this8.originalFontSize = oldValue;
        }
      });
    }

    // Removes the item's uri from the list of potential items to reopen.
  }, {
    key: 'itemOpened',
    value: function itemOpened(item) {
      var uri = undefined;
      if (typeof item.getURI === 'function') {
        uri = item.getURI();
      } else if (typeof item.getUri === 'function') {
        uri = item.getUri();
      }

      if (uri != null) {
        _.remove(this.destroyedItemURIs, uri);
      }
    }

    // Adds the destroyed item's uri to the list of items to reopen.
  }, {
    key: 'didDestroyPaneItem',
    value: function didDestroyPaneItem(_ref7) {
      var item = _ref7.item;

      var uri = undefined;
      if (typeof item.getURI === 'function') {
        uri = item.getURI();
      } else if (typeof item.getUri === 'function') {
        uri = item.getUri();
      }

      if (uri != null) {
        this.destroyedItemURIs.push(uri);
      }
    }

    // Called by Model superclass when destroyed
  }, {
    key: 'destroyed',
    value: function destroyed() {
      this.paneContainers.center.destroy();
      this.paneContainers.left.destroy();
      this.paneContainers.right.destroy();
      this.paneContainers.bottom.destroy();
      this.cancelStoppedChangingActivePaneItemTimeout();
      if (this.activeItemSubscriptions != null) {
        this.activeItemSubscriptions.dispose();
      }
    }

    /*
    Section: Pane Locations
    */

  }, {
    key: 'getCenter',
    value: function getCenter() {
      return this.paneContainers.center;
    }
  }, {
    key: 'getLeftDock',
    value: function getLeftDock() {
      return this.paneContainers.left;
    }
  }, {
    key: 'getRightDock',
    value: function getRightDock() {
      return this.paneContainers.right;
    }
  }, {
    key: 'getBottomDock',
    value: function getBottomDock() {
      return this.paneContainers.bottom;
    }
  }, {
    key: 'getPaneContainers',
    value: function getPaneContainers() {
      return [this.paneContainers.center, this.paneContainers.left, this.paneContainers.right, this.paneContainers.bottom];
    }

    /*
    Section: Panels
     Panels are used to display UI related to an editor window. They are placed at one of the four
    edges of the window: left, right, top or bottom. If there are multiple panels on the same window
    edge they are stacked in order of priority: higher priority is closer to the center, lower
    priority towards the edge.
     *Note:* If your panel changes its size throughout its lifetime, consider giving it a higher
    priority, allowing fixed size panels to be closer to the edge. This allows control targets to
    remain more static for easier targeting by users that employ mice or trackpads. (See
    [atom/atom#4834](https://github.com/atom/atom/issues/4834) for discussion.)
    */

    // Essential: Get an {Array} of all the panel items at the bottom of the editor window.
  }, {
    key: 'getBottomPanels',
    value: function getBottomPanels() {
      return this.getPanels('bottom');
    }

    // Essential: Adds a panel item to the bottom of the editor window.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addBottomPanel',
    value: function addBottomPanel(options) {
      return this.addPanel('bottom', options);
    }

    // Essential: Get an {Array} of all the panel items to the left of the editor window.
  }, {
    key: 'getLeftPanels',
    value: function getLeftPanels() {
      return this.getPanels('left');
    }

    // Essential: Adds a panel item to the left of the editor window.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addLeftPanel',
    value: function addLeftPanel(options) {
      return this.addPanel('left', options);
    }

    // Essential: Get an {Array} of all the panel items to the right of the editor window.
  }, {
    key: 'getRightPanels',
    value: function getRightPanels() {
      return this.getPanels('right');
    }

    // Essential: Adds a panel item to the right of the editor window.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addRightPanel',
    value: function addRightPanel(options) {
      return this.addPanel('right', options);
    }

    // Essential: Get an {Array} of all the panel items at the top of the editor window.
  }, {
    key: 'getTopPanels',
    value: function getTopPanels() {
      return this.getPanels('top');
    }

    // Essential: Adds a panel item to the top of the editor window above the tabs.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addTopPanel',
    value: function addTopPanel(options) {
      return this.addPanel('top', options);
    }

    // Essential: Get an {Array} of all the panel items in the header.
  }, {
    key: 'getHeaderPanels',
    value: function getHeaderPanels() {
      return this.getPanels('header');
    }

    // Essential: Adds a panel item to the header.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addHeaderPanel',
    value: function addHeaderPanel(options) {
      return this.addPanel('header', options);
    }

    // Essential: Get an {Array} of all the panel items in the footer.
  }, {
    key: 'getFooterPanels',
    value: function getFooterPanels() {
      return this.getPanels('footer');
    }

    // Essential: Adds a panel item to the footer.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addFooterPanel',
    value: function addFooterPanel(options) {
      return this.addPanel('footer', options);
    }

    // Essential: Get an {Array} of all the modal panel items
  }, {
    key: 'getModalPanels',
    value: function getModalPanels() {
      return this.getPanels('modal');
    }

    // Essential: Adds a panel item as a modal dialog.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be a DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     model option. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addModalPanel',
    value: function addModalPanel() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return this.addPanel('modal', options);
    }

    // Essential: Returns the {Panel} associated with the given item. Returns
    // `null` when the item has no panel.
    //
    // * `item` Item the panel contains
  }, {
    key: 'panelForItem',
    value: function panelForItem(item) {
      for (var _location5 in this.panelContainers) {
        var container = this.panelContainers[_location5];
        var panel = container.panelForItem(item);
        if (panel != null) {
          return panel;
        }
      }
      return null;
    }
  }, {
    key: 'getPanels',
    value: function getPanels(location) {
      return this.panelContainers[location].getPanels();
    }
  }, {
    key: 'addPanel',
    value: function addPanel(location, options) {
      if (options == null) {
        options = {};
      }
      return this.panelContainers[location].addPanel(new Panel(options, this.viewRegistry));
    }

    /*
    Section: Searching and Replacing
    */

    // Public: Performs a search across all files in the workspace.
    //
    // * `regex` {RegExp} to search with.
    // * `options` (optional) {Object}
    //   * `paths` An {Array} of glob patterns to search within.
    //   * `onPathsSearched` (optional) {Function} to be periodically called
    //     with number of paths searched.
    //   * `leadingContextLineCount` {Number} default `0`; The number of lines
    //      before the matched line to include in the results object.
    //   * `trailingContextLineCount` {Number} default `0`; The number of lines
    //      after the matched line to include in the results object.
    // * `iterator` {Function} callback on each file found.
    //
    // Returns a {Promise} with a `cancel()` method that will cancel all
    // of the underlying searches that were started as part of this scan.
  }, {
    key: 'scan',
    value: function scan(regex, options, iterator) {
      var _this9 = this;

      if (options === undefined) options = {};

      if (_.isFunction(options)) {
        iterator = options;
        options = {};
      }

      // Find a searcher for every Directory in the project. Each searcher that is matched
      // will be associated with an Array of Directory objects in the Map.
      var directoriesForSearcher = new Map();
      for (var directory of this.project.getDirectories()) {
        var searcher = this.defaultDirectorySearcher;
        for (var directorySearcher of this.directorySearchers) {
          if (directorySearcher.canSearchDirectory(directory)) {
            searcher = directorySearcher;
            break;
          }
        }
        var directories = directoriesForSearcher.get(searcher);
        if (!directories) {
          directories = [];
          directoriesForSearcher.set(searcher, directories);
        }
        directories.push(directory);
      }

      // Define the onPathsSearched callback.
      var onPathsSearched = undefined;
      if (_.isFunction(options.onPathsSearched)) {
        (function () {
          // Maintain a map of directories to the number of search results. When notified of a new count,
          // replace the entry in the map and update the total.
          var onPathsSearchedOption = options.onPathsSearched;
          var totalNumberOfPathsSearched = 0;
          var numberOfPathsSearchedForSearcher = new Map();
          onPathsSearched = function (searcher, numberOfPathsSearched) {
            var oldValue = numberOfPathsSearchedForSearcher.get(searcher);
            if (oldValue) {
              totalNumberOfPathsSearched -= oldValue;
            }
            numberOfPathsSearchedForSearcher.set(searcher, numberOfPathsSearched);
            totalNumberOfPathsSearched += numberOfPathsSearched;
            return onPathsSearchedOption(totalNumberOfPathsSearched);
          };
        })();
      } else {
        onPathsSearched = function () {};
      }

      // Kick off all of the searches and unify them into one Promise.
      var allSearches = [];
      directoriesForSearcher.forEach(function (directories, searcher) {
        var searchOptions = {
          inclusions: options.paths || [],
          includeHidden: true,
          excludeVcsIgnores: _this9.config.get('core.excludeVcsIgnoredPaths'),
          exclusions: _this9.config.get('core.ignoredNames'),
          follow: _this9.config.get('core.followSymlinks'),
          leadingContextLineCount: options.leadingContextLineCount || 0,
          trailingContextLineCount: options.trailingContextLineCount || 0,
          didMatch: function didMatch(result) {
            if (!_this9.project.isPathModified(result.filePath)) {
              return iterator(result);
            }
          },
          didError: function didError(error) {
            return iterator(null, error);
          },
          didSearchPaths: function didSearchPaths(count) {
            return onPathsSearched(searcher, count);
          }
        };
        var directorySearcher = searcher.search(directories, regex, searchOptions);
        allSearches.push(directorySearcher);
      });
      var searchPromise = Promise.all(allSearches);

      for (var buffer of this.project.getBuffers()) {
        if (buffer.isModified()) {
          var filePath = buffer.getPath();
          if (!this.project.contains(filePath)) {
            continue;
          }
          var matches = [];
          buffer.scan(regex, function (match) {
            return matches.push(match);
          });
          if (matches.length > 0) {
            iterator({ filePath: filePath, matches: matches });
          }
        }
      }

      // Make sure the Promise that is returned to the client is cancelable. To be consistent
      // with the existing behavior, instead of cancel() rejecting the promise, it should
      // resolve it with the special value 'cancelled'. At least the built-in find-and-replace
      // package relies on this behavior.
      var isCancelled = false;
      var cancellablePromise = new Promise(function (resolve, reject) {
        var onSuccess = function onSuccess() {
          if (isCancelled) {
            resolve('cancelled');
          } else {
            resolve(null);
          }
        };

        var onFailure = function onFailure() {
          for (var promise of allSearches) {
            promise.cancel();
          }
          reject();
        };

        searchPromise.then(onSuccess, onFailure);
      });
      cancellablePromise.cancel = function () {
        isCancelled = true;
        // Note that cancelling all of the members of allSearches will cause all of the searches
        // to resolve, which causes searchPromise to resolve, which is ultimately what causes
        // cancellablePromise to resolve.
        allSearches.map(function (promise) {
          return promise.cancel();
        });
      };

      // Although this method claims to return a `Promise`, the `ResultsPaneView.onSearch()`
      // method in the find-and-replace package expects the object returned by this method to have a
      // `done()` method. Include a done() method until find-and-replace can be updated.
      cancellablePromise.done = function (onSuccessOrFailure) {
        cancellablePromise.then(onSuccessOrFailure, onSuccessOrFailure);
      };
      return cancellablePromise;
    }

    // Public: Performs a replace across all the specified files in the project.
    //
    // * `regex` A {RegExp} to search with.
    // * `replacementText` {String} to replace all matches of regex with.
    // * `filePaths` An {Array} of file path strings to run the replace on.
    // * `iterator` A {Function} callback on each file with replacements:
    //   * `options` {Object} with keys `filePath` and `replacements`.
    //
    // Returns a {Promise}.
  }, {
    key: 'replace',
    value: function replace(regex, replacementText, filePaths, iterator) {
      var _this10 = this;

      return new Promise(function (resolve, reject) {
        var buffer = undefined;
        var openPaths = _this10.project.getBuffers().map(function (buffer) {
          return buffer.getPath();
        });
        var outOfProcessPaths = _.difference(filePaths, openPaths);

        var inProcessFinished = !openPaths.length;
        var outOfProcessFinished = !outOfProcessPaths.length;
        var checkFinished = function checkFinished() {
          if (outOfProcessFinished && inProcessFinished) {
            resolve();
          }
        };

        if (!outOfProcessFinished.length) {
          var flags = 'g';
          if (regex.ignoreCase) {
            flags += 'i';
          }

          var task = Task.once(require.resolve('./replace-handler'), outOfProcessPaths, regex.source, flags, replacementText, function () {
            outOfProcessFinished = true;
            checkFinished();
          });

          task.on('replace:path-replaced', iterator);
          task.on('replace:file-error', function (error) {
            iterator(null, error);
          });
        }

        for (buffer of _this10.project.getBuffers()) {
          if (!filePaths.includes(buffer.getPath())) {
            continue;
          }
          var replacements = buffer.replace(regex, replacementText, iterator);
          if (replacements) {
            iterator({ filePath: buffer.getPath(), replacements: replacements });
          }
        }

        inProcessFinished = true;
        checkFinished();
      });
    }
  }, {
    key: 'checkoutHeadRevision',
    value: function checkoutHeadRevision(editor) {
      var _this11 = this;

      if (editor.getPath()) {
        var checkoutHead = function checkoutHead() {
          return _this11.project.repositoryForDirectory(new Directory(editor.getDirectoryPath())).then(function (repository) {
            return repository != null ? repository.checkoutHeadForEditor(editor) : undefined;
          });
        };

        if (this.config.get('editor.confirmCheckoutHeadRevision')) {
          this.applicationDelegate.confirm({
            message: 'Confirm Checkout HEAD Revision',
            detailedMessage: 'Are you sure you want to discard all changes to "' + editor.getFileName() + '" since the last Git commit?',
            buttons: {
              OK: checkoutHead,
              Cancel: null
            }
          });
        } else {
          return checkoutHead();
        }
      } else {
        return Promise.resolve(false);
      }
    }
  }, {
    key: 'paneContainer',
    get: function get() {
      Grim.deprecate('`atom.workspace.paneContainer` has always been private, but it is now gone. Please use `atom.workspace.getCenter()` instead and consult the workspace API docs for public methods.');
      return this.paneContainers.center.paneContainer;
    }
  }]);

  return Workspace;
})(Model);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovcHJvamVjdHMvYXRvbS9vdXQvYXBwL3NyYy93b3Jrc3BhY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOztBQUVYLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDOztBQUVwQyxJQUFJLFlBQVksR0FBRyxDQUFDLFlBQVk7QUFBRSxXQUFTLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFBRSxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUFFLFVBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsQUFBQyxVQUFVLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxBQUFDLElBQUksT0FBTyxJQUFJLFVBQVUsRUFBRSxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxBQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FBRTtHQUFFLEFBQUMsT0FBTyxVQUFVLFdBQVcsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFO0FBQUUsUUFBSSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxBQUFDLElBQUksV0FBVyxFQUFFLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxBQUFDLE9BQU8sV0FBVyxDQUFDO0dBQUUsQ0FBQztDQUFFLENBQUEsRUFBRyxDQUFDOztBQUV0akIsSUFBSSxJQUFJLEdBQUcsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFBRSxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsQUFBQyxTQUFTLEVBQUUsT0FBTyxNQUFNLEVBQUU7QUFBRSxRQUFJLE1BQU0sR0FBRyxHQUFHO1FBQUUsUUFBUSxHQUFHLEdBQUc7UUFBRSxRQUFRLEdBQUcsR0FBRyxDQUFDLEFBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxBQUFDLElBQUksTUFBTSxLQUFLLElBQUksRUFBRSxNQUFNLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxBQUFDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQUFBQyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7QUFBRSxVQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEFBQUMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO0FBQUUsZUFBTyxTQUFTLENBQUM7T0FBRSxNQUFNO0FBQUUsV0FBRyxHQUFHLE1BQU0sQ0FBQyxBQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsQUFBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEFBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxBQUFDLElBQUksR0FBRyxNQUFNLEdBQUcsU0FBUyxDQUFDLEFBQUMsU0FBUyxTQUFTLENBQUM7T0FBRTtLQUFFLE1BQU0sSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQUUsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQUUsTUFBTTtBQUFFLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQUFBQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFBRSxlQUFPLFNBQVMsQ0FBQztPQUFFLEFBQUMsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQUU7R0FBRTtDQUFFLENBQUM7O0FBRXJwQixTQUFTLGtCQUFrQixDQUFDLEdBQUcsRUFBRTtBQUFFLE1BQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUFFLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxPQUFPLElBQUksQ0FBQztHQUFFLE1BQU07QUFBRSxXQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FBRTtDQUFFOztBQUUvTCxTQUFTLGlCQUFpQixDQUFDLEVBQUUsRUFBRTtBQUFFLFNBQU8sWUFBWTtBQUFFLFFBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLEFBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFBRSxVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxBQUFDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEFBQUMsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUFFLFlBQUk7QUFBRSxjQUFJLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQUFBQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQUUsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUFFLGdCQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQUFBQyxPQUFPO1NBQUUsQUFBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFBRSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQUUsTUFBTTtBQUFFLGlCQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFD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QUNoQixvQkFBTSxFQUFFLElBQUk7YUFDYjtXQUNGLENBQUMsQ0FBQTtTQUNILE1BQU07QUFDTCxpQkFBTyxZQUFZLEVBQUUsQ0FBQTtTQUN0QjtPQUNGLE1BQU07QUFDTCxlQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDOUI7S0FDRjtHQStSQSxFQUFFO0FBQ0QsT0FBRyxFQUFFLGVBQWU7QUFDcEIsT0FBRyxFQXo4RGEsU0FBQSxHQUFBLEdBQUc7QUFDbkIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxvTEFBb0wsQ0FBQyxDQUFBO0FBQ3BNLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFBO0tBQ2hEO0dBMDhEQSxDQUFDLENBQUMsQ0FBQzs7QUFFSixTQXZnRXFCLFNBQVMsQ0FBQTtDQXdnRS9CLENBQUEsQ0F4Z0V3QyxLQUFLLENBaXVEN0MsQ0FBQSIsImZpbGUiOiJmaWxlOi8vL0M6L3Byb2plY3RzL2F0b20vb3V0L2FwcC9zcmMvd29ya3NwYWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuY29uc3QgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUtcGx1cycpXG5jb25zdCB1cmwgPSByZXF1aXJlKCd1cmwnKVxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuY29uc3Qge0VtaXR0ZXIsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnZXZlbnQta2l0JylcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMtcGx1cycpXG5jb25zdCB7RGlyZWN0b3J5fSA9IHJlcXVpcmUoJ3BhdGh3YXRjaGVyJylcbmNvbnN0IEdyaW0gPSByZXF1aXJlKCdncmltJylcbmNvbnN0IERlZmF1bHREaXJlY3RvcnlTZWFyY2hlciA9IHJlcXVpcmUoJy4vZGVmYXVsdC1kaXJlY3Rvcnktc2VhcmNoZXInKVxuY29uc3QgRG9jayA9IHJlcXVpcmUoJy4vZG9jaycpXG5jb25zdCBNb2RlbCA9IHJlcXVpcmUoJy4vbW9kZWwnKVxuY29uc3QgU3RhdGVTdG9yZSA9IHJlcXVpcmUoJy4vc3RhdGUtc3RvcmUnKVxuY29uc3QgVGV4dEVkaXRvciA9IHJlcXVpcmUoJy4vdGV4dC1lZGl0b3InKVxuY29uc3QgUGFuZWwgPSByZXF1aXJlKCcuL3BhbmVsJylcbmNvbnN0IFBhbmVsQ29udGFpbmVyID0gcmVxdWlyZSgnLi9wYW5lbC1jb250YWluZXInKVxuY29uc3QgVGFzayA9IHJlcXVpcmUoJy4vdGFzaycpXG5jb25zdCBXb3Jrc3BhY2VDZW50ZXIgPSByZXF1aXJlKCcuL3dvcmtzcGFjZS1jZW50ZXInKVxuY29uc3QgV29ya3NwYWNlRWxlbWVudCA9IHJlcXVpcmUoJy4vd29ya3NwYWNlLWVsZW1lbnQnKVxuXG5jb25zdCBTVE9QUEVEX0NIQU5HSU5HX0FDVElWRV9QQU5FX0lURU1fREVMQVkgPSAxMDBcbmNvbnN0IEFMTF9MT0NBVElPTlMgPSBbJ2NlbnRlcicsICdsZWZ0JywgJ3JpZ2h0JywgJ2JvdHRvbSddXG5cbi8vIEVzc2VudGlhbDogUmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgdGhlIHVzZXIgaW50ZXJmYWNlIGZvciB0aGUgZW50aXJlIHdpbmRvdy5cbi8vIEFuIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgaXMgYXZhaWxhYmxlIHZpYSB0aGUgYGF0b20ud29ya3NwYWNlYCBnbG9iYWwuXG4vL1xuLy8gSW50ZXJhY3Qgd2l0aCB0aGlzIG9iamVjdCB0byBvcGVuIGZpbGVzLCBiZSBub3RpZmllZCBvZiBjdXJyZW50IGFuZCBmdXR1cmVcbi8vIGVkaXRvcnMsIGFuZCBtYW5pcHVsYXRlIHBhbmVzLiBUbyBhZGQgcGFuZWxzLCB1c2Uge1dvcmtzcGFjZTo6YWRkVG9wUGFuZWx9XG4vLyBhbmQgZnJpZW5kcy5cbi8vXG4vLyAjIyBXb3Jrc3BhY2UgSXRlbXNcbi8vXG4vLyBUaGUgdGVybSBcIml0ZW1cIiByZWZlcnMgdG8gYW55dGhpbmcgdGhhdCBjYW4gYmUgZGlzcGxheWVkXG4vLyBpbiBhIHBhbmUgd2l0aGluIHRoZSB3b3Jrc3BhY2UsIGVpdGhlciBpbiB0aGUge1dvcmtzcGFjZUNlbnRlcn0gb3IgaW4gb25lXG4vLyBvZiB0aGUgdGhyZWUge0RvY2t9cy4gVGhlIHdvcmtzcGFjZSBleHBlY3RzIGl0ZW1zIHRvIGNvbmZvcm0gdG8gdGhlXG4vLyBmb2xsb3dpbmcgaW50ZXJmYWNlOlxuLy9cbi8vICMjIyBSZXF1aXJlZCBNZXRob2RzXG4vL1xuLy8gIyMjIyBgZ2V0VGl0bGUoKWBcbi8vXG4vLyBSZXR1cm5zIGEge1N0cmluZ30gY29udGFpbmluZyB0aGUgdGl0bGUgb2YgdGhlIGl0ZW0gdG8gZGlzcGxheSBvbiBpdHNcbi8vIGFzc29jaWF0ZWQgdGFiLlxuLy9cbi8vICMjIyBPcHRpb25hbCBNZXRob2RzXG4vL1xuLy8gIyMjIyBgZ2V0RWxlbWVudCgpYFxuLy9cbi8vIElmIHlvdXIgaXRlbSBhbHJlYWR5ICppcyogYSBET00gZWxlbWVudCwgeW91IGRvIG5vdCBuZWVkIHRvIGltcGxlbWVudCB0aGlzXG4vLyBtZXRob2QuIE90aGVyd2lzZSBpdCBzaG91bGQgcmV0dXJuIHRoZSBlbGVtZW50IHlvdSB3YW50IHRvIGRpc3BsYXkgdG9cbi8vIHJlcHJlc2VudCB0aGlzIGl0ZW0uXG4vL1xuLy8gIyMjIyBgZGVzdHJveSgpYFxuLy9cbi8vIERlc3Ryb3lzIHRoZSBpdGVtLiBUaGlzIHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIGl0ZW0gaXMgcmVtb3ZlZCBmcm9tIGl0c1xuLy8gcGFyZW50IHBhbmUuXG4vL1xuLy8gIyMjIyBgb25EaWREZXN0cm95KGNhbGxiYWNrKWBcbi8vXG4vLyBDYWxsZWQgYnkgdGhlIHdvcmtzcGFjZSBzbyBpdCBjYW4gYmUgbm90aWZpZWQgd2hlbiB0aGUgaXRlbSBpcyBkZXN0cm95ZWQuXG4vLyBNdXN0IHJldHVybiBhIHtEaXNwb3NhYmxlfS5cbi8vXG4vLyAjIyMjIGBzZXJpYWxpemUoKWBcbi8vXG4vLyBTZXJpYWxpemUgdGhlIHN0YXRlIG9mIHRoZSBpdGVtLiBNdXN0IHJldHVybiBhbiBvYmplY3QgdGhhdCBjYW4gYmUgcGFzc2VkIHRvXG4vLyBgSlNPTi5zdHJpbmdpZnlgLiBUaGUgc3RhdGUgc2hvdWxkIGluY2x1ZGUgYSBmaWVsZCBjYWxsZWQgYGRlc2VyaWFsaXplcmAsXG4vLyB3aGljaCBuYW1lcyBhIGRlc2VyaWFsaXplciBkZWNsYXJlZCBpbiB5b3VyIGBwYWNrYWdlLmpzb25gLiBUaGlzIG1ldGhvZCBpc1xuLy8gaW52b2tlZCBvbiBpdGVtcyB3aGVuIHNlcmlhbGl6aW5nIHRoZSB3b3Jrc3BhY2Ugc28gdGhleSBjYW4gYmUgcmVzdG9yZWQgdG9cbi8vIHRoZSBzYW1lIGxvY2F0aW9uIGxhdGVyLlxuLy9cbi8vICMjIyMgYGdldFVSSSgpYFxuLy9cbi8vIFJldHVybnMgdGhlIFVSSSBhc3NvY2lhdGVkIHdpdGggdGhlIGl0ZW0uXG4vL1xuLy8gIyMjIyBgZ2V0TG9uZ1RpdGxlKClgXG4vL1xuLy8gUmV0dXJucyBhIHtTdHJpbmd9IGNvbnRhaW5pbmcgYSBsb25nZXIgdmVyc2lvbiBvZiB0aGUgdGl0bGUgdG8gZGlzcGxheSBpblxuLy8gcGxhY2VzIGxpa2UgdGhlIHdpbmRvdyB0aXRsZSBvciBvbiB0YWJzIHRoZWlyIHNob3J0IHRpdGxlcyBhcmUgYW1iaWd1b3VzLlxuLy9cbi8vICMjIyMgYG9uRGlkQ2hhbmdlVGl0bGVgXG4vL1xuLy8gQ2FsbGVkIGJ5IHRoZSB3b3Jrc3BhY2Ugc28gaXQgY2FuIGJlIG5vdGlmaWVkIHdoZW4gdGhlIGl0ZW0ncyB0aXRsZSBjaGFuZ2VzLlxuLy8gTXVzdCByZXR1cm4gYSB7RGlzcG9zYWJsZX0uXG4vL1xuLy8gIyMjIyBgZ2V0SWNvbk5hbWUoKWBcbi8vXG4vLyBSZXR1cm4gYSB7U3RyaW5nfSB3aXRoIHRoZSBuYW1lIG9mIGFuIGljb24uIElmIHRoaXMgbWV0aG9kIGlzIGRlZmluZWQgYW5kXG4vLyByZXR1cm5zIGEgc3RyaW5nLCB0aGUgaXRlbSdzIHRhYiBlbGVtZW50IHdpbGwgYmUgcmVuZGVyZWQgd2l0aCB0aGUgYGljb25gIGFuZFxuLy8gYGljb24tJHtpY29uTmFtZX1gIENTUyBjbGFzc2VzLlxuLy9cbi8vICMjIyBgb25EaWRDaGFuZ2VJY29uKGNhbGxiYWNrKWBcbi8vXG4vLyBDYWxsZWQgYnkgdGhlIHdvcmtzcGFjZSBzbyBpdCBjYW4gYmUgbm90aWZpZWQgd2hlbiB0aGUgaXRlbSdzIGljb24gY2hhbmdlcy5cbi8vIE11c3QgcmV0dXJuIGEge0Rpc3Bvc2FibGV9LlxuLy9cbi8vICMjIyMgYGdldERlZmF1bHRMb2NhdGlvbigpYFxuLy9cbi8vIFRlbGxzIHRoZSB3b3Jrc3BhY2Ugd2hlcmUgeW91ciBpdGVtIHNob3VsZCBiZSBvcGVuZWQgaW4gYWJzZW5jZSBvZiBhIHVzZXJcbi8vIG92ZXJyaWRlLiBJdGVtcyBjYW4gYXBwZWFyIGluIHRoZSBjZW50ZXIgb3IgaW4gYSBkb2NrIG9uIHRoZSBsZWZ0LCByaWdodCwgb3Jcbi8vIGJvdHRvbSBvZiB0aGUgd29ya3NwYWNlLlxuLy9cbi8vIFJldHVybnMgYSB7U3RyaW5nfSB3aXRoIG9uZSBvZiB0aGUgZm9sbG93aW5nIHZhbHVlczogYCdjZW50ZXInYCwgYCdsZWZ0J2AsXG4vLyBgJ3JpZ2h0J2AsIGAnYm90dG9tJ2AuIElmIHRoaXMgbWV0aG9kIGlzIG5vdCBkZWZpbmVkLCBgJ2NlbnRlcidgIGlzIHRoZVxuLy8gZGVmYXVsdC5cbi8vXG4vLyAjIyMjIGBnZXRBbGxvd2VkTG9jYXRpb25zKClgXG4vL1xuLy8gVGVsbHMgdGhlIHdvcmtzcGFjZSB3aGVyZSB0aGlzIGl0ZW0gY2FuIGJlIG1vdmVkLiBSZXR1cm5zIGFuIHtBcnJheX0gb2Ygb25lXG4vLyBvciBtb3JlIG9mIHRoZSBmb2xsb3dpbmcgdmFsdWVzOiBgJ2NlbnRlcidgLCBgJ2xlZnQnYCwgYCdyaWdodCdgLCBvclxuLy8gYCdib3R0b20nYC5cbi8vXG4vLyAjIyMjIGBpc1Blcm1hbmVudERvY2tJdGVtKClgXG4vL1xuLy8gVGVsbHMgdGhlIHdvcmtzcGFjZSB3aGV0aGVyIG9yIG5vdCB0aGlzIGl0ZW0gY2FuIGJlIGNsb3NlZCBieSB0aGUgdXNlciBieVxuLy8gY2xpY2tpbmcgYW4gYHhgIG9uIGl0cyB0YWIuIFVzZSBvZiB0aGlzIGZlYXR1cmUgaXMgZGlzY291cmFnZWQgdW5sZXNzIHRoZXJlJ3Ncbi8vIGEgdmVyeSBnb29kIHJlYXNvbiBub3QgdG8gYWxsb3cgdXNlcnMgdG8gY2xvc2UgeW91ciBpdGVtLiBJdGVtcyBjYW4gYmUgbWFkZVxuLy8gcGVybWFuZW50ICpvbmx5KiB3aGVuIHRoZXkgYXJlIGNvbnRhaW5lZCBpbiBkb2Nrcy4gQ2VudGVyIHBhbmUgaXRlbXMgY2FuXG4vLyBhbHdheXMgYmUgcmVtb3ZlZC4gTm90ZSB0aGF0IGl0IGlzIGN1cnJlbnRseSBzdGlsbCBwb3NzaWJsZSB0byBjbG9zZSBkb2NrXG4vLyBpdGVtcyB2aWEgdGhlIGBDbG9zZSBQYW5lYCBvcHRpb24gaW4gdGhlIGNvbnRleHQgbWVudSBhbmQgdmlhIEF0b20gQVBJcywgc29cbi8vIHlvdSBzaG91bGQgc3RpbGwgYmUgcHJlcGFyZWQgdG8gaGFuZGxlIHlvdXIgZG9jayBpdGVtcyBiZWluZyBkZXN0cm95ZWQgYnkgdGhlXG4vLyB1c2VyIGV2ZW4gaWYgeW91IGltcGxlbWVudCB0aGlzIG1ldGhvZC5cbi8vXG4vLyAjIyMjIGBzYXZlKClgXG4vL1xuLy8gU2F2ZXMgdGhlIGl0ZW0uXG4vL1xuLy8gIyMjIyBgc2F2ZUFzKHBhdGgpYFxuLy9cbi8vIFNhdmVzIHRoZSBpdGVtIHRvIHRoZSBzcGVjaWZpZWQgcGF0aC5cbi8vXG4vLyAjIyMjIGBnZXRQYXRoKClgXG4vL1xuLy8gUmV0dXJucyB0aGUgbG9jYWwgcGF0aCBhc3NvY2lhdGVkIHdpdGggdGhpcyBpdGVtLiBUaGlzIGlzIG9ubHkgdXNlZCB0byBzZXRcbi8vIHRoZSBpbml0aWFsIGxvY2F0aW9uIG9mIHRoZSBcInNhdmUgYXNcIiBkaWFsb2cuXG4vL1xuLy8gIyMjIyBgaXNNb2RpZmllZCgpYFxuLy9cbi8vIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGl0ZW0gaXMgbW9kaWZpZWQgdG8gcmVmbGVjdCBtb2RpZmljYXRpb24gaW4gdGhlXG4vLyBVSS5cbi8vXG4vLyAjIyMjIGBvbkRpZENoYW5nZU1vZGlmaWVkKClgXG4vL1xuLy8gQ2FsbGVkIGJ5IHRoZSB3b3Jrc3BhY2Ugc28gaXQgY2FuIGJlIG5vdGlmaWVkIHdoZW4gaXRlbSdzIG1vZGlmaWVkIHN0YXR1c1xuLy8gY2hhbmdlcy4gTXVzdCByZXR1cm4gYSB7RGlzcG9zYWJsZX0uXG4vL1xuLy8gIyMjIyBgY29weSgpYFxuLy9cbi8vIENyZWF0ZSBhIGNvcHkgb2YgdGhlIGl0ZW0uIElmIGRlZmluZWQsIHRoZSB3b3Jrc3BhY2Ugd2lsbCBjYWxsIHRoaXMgbWV0aG9kIHRvXG4vLyBkdXBsaWNhdGUgdGhlIGl0ZW0gd2hlbiBzcGxpdHRpbmcgcGFuZXMgdmlhIGNlcnRhaW4gc3BsaXQgY29tbWFuZHMuXG4vL1xuLy8gIyMjIyBgZ2V0UHJlZmVycmVkSGVpZ2h0KClgXG4vL1xuLy8gSWYgdGhpcyBpdGVtIGlzIGRpc3BsYXllZCBpbiB0aGUgYm90dG9tIHtEb2NrfSwgY2FsbGVkIGJ5IHRoZSB3b3Jrc3BhY2Ugd2hlblxuLy8gaW5pdGlhbGx5IGRpc3BsYXlpbmcgdGhlIGRvY2sgdG8gc2V0IGl0cyBoZWlnaHQuIE9uY2UgdGhlIGRvY2sgaGFzIGJlZW5cbi8vIHJlc2l6ZWQgYnkgdGhlIHVzZXIsIHRoZWlyIGhlaWdodCB3aWxsIG92ZXJyaWRlIHRoaXMgdmFsdWUuXG4vL1xuLy8gUmV0dXJucyBhIHtOdW1iZXJ9LlxuLy9cbi8vICMjIyMgYGdldFByZWZlcnJlZFdpZHRoKClgXG4vL1xuLy8gSWYgdGhpcyBpdGVtIGlzIGRpc3BsYXllZCBpbiB0aGUgbGVmdCBvciByaWdodCB7RG9ja30sIGNhbGxlZCBieSB0aGVcbi8vIHdvcmtzcGFjZSB3aGVuIGluaXRpYWxseSBkaXNwbGF5aW5nIHRoZSBkb2NrIHRvIHNldCBpdHMgd2lkdGguIE9uY2UgdGhlIGRvY2tcbi8vIGhhcyBiZWVuIHJlc2l6ZWQgYnkgdGhlIHVzZXIsIHRoZWlyIHdpZHRoIHdpbGwgb3ZlcnJpZGUgdGhpcyB2YWx1ZS5cbi8vXG4vLyBSZXR1cm5zIGEge051bWJlcn0uXG4vL1xuLy8gIyMjIyBgb25EaWRUZXJtaW5hdGVQZW5kaW5nU3RhdGUoY2FsbGJhY2spYFxuLy9cbi8vIElmIHRoZSB3b3Jrc3BhY2UgaXMgY29uZmlndXJlZCB0byB1c2UgKnBlbmRpbmcgcGFuZSBpdGVtcyosIHRoZSB3b3Jrc3BhY2Vcbi8vIHdpbGwgc3Vic2NyaWJlIHRvIHRoaXMgbWV0aG9kIHRvIHRlcm1pbmF0ZSB0aGUgcGVuZGluZyBzdGF0ZSBvZiB0aGUgaXRlbS5cbi8vIE11c3QgcmV0dXJuIGEge0Rpc3Bvc2FibGV9LlxuLy9cbi8vICMjIyMgYHNob3VsZFByb21wdFRvU2F2ZSgpYFxuLy9cbi8vIFRoaXMgbWV0aG9kIGluZGljYXRlcyB3aGV0aGVyIEF0b20gc2hvdWxkIHByb21wdCB0aGUgdXNlciB0byBzYXZlIHRoaXMgaXRlbVxuLy8gd2hlbiB0aGUgdXNlciBjbG9zZXMgb3IgcmVsb2FkcyB0aGUgd2luZG93LiBSZXR1cm5zIGEgYm9vbGVhbi5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgV29ya3NwYWNlIGV4dGVuZHMgTW9kZWwge1xuICBjb25zdHJ1Y3RvciAocGFyYW1zKSB7XG4gICAgc3VwZXIoLi4uYXJndW1lbnRzKVxuXG4gICAgdGhpcy51cGRhdGVXaW5kb3dUaXRsZSA9IHRoaXMudXBkYXRlV2luZG93VGl0bGUuYmluZCh0aGlzKVxuICAgIHRoaXMudXBkYXRlRG9jdW1lbnRFZGl0ZWQgPSB0aGlzLnVwZGF0ZURvY3VtZW50RWRpdGVkLmJpbmQodGhpcylcbiAgICB0aGlzLmRpZERlc3Ryb3lQYW5lSXRlbSA9IHRoaXMuZGlkRGVzdHJveVBhbmVJdGVtLmJpbmQodGhpcylcbiAgICB0aGlzLmRpZENoYW5nZUFjdGl2ZVBhbmVPblBhbmVDb250YWluZXIgPSB0aGlzLmRpZENoYW5nZUFjdGl2ZVBhbmVPblBhbmVDb250YWluZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuZGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW1PblBhbmVDb250YWluZXIgPSB0aGlzLmRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtT25QYW5lQ29udGFpbmVyLmJpbmQodGhpcylcbiAgICB0aGlzLmRpZEFjdGl2YXRlUGFuZUNvbnRhaW5lciA9IHRoaXMuZGlkQWN0aXZhdGVQYW5lQ29udGFpbmVyLmJpbmQodGhpcylcbiAgICB0aGlzLmRpZEhpZGVEb2NrID0gdGhpcy5kaWRIaWRlRG9jay5iaW5kKHRoaXMpXG5cbiAgICB0aGlzLmVuYWJsZVBlcnNpc3RlbmNlID0gcGFyYW1zLmVuYWJsZVBlcnNpc3RlbmNlXG4gICAgdGhpcy5wYWNrYWdlTWFuYWdlciA9IHBhcmFtcy5wYWNrYWdlTWFuYWdlclxuICAgIHRoaXMuY29uZmlnID0gcGFyYW1zLmNvbmZpZ1xuICAgIHRoaXMucHJvamVjdCA9IHBhcmFtcy5wcm9qZWN0XG4gICAgdGhpcy5ub3RpZmljYXRpb25NYW5hZ2VyID0gcGFyYW1zLm5vdGlmaWNhdGlvbk1hbmFnZXJcbiAgICB0aGlzLnZpZXdSZWdpc3RyeSA9IHBhcmFtcy52aWV3UmVnaXN0cnlcbiAgICB0aGlzLmdyYW1tYXJSZWdpc3RyeSA9IHBhcmFtcy5ncmFtbWFyUmVnaXN0cnlcbiAgICB0aGlzLmFwcGxpY2F0aW9uRGVsZWdhdGUgPSBwYXJhbXMuYXBwbGljYXRpb25EZWxlZ2F0ZVxuICAgIHRoaXMuYXNzZXJ0ID0gcGFyYW1zLmFzc2VydFxuICAgIHRoaXMuZGVzZXJpYWxpemVyTWFuYWdlciA9IHBhcmFtcy5kZXNlcmlhbGl6ZXJNYW5hZ2VyXG4gICAgdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkgPSBwYXJhbXMudGV4dEVkaXRvclJlZ2lzdHJ5XG4gICAgdGhpcy5zdHlsZU1hbmFnZXIgPSBwYXJhbXMuc3R5bGVNYW5hZ2VyXG4gICAgdGhpcy5kcmFnZ2luZ0l0ZW0gPSBmYWxzZVxuICAgIHRoaXMuaXRlbUxvY2F0aW9uU3RvcmUgPSBuZXcgU3RhdGVTdG9yZSgnQXRvbVByZXZpb3VzSXRlbUxvY2F0aW9ucycsIDEpXG5cbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5vcGVuZXJzID0gW11cbiAgICB0aGlzLmRlc3Ryb3llZEl0ZW1VUklzID0gW11cbiAgICB0aGlzLnN0b3BwZWRDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtVGltZW91dCA9IG51bGxcblxuICAgIHRoaXMuZGVmYXVsdERpcmVjdG9yeVNlYXJjaGVyID0gbmV3IERlZmF1bHREaXJlY3RvcnlTZWFyY2hlcigpXG4gICAgdGhpcy5jb25zdW1lU2VydmljZXModGhpcy5wYWNrYWdlTWFuYWdlcilcblxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMgPSB7XG4gICAgICBjZW50ZXI6IHRoaXMuY3JlYXRlQ2VudGVyKCksXG4gICAgICBsZWZ0OiB0aGlzLmNyZWF0ZURvY2soJ2xlZnQnKSxcbiAgICAgIHJpZ2h0OiB0aGlzLmNyZWF0ZURvY2soJ3JpZ2h0JyksXG4gICAgICBib3R0b206IHRoaXMuY3JlYXRlRG9jaygnYm90dG9tJylcbiAgICB9XG4gICAgdGhpcy5hY3RpdmVQYW5lQ29udGFpbmVyID0gdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXJcblxuICAgIHRoaXMucGFuZWxDb250YWluZXJzID0ge1xuICAgICAgdG9wOiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAndG9wJ30pLFxuICAgICAgbGVmdDogbmV3IFBhbmVsQ29udGFpbmVyKHt2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LCBsb2NhdGlvbjogJ2xlZnQnLCBkb2NrOiB0aGlzLnBhbmVDb250YWluZXJzLmxlZnR9KSxcbiAgICAgIHJpZ2h0OiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAncmlnaHQnLCBkb2NrOiB0aGlzLnBhbmVDb250YWluZXJzLnJpZ2h0fSksXG4gICAgICBib3R0b206IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdib3R0b20nLCBkb2NrOiB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbX0pLFxuICAgICAgaGVhZGVyOiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAnaGVhZGVyJ30pLFxuICAgICAgZm9vdGVyOiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAnZm9vdGVyJ30pLFxuICAgICAgbW9kYWw6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdtb2RhbCd9KVxuICAgIH1cblxuICAgIHRoaXMuc3Vic2NyaWJlVG9FdmVudHMoKVxuICB9XG5cbiAgZ2V0IHBhbmVDb250YWluZXIgKCkge1xuICAgIEdyaW0uZGVwcmVjYXRlKCdgYXRvbS53b3Jrc3BhY2UucGFuZUNvbnRhaW5lcmAgaGFzIGFsd2F5cyBiZWVuIHByaXZhdGUsIGJ1dCBpdCBpcyBub3cgZ29uZS4gUGxlYXNlIHVzZSBgYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKClgIGluc3RlYWQgYW5kIGNvbnN1bHQgdGhlIHdvcmtzcGFjZSBBUEkgZG9jcyBmb3IgcHVibGljIG1ldGhvZHMuJylcbiAgICByZXR1cm4gdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXIucGFuZUNvbnRhaW5lclxuICB9XG5cbiAgZ2V0RWxlbWVudCAoKSB7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudCA9IG5ldyBXb3Jrc3BhY2VFbGVtZW50KCkuaW5pdGlhbGl6ZSh0aGlzLCB7XG4gICAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICAgIHByb2plY3Q6IHRoaXMucHJvamVjdCxcbiAgICAgICAgdmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSxcbiAgICAgICAgc3R5bGVNYW5hZ2VyOiB0aGlzLnN0eWxlTWFuYWdlclxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFxuICB9XG5cbiAgY3JlYXRlQ2VudGVyICgpIHtcbiAgICByZXR1cm4gbmV3IFdvcmtzcGFjZUNlbnRlcih7XG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgYXBwbGljYXRpb25EZWxlZ2F0ZTogdGhpcy5hcHBsaWNhdGlvbkRlbGVnYXRlLFxuICAgICAgbm90aWZpY2F0aW9uTWFuYWdlcjogdGhpcy5ub3RpZmljYXRpb25NYW5hZ2VyLFxuICAgICAgZGVzZXJpYWxpemVyTWFuYWdlcjogdGhpcy5kZXNlcmlhbGl6ZXJNYW5hZ2VyLFxuICAgICAgdmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSxcbiAgICAgIGRpZEFjdGl2YXRlOiB0aGlzLmRpZEFjdGl2YXRlUGFuZUNvbnRhaW5lcixcbiAgICAgIGRpZENoYW5nZUFjdGl2ZVBhbmU6IHRoaXMuZGlkQ2hhbmdlQWN0aXZlUGFuZU9uUGFuZUNvbnRhaW5lcixcbiAgICAgIGRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtOiB0aGlzLmRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtT25QYW5lQ29udGFpbmVyLFxuICAgICAgZGlkRGVzdHJveVBhbmVJdGVtOiB0aGlzLmRpZERlc3Ryb3lQYW5lSXRlbVxuICAgIH0pXG4gIH1cblxuICBjcmVhdGVEb2NrIChsb2NhdGlvbikge1xuICAgIHJldHVybiBuZXcgRG9jayh7XG4gICAgICBsb2NhdGlvbixcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBhcHBsaWNhdGlvbkRlbGVnYXRlOiB0aGlzLmFwcGxpY2F0aW9uRGVsZWdhdGUsXG4gICAgICBkZXNlcmlhbGl6ZXJNYW5hZ2VyOiB0aGlzLmRlc2VyaWFsaXplck1hbmFnZXIsXG4gICAgICBub3RpZmljYXRpb25NYW5hZ2VyOiB0aGlzLm5vdGlmaWNhdGlvbk1hbmFnZXIsXG4gICAgICB2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LFxuICAgICAgZGlkSGlkZTogdGhpcy5kaWRIaWRlRG9jayxcbiAgICAgIGRpZEFjdGl2YXRlOiB0aGlzLmRpZEFjdGl2YXRlUGFuZUNvbnRhaW5lcixcbiAgICAgIGRpZENoYW5nZUFjdGl2ZVBhbmU6IHRoaXMuZGlkQ2hhbmdlQWN0aXZlUGFuZU9uUGFuZUNvbnRhaW5lcixcbiAgICAgIGRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtOiB0aGlzLmRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtT25QYW5lQ29udGFpbmVyLFxuICAgICAgZGlkRGVzdHJveVBhbmVJdGVtOiB0aGlzLmRpZERlc3Ryb3lQYW5lSXRlbVxuICAgIH0pXG4gIH1cblxuICByZXNldCAocGFja2FnZU1hbmFnZXIpIHtcbiAgICB0aGlzLnBhY2thZ2VNYW5hZ2VyID0gcGFja2FnZU1hbmFnZXJcbiAgICB0aGlzLmVtaXR0ZXIuZGlzcG9zZSgpXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuXG4gICAgdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXIuZGVzdHJveSgpXG4gICAgdGhpcy5wYW5lQ29udGFpbmVycy5sZWZ0LmRlc3Ryb3koKVxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHQuZGVzdHJveSgpXG4gICAgdGhpcy5wYW5lQ29udGFpbmVycy5ib3R0b20uZGVzdHJveSgpXG5cbiAgICBfLnZhbHVlcyh0aGlzLnBhbmVsQ29udGFpbmVycykuZm9yRWFjaChwYW5lbENvbnRhaW5lciA9PiB7IHBhbmVsQ29udGFpbmVyLmRlc3Ryb3koKSB9KVxuXG4gICAgdGhpcy5wYW5lQ29udGFpbmVycyA9IHtcbiAgICAgIGNlbnRlcjogdGhpcy5jcmVhdGVDZW50ZXIoKSxcbiAgICAgIGxlZnQ6IHRoaXMuY3JlYXRlRG9jaygnbGVmdCcpLFxuICAgICAgcmlnaHQ6IHRoaXMuY3JlYXRlRG9jaygncmlnaHQnKSxcbiAgICAgIGJvdHRvbTogdGhpcy5jcmVhdGVEb2NrKCdib3R0b20nKVxuICAgIH1cbiAgICB0aGlzLmFjdGl2ZVBhbmVDb250YWluZXIgPSB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlclxuXG4gICAgdGhpcy5wYW5lbENvbnRhaW5lcnMgPSB7XG4gICAgICB0b3A6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICd0b3AnfSksXG4gICAgICBsZWZ0OiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAnbGVmdCcsIGRvY2s6IHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdH0pLFxuICAgICAgcmlnaHQ6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdyaWdodCcsIGRvY2s6IHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHR9KSxcbiAgICAgIGJvdHRvbTogbmV3IFBhbmVsQ29udGFpbmVyKHt2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LCBsb2NhdGlvbjogJ2JvdHRvbScsIGRvY2s6IHRoaXMucGFuZUNvbnRhaW5lcnMuYm90dG9tfSksXG4gICAgICBoZWFkZXI6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdoZWFkZXInfSksXG4gICAgICBmb290ZXI6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdmb290ZXInfSksXG4gICAgICBtb2RhbDogbmV3IFBhbmVsQ29udGFpbmVyKHt2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LCBsb2NhdGlvbjogJ21vZGFsJ30pXG4gICAgfVxuXG4gICAgdGhpcy5vcmlnaW5hbEZvbnRTaXplID0gbnVsbFxuICAgIHRoaXMub3BlbmVycyA9IFtdXG4gICAgdGhpcy5kZXN0cm95ZWRJdGVtVVJJcyA9IFtdXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbFxuICAgIHRoaXMuY29uc3VtZVNlcnZpY2VzKHRoaXMucGFja2FnZU1hbmFnZXIpXG4gIH1cblxuICBzdWJzY3JpYmVUb0V2ZW50cyAoKSB7XG4gICAgdGhpcy5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHModGhpcy51cGRhdGVXaW5kb3dUaXRsZSlcbiAgICB0aGlzLnN1YnNjcmliZVRvRm9udFNpemUoKVxuICAgIHRoaXMuc3Vic2NyaWJlVG9BZGRlZEl0ZW1zKClcbiAgICB0aGlzLnN1YnNjcmliZVRvTW92ZWRJdGVtcygpXG4gIH1cblxuICBjb25zdW1lU2VydmljZXMgKHtzZXJ2aWNlSHVifSkge1xuICAgIHRoaXMuZGlyZWN0b3J5U2VhcmNoZXJzID0gW11cbiAgICBzZXJ2aWNlSHViLmNvbnN1bWUoXG4gICAgICAnYXRvbS5kaXJlY3Rvcnktc2VhcmNoZXInLFxuICAgICAgJ14wLjEuMCcsXG4gICAgICBwcm92aWRlciA9PiB0aGlzLmRpcmVjdG9yeVNlYXJjaGVycy51bnNoaWZ0KHByb3ZpZGVyKVxuICAgIClcbiAgfVxuXG4gIC8vIENhbGxlZCBieSB0aGUgU2VyaWFsaXphYmxlIG1peGluIGR1cmluZyBzZXJpYWxpemF0aW9uLlxuICBzZXJpYWxpemUgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdXb3Jrc3BhY2UnLFxuICAgICAgcGFja2FnZXNXaXRoQWN0aXZlR3JhbW1hcnM6IHRoaXMuZ2V0UGFja2FnZU5hbWVzV2l0aEFjdGl2ZUdyYW1tYXJzKCksXG4gICAgICBkZXN0cm95ZWRJdGVtVVJJczogdGhpcy5kZXN0cm95ZWRJdGVtVVJJcy5zbGljZSgpLFxuICAgICAgLy8gRW5zdXJlIGRlc2VyaWFsaXppbmcgMS4xNyBzdGF0ZSB3aXRoIHByZSAxLjE3IEF0b20gZG9lcyBub3QgZXJyb3JcbiAgICAgIC8vIFRPRE86IFJlbW92ZSBhZnRlciAxLjE3IGhhcyBiZWVuIG9uIHN0YWJsZSBmb3IgYSB3aGlsZVxuICAgICAgcGFuZUNvbnRhaW5lcjoge3ZlcnNpb246IDJ9LFxuICAgICAgcGFuZUNvbnRhaW5lcnM6IHtcbiAgICAgICAgY2VudGVyOiB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlci5zZXJpYWxpemUoKSxcbiAgICAgICAgbGVmdDogdGhpcy5wYW5lQ29udGFpbmVycy5sZWZ0LnNlcmlhbGl6ZSgpLFxuICAgICAgICByaWdodDogdGhpcy5wYW5lQ29udGFpbmVycy5yaWdodC5zZXJpYWxpemUoKSxcbiAgICAgICAgYm90dG9tOiB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbS5zZXJpYWxpemUoKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplIChzdGF0ZSwgZGVzZXJpYWxpemVyTWFuYWdlcikge1xuICAgIGNvbnN0IHBhY2thZ2VzV2l0aEFjdGl2ZUdyYW1tYXJzID1cbiAgICAgIHN0YXRlLnBhY2thZ2VzV2l0aEFjdGl2ZUdyYW1tYXJzICE9IG51bGwgPyBzdGF0ZS5wYWNrYWdlc1dpdGhBY3RpdmVHcmFtbWFycyA6IFtdXG4gICAgZm9yIChsZXQgcGFja2FnZU5hbWUgb2YgcGFja2FnZXNXaXRoQWN0aXZlR3JhbW1hcnMpIHtcbiAgICAgIGNvbnN0IHBrZyA9IHRoaXMucGFja2FnZU1hbmFnZXIuZ2V0TG9hZGVkUGFja2FnZShwYWNrYWdlTmFtZSlcbiAgICAgIGlmIChwa2cgIT0gbnVsbCkge1xuICAgICAgICBwa2cubG9hZEdyYW1tYXJzU3luYygpXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzdGF0ZS5kZXN0cm95ZWRJdGVtVVJJcyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmRlc3Ryb3llZEl0ZW1VUklzID0gc3RhdGUuZGVzdHJveWVkSXRlbVVSSXNcbiAgICB9XG5cbiAgICBpZiAoc3RhdGUucGFuZUNvbnRhaW5lcnMpIHtcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMuY2VudGVyLmRlc2VyaWFsaXplKHN0YXRlLnBhbmVDb250YWluZXJzLmNlbnRlciwgZGVzZXJpYWxpemVyTWFuYWdlcilcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdC5kZXNlcmlhbGl6ZShzdGF0ZS5wYW5lQ29udGFpbmVycy5sZWZ0LCBkZXNlcmlhbGl6ZXJNYW5hZ2VyKVxuICAgICAgdGhpcy5wYW5lQ29udGFpbmVycy5yaWdodC5kZXNlcmlhbGl6ZShzdGF0ZS5wYW5lQ29udGFpbmVycy5yaWdodCwgZGVzZXJpYWxpemVyTWFuYWdlcilcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMuYm90dG9tLmRlc2VyaWFsaXplKHN0YXRlLnBhbmVDb250YWluZXJzLmJvdHRvbSwgZGVzZXJpYWxpemVyTWFuYWdlcilcbiAgICB9IGVsc2UgaWYgKHN0YXRlLnBhbmVDb250YWluZXIpIHtcbiAgICAgIC8vIFRPRE86IFJlbW92ZSB0aGlzIGZhbGxiYWNrIG9uY2UgYSBsb3Qgb2YgdGltZSBoYXMgcGFzc2VkIHNpbmNlIDEuMTcgd2FzIHJlbGVhc2VkXG4gICAgICB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlci5kZXNlcmlhbGl6ZShzdGF0ZS5wYW5lQ29udGFpbmVyLCBkZXNlcmlhbGl6ZXJNYW5hZ2VyKVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlV2luZG93VGl0bGUoKVxuICB9XG5cbiAgZ2V0UGFja2FnZU5hbWVzV2l0aEFjdGl2ZUdyYW1tYXJzICgpIHtcbiAgICBjb25zdCBwYWNrYWdlTmFtZXMgPSBbXVxuICAgIGNvbnN0IGFkZEdyYW1tYXIgPSAoe2luY2x1ZGVkR3JhbW1hclNjb3BlcywgcGFja2FnZU5hbWV9ID0ge30pID0+IHtcbiAgICAgIGlmICghcGFja2FnZU5hbWUpIHsgcmV0dXJuIH1cbiAgICAgIC8vIFByZXZlbnQgY3ljbGVzXG4gICAgICBpZiAocGFja2FnZU5hbWVzLmluZGV4T2YocGFja2FnZU5hbWUpICE9PSAtMSkgeyByZXR1cm4gfVxuXG4gICAgICBwYWNrYWdlTmFtZXMucHVzaChwYWNrYWdlTmFtZSlcbiAgICAgIGZvciAobGV0IHNjb3BlTmFtZSBvZiBpbmNsdWRlZEdyYW1tYXJTY29wZXMgIT0gbnVsbCA/IGluY2x1ZGVkR3JhbW1hclNjb3BlcyA6IFtdKSB7XG4gICAgICAgIGFkZEdyYW1tYXIodGhpcy5ncmFtbWFyUmVnaXN0cnkuZ3JhbW1hckZvclNjb3BlTmFtZShzY29wZU5hbWUpKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGVkaXRvcnMgPSB0aGlzLmdldFRleHRFZGl0b3JzKClcbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgZWRpdG9ycykgeyBhZGRHcmFtbWFyKGVkaXRvci5nZXRHcmFtbWFyKCkpIH1cblxuICAgIGlmIChlZGl0b3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAobGV0IGdyYW1tYXIgb2YgdGhpcy5ncmFtbWFyUmVnaXN0cnkuZ2V0R3JhbW1hcnMoKSkge1xuICAgICAgICBpZiAoZ3JhbW1hci5pbmplY3Rpb25TZWxlY3Rvcikge1xuICAgICAgICAgIGFkZEdyYW1tYXIoZ3JhbW1hcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfLnVuaXEocGFja2FnZU5hbWVzKVxuICB9XG5cbiAgZGlkQWN0aXZhdGVQYW5lQ29udGFpbmVyIChwYW5lQ29udGFpbmVyKSB7XG4gICAgaWYgKHBhbmVDb250YWluZXIgIT09IHRoaXMuZ2V0QWN0aXZlUGFuZUNvbnRhaW5lcigpKSB7XG4gICAgICB0aGlzLmFjdGl2ZVBhbmVDb250YWluZXIgPSBwYW5lQ29udGFpbmVyXG4gICAgICB0aGlzLmRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKHRoaXMuYWN0aXZlUGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lSXRlbSgpKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtYWN0aXZlLXBhbmUtY29udGFpbmVyJywgdGhpcy5hY3RpdmVQYW5lQ29udGFpbmVyKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtYWN0aXZlLXBhbmUnLCB0aGlzLmFjdGl2ZVBhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtYWN0aXZlLXBhbmUtaXRlbScsIHRoaXMuYWN0aXZlUGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lSXRlbSgpKVxuICAgIH1cbiAgfVxuXG4gIGRpZENoYW5nZUFjdGl2ZVBhbmVPblBhbmVDb250YWluZXIgKHBhbmVDb250YWluZXIsIHBhbmUpIHtcbiAgICBpZiAocGFuZUNvbnRhaW5lciA9PT0gdGhpcy5nZXRBY3RpdmVQYW5lQ29udGFpbmVyKCkpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWFjdGl2ZS1wYW5lJywgcGFuZSlcbiAgICB9XG4gIH1cblxuICBkaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbU9uUGFuZUNvbnRhaW5lciAocGFuZUNvbnRhaW5lciwgaXRlbSkge1xuICAgIGlmIChwYW5lQ29udGFpbmVyID09PSB0aGlzLmdldEFjdGl2ZVBhbmVDb250YWluZXIoKSkge1xuICAgICAgdGhpcy5kaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShpdGVtKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtYWN0aXZlLXBhbmUtaXRlbScsIGl0ZW0pXG4gICAgfVxuICB9XG5cbiAgZGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pIHtcbiAgICB0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlKClcbiAgICB0aGlzLnVwZGF0ZURvY3VtZW50RWRpdGVkKClcbiAgICBpZiAodGhpcy5hY3RpdmVJdGVtU3Vic2NyaXB0aW9ucykgdGhpcy5hY3RpdmVJdGVtU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmFjdGl2ZUl0ZW1TdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgbGV0IG1vZGlmaWVkU3Vic2NyaXB0aW9uLCB0aXRsZVN1YnNjcmlwdGlvblxuXG4gICAgaWYgKGl0ZW0gIT0gbnVsbCAmJiB0eXBlb2YgaXRlbS5vbkRpZENoYW5nZVRpdGxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aXRsZVN1YnNjcmlwdGlvbiA9IGl0ZW0ub25EaWRDaGFuZ2VUaXRsZSh0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlKVxuICAgIH0gZWxzZSBpZiAoaXRlbSAhPSBudWxsICYmIHR5cGVvZiBpdGVtLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aXRsZVN1YnNjcmlwdGlvbiA9IGl0ZW0ub24oJ3RpdGxlLWNoYW5nZWQnLCB0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlKVxuICAgICAgaWYgKHRpdGxlU3Vic2NyaXB0aW9uID09IG51bGwgfHwgdHlwZW9mIHRpdGxlU3Vic2NyaXB0aW9uLmRpc3Bvc2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGl0bGVTdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgICAgaXRlbS5vZmYoJ3RpdGxlLWNoYW5nZWQnLCB0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpdGVtICE9IG51bGwgJiYgdHlwZW9mIGl0ZW0ub25EaWRDaGFuZ2VNb2RpZmllZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbW9kaWZpZWRTdWJzY3JpcHRpb24gPSBpdGVtLm9uRGlkQ2hhbmdlTW9kaWZpZWQodGhpcy51cGRhdGVEb2N1bWVudEVkaXRlZClcbiAgICB9IGVsc2UgaWYgKGl0ZW0gIT0gbnVsbCAmJiB0eXBlb2YgaXRlbS5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbW9kaWZpZWRTdWJzY3JpcHRpb24gPSBpdGVtLm9uKCdtb2RpZmllZC1zdGF0dXMtY2hhbmdlZCcsIHRoaXMudXBkYXRlRG9jdW1lbnRFZGl0ZWQpXG4gICAgICBpZiAobW9kaWZpZWRTdWJzY3JpcHRpb24gPT0gbnVsbCB8fCB0eXBlb2YgbW9kaWZpZWRTdWJzY3JpcHRpb24uZGlzcG9zZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtb2RpZmllZFN1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgICBpdGVtLm9mZignbW9kaWZpZWQtc3RhdHVzLWNoYW5nZWQnLCB0aGlzLnVwZGF0ZURvY3VtZW50RWRpdGVkKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aXRsZVN1YnNjcmlwdGlvbiAhPSBudWxsKSB7IHRoaXMuYWN0aXZlSXRlbVN1YnNjcmlwdGlvbnMuYWRkKHRpdGxlU3Vic2NyaXB0aW9uKSB9XG4gICAgaWYgKG1vZGlmaWVkU3Vic2NyaXB0aW9uICE9IG51bGwpIHsgdGhpcy5hY3RpdmVJdGVtU3Vic2NyaXB0aW9ucy5hZGQobW9kaWZpZWRTdWJzY3JpcHRpb24pIH1cblxuICAgIHRoaXMuY2FuY2VsU3RvcHBlZENoYW5naW5nQWN0aXZlUGFuZUl0ZW1UaW1lb3V0KClcbiAgICB0aGlzLnN0b3BwZWRDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5zdG9wcGVkQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbVRpbWVvdXQgPSBudWxsXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXN0b3AtY2hhbmdpbmctYWN0aXZlLXBhbmUtaXRlbScsIGl0ZW0pXG4gICAgfSwgU1RPUFBFRF9DSEFOR0lOR19BQ1RJVkVfUEFORV9JVEVNX0RFTEFZKVxuICB9XG5cbiAgY2FuY2VsU3RvcHBlZENoYW5naW5nQWN0aXZlUGFuZUl0ZW1UaW1lb3V0ICgpIHtcbiAgICBpZiAodGhpcy5zdG9wcGVkQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbVRpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3RvcHBlZENoYW5naW5nQWN0aXZlUGFuZUl0ZW1UaW1lb3V0KVxuICAgIH1cbiAgfVxuXG4gIGRpZEhpZGVEb2NrICgpIHtcbiAgICB0aGlzLmdldENlbnRlcigpLmFjdGl2YXRlKClcbiAgfVxuXG4gIHNldERyYWdnaW5nSXRlbSAoZHJhZ2dpbmdJdGVtKSB7XG4gICAgXy52YWx1ZXModGhpcy5wYW5lQ29udGFpbmVycykuZm9yRWFjaChkb2NrID0+IHtcbiAgICAgIGRvY2suc2V0RHJhZ2dpbmdJdGVtKGRyYWdnaW5nSXRlbSlcbiAgICB9KVxuICB9XG5cbiAgc3Vic2NyaWJlVG9BZGRlZEl0ZW1zICgpIHtcbiAgICB0aGlzLm9uRGlkQWRkUGFuZUl0ZW0oKHtpdGVtLCBwYW5lLCBpbmRleH0pID0+IHtcbiAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvcikge1xuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAgICAgdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkuYWRkKGl0ZW0pLFxuICAgICAgICAgIHRoaXMudGV4dEVkaXRvclJlZ2lzdHJ5Lm1haW50YWluR3JhbW1hcihpdGVtKSxcbiAgICAgICAgICB0aGlzLnRleHRFZGl0b3JSZWdpc3RyeS5tYWludGFpbkNvbmZpZyhpdGVtKSxcbiAgICAgICAgICBpdGVtLm9ic2VydmVHcmFtbWFyKHRoaXMuaGFuZGxlR3JhbW1hclVzZWQuYmluZCh0aGlzKSlcbiAgICAgICAgKVxuICAgICAgICBpdGVtLm9uRGlkRGVzdHJveSgoKSA9PiB7IHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpIH0pXG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtYWRkLXRleHQtZWRpdG9yJywge3RleHRFZGl0b3I6IGl0ZW0sIHBhbmUsIGluZGV4fSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgc3Vic2NyaWJlVG9Nb3ZlZEl0ZW1zICgpIHtcbiAgICBmb3IgKGNvbnN0IHBhbmVDb250YWluZXIgb2YgdGhpcy5nZXRQYW5lQ29udGFpbmVycygpKSB7XG4gICAgICBwYW5lQ29udGFpbmVyLm9ic2VydmVQYW5lcyhwYW5lID0+IHtcbiAgICAgICAgcGFuZS5vbkRpZEFkZEl0ZW0oKHtpdGVtfSkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaXRlbS5nZXRVUkkgPT09ICdmdW5jdGlvbicgJiYgdGhpcy5lbmFibGVQZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgY29uc3QgdXJpID0gaXRlbS5nZXRVUkkoKVxuICAgICAgICAgICAgaWYgKHVyaSkge1xuICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHBhbmVDb250YWluZXIuZ2V0TG9jYXRpb24oKVxuICAgICAgICAgICAgICBsZXQgZGVmYXVsdExvY2F0aW9uXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbS5nZXREZWZhdWx0TG9jYXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0TG9jYXRpb24gPSBpdGVtLmdldERlZmF1bHRMb2NhdGlvbigpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZGVmYXVsdExvY2F0aW9uID0gZGVmYXVsdExvY2F0aW9uIHx8ICdjZW50ZXInXG4gICAgICAgICAgICAgIGlmIChsb2NhdGlvbiA9PT0gZGVmYXVsdExvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtTG9jYXRpb25TdG9yZS5kZWxldGUoaXRlbS5nZXRVUkkoKSlcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1Mb2NhdGlvblN0b3JlLnNhdmUoaXRlbS5nZXRVUkkoKSwgbG9jYXRpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8vIFVwZGF0ZXMgdGhlIGFwcGxpY2F0aW9uJ3MgdGl0bGUgYW5kIHByb3h5IGljb24gYmFzZWQgb24gd2hpY2hldmVyIGZpbGUgaXNcbiAgLy8gb3Blbi5cbiAgdXBkYXRlV2luZG93VGl0bGUgKCkge1xuICAgIGxldCBpdGVtUGF0aCwgaXRlbVRpdGxlLCBwcm9qZWN0UGF0aCwgcmVwcmVzZW50ZWRQYXRoXG4gICAgY29uc3QgYXBwTmFtZSA9ICdBdG9tJ1xuICAgIGNvbnN0IGxlZnQgPSB0aGlzLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgIGNvbnN0IHByb2plY3RQYXRocyA9IGxlZnQgIT0gbnVsbCA/IGxlZnQgOiBbXVxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdldEFjdGl2ZVBhbmVJdGVtKClcbiAgICBpZiAoaXRlbSkge1xuICAgICAgaXRlbVBhdGggPSB0eXBlb2YgaXRlbS5nZXRQYXRoID09PSAnZnVuY3Rpb24nID8gaXRlbS5nZXRQYXRoKCkgOiB1bmRlZmluZWRcbiAgICAgIGNvbnN0IGxvbmdUaXRsZSA9IHR5cGVvZiBpdGVtLmdldExvbmdUaXRsZSA9PT0gJ2Z1bmN0aW9uJyA/IGl0ZW0uZ2V0TG9uZ1RpdGxlKCkgOiB1bmRlZmluZWRcbiAgICAgIGl0ZW1UaXRsZSA9IGxvbmdUaXRsZSA9PSBudWxsXG4gICAgICAgID8gKHR5cGVvZiBpdGVtLmdldFRpdGxlID09PSAnZnVuY3Rpb24nID8gaXRlbS5nZXRUaXRsZSgpIDogdW5kZWZpbmVkKVxuICAgICAgICA6IGxvbmdUaXRsZVxuICAgICAgcHJvamVjdFBhdGggPSBfLmZpbmQoXG4gICAgICAgIHByb2plY3RQYXRocyxcbiAgICAgICAgcHJvamVjdFBhdGggPT5cbiAgICAgICAgICAoaXRlbVBhdGggPT09IHByb2plY3RQYXRoKSB8fCAoaXRlbVBhdGggIT0gbnVsbCA/IGl0ZW1QYXRoLnN0YXJ0c1dpdGgocHJvamVjdFBhdGggKyBwYXRoLnNlcCkgOiB1bmRlZmluZWQpXG4gICAgICApXG4gICAgfVxuICAgIGlmIChpdGVtVGl0bGUgPT0gbnVsbCkgeyBpdGVtVGl0bGUgPSAndW50aXRsZWQnIH1cbiAgICBpZiAocHJvamVjdFBhdGggPT0gbnVsbCkgeyBwcm9qZWN0UGF0aCA9IGl0ZW1QYXRoID8gcGF0aC5kaXJuYW1lKGl0ZW1QYXRoKSA6IHByb2plY3RQYXRoc1swXSB9XG4gICAgaWYgKHByb2plY3RQYXRoICE9IG51bGwpIHtcbiAgICAgIHByb2plY3RQYXRoID0gZnMudGlsZGlmeShwcm9qZWN0UGF0aClcbiAgICB9XG5cbiAgICBjb25zdCB0aXRsZVBhcnRzID0gW11cbiAgICBpZiAoKGl0ZW0gIT0gbnVsbCkgJiYgKHByb2plY3RQYXRoICE9IG51bGwpKSB7XG4gICAgICB0aXRsZVBhcnRzLnB1c2goaXRlbVRpdGxlLCBwcm9qZWN0UGF0aClcbiAgICAgIHJlcHJlc2VudGVkUGF0aCA9IGl0ZW1QYXRoICE9IG51bGwgPyBpdGVtUGF0aCA6IHByb2plY3RQYXRoXG4gICAgfSBlbHNlIGlmIChwcm9qZWN0UGF0aCAhPSBudWxsKSB7XG4gICAgICB0aXRsZVBhcnRzLnB1c2gocHJvamVjdFBhdGgpXG4gICAgICByZXByZXNlbnRlZFBhdGggPSBwcm9qZWN0UGF0aFxuICAgIH0gZWxzZSB7XG4gICAgICB0aXRsZVBhcnRzLnB1c2goaXRlbVRpdGxlKVxuICAgICAgcmVwcmVzZW50ZWRQYXRoID0gJydcbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ2RhcndpbicpIHtcbiAgICAgIHRpdGxlUGFydHMucHVzaChhcHBOYW1lKVxuICAgIH1cblxuICAgIGRvY3VtZW50LnRpdGxlID0gdGl0bGVQYXJ0cy5qb2luKCcgXFx1MjAxNCAnKVxuICAgIHRoaXMuYXBwbGljYXRpb25EZWxlZ2F0ZS5zZXRSZXByZXNlbnRlZEZpbGVuYW1lKHJlcHJlc2VudGVkUGF0aClcbiAgfVxuXG4gIC8vIE9uIG1hY09TLCBmYWRlcyB0aGUgYXBwbGljYXRpb24gd2luZG93J3MgcHJveHkgaWNvbiB3aGVuIHRoZSBjdXJyZW50IGZpbGVcbiAgLy8gaGFzIGJlZW4gbW9kaWZpZWQuXG4gIHVwZGF0ZURvY3VtZW50RWRpdGVkICgpIHtcbiAgICBjb25zdCBhY3RpdmVQYW5lSXRlbSA9IHRoaXMuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgIGNvbnN0IG1vZGlmaWVkID0gYWN0aXZlUGFuZUl0ZW0gIT0gbnVsbCAmJiB0eXBlb2YgYWN0aXZlUGFuZUl0ZW0uaXNNb2RpZmllZCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBhY3RpdmVQYW5lSXRlbS5pc01vZGlmaWVkKCkgfHwgZmFsc2VcbiAgICAgIDogZmFsc2VcbiAgICB0aGlzLmFwcGxpY2F0aW9uRGVsZWdhdGUuc2V0V2luZG93RG9jdW1lbnRFZGl0ZWQobW9kaWZpZWQpXG4gIH1cblxuICAvKlxuICBTZWN0aW9uOiBFdmVudCBTdWJzY3JpcHRpb25cbiAgKi9cblxuICBvbkRpZENoYW5nZUFjdGl2ZVBhbmVDb250YWluZXIgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1hY3RpdmUtcGFuZS1jb250YWluZXInLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aXRoIGFsbCBjdXJyZW50IGFuZCBmdXR1cmUgdGV4dFxuICAvLyBlZGl0b3JzIGluIHRoZSB3b3Jrc3BhY2UuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aXRoIGN1cnJlbnQgYW5kIGZ1dHVyZSB0ZXh0IGVkaXRvcnMuXG4gIC8vICAgKiBgZWRpdG9yYCBBbiB7VGV4dEVkaXRvcn0gdGhhdCBpcyBwcmVzZW50IGluIHs6OmdldFRleHRFZGl0b3JzfSBhdCB0aGUgdGltZVxuICAvLyAgICAgb2Ygc3Vic2NyaXB0aW9uIG9yIHRoYXQgaXMgYWRkZWQgYXQgc29tZSBsYXRlciB0aW1lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvYnNlcnZlVGV4dEVkaXRvcnMgKGNhbGxiYWNrKSB7XG4gICAgZm9yIChsZXQgdGV4dEVkaXRvciBvZiB0aGlzLmdldFRleHRFZGl0b3JzKCkpIHsgY2FsbGJhY2sodGV4dEVkaXRvcikgfVxuICAgIHJldHVybiB0aGlzLm9uRGlkQWRkVGV4dEVkaXRvcigoe3RleHRFZGl0b3J9KSA9PiBjYWxsYmFjayh0ZXh0RWRpdG9yKSlcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aXRoIGFsbCBjdXJyZW50IGFuZCBmdXR1cmUgcGFuZXMgaXRlbXNcbiAgLy8gaW4gdGhlIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdpdGggY3VycmVudCBhbmQgZnV0dXJlIHBhbmUgaXRlbXMuXG4gIC8vICAgKiBgaXRlbWAgQW4gaXRlbSB0aGF0IGlzIHByZXNlbnQgaW4gezo6Z2V0UGFuZUl0ZW1zfSBhdCB0aGUgdGltZSBvZlxuICAvLyAgICAgIHN1YnNjcmlwdGlvbiBvciB0aGF0IGlzIGFkZGVkIGF0IHNvbWUgbGF0ZXIgdGltZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZVBhbmVJdGVtcyAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAuLi50aGlzLmdldFBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIub2JzZXJ2ZVBhbmVJdGVtcyhjYWxsYmFjaykpXG4gICAgKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gY2hhbmdlcy5cbiAgLy9cbiAgLy8gQmVjYXVzZSBvYnNlcnZlcnMgYXJlIGludm9rZWQgc3luY2hyb25vdXNseSwgaXQncyBpbXBvcnRhbnQgbm90IHRvIHBlcmZvcm1cbiAgLy8gYW55IGV4cGVuc2l2ZSBvcGVyYXRpb25zIHZpYSB0aGlzIG1ldGhvZC4gQ29uc2lkZXJcbiAgLy8gezo6b25EaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbX0gdG8gZGVsYXkgb3BlcmF0aW9ucyB1bnRpbCBhZnRlciBjaGFuZ2VzXG4gIC8vIHN0b3Agb2NjdXJyaW5nLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYWN0aXZlIHBhbmUgaXRlbSBjaGFuZ2VzLlxuICAvLyAgICogYGl0ZW1gIFRoZSBhY3RpdmUgcGFuZSBpdGVtLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtYWN0aXZlLXBhbmUtaXRlbScsIGNhbGxiYWNrKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gc3RvcHNcbiAgLy8gY2hhbmdpbmcuXG4gIC8vXG4gIC8vIE9ic2VydmVycyBhcmUgY2FsbGVkIGFzeW5jaHJvbm91c2x5IDEwMG1zIGFmdGVyIHRoZSBsYXN0IGFjdGl2ZSBwYW5lIGl0ZW1cbiAgLy8gY2hhbmdlLiBIYW5kbGluZyBjaGFuZ2VzIGhlcmUgcmF0aGVyIHRoYW4gaW4gdGhlIHN5bmNocm9ub3VzXG4gIC8vIHs6Om9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW19IHByZXZlbnRzIHVubmVlZGVkIHdvcmsgaWYgdGhlIHVzZXIgaXMgcXVpY2tseVxuICAvLyBjaGFuZ2luZyBvciBjbG9zaW5nIHRhYnMgYW5kIGVuc3VyZXMgY3JpdGljYWwgVUkgZmVlZGJhY2ssIGxpa2UgY2hhbmdpbmcgdGhlXG4gIC8vIGhpZ2hsaWdodGVkIHRhYiwgZ2V0cyBwcmlvcml0eSBvdmVyIHdvcmsgdGhhdCBjYW4gYmUgZG9uZSBhc3luY2hyb25vdXNseS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gc3RvcHRzXG4gIC8vICAgY2hhbmdpbmcuXG4gIC8vICAgKiBgaXRlbWAgVGhlIGFjdGl2ZSBwYW5lIGl0ZW0uXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXN0b3AtY2hhbmdpbmctYWN0aXZlLXBhbmUtaXRlbScsIGNhbGxiYWNrKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdpdGggdGhlIGN1cnJlbnQgYWN0aXZlIHBhbmUgaXRlbSBhbmRcbiAgLy8gd2l0aCBhbGwgZnV0dXJlIGFjdGl2ZSBwYW5lIGl0ZW1zIGluIHRoZSB3b3Jrc3BhY2UuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGNoYW5nZXMuXG4gIC8vICAgKiBgaXRlbWAgVGhlIGN1cnJlbnQgYWN0aXZlIHBhbmUgaXRlbS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtIChjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrKHRoaXMuZ2V0QWN0aXZlUGFuZUl0ZW0oKSlcbiAgICByZXR1cm4gdGhpcy5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKGNhbGxiYWNrKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW5ldmVyIGFuIGl0ZW0gaXMgb3BlbmVkLiBVbmxpa2VcbiAgLy8gezo6b25EaWRBZGRQYW5lSXRlbX0sIG9ic2VydmVycyB3aWxsIGJlIG5vdGlmaWVkIGZvciBpdGVtcyB0aGF0IGFyZSBhbHJlYWR5XG4gIC8vIHByZXNlbnQgaW4gdGhlIHdvcmtzcGFjZSB3aGVuIHRoZXkgYXJlIHJlb3BlbmVkLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbmV2ZXIgYW4gaXRlbSBpcyBvcGVuZWQuXG4gIC8vICAgKiBgZXZlbnRgIHtPYmplY3R9IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzOlxuICAvLyAgICAgKiBgdXJpYCB7U3RyaW5nfSByZXByZXNlbnRpbmcgdGhlIG9wZW5lZCBVUkkuIENvdWxkIGJlIGB1bmRlZmluZWRgLlxuICAvLyAgICAgKiBgaXRlbWAgVGhlIG9wZW5lZCBpdGVtLlxuICAvLyAgICAgKiBgcGFuZWAgVGhlIHBhbmUgaW4gd2hpY2ggdGhlIGl0ZW0gd2FzIG9wZW5lZC5cbiAgLy8gICAgICogYGluZGV4YCBUaGUgaW5kZXggb2YgdGhlIG9wZW5lZCBpdGVtIG9uIGl0cyBwYW5lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZE9wZW4gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLW9wZW4nLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gYSBwYW5lIGlzIGFkZGVkIHRvIHRoZSB3b3Jrc3BhY2UuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCBwYW5lcyBhcmUgYWRkZWQuXG4gIC8vICAgKiBgZXZlbnRgIHtPYmplY3R9IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzOlxuICAvLyAgICAgKiBgcGFuZWAgVGhlIGFkZGVkIHBhbmUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkQWRkUGFuZSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAuLi50aGlzLmdldFBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIub25EaWRBZGRQYW5lKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayBiZWZvcmUgYSBwYW5lIGlzIGRlc3Ryb3llZCBpbiB0aGVcbiAgLy8gd29ya3NwYWNlLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgYmVmb3JlIHBhbmVzIGFyZSBkZXN0cm95ZWQuXG4gIC8vICAgKiBgZXZlbnRgIHtPYmplY3R9IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzOlxuICAvLyAgICAgKiBgcGFuZWAgVGhlIHBhbmUgdG8gYmUgZGVzdHJveWVkLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbldpbGxEZXN0cm95UGFuZSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAuLi50aGlzLmdldFBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIub25XaWxsRGVzdHJveVBhbmUoY2FsbGJhY2spKVxuICAgIClcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gYSBwYW5lIGlzIGRlc3Ryb3llZCBpbiB0aGVcbiAgLy8gd29ya3NwYWNlLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgcGFuZXMgYXJlIGRlc3Ryb3llZC5cbiAgLy8gICAqIGBldmVudGAge09iamVjdH0gd2l0aCB0aGUgZm9sbG93aW5nIGtleXM6XG4gIC8vICAgICAqIGBwYW5lYCBUaGUgZGVzdHJveWVkIHBhbmUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkRGVzdHJveVBhbmUgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9uRGlkRGVzdHJveVBhbmUoY2FsbGJhY2spKVxuICAgIClcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdpdGggYWxsIGN1cnJlbnQgYW5kIGZ1dHVyZSBwYW5lcyBpbiB0aGVcbiAgLy8gd29ya3NwYWNlLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2l0aCBjdXJyZW50IGFuZCBmdXR1cmUgcGFuZXMuXG4gIC8vICAgKiBgcGFuZWAgQSB7UGFuZX0gdGhhdCBpcyBwcmVzZW50IGluIHs6OmdldFBhbmVzfSBhdCB0aGUgdGltZSBvZlxuICAvLyAgICAgIHN1YnNjcmlwdGlvbiBvciB0aGF0IGlzIGFkZGVkIGF0IHNvbWUgbGF0ZXIgdGltZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZVBhbmVzIChjYWxsYmFjaykge1xuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIC4uLnRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5tYXAoY29udGFpbmVyID0+IGNvbnRhaW5lci5vYnNlcnZlUGFuZXMoY2FsbGJhY2spKVxuICAgIClcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gdGhlIGFjdGl2ZSBwYW5lIGNoYW5nZXMuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhY3RpdmUgcGFuZSBjaGFuZ2VzLlxuICAvLyAgICogYHBhbmVgIEEge1BhbmV9IHRoYXQgaXMgdGhlIGN1cnJlbnQgcmV0dXJuIHZhbHVlIG9mIHs6OmdldEFjdGl2ZVBhbmV9LlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZENoYW5nZUFjdGl2ZVBhbmUgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1hY3RpdmUtcGFuZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2l0aCB0aGUgY3VycmVudCBhY3RpdmUgcGFuZSBhbmQgd2hlblxuICAvLyB0aGUgYWN0aXZlIHBhbmUgY2hhbmdlcy5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdpdGggdGhlIGN1cnJlbnQgYW5kIGZ1dHVyZSBhY3RpdmUjXG4gIC8vICAgcGFuZXMuXG4gIC8vICAgKiBgcGFuZWAgQSB7UGFuZX0gdGhhdCBpcyB0aGUgY3VycmVudCByZXR1cm4gdmFsdWUgb2Ygezo6Z2V0QWN0aXZlUGFuZX0uXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9ic2VydmVBY3RpdmVQYW5lIChjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrKHRoaXMuZ2V0QWN0aXZlUGFuZSgpKVxuICAgIHJldHVybiB0aGlzLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZShjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gYSBwYW5lIGl0ZW0gaXMgYWRkZWQgdG8gdGhlXG4gIC8vIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gcGFuZSBpdGVtcyBhcmUgYWRkZWQuXG4gIC8vICAgKiBgZXZlbnRgIHtPYmplY3R9IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzOlxuICAvLyAgICAgKiBgaXRlbWAgVGhlIGFkZGVkIHBhbmUgaXRlbS5cbiAgLy8gICAgICogYHBhbmVgIHtQYW5lfSBjb250YWluaW5nIHRoZSBhZGRlZCBpdGVtLlxuICAvLyAgICAgKiBgaW5kZXhgIHtOdW1iZXJ9IGluZGljYXRpbmcgdGhlIGluZGV4IG9mIHRoZSBhZGRlZCBpdGVtIGluIGl0cyBwYW5lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZEFkZFBhbmVJdGVtIChjYWxsYmFjaykge1xuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIC4uLnRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5tYXAoY29udGFpbmVyID0+IGNvbnRhaW5lci5vbkRpZEFkZFBhbmVJdGVtKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIGEgcGFuZSBpdGVtIGlzIGFib3V0IHRvIGJlXG4gIC8vIGRlc3Ryb3llZCwgYmVmb3JlIHRoZSB1c2VyIGlzIHByb21wdGVkIHRvIHNhdmUgaXQuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCBiZWZvcmUgcGFuZSBpdGVtcyBhcmUgZGVzdHJveWVkLlxuICAvLyAgICogYGV2ZW50YCB7T2JqZWN0fSB3aXRoIHRoZSBmb2xsb3dpbmcga2V5czpcbiAgLy8gICAgICogYGl0ZW1gIFRoZSBpdGVtIHRvIGJlIGRlc3Ryb3llZC5cbiAgLy8gICAgICogYHBhbmVgIHtQYW5lfSBjb250YWluaW5nIHRoZSBpdGVtIHRvIGJlIGRlc3Ryb3llZC5cbiAgLy8gICAgICogYGluZGV4YCB7TnVtYmVyfSBpbmRpY2F0aW5nIHRoZSBpbmRleCBvZiB0aGUgaXRlbSB0byBiZSBkZXN0cm95ZWQgaW5cbiAgLy8gICAgICAgaXRzIHBhbmUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbldpbGxEZXN0cm95UGFuZUl0ZW0gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9uV2lsbERlc3Ryb3lQYW5lSXRlbShjYWxsYmFjaykpXG4gICAgKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2hlbiBhIHBhbmUgaXRlbSBpcyBkZXN0cm95ZWQuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHBhbmUgaXRlbXMgYXJlIGRlc3Ryb3llZC5cbiAgLy8gICAqIGBldmVudGAge09iamVjdH0gd2l0aCB0aGUgZm9sbG93aW5nIGtleXM6XG4gIC8vICAgICAqIGBpdGVtYCBUaGUgZGVzdHJveWVkIGl0ZW0uXG4gIC8vICAgICAqIGBwYW5lYCB7UGFuZX0gY29udGFpbmluZyB0aGUgZGVzdHJveWVkIGl0ZW0uXG4gIC8vICAgICAqIGBpbmRleGAge051bWJlcn0gaW5kaWNhdGluZyB0aGUgaW5kZXggb2YgdGhlIGRlc3Ryb3llZCBpdGVtIGluIGl0c1xuICAvLyAgICAgICBwYW5lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWREZXN0cm95UGFuZUl0ZW0gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9uRGlkRGVzdHJveVBhbmVJdGVtKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIGEgdGV4dCBlZGl0b3IgaXMgYWRkZWQgdG8gdGhlXG4gIC8vIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHBhbmVzIGFyZSBhZGRlZC5cbiAgLy8gICAqIGBldmVudGAge09iamVjdH0gd2l0aCB0aGUgZm9sbG93aW5nIGtleXM6XG4gIC8vICAgICAqIGB0ZXh0RWRpdG9yYCB7VGV4dEVkaXRvcn0gdGhhdCB3YXMgYWRkZWQuXG4gIC8vICAgICAqIGBwYW5lYCB7UGFuZX0gY29udGFpbmluZyB0aGUgYWRkZWQgdGV4dCBlZGl0b3IuXG4gIC8vICAgICAqIGBpbmRleGAge051bWJlcn0gaW5kaWNhdGluZyB0aGUgaW5kZXggb2YgdGhlIGFkZGVkIHRleHQgZWRpdG9yIGluIGl0c1xuICAvLyAgICAgICAgcGFuZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRBZGRUZXh0RWRpdG9yIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1hZGQtdGV4dC1lZGl0b3InLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IE9wZW5pbmdcbiAgKi9cblxuICAvLyBFc3NlbnRpYWw6IE9wZW5zIHRoZSBnaXZlbiBVUkkgaW4gQXRvbSBhc3luY2hyb25vdXNseS5cbiAgLy8gSWYgdGhlIFVSSSBpcyBhbHJlYWR5IG9wZW4sIHRoZSBleGlzdGluZyBpdGVtIGZvciB0aGF0IFVSSSB3aWxsIGJlXG4gIC8vIGFjdGl2YXRlZC4gSWYgbm8gVVJJIGlzIGdpdmVuLCBvciBubyByZWdpc3RlcmVkIG9wZW5lciBjYW4gb3BlblxuICAvLyB0aGUgVVJJLCBhIG5ldyBlbXB0eSB7VGV4dEVkaXRvcn0gd2lsbCBiZSBjcmVhdGVkLlxuICAvL1xuICAvLyAqIGB1cmlgIChvcHRpb25hbCkgQSB7U3RyaW5nfSBjb250YWluaW5nIGEgVVJJLlxuICAvLyAqIGBvcHRpb25zYCAob3B0aW9uYWwpIHtPYmplY3R9XG4gIC8vICAgKiBgaW5pdGlhbExpbmVgIEEge051bWJlcn0gaW5kaWNhdGluZyB3aGljaCByb3cgdG8gbW92ZSB0aGUgY3Vyc29yIHRvXG4gIC8vICAgICBpbml0aWFsbHkuIERlZmF1bHRzIHRvIGAwYC5cbiAgLy8gICAqIGBpbml0aWFsQ29sdW1uYCBBIHtOdW1iZXJ9IGluZGljYXRpbmcgd2hpY2ggY29sdW1uIHRvIG1vdmUgdGhlIGN1cnNvciB0b1xuICAvLyAgICAgaW5pdGlhbGx5LiBEZWZhdWx0cyB0byBgMGAuXG4gIC8vICAgKiBgc3BsaXRgIEVpdGhlciAnbGVmdCcsICdyaWdodCcsICd1cCcgb3IgJ2Rvd24nLlxuICAvLyAgICAgSWYgJ2xlZnQnLCB0aGUgaXRlbSB3aWxsIGJlIG9wZW5lZCBpbiBsZWZ0bW9zdCBwYW5lIG9mIHRoZSBjdXJyZW50IGFjdGl2ZSBwYW5lJ3Mgcm93LlxuICAvLyAgICAgSWYgJ3JpZ2h0JywgdGhlIGl0ZW0gd2lsbCBiZSBvcGVuZWQgaW4gdGhlIHJpZ2h0bW9zdCBwYW5lIG9mIHRoZSBjdXJyZW50IGFjdGl2ZSBwYW5lJ3Mgcm93LiBJZiBvbmx5IG9uZSBwYW5lIGV4aXN0cyBpbiB0aGUgcm93LCBhIG5ldyBwYW5lIHdpbGwgYmUgY3JlYXRlZC5cbiAgLy8gICAgIElmICd1cCcsIHRoZSBpdGVtIHdpbGwgYmUgb3BlbmVkIGluIHRvcG1vc3QgcGFuZSBvZiB0aGUgY3VycmVudCBhY3RpdmUgcGFuZSdzIGNvbHVtbi5cbiAgLy8gICAgIElmICdkb3duJywgdGhlIGl0ZW0gd2lsbCBiZSBvcGVuZWQgaW4gdGhlIGJvdHRvbW1vc3QgcGFuZSBvZiB0aGUgY3VycmVudCBhY3RpdmUgcGFuZSdzIGNvbHVtbi4gSWYgb25seSBvbmUgcGFuZSBleGlzdHMgaW4gdGhlIGNvbHVtbiwgYSBuZXcgcGFuZSB3aWxsIGJlIGNyZWF0ZWQuXG4gIC8vICAgKiBgYWN0aXZhdGVQYW5lYCBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gY2FsbCB7UGFuZTo6YWN0aXZhdGV9IG9uXG4gIC8vICAgICBjb250YWluaW5nIHBhbmUuIERlZmF1bHRzIHRvIGB0cnVlYC5cbiAgLy8gICAqIGBhY3RpdmF0ZUl0ZW1gIEEge0Jvb2xlYW59IGluZGljYXRpbmcgd2hldGhlciB0byBjYWxsIHtQYW5lOjphY3RpdmF0ZUl0ZW19XG4gIC8vICAgICBvbiBjb250YWluaW5nIHBhbmUuIERlZmF1bHRzIHRvIGB0cnVlYC5cbiAgLy8gICAqIGBwZW5kaW5nYCBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IHRoZSBpdGVtIHNob3VsZCBiZSBvcGVuZWRcbiAgLy8gICAgIGluIGEgcGVuZGluZyBzdGF0ZS4gRXhpc3RpbmcgcGVuZGluZyBpdGVtcyBpbiBhIHBhbmUgYXJlIHJlcGxhY2VkIHdpdGhcbiAgLy8gICAgIG5ldyBwZW5kaW5nIGl0ZW1zIHdoZW4gdGhleSBhcmUgb3BlbmVkLlxuICAvLyAgICogYHNlYXJjaEFsbFBhbmVzYCBBIHtCb29sZWFufS4gSWYgYHRydWVgLCB0aGUgd29ya3NwYWNlIHdpbGwgYXR0ZW1wdCB0b1xuICAvLyAgICAgYWN0aXZhdGUgYW4gZXhpc3RpbmcgaXRlbSBmb3IgdGhlIGdpdmVuIFVSSSBvbiBhbnkgcGFuZS5cbiAgLy8gICAgIElmIGBmYWxzZWAsIG9ubHkgdGhlIGFjdGl2ZSBwYW5lIHdpbGwgYmUgc2VhcmNoZWQgZm9yXG4gIC8vICAgICBhbiBleGlzdGluZyBpdGVtIGZvciB0aGUgc2FtZSBVUkkuIERlZmF1bHRzIHRvIGBmYWxzZWAuXG4gIC8vICAgKiBgbG9jYXRpb25gIChvcHRpb25hbCkgQSB7U3RyaW5nfSBjb250YWluaW5nIHRoZSBuYW1lIG9mIHRoZSBsb2NhdGlvblxuICAvLyAgICAgaW4gd2hpY2ggdGhpcyBpdGVtIHNob3VsZCBiZSBvcGVuZWQgKG9uZSBvZiBcImxlZnRcIiwgXCJyaWdodFwiLCBcImJvdHRvbVwiLFxuICAvLyAgICAgb3IgXCJjZW50ZXJcIikuIElmIG9taXR0ZWQsIEF0b20gd2lsbCBmYWxsIGJhY2sgdG8gdGhlIGxhc3QgbG9jYXRpb24gaW5cbiAgLy8gICAgIHdoaWNoIGEgdXNlciBoYXMgcGxhY2VkIGFuIGl0ZW0gd2l0aCB0aGUgc2FtZSBVUkkgb3IsIGlmIHRoaXMgaXMgYSBuZXdcbiAgLy8gICAgIFVSSSwgdGhlIGRlZmF1bHQgbG9jYXRpb24gc3BlY2lmaWVkIGJ5IHRoZSBpdGVtLiBOT1RFOiBUaGlzIG9wdGlvblxuICAvLyAgICAgc2hvdWxkIGFsbW9zdCBhbHdheXMgYmUgb21pdHRlZCB0byBob25vciB1c2VyIHByZWZlcmVuY2UuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UHJvbWlzZX0gdGhhdCByZXNvbHZlcyB0byB0aGUge1RleHRFZGl0b3J9IGZvciB0aGUgZmlsZSBVUkkuXG4gIGFzeW5jIG9wZW4gKGl0ZW1PclVSSSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHVyaSwgaXRlbVxuICAgIGlmICh0eXBlb2YgaXRlbU9yVVJJID09PSAnc3RyaW5nJykge1xuICAgICAgdXJpID0gdGhpcy5wcm9qZWN0LnJlc29sdmVQYXRoKGl0ZW1PclVSSSlcbiAgICB9IGVsc2UgaWYgKGl0ZW1PclVSSSkge1xuICAgICAgaXRlbSA9IGl0ZW1PclVSSVxuICAgICAgaWYgKHR5cGVvZiBpdGVtLmdldFVSSSA9PT0gJ2Z1bmN0aW9uJykgdXJpID0gaXRlbS5nZXRVUkkoKVxuICAgIH1cblxuICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdjb3JlLmFsbG93UGVuZGluZ1BhbmVJdGVtcycpKSB7XG4gICAgICBvcHRpb25zLnBlbmRpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIEF2b2lkIGFkZGluZyBVUkxzIGFzIHJlY2VudCBkb2N1bWVudHMgdG8gd29yay1hcm91bmQgdGhpcyBTcG90bGlnaHQgY3Jhc2g6XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvMTAwNzFcbiAgICBpZiAodXJpICYmICghdXJsLnBhcnNlKHVyaSkucHJvdG9jb2wgfHwgcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykpIHtcbiAgICAgIHRoaXMuYXBwbGljYXRpb25EZWxlZ2F0ZS5hZGRSZWNlbnREb2N1bWVudCh1cmkpXG4gICAgfVxuXG4gICAgbGV0IHBhbmUsIGl0ZW1FeGlzdHNJbldvcmtzcGFjZVxuXG4gICAgLy8gVHJ5IHRvIGZpbmQgYW4gZXhpc3RpbmcgaXRlbSBpbiB0aGUgd29ya3NwYWNlLlxuICAgIGlmIChpdGVtIHx8IHVyaSkge1xuICAgICAgaWYgKG9wdGlvbnMucGFuZSkge1xuICAgICAgICBwYW5lID0gb3B0aW9ucy5wYW5lXG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc2VhcmNoQWxsUGFuZXMpIHtcbiAgICAgICAgcGFuZSA9IGl0ZW0gPyB0aGlzLnBhbmVGb3JJdGVtKGl0ZW0pIDogdGhpcy5wYW5lRm9yVVJJKHVyaSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIGFuIGl0ZW0gd2l0aCB0aGUgZ2l2ZW4gVVJJIGlzIGFscmVhZHkgaW4gdGhlIHdvcmtzcGFjZSwgYXNzdW1lXG4gICAgICAgIC8vIHRoYXQgaXRlbSdzIHBhbmUgY29udGFpbmVyIGlzIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIHRoYXQgVVJJLlxuICAgICAgICBsZXQgY29udGFpbmVyXG4gICAgICAgIGlmICh1cmkpIGNvbnRhaW5lciA9IHRoaXMucGFuZUNvbnRhaW5lckZvclVSSSh1cmkpXG4gICAgICAgIGlmICghY29udGFpbmVyKSBjb250YWluZXIgPSB0aGlzLmdldEFjdGl2ZVBhbmVDb250YWluZXIoKVxuXG4gICAgICAgIC8vIFRoZSBgc3BsaXRgIG9wdGlvbiBhZmZlY3RzIHdoZXJlIHdlIHNlYXJjaCBmb3IgdGhlIGl0ZW0uXG4gICAgICAgIHBhbmUgPSBjb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5zcGxpdCkge1xuICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZExlZnRtb3N0U2libGluZygpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgIHBhbmUgPSBwYW5lLmZpbmRSaWdodG1vc3RTaWJsaW5nKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZFRvcG1vc3RTaWJsaW5nKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgICBwYW5lID0gcGFuZS5maW5kQm90dG9tbW9zdFNpYmxpbmcoKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocGFuZSkge1xuICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgIGl0ZW1FeGlzdHNJbldvcmtzcGFjZSA9IHBhbmUuZ2V0SXRlbXMoKS5pbmNsdWRlcyhpdGVtKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0gPSBwYW5lLml0ZW1Gb3JVUkkodXJpKVxuICAgICAgICAgIGl0ZW1FeGlzdHNJbldvcmtzcGFjZSA9IGl0ZW0gIT0gbnVsbFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgYWxyZWFkeSBoYXZlIGFuIGl0ZW0gYXQgdGhpcyBzdGFnZSwgd2Ugd29uJ3QgbmVlZCB0byBkbyBhbiBhc3luY1xuICAgIC8vIGxvb2t1cCBvZiB0aGUgVVJJLCBzbyB3ZSB5aWVsZCB0aGUgZXZlbnQgbG9vcCB0byBlbnN1cmUgdGhpcyBtZXRob2RcbiAgICAvLyBpcyBjb25zaXN0ZW50bHkgYXN5bmNocm9ub3VzLlxuICAgIGlmIChpdGVtKSBhd2FpdCBQcm9taXNlLnJlc29sdmUoKVxuXG4gICAgaWYgKCFpdGVtRXhpc3RzSW5Xb3Jrc3BhY2UpIHtcbiAgICAgIGl0ZW0gPSBpdGVtIHx8IGF3YWl0IHRoaXMuY3JlYXRlSXRlbUZvclVSSSh1cmksIG9wdGlvbnMpXG4gICAgICBpZiAoIWl0ZW0pIHJldHVyblxuXG4gICAgICBpZiAob3B0aW9ucy5wYW5lKSB7XG4gICAgICAgIHBhbmUgPSBvcHRpb25zLnBhbmVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBsb2NhdGlvbiA9IG9wdGlvbnMubG9jYXRpb25cbiAgICAgICAgaWYgKCFsb2NhdGlvbiAmJiAhb3B0aW9ucy5zcGxpdCAmJiB1cmkgJiYgdGhpcy5lbmFibGVQZXJzaXN0ZW5jZSkge1xuICAgICAgICAgIGxvY2F0aW9uID0gYXdhaXQgdGhpcy5pdGVtTG9jYXRpb25TdG9yZS5sb2FkKHVyaSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxvY2F0aW9uICYmIHR5cGVvZiBpdGVtLmdldERlZmF1bHRMb2NhdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGxvY2F0aW9uID0gaXRlbS5nZXREZWZhdWx0TG9jYXRpb24oKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWxsb3dlZExvY2F0aW9ucyA9IHR5cGVvZiBpdGVtLmdldEFsbG93ZWRMb2NhdGlvbnMgPT09ICdmdW5jdGlvbicgPyBpdGVtLmdldEFsbG93ZWRMb2NhdGlvbnMoKSA6IEFMTF9MT0NBVElPTlNcbiAgICAgICAgbG9jYXRpb24gPSBhbGxvd2VkTG9jYXRpb25zLmluY2x1ZGVzKGxvY2F0aW9uKSA/IGxvY2F0aW9uIDogYWxsb3dlZExvY2F0aW9uc1swXVxuXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMucGFuZUNvbnRhaW5lcnNbbG9jYXRpb25dIHx8IHRoaXMuZ2V0Q2VudGVyKClcbiAgICAgICAgcGFuZSA9IGNvbnRhaW5lci5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLnNwbGl0KSB7XG4gICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICBwYW5lID0gcGFuZS5maW5kTGVmdG1vc3RTaWJsaW5nKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZE9yQ3JlYXRlUmlnaHRtb3N0U2libGluZygpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICAgIHBhbmUgPSBwYW5lLmZpbmRUb3Btb3N0U2libGluZygpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZE9yQ3JlYXRlQm90dG9tbW9zdFNpYmxpbmcoKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghb3B0aW9ucy5wZW5kaW5nICYmIChwYW5lLmdldFBlbmRpbmdJdGVtKCkgPT09IGl0ZW0pKSB7XG4gICAgICBwYW5lLmNsZWFyUGVuZGluZ0l0ZW0oKVxuICAgIH1cblxuICAgIHRoaXMuaXRlbU9wZW5lZChpdGVtKVxuXG4gICAgaWYgKG9wdGlvbnMuYWN0aXZhdGVJdGVtID09PSBmYWxzZSkge1xuICAgICAgcGFuZS5hZGRJdGVtKGl0ZW0sIHtwZW5kaW5nOiBvcHRpb25zLnBlbmRpbmd9KVxuICAgIH0gZWxzZSB7XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShpdGVtLCB7cGVuZGluZzogb3B0aW9ucy5wZW5kaW5nfSlcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5hY3RpdmF0ZVBhbmUgIT09IGZhbHNlKSB7XG4gICAgICBwYW5lLmFjdGl2YXRlKClcbiAgICB9XG5cbiAgICBsZXQgaW5pdGlhbENvbHVtbiA9IDBcbiAgICBsZXQgaW5pdGlhbExpbmUgPSAwXG4gICAgaWYgKCFOdW1iZXIuaXNOYU4ob3B0aW9ucy5pbml0aWFsTGluZSkpIHtcbiAgICAgIGluaXRpYWxMaW5lID0gb3B0aW9ucy5pbml0aWFsTGluZVxuICAgIH1cbiAgICBpZiAoIU51bWJlci5pc05hTihvcHRpb25zLmluaXRpYWxDb2x1bW4pKSB7XG4gICAgICBpbml0aWFsQ29sdW1uID0gb3B0aW9ucy5pbml0aWFsQ29sdW1uXG4gICAgfVxuICAgIGlmIChpbml0aWFsTGluZSA+PSAwIHx8IGluaXRpYWxDb2x1bW4gPj0gMCkge1xuICAgICAgaWYgKHR5cGVvZiBpdGVtLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGl0ZW0uc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2luaXRpYWxMaW5lLCBpbml0aWFsQ29sdW1uXSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IHBhbmUuZ2V0QWN0aXZlSXRlbUluZGV4KClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLW9wZW4nLCB7dXJpLCBwYW5lLCBpdGVtLCBpbmRleH0pXG4gICAgcmV0dXJuIGl0ZW1cbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogU2VhcmNoIHRoZSB3b3Jrc3BhY2UgZm9yIGl0ZW1zIG1hdGNoaW5nIHRoZSBnaXZlbiBVUkkgYW5kIGhpZGUgdGhlbS5cbiAgLy9cbiAgLy8gKiBgaXRlbU9yVVJJYCAob3B0aW9uYWwpIFRoZSBpdGVtIHRvIGhpZGUgb3IgYSB7U3RyaW5nfSBjb250YWluaW5nIHRoZSBVUklcbiAgLy8gICBvZiB0aGUgaXRlbSB0byBoaWRlLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge2Jvb2xlYW59IGluZGljYXRpbmcgd2hldGhlciBhbnkgaXRlbXMgd2VyZSBmb3VuZCAoYW5kIGhpZGRlbikuXG4gIGhpZGUgKGl0ZW1PclVSSSkge1xuICAgIGxldCBmb3VuZEl0ZW1zID0gZmFsc2VcblxuICAgIC8vIElmIGFueSB2aXNpYmxlIGl0ZW0gaGFzIHRoZSBnaXZlbiBVUkksIGhpZGUgaXRcbiAgICBmb3IgKGNvbnN0IGNvbnRhaW5lciBvZiB0aGlzLmdldFBhbmVDb250YWluZXJzKCkpIHtcbiAgICAgIGNvbnN0IGlzQ2VudGVyID0gY29udGFpbmVyID09PSB0aGlzLmdldENlbnRlcigpXG4gICAgICBpZiAoaXNDZW50ZXIgfHwgY29udGFpbmVyLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBjb250YWluZXIuZ2V0UGFuZXMoKSkge1xuICAgICAgICAgIGNvbnN0IGFjdGl2ZUl0ZW0gPSBwYW5lLmdldEFjdGl2ZUl0ZW0oKVxuICAgICAgICAgIGNvbnN0IGZvdW5kSXRlbSA9IChcbiAgICAgICAgICAgIGFjdGl2ZUl0ZW0gIT0gbnVsbCAmJiAoXG4gICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPT09IGl0ZW1PclVSSSB8fFxuICAgICAgICAgICAgICB0eXBlb2YgYWN0aXZlSXRlbS5nZXRVUkkgPT09ICdmdW5jdGlvbicgJiYgYWN0aXZlSXRlbS5nZXRVUkkoKSA9PT0gaXRlbU9yVVJJXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICAgIGlmIChmb3VuZEl0ZW0pIHtcbiAgICAgICAgICAgIGZvdW5kSXRlbXMgPSB0cnVlXG4gICAgICAgICAgICAvLyBXZSBjYW4ndCByZWFsbHkgaGlkZSB0aGUgY2VudGVyIHNvIHdlIGp1c3QgZGVzdHJveSB0aGUgaXRlbS5cbiAgICAgICAgICAgIGlmIChpc0NlbnRlcikge1xuICAgICAgICAgICAgICBwYW5lLmRlc3Ryb3lJdGVtKGFjdGl2ZUl0ZW0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250YWluZXIuaGlkZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvdW5kSXRlbXNcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogU2VhcmNoIHRoZSB3b3Jrc3BhY2UgZm9yIGl0ZW1zIG1hdGNoaW5nIHRoZSBnaXZlbiBVUkkuIElmIGFueSBhcmUgZm91bmQsIGhpZGUgdGhlbS5cbiAgLy8gT3RoZXJ3aXNlLCBvcGVuIHRoZSBVUkwuXG4gIC8vXG4gIC8vICogYGl0ZW1PclVSSWAgKG9wdGlvbmFsKSBUaGUgaXRlbSB0byB0b2dnbGUgb3IgYSB7U3RyaW5nfSBjb250YWluaW5nIHRoZSBVUklcbiAgLy8gICBvZiB0aGUgaXRlbSB0byB0b2dnbGUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgaXRlbSBpcyBzaG93biBvciBoaWRkZW4uXG4gIHRvZ2dsZSAoaXRlbU9yVVJJKSB7XG4gICAgaWYgKHRoaXMuaGlkZShpdGVtT3JVUkkpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMub3BlbihpdGVtT3JVUkksIHtzZWFyY2hBbGxQYW5lczogdHJ1ZX0pXG4gICAgfVxuICB9XG5cbiAgLy8gT3BlbiBBdG9tJ3MgbGljZW5zZSBpbiB0aGUgYWN0aXZlIHBhbmUuXG4gIG9wZW5MaWNlbnNlICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuKHBhdGguam9pbihwcm9jZXNzLnJlc291cmNlc1BhdGgsICdMSUNFTlNFLm1kJykpXG4gIH1cblxuICAvLyBTeW5jaHJvbm91c2x5IG9wZW4gdGhlIGdpdmVuIFVSSSBpbiB0aGUgYWN0aXZlIHBhbmUuICoqT25seSB1c2UgdGhpcyBtZXRob2RcbiAgLy8gaW4gc3BlY3MuIENhbGxpbmcgdGhpcyBpbiBwcm9kdWN0aW9uIGNvZGUgd2lsbCBibG9jayB0aGUgVUkgdGhyZWFkIGFuZFxuICAvLyBldmVyeW9uZSB3aWxsIGJlIG1hZCBhdCB5b3UuKipcbiAgLy9cbiAgLy8gKiBgdXJpYCBBIHtTdHJpbmd9IGNvbnRhaW5pbmcgYSBVUkkuXG4gIC8vICogYG9wdGlvbnNgIEFuIG9wdGlvbmFsIG9wdGlvbnMge09iamVjdH1cbiAgLy8gICAqIGBpbml0aWFsTGluZWAgQSB7TnVtYmVyfSBpbmRpY2F0aW5nIHdoaWNoIHJvdyB0byBtb3ZlIHRoZSBjdXJzb3IgdG9cbiAgLy8gICAgIGluaXRpYWxseS4gRGVmYXVsdHMgdG8gYDBgLlxuICAvLyAgICogYGluaXRpYWxDb2x1bW5gIEEge051bWJlcn0gaW5kaWNhdGluZyB3aGljaCBjb2x1bW4gdG8gbW92ZSB0aGUgY3Vyc29yIHRvXG4gIC8vICAgICBpbml0aWFsbHkuIERlZmF1bHRzIHRvIGAwYC5cbiAgLy8gICAqIGBhY3RpdmF0ZVBhbmVgIEEge0Jvb2xlYW59IGluZGljYXRpbmcgd2hldGhlciB0byBjYWxsIHtQYW5lOjphY3RpdmF0ZX0gb25cbiAgLy8gICAgIHRoZSBjb250YWluaW5nIHBhbmUuIERlZmF1bHRzIHRvIGB0cnVlYC5cbiAgLy8gICAqIGBhY3RpdmF0ZUl0ZW1gIEEge0Jvb2xlYW59IGluZGljYXRpbmcgd2hldGhlciB0byBjYWxsIHtQYW5lOjphY3RpdmF0ZUl0ZW19XG4gIC8vICAgICBvbiBjb250YWluaW5nIHBhbmUuIERlZmF1bHRzIHRvIGB0cnVlYC5cbiAgb3BlblN5bmMgKHVyaV8gPSAnJywgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qge2luaXRpYWxMaW5lLCBpbml0aWFsQ29sdW1ufSA9IG9wdGlvbnNcbiAgICBjb25zdCBhY3RpdmF0ZVBhbmUgPSBvcHRpb25zLmFjdGl2YXRlUGFuZSAhPSBudWxsID8gb3B0aW9ucy5hY3RpdmF0ZVBhbmUgOiB0cnVlXG4gICAgY29uc3QgYWN0aXZhdGVJdGVtID0gb3B0aW9ucy5hY3RpdmF0ZUl0ZW0gIT0gbnVsbCA/IG9wdGlvbnMuYWN0aXZhdGVJdGVtIDogdHJ1ZVxuXG4gICAgY29uc3QgdXJpID0gdGhpcy5wcm9qZWN0LnJlc29sdmVQYXRoKHVyaV8pXG4gICAgbGV0IGl0ZW0gPSB0aGlzLmdldEFjdGl2ZVBhbmUoKS5pdGVtRm9yVVJJKHVyaSlcbiAgICBpZiAodXJpICYmIChpdGVtID09IG51bGwpKSB7XG4gICAgICBmb3IgKGNvbnN0IG9wZW5lciBvZiB0aGlzLmdldE9wZW5lcnMoKSkge1xuICAgICAgICBpdGVtID0gb3BlbmVyKHVyaSwgb3B0aW9ucylcbiAgICAgICAgaWYgKGl0ZW0pIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpdGVtID09IG51bGwpIHtcbiAgICAgIGl0ZW0gPSB0aGlzLnByb2plY3Qub3BlblN5bmModXJpLCB7aW5pdGlhbExpbmUsIGluaXRpYWxDb2x1bW59KVxuICAgIH1cblxuICAgIGlmIChhY3RpdmF0ZUl0ZW0pIHtcbiAgICAgIHRoaXMuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlSXRlbShpdGVtKVxuICAgIH1cbiAgICB0aGlzLml0ZW1PcGVuZWQoaXRlbSlcbiAgICBpZiAoYWN0aXZhdGVQYW5lKSB7XG4gICAgICB0aGlzLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpXG4gICAgfVxuICAgIHJldHVybiBpdGVtXG4gIH1cblxuICBvcGVuVVJJSW5QYW5lICh1cmksIHBhbmUpIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuKHVyaSwge3BhbmV9KVxuICB9XG5cbiAgLy8gUHVibGljOiBDcmVhdGVzIGEgbmV3IGl0ZW0gdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgcHJvdmlkZWQgVVJJLlxuICAvL1xuICAvLyBJZiBubyBVUkkgaXMgZ2l2ZW4sIG9yIG5vIHJlZ2lzdGVyZWQgb3BlbmVyIGNhbiBvcGVuIHRoZSBVUkksIGEgbmV3IGVtcHR5XG4gIC8vIHtUZXh0RWRpdG9yfSB3aWxsIGJlIGNyZWF0ZWQuXG4gIC8vXG4gIC8vICogYHVyaWAgQSB7U3RyaW5nfSBjb250YWluaW5nIGEgVVJJLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge1Byb21pc2V9IHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHtUZXh0RWRpdG9yfSAob3Igb3RoZXIgaXRlbSkgZm9yIHRoZSBnaXZlbiBVUkkuXG4gIGNyZWF0ZUl0ZW1Gb3JVUkkgKHVyaSwgb3B0aW9ucykge1xuICAgIGlmICh1cmkgIT0gbnVsbCkge1xuICAgICAgZm9yIChsZXQgb3BlbmVyIG9mIHRoaXMuZ2V0T3BlbmVycygpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBvcGVuZXIodXJpLCBvcHRpb25zKVxuICAgICAgICBpZiAoaXRlbSAhPSBudWxsKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGl0ZW0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW5UZXh0RmlsZSh1cmksIG9wdGlvbnMpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHN3aXRjaCAoZXJyb3IuY29kZSkge1xuICAgICAgICBjYXNlICdDQU5DRUxMRUQnOlxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICBjYXNlICdFQUNDRVMnOlxuICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9uTWFuYWdlci5hZGRXYXJuaW5nKGBQZXJtaXNzaW9uIGRlbmllZCAnJHtlcnJvci5wYXRofSdgKVxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICBjYXNlICdFUEVSTSc6XG4gICAgICAgIGNhc2UgJ0VCVVNZJzpcbiAgICAgICAgY2FzZSAnRU5YSU8nOlxuICAgICAgICBjYXNlICdFSU8nOlxuICAgICAgICBjYXNlICdFTk9UQ09OTic6XG4gICAgICAgIGNhc2UgJ1VOS05PV04nOlxuICAgICAgICBjYXNlICdFQ09OTlJFU0VUJzpcbiAgICAgICAgY2FzZSAnRUlOVkFMJzpcbiAgICAgICAgY2FzZSAnRU1GSUxFJzpcbiAgICAgICAgY2FzZSAnRU5PVERJUic6XG4gICAgICAgIGNhc2UgJ0VBR0FJTic6XG4gICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25NYW5hZ2VyLmFkZFdhcm5pbmcoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIG9wZW4gJyR7ZXJyb3IucGF0aCAhPSBudWxsID8gZXJyb3IucGF0aCA6IHVyaX0nYCxcbiAgICAgICAgICAgIHtkZXRhaWw6IGVycm9yLm1lc3NhZ2V9XG4gICAgICAgICAgKVxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb3BlblRleHRGaWxlICh1cmksIG9wdGlvbnMpIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMucHJvamVjdC5yZXNvbHZlUGF0aCh1cmkpXG5cbiAgICBpZiAoZmlsZVBhdGggIT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZnMuY2xvc2VTeW5jKGZzLm9wZW5TeW5jKGZpbGVQYXRoLCAncicpKVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gYWxsb3cgRU5PRU5UIGVycm9ycyB0byBjcmVhdGUgYW4gZWRpdG9yIGZvciBwYXRocyB0aGF0IGRvbnQgZXhpc3RcbiAgICAgICAgaWYgKGVycm9yLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGZpbGVTaXplID0gZnMuZ2V0U2l6ZVN5bmMoZmlsZVBhdGgpXG5cbiAgICBjb25zdCBsYXJnZUZpbGVNb2RlID0gZmlsZVNpemUgPj0gKDIgKiAxMDQ4NTc2KSAvLyAyTUJcbiAgICBpZiAoZmlsZVNpemUgPj0gKHRoaXMuY29uZmlnLmdldCgnY29yZS53YXJuT25MYXJnZUZpbGVMaW1pdCcpICogMTA0ODU3NikpIHsgLy8gMjBNQiBieSBkZWZhdWx0XG4gICAgICBjb25zdCBjaG9pY2UgPSB0aGlzLmFwcGxpY2F0aW9uRGVsZWdhdGUuY29uZmlybSh7XG4gICAgICAgIG1lc3NhZ2U6ICdBdG9tIHdpbGwgYmUgdW5yZXNwb25zaXZlIGR1cmluZyB0aGUgbG9hZGluZyBvZiB2ZXJ5IGxhcmdlIGZpbGVzLicsXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogJ0RvIHlvdSBzdGlsbCB3YW50IHRvIGxvYWQgdGhpcyBmaWxlPycsXG4gICAgICAgIGJ1dHRvbnM6IFsnUHJvY2VlZCcsICdDYW5jZWwnXVxuICAgICAgfSlcbiAgICAgIGlmIChjaG9pY2UgPT09IDEpIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoKVxuICAgICAgICBlcnJvci5jb2RlID0gJ0NBTkNFTExFRCdcbiAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wcm9qZWN0LmJ1ZmZlckZvclBhdGgoZmlsZVBhdGgsIG9wdGlvbnMpXG4gICAgICAudGhlbihidWZmZXIgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkuYnVpbGQoT2JqZWN0LmFzc2lnbih7YnVmZmVyLCBsYXJnZUZpbGVNb2RlLCBhdXRvSGVpZ2h0OiBmYWxzZX0sIG9wdGlvbnMpKVxuICAgICAgfSlcbiAgfVxuXG4gIGhhbmRsZUdyYW1tYXJVc2VkIChncmFtbWFyKSB7XG4gICAgaWYgKGdyYW1tYXIgPT0gbnVsbCkgeyByZXR1cm4gfVxuICAgIHJldHVybiB0aGlzLnBhY2thZ2VNYW5hZ2VyLnRyaWdnZXJBY3RpdmF0aW9uSG9vayhgJHtncmFtbWFyLnBhY2thZ2VOYW1lfTpncmFtbWFyLXVzZWRgKVxuICB9XG5cbiAgLy8gUHVibGljOiBSZXR1cm5zIGEge0Jvb2xlYW59IHRoYXQgaXMgYHRydWVgIGlmIGBvYmplY3RgIGlzIGEgYFRleHRFZGl0b3JgLlxuICAvL1xuICAvLyAqIGBvYmplY3RgIEFuIHtPYmplY3R9IHlvdSB3YW50IHRvIHBlcmZvcm0gdGhlIGNoZWNrIGFnYWluc3QuXG4gIGlzVGV4dEVkaXRvciAob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIFRleHRFZGl0b3JcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBDcmVhdGUgYSBuZXcgdGV4dCBlZGl0b3IuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7VGV4dEVkaXRvcn0uXG4gIGJ1aWxkVGV4dEVkaXRvciAocGFyYW1zKSB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkuYnVpbGQocGFyYW1zKVxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMudGV4dEVkaXRvclJlZ2lzdHJ5Lm1haW50YWluR3JhbW1hcihlZGl0b3IpLFxuICAgICAgdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkubWFpbnRhaW5Db25maWcoZWRpdG9yKVxuICAgIClcbiAgICBlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHsgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCkgfSlcbiAgICByZXR1cm4gZWRpdG9yXG4gIH1cblxuICAvLyBQdWJsaWM6IEFzeW5jaHJvbm91c2x5IHJlb3BlbnMgdGhlIGxhc3QtY2xvc2VkIGl0ZW0ncyBVUkkgaWYgaXQgaGFzbid0IGFscmVhZHkgYmVlblxuICAvLyByZW9wZW5lZC5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQcm9taXNlfSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIGl0ZW0gaXMgb3BlbmVkXG4gIHJlb3Blbkl0ZW0gKCkge1xuICAgIGNvbnN0IHVyaSA9IHRoaXMuZGVzdHJveWVkSXRlbVVSSXMucG9wKClcbiAgICBpZiAodXJpKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuKHVyaSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgfVxuICB9XG5cbiAgLy8gUHVibGljOiBSZWdpc3RlciBhbiBvcGVuZXIgZm9yIGEgdXJpLlxuICAvL1xuICAvLyBXaGVuIGEgVVJJIGlzIG9wZW5lZCB2aWEge1dvcmtzcGFjZTo6b3Blbn0sIEF0b20gbG9vcHMgdGhyb3VnaCBpdHMgcmVnaXN0ZXJlZFxuICAvLyBvcGVuZXIgZnVuY3Rpb25zIHVudGlsIG9uZSByZXR1cm5zIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiB1cmkuXG4gIC8vIE9wZW5lcnMgYXJlIGV4cGVjdGVkIHRvIHJldHVybiBhbiBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIEhUTUxFbGVtZW50IG9yXG4gIC8vIGEgbW9kZWwgd2hpY2ggaGFzIGFuIGFzc29jaWF0ZWQgdmlldyBpbiB0aGUge1ZpZXdSZWdpc3RyeX0uXG4gIC8vIEEge1RleHRFZGl0b3J9IHdpbGwgYmUgdXNlZCBpZiBubyBvcGVuZXIgcmV0dXJucyBhIHZhbHVlLlxuICAvL1xuICAvLyAjIyBFeGFtcGxlc1xuICAvL1xuICAvLyBgYGBjb2ZmZWVcbiAgLy8gYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyICh1cmkpIC0+XG4gIC8vICAgaWYgcGF0aC5leHRuYW1lKHVyaSkgaXMgJy50b21sJ1xuICAvLyAgICAgcmV0dXJuIG5ldyBUb21sRWRpdG9yKHVyaSlcbiAgLy8gYGBgXG4gIC8vXG4gIC8vICogYG9wZW5lcmAgQSB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIGEgcGF0aCBpcyBiZWluZyBvcGVuZWQuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gcmVtb3ZlIHRoZVxuICAvLyBvcGVuZXIuXG4gIC8vXG4gIC8vIE5vdGUgdGhhdCB0aGUgb3BlbmVyIHdpbGwgYmUgY2FsbGVkIGlmIGFuZCBvbmx5IGlmIHRoZSBVUkkgaXMgbm90IGFscmVhZHkgb3BlblxuICAvLyBpbiB0aGUgY3VycmVudCBwYW5lLiBUaGUgc2VhcmNoQWxsUGFuZXMgZmxhZyBleHBhbmRzIHRoZSBzZWFyY2ggZnJvbSB0aGVcbiAgLy8gY3VycmVudCBwYW5lIHRvIGFsbCBwYW5lcy4gSWYgeW91IHdpc2ggdG8gb3BlbiBhIHZpZXcgb2YgYSBkaWZmZXJlbnQgdHlwZSBmb3JcbiAgLy8gYSBmaWxlIHRoYXQgaXMgYWxyZWFkeSBvcGVuLCBjb25zaWRlciBjaGFuZ2luZyB0aGUgcHJvdG9jb2wgb2YgdGhlIFVSSS4gRm9yXG4gIC8vIGV4YW1wbGUsIHBlcmhhcHMgeW91IHdpc2ggdG8gcHJldmlldyBhIHJlbmRlcmVkIHZlcnNpb24gb2YgdGhlIGZpbGUgYC9mb28vYmFyL2Jhei5xdXV4YFxuICAvLyB0aGF0IGlzIGFscmVhZHkgb3BlbiBpbiBhIHRleHQgZWRpdG9yIHZpZXcuIFlvdSBjb3VsZCBzaWduYWwgdGhpcyBieSBjYWxsaW5nXG4gIC8vIHtXb3Jrc3BhY2U6Om9wZW59IG9uIHRoZSBVUkkgYHF1dXgtcHJldmlldzovL2Zvby9iYXIvYmF6LnF1dXhgLiBUaGVuIHlvdXIgb3BlbmVyXG4gIC8vIGNhbiBjaGVjayB0aGUgcHJvdG9jb2wgZm9yIHF1dXgtcHJldmlldyBhbmQgb25seSBoYW5kbGUgdGhvc2UgVVJJcyB0aGF0IG1hdGNoLlxuICBhZGRPcGVuZXIgKG9wZW5lcikge1xuICAgIHRoaXMub3BlbmVycy5wdXNoKG9wZW5lcilcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4geyBfLnJlbW92ZSh0aGlzLm9wZW5lcnMsIG9wZW5lcikgfSlcbiAgfVxuXG4gIGdldE9wZW5lcnMgKCkge1xuICAgIHJldHVybiB0aGlzLm9wZW5lcnNcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFBhbmUgSXRlbXNcbiAgKi9cblxuICAvLyBFc3NlbnRpYWw6IEdldCBhbGwgcGFuZSBpdGVtcyBpbiB0aGUgd29ya3NwYWNlLlxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtBcnJheX0gb2YgaXRlbXMuXG4gIGdldFBhbmVJdGVtcyAoKSB7XG4gICAgcmV0dXJuIF8uZmxhdHRlbih0aGlzLmdldFBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIuZ2V0UGFuZUl0ZW1zKCkpKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgdGhlIGFjdGl2ZSB7UGFuZX0ncyBhY3RpdmUgaXRlbS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhbiBwYW5lIGl0ZW0ge09iamVjdH0uXG4gIGdldEFjdGl2ZVBhbmVJdGVtICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBY3RpdmVQYW5lQ29udGFpbmVyKCkuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgYWxsIHRleHQgZWRpdG9ycyBpbiB0aGUgd29ya3NwYWNlLlxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtBcnJheX0gb2Yge1RleHRFZGl0b3J9cy5cbiAgZ2V0VGV4dEVkaXRvcnMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVJdGVtcygpLmZpbHRlcihpdGVtID0+IGl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgdGhlIGFjdGl2ZSBpdGVtIGlmIGl0IGlzIGFuIHtUZXh0RWRpdG9yfS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7VGV4dEVkaXRvcn0gb3IgYHVuZGVmaW5lZGAgaWYgdGhlIGN1cnJlbnQgYWN0aXZlIGl0ZW0gaXMgbm90IGFuXG4gIC8vIHtUZXh0RWRpdG9yfS5cbiAgZ2V0QWN0aXZlVGV4dEVkaXRvciAoKSB7XG4gICAgY29uc3QgYWN0aXZlSXRlbSA9IHRoaXMuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgIGlmIChhY3RpdmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvcikgeyByZXR1cm4gYWN0aXZlSXRlbSB9XG4gIH1cblxuICAvLyBTYXZlIGFsbCBwYW5lIGl0ZW1zLlxuICBzYXZlQWxsICgpIHtcbiAgICB0aGlzLmdldFBhbmVDb250YWluZXJzKCkuZm9yRWFjaChjb250YWluZXIgPT4ge1xuICAgICAgY29udGFpbmVyLnNhdmVBbGwoKVxuICAgIH0pXG4gIH1cblxuICBjb25maXJtQ2xvc2UgKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYW5lQ29udGFpbmVycygpXG4gICAgICAubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIuY29uZmlybUNsb3NlKG9wdGlvbnMpKVxuICAgICAgLmV2ZXJ5KHNhdmVkID0+IHNhdmVkKVxuICB9XG5cbiAgLy8gU2F2ZSB0aGUgYWN0aXZlIHBhbmUgaXRlbS5cbiAgLy9cbiAgLy8gSWYgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gY3VycmVudGx5IGhhcyBhIFVSSSBhY2NvcmRpbmcgdG8gdGhlIGl0ZW0nc1xuICAvLyBgLmdldFVSSWAgbWV0aG9kLCBjYWxscyBgLnNhdmVgIG9uIHRoZSBpdGVtLiBPdGhlcndpc2VcbiAgLy8gezo6c2F2ZUFjdGl2ZVBhbmVJdGVtQXN9ICMgd2lsbCBiZSBjYWxsZWQgaW5zdGVhZC4gVGhpcyBtZXRob2QgZG9lcyBub3RoaW5nXG4gIC8vIGlmIHRoZSBhY3RpdmUgaXRlbSBkb2VzIG5vdCBpbXBsZW1lbnQgYSBgLnNhdmVgIG1ldGhvZC5cbiAgc2F2ZUFjdGl2ZVBhbmVJdGVtICgpIHtcbiAgICB0aGlzLmdldEFjdGl2ZVBhbmUoKS5zYXZlQWN0aXZlSXRlbSgpXG4gIH1cblxuICAvLyBQcm9tcHQgdGhlIHVzZXIgZm9yIGEgcGF0aCBhbmQgc2F2ZSB0aGUgYWN0aXZlIHBhbmUgaXRlbSB0byBpdC5cbiAgLy9cbiAgLy8gT3BlbnMgYSBuYXRpdmUgZGlhbG9nIHdoZXJlIHRoZSB1c2VyIHNlbGVjdHMgYSBwYXRoIG9uIGRpc2ssIHRoZW4gY2FsbHNcbiAgLy8gYC5zYXZlQXNgIG9uIHRoZSBpdGVtIHdpdGggdGhlIHNlbGVjdGVkIHBhdGguIFRoaXMgbWV0aG9kIGRvZXMgbm90aGluZyBpZlxuICAvLyB0aGUgYWN0aXZlIGl0ZW0gZG9lcyBub3QgaW1wbGVtZW50IGEgYC5zYXZlQXNgIG1ldGhvZC5cbiAgc2F2ZUFjdGl2ZVBhbmVJdGVtQXMgKCkge1xuICAgIHRoaXMuZ2V0QWN0aXZlUGFuZSgpLnNhdmVBY3RpdmVJdGVtQXMoKVxuICB9XG5cbiAgLy8gRGVzdHJveSAoY2xvc2UpIHRoZSBhY3RpdmUgcGFuZSBpdGVtLlxuICAvL1xuICAvLyBSZW1vdmVzIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGFuZCBjYWxscyB0aGUgYC5kZXN0cm95YCBtZXRob2Qgb24gaXQgaWYgb25lIGlzXG4gIC8vIGRlZmluZWQuXG4gIGRlc3Ryb3lBY3RpdmVQYW5lSXRlbSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWN0aXZlUGFuZSgpLmRlc3Ryb3lBY3RpdmVJdGVtKClcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFBhbmVzXG4gICovXG5cbiAgLy8gRXh0ZW5kZWQ6IEdldCB0aGUgbW9zdCByZWNlbnRseSBmb2N1c2VkIHBhbmUgY29udGFpbmVyLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0RvY2t9IG9yIHRoZSB7V29ya3NwYWNlQ2VudGVyfS5cbiAgZ2V0QWN0aXZlUGFuZUNvbnRhaW5lciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlUGFuZUNvbnRhaW5lclxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEdldCBhbGwgcGFuZXMgaW4gdGhlIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7QXJyYXl9IG9mIHtQYW5lfXMuXG4gIGdldFBhbmVzICgpIHtcbiAgICByZXR1cm4gXy5mbGF0dGVuKHRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5tYXAoY29udGFpbmVyID0+IGNvbnRhaW5lci5nZXRQYW5lcygpKSlcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBHZXQgdGhlIGFjdGl2ZSB7UGFuZX0uXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UGFuZX0uXG4gIGdldEFjdGl2ZVBhbmUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEFjdGl2ZVBhbmVDb250YWluZXIoKS5nZXRBY3RpdmVQYW5lKClcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBNYWtlIHRoZSBuZXh0IHBhbmUgYWN0aXZlLlxuICBhY3RpdmF0ZU5leHRQYW5lICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBY3RpdmVQYW5lQ29udGFpbmVyKCkuYWN0aXZhdGVOZXh0UGFuZSgpXG4gIH1cblxuICAvLyBFeHRlbmRlZDogTWFrZSB0aGUgcHJldmlvdXMgcGFuZSBhY3RpdmUuXG4gIGFjdGl2YXRlUHJldmlvdXNQYW5lICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBY3RpdmVQYW5lQ29udGFpbmVyKCkuYWN0aXZhdGVQcmV2aW91c1BhbmUoKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEdldCB0aGUgZmlyc3QgcGFuZSBjb250YWluZXIgdGhhdCBjb250YWlucyBhbiBpdGVtIHdpdGggdGhlIGdpdmVuXG4gIC8vIFVSSS5cbiAgLy9cbiAgLy8gKiBgdXJpYCB7U3RyaW5nfSB1cmlcbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEb2NrfSwgdGhlIHtXb3Jrc3BhY2VDZW50ZXJ9LCBvciBgdW5kZWZpbmVkYCBpZiBubyBpdGVtIGV4aXN0c1xuICAvLyB3aXRoIHRoZSBnaXZlbiBVUkkuXG4gIHBhbmVDb250YWluZXJGb3JVUkkgKHVyaSkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVDb250YWluZXJzKCkuZmluZChjb250YWluZXIgPT4gY29udGFpbmVyLnBhbmVGb3JVUkkodXJpKSlcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBHZXQgdGhlIGZpcnN0IHBhbmUgY29udGFpbmVyIHRoYXQgY29udGFpbnMgdGhlIGdpdmVuIGl0ZW0uXG4gIC8vXG4gIC8vICogYGl0ZW1gIHRoZSBJdGVtIHRoYXQgdGhlIHJldHVybmVkIHBhbmUgY29udGFpbmVyIG11c3QgY29udGFpbi5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEb2NrfSwgdGhlIHtXb3Jrc3BhY2VDZW50ZXJ9LCBvciBgdW5kZWZpbmVkYCBpZiBubyBpdGVtIGV4aXN0c1xuICAvLyB3aXRoIHRoZSBnaXZlbiBVUkkuXG4gIHBhbmVDb250YWluZXJGb3JJdGVtICh1cmkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYW5lQ29udGFpbmVycygpLmZpbmQoY29udGFpbmVyID0+IGNvbnRhaW5lci5wYW5lRm9ySXRlbSh1cmkpKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEdldCB0aGUgZmlyc3Qge1BhbmV9IHRoYXQgY29udGFpbnMgYW4gaXRlbSB3aXRoIHRoZSBnaXZlbiBVUkkuXG4gIC8vXG4gIC8vICogYHVyaWAge1N0cmluZ30gdXJpXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UGFuZX0gb3IgYHVuZGVmaW5lZGAgaWYgbm8gaXRlbSBleGlzdHMgd2l0aCB0aGUgZ2l2ZW4gVVJJLlxuICBwYW5lRm9yVVJJICh1cmkpIHtcbiAgICBmb3IgKGxldCBsb2NhdGlvbiBvZiB0aGlzLmdldFBhbmVDb250YWluZXJzKCkpIHtcbiAgICAgIGNvbnN0IHBhbmUgPSBsb2NhdGlvbi5wYW5lRm9yVVJJKHVyaSlcbiAgICAgIGlmIChwYW5lICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHBhbmVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBFeHRlbmRlZDogR2V0IHRoZSB7UGFuZX0gY29udGFpbmluZyB0aGUgZ2l2ZW4gaXRlbS5cbiAgLy9cbiAgLy8gKiBgaXRlbWAgdGhlIEl0ZW0gdGhhdCB0aGUgcmV0dXJuZWQgcGFuZSBtdXN0IGNvbnRhaW4uXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UGFuZX0gb3IgYHVuZGVmaW5lZGAgaWYgbm8gcGFuZSBleGlzdHMgZm9yIHRoZSBnaXZlbiBpdGVtLlxuICBwYW5lRm9ySXRlbSAoaXRlbSkge1xuICAgIGZvciAobGV0IGxvY2F0aW9uIG9mIHRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKSkge1xuICAgICAgY29uc3QgcGFuZSA9IGxvY2F0aW9uLnBhbmVGb3JJdGVtKGl0ZW0pXG4gICAgICBpZiAocGFuZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwYW5lXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gRGVzdHJveSAoY2xvc2UpIHRoZSBhY3RpdmUgcGFuZS5cbiAgZGVzdHJveUFjdGl2ZVBhbmUgKCkge1xuICAgIGNvbnN0IGFjdGl2ZVBhbmUgPSB0aGlzLmdldEFjdGl2ZVBhbmUoKVxuICAgIGlmIChhY3RpdmVQYW5lICE9IG51bGwpIHtcbiAgICAgIGFjdGl2ZVBhbmUuZGVzdHJveSgpXG4gICAgfVxuICB9XG5cbiAgLy8gQ2xvc2UgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0sIG9yIHRoZSBhY3RpdmUgcGFuZSBpZiBpdCBpcyBlbXB0eSxcbiAgLy8gb3IgdGhlIGN1cnJlbnQgd2luZG93IGlmIHRoZXJlIGlzIG9ubHkgdGhlIGVtcHR5IHJvb3QgcGFuZS5cbiAgY2xvc2VBY3RpdmVQYW5lSXRlbU9yRW1wdHlQYW5lT3JXaW5kb3cgKCkge1xuICAgIGlmICh0aGlzLmdldEFjdGl2ZVBhbmVJdGVtKCkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5kZXN0cm95QWN0aXZlUGFuZUl0ZW0oKVxuICAgIH0gZWxzZSBpZiAodGhpcy5nZXRDZW50ZXIoKS5nZXRQYW5lcygpLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRoaXMuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgIH0gZWxzZSBpZiAodGhpcy5jb25maWcuZ2V0KCdjb3JlLmNsb3NlRW1wdHlXaW5kb3dzJykpIHtcbiAgICAgIGF0b20uY2xvc2UoKVxuICAgIH1cbiAgfVxuXG4gIC8vIEluY3JlYXNlIHRoZSBlZGl0b3IgZm9udCBzaXplIGJ5IDFweC5cbiAgaW5jcmVhc2VGb250U2l6ZSAoKSB7XG4gICAgdGhpcy5jb25maWcuc2V0KCdlZGl0b3IuZm9udFNpemUnLCB0aGlzLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250U2l6ZScpICsgMSlcbiAgfVxuXG4gIC8vIERlY3JlYXNlIHRoZSBlZGl0b3IgZm9udCBzaXplIGJ5IDFweC5cbiAgZGVjcmVhc2VGb250U2l6ZSAoKSB7XG4gICAgY29uc3QgZm9udFNpemUgPSB0aGlzLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250U2l6ZScpXG4gICAgaWYgKGZvbnRTaXplID4gMSkge1xuICAgICAgdGhpcy5jb25maWcuc2V0KCdlZGl0b3IuZm9udFNpemUnLCBmb250U2l6ZSAtIDEpXG4gICAgfVxuICB9XG5cbiAgLy8gUmVzdG9yZSB0byB0aGUgd2luZG93J3Mgb3JpZ2luYWwgZWRpdG9yIGZvbnQgc2l6ZS5cbiAgcmVzZXRGb250U2l6ZSAoKSB7XG4gICAgaWYgKHRoaXMub3JpZ2luYWxGb250U2l6ZSkge1xuICAgICAgdGhpcy5jb25maWcuc2V0KCdlZGl0b3IuZm9udFNpemUnLCB0aGlzLm9yaWdpbmFsRm9udFNpemUpXG4gICAgfVxuICB9XG5cbiAgc3Vic2NyaWJlVG9Gb250U2l6ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLm9uRGlkQ2hhbmdlKCdlZGl0b3IuZm9udFNpemUnLCAoe29sZFZhbHVlfSkgPT4ge1xuICAgICAgaWYgKHRoaXMub3JpZ2luYWxGb250U2l6ZSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxGb250U2l6ZSA9IG9sZFZhbHVlXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8vIFJlbW92ZXMgdGhlIGl0ZW0ncyB1cmkgZnJvbSB0aGUgbGlzdCBvZiBwb3RlbnRpYWwgaXRlbXMgdG8gcmVvcGVuLlxuICBpdGVtT3BlbmVkIChpdGVtKSB7XG4gICAgbGV0IHVyaVxuICAgIGlmICh0eXBlb2YgaXRlbS5nZXRVUkkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHVyaSA9IGl0ZW0uZ2V0VVJJKClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpdGVtLmdldFVyaSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdXJpID0gaXRlbS5nZXRVcmkoKVxuICAgIH1cblxuICAgIGlmICh1cmkgIT0gbnVsbCkge1xuICAgICAgXy5yZW1vdmUodGhpcy5kZXN0cm95ZWRJdGVtVVJJcywgdXJpKVxuICAgIH1cbiAgfVxuXG4gIC8vIEFkZHMgdGhlIGRlc3Ryb3llZCBpdGVtJ3MgdXJpIHRvIHRoZSBsaXN0IG9mIGl0ZW1zIHRvIHJlb3Blbi5cbiAgZGlkRGVzdHJveVBhbmVJdGVtICh7aXRlbX0pIHtcbiAgICBsZXQgdXJpXG4gICAgaWYgKHR5cGVvZiBpdGVtLmdldFVSSSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdXJpID0gaXRlbS5nZXRVUkkoKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGl0ZW0uZ2V0VXJpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB1cmkgPSBpdGVtLmdldFVyaSgpXG4gICAgfVxuXG4gICAgaWYgKHVyaSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmRlc3Ryb3llZEl0ZW1VUklzLnB1c2godXJpKVxuICAgIH1cbiAgfVxuXG4gIC8vIENhbGxlZCBieSBNb2RlbCBzdXBlcmNsYXNzIHdoZW4gZGVzdHJveWVkXG4gIGRlc3Ryb3llZCAoKSB7XG4gICAgdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXIuZGVzdHJveSgpXG4gICAgdGhpcy5wYW5lQ29udGFpbmVycy5sZWZ0LmRlc3Ryb3koKVxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHQuZGVzdHJveSgpXG4gICAgdGhpcy5wYW5lQ29udGFpbmVycy5ib3R0b20uZGVzdHJveSgpXG4gICAgdGhpcy5jYW5jZWxTdG9wcGVkQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbVRpbWVvdXQoKVxuICAgIGlmICh0aGlzLmFjdGl2ZUl0ZW1TdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYWN0aXZlSXRlbVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICB9XG5cbiAgLypcbiAgU2VjdGlvbjogUGFuZSBMb2NhdGlvbnNcbiAgKi9cblxuICBnZXRDZW50ZXIgKCkge1xuICAgIHJldHVybiB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlclxuICB9XG5cbiAgZ2V0TGVmdERvY2sgKCkge1xuICAgIHJldHVybiB0aGlzLnBhbmVDb250YWluZXJzLmxlZnRcbiAgfVxuXG4gIGdldFJpZ2h0RG9jayAoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHRcbiAgfVxuXG4gIGdldEJvdHRvbURvY2sgKCkge1xuICAgIHJldHVybiB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbVxuICB9XG5cbiAgZ2V0UGFuZUNvbnRhaW5lcnMgKCkge1xuICAgIHJldHVybiBbXG4gICAgICB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlcixcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdCxcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHQsXG4gICAgICB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbVxuICAgIF1cbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFBhbmVsc1xuXG4gIFBhbmVscyBhcmUgdXNlZCB0byBkaXNwbGF5IFVJIHJlbGF0ZWQgdG8gYW4gZWRpdG9yIHdpbmRvdy4gVGhleSBhcmUgcGxhY2VkIGF0IG9uZSBvZiB0aGUgZm91clxuICBlZGdlcyBvZiB0aGUgd2luZG93OiBsZWZ0LCByaWdodCwgdG9wIG9yIGJvdHRvbS4gSWYgdGhlcmUgYXJlIG11bHRpcGxlIHBhbmVscyBvbiB0aGUgc2FtZSB3aW5kb3dcbiAgZWRnZSB0aGV5IGFyZSBzdGFja2VkIGluIG9yZGVyIG9mIHByaW9yaXR5OiBoaWdoZXIgcHJpb3JpdHkgaXMgY2xvc2VyIHRvIHRoZSBjZW50ZXIsIGxvd2VyXG4gIHByaW9yaXR5IHRvd2FyZHMgdGhlIGVkZ2UuXG5cbiAgKk5vdGU6KiBJZiB5b3VyIHBhbmVsIGNoYW5nZXMgaXRzIHNpemUgdGhyb3VnaG91dCBpdHMgbGlmZXRpbWUsIGNvbnNpZGVyIGdpdmluZyBpdCBhIGhpZ2hlclxuICBwcmlvcml0eSwgYWxsb3dpbmcgZml4ZWQgc2l6ZSBwYW5lbHMgdG8gYmUgY2xvc2VyIHRvIHRoZSBlZGdlLiBUaGlzIGFsbG93cyBjb250cm9sIHRhcmdldHMgdG9cbiAgcmVtYWluIG1vcmUgc3RhdGljIGZvciBlYXNpZXIgdGFyZ2V0aW5nIGJ5IHVzZXJzIHRoYXQgZW1wbG95IG1pY2Ugb3IgdHJhY2twYWRzLiAoU2VlXG4gIFthdG9tL2F0b20jNDgzNF0oaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvNDgzNCkgZm9yIGRpc2N1c3Npb24uKVxuICAqL1xuXG4gIC8vIEVzc2VudGlhbDogR2V0IGFuIHtBcnJheX0gb2YgYWxsIHRoZSBwYW5lbCBpdGVtcyBhdCB0aGUgYm90dG9tIG9mIHRoZSBlZGl0b3Igd2luZG93LlxuICBnZXRCb3R0b21QYW5lbHMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVscygnYm90dG9tJylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogQWRkcyBhIHBhbmVsIGl0ZW0gdG8gdGhlIGJvdHRvbSBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgLy9cbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH1cbiAgLy8gICAqIGBpdGVtYCBZb3VyIHBhbmVsIGNvbnRlbnQuIEl0IGNhbiBiZSBET00gZWxlbWVudCwgYSBqUXVlcnkgZWxlbWVudCwgb3JcbiAgLy8gICAgIGEgbW9kZWwgd2l0aCBhIHZpZXcgcmVnaXN0ZXJlZCB2aWEge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfS4gV2UgcmVjb21tZW5kIHRoZVxuICAvLyAgICAgbGF0dGVyLiBTZWUge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgLy8gICAqIGB2aXNpYmxlYCAob3B0aW9uYWwpIHtCb29sZWFufSBmYWxzZSBpZiB5b3Ugd2FudCB0aGUgcGFuZWwgdG8gaW5pdGlhbGx5IGJlIGhpZGRlblxuICAvLyAgICAgKGRlZmF1bHQ6IHRydWUpXG4gIC8vICAgKiBgcHJpb3JpdHlgIChvcHRpb25hbCkge051bWJlcn0gRGV0ZXJtaW5lcyBzdGFja2luZyBvcmRlci4gTG93ZXIgcHJpb3JpdHkgaXRlbXMgYXJlXG4gIC8vICAgICBmb3JjZWQgY2xvc2VyIHRvIHRoZSBlZGdlcyBvZiB0aGUgd2luZG93LiAoZGVmYXVsdDogMTAwKVxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmVsfVxuICBhZGRCb3R0b21QYW5lbCAob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLmFkZFBhbmVsKCdib3R0b20nLCBvcHRpb25zKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgYW4ge0FycmF5fSBvZiBhbGwgdGhlIHBhbmVsIGl0ZW1zIHRvIHRoZSBsZWZ0IG9mIHRoZSBlZGl0b3Igd2luZG93LlxuICBnZXRMZWZ0UGFuZWxzICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYW5lbHMoJ2xlZnQnKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBBZGRzIGEgcGFuZWwgaXRlbSB0byB0aGUgbGVmdCBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgLy9cbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH1cbiAgLy8gICAqIGBpdGVtYCBZb3VyIHBhbmVsIGNvbnRlbnQuIEl0IGNhbiBiZSBET00gZWxlbWVudCwgYSBqUXVlcnkgZWxlbWVudCwgb3JcbiAgLy8gICAgIGEgbW9kZWwgd2l0aCBhIHZpZXcgcmVnaXN0ZXJlZCB2aWEge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfS4gV2UgcmVjb21tZW5kIHRoZVxuICAvLyAgICAgbGF0dGVyLiBTZWUge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgLy8gICAqIGB2aXNpYmxlYCAob3B0aW9uYWwpIHtCb29sZWFufSBmYWxzZSBpZiB5b3Ugd2FudCB0aGUgcGFuZWwgdG8gaW5pdGlhbGx5IGJlIGhpZGRlblxuICAvLyAgICAgKGRlZmF1bHQ6IHRydWUpXG4gIC8vICAgKiBgcHJpb3JpdHlgIChvcHRpb25hbCkge051bWJlcn0gRGV0ZXJtaW5lcyBzdGFja2luZyBvcmRlci4gTG93ZXIgcHJpb3JpdHkgaXRlbXMgYXJlXG4gIC8vICAgICBmb3JjZWQgY2xvc2VyIHRvIHRoZSBlZGdlcyBvZiB0aGUgd2luZG93LiAoZGVmYXVsdDogMTAwKVxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmVsfVxuICBhZGRMZWZ0UGFuZWwgKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRQYW5lbCgnbGVmdCcsIG9wdGlvbnMpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEdldCBhbiB7QXJyYXl9IG9mIGFsbCB0aGUgcGFuZWwgaXRlbXMgdG8gdGhlIHJpZ2h0IG9mIHRoZSBlZGl0b3Igd2luZG93LlxuICBnZXRSaWdodFBhbmVscyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFuZWxzKCdyaWdodCcpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEFkZHMgYSBwYW5lbCBpdGVtIHRvIHRoZSByaWdodCBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgLy9cbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH1cbiAgLy8gICAqIGBpdGVtYCBZb3VyIHBhbmVsIGNvbnRlbnQuIEl0IGNhbiBiZSBET00gZWxlbWVudCwgYSBqUXVlcnkgZWxlbWVudCwgb3JcbiAgLy8gICAgIGEgbW9kZWwgd2l0aCBhIHZpZXcgcmVnaXN0ZXJlZCB2aWEge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfS4gV2UgcmVjb21tZW5kIHRoZVxuICAvLyAgICAgbGF0dGVyLiBTZWUge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgLy8gICAqIGB2aXNpYmxlYCAob3B0aW9uYWwpIHtCb29sZWFufSBmYWxzZSBpZiB5b3Ugd2FudCB0aGUgcGFuZWwgdG8gaW5pdGlhbGx5IGJlIGhpZGRlblxuICAvLyAgICAgKGRlZmF1bHQ6IHRydWUpXG4gIC8vICAgKiBgcHJpb3JpdHlgIChvcHRpb25hbCkge051bWJlcn0gRGV0ZXJtaW5lcyBzdGFja2luZyBvcmRlci4gTG93ZXIgcHJpb3JpdHkgaXRlbXMgYXJlXG4gIC8vICAgICBmb3JjZWQgY2xvc2VyIHRvIHRoZSBlZGdlcyBvZiB0aGUgd2luZG93LiAoZGVmYXVsdDogMTAwKVxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmVsfVxuICBhZGRSaWdodFBhbmVsIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUGFuZWwoJ3JpZ2h0Jywgb3B0aW9ucylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IGFuIHtBcnJheX0gb2YgYWxsIHRoZSBwYW5lbCBpdGVtcyBhdCB0aGUgdG9wIG9mIHRoZSBlZGl0b3Igd2luZG93LlxuICBnZXRUb3BQYW5lbHMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVscygndG9wJylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogQWRkcyBhIHBhbmVsIGl0ZW0gdG8gdGhlIHRvcCBvZiB0aGUgZWRpdG9yIHdpbmRvdyBhYm92ZSB0aGUgdGFicy5cbiAgLy9cbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH1cbiAgLy8gICAqIGBpdGVtYCBZb3VyIHBhbmVsIGNvbnRlbnQuIEl0IGNhbiBiZSBET00gZWxlbWVudCwgYSBqUXVlcnkgZWxlbWVudCwgb3JcbiAgLy8gICAgIGEgbW9kZWwgd2l0aCBhIHZpZXcgcmVnaXN0ZXJlZCB2aWEge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfS4gV2UgcmVjb21tZW5kIHRoZVxuICAvLyAgICAgbGF0dGVyLiBTZWUge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgLy8gICAqIGB2aXNpYmxlYCAob3B0aW9uYWwpIHtCb29sZWFufSBmYWxzZSBpZiB5b3Ugd2FudCB0aGUgcGFuZWwgdG8gaW5pdGlhbGx5IGJlIGhpZGRlblxuICAvLyAgICAgKGRlZmF1bHQ6IHRydWUpXG4gIC8vICAgKiBgcHJpb3JpdHlgIChvcHRpb25hbCkge051bWJlcn0gRGV0ZXJtaW5lcyBzdGFja2luZyBvcmRlci4gTG93ZXIgcHJpb3JpdHkgaXRlbXMgYXJlXG4gIC8vICAgICBmb3JjZWQgY2xvc2VyIHRvIHRoZSBlZGdlcyBvZiB0aGUgd2luZG93LiAoZGVmYXVsdDogMTAwKVxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmVsfVxuICBhZGRUb3BQYW5lbCAob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLmFkZFBhbmVsKCd0b3AnLCBvcHRpb25zKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgYW4ge0FycmF5fSBvZiBhbGwgdGhlIHBhbmVsIGl0ZW1zIGluIHRoZSBoZWFkZXIuXG4gIGdldEhlYWRlclBhbmVscyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFuZWxzKCdoZWFkZXInKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBBZGRzIGEgcGFuZWwgaXRlbSB0byB0aGUgaGVhZGVyLlxuICAvL1xuICAvLyAqIGBvcHRpb25zYCB7T2JqZWN0fVxuICAvLyAgICogYGl0ZW1gIFlvdXIgcGFuZWwgY29udGVudC4gSXQgY2FuIGJlIERPTSBlbGVtZW50LCBhIGpRdWVyeSBlbGVtZW50LCBvclxuICAvLyAgICAgYSBtb2RlbCB3aXRoIGEgdmlldyByZWdpc3RlcmVkIHZpYSB7Vmlld1JlZ2lzdHJ5OjphZGRWaWV3UHJvdmlkZXJ9LiBXZSByZWNvbW1lbmQgdGhlXG4gIC8vICAgICBsYXR0ZXIuIFNlZSB7Vmlld1JlZ2lzdHJ5OjphZGRWaWV3UHJvdmlkZXJ9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAvLyAgICogYHZpc2libGVgIChvcHRpb25hbCkge0Jvb2xlYW59IGZhbHNlIGlmIHlvdSB3YW50IHRoZSBwYW5lbCB0byBpbml0aWFsbHkgYmUgaGlkZGVuXG4gIC8vICAgICAoZGVmYXVsdDogdHJ1ZSlcbiAgLy8gICAqIGBwcmlvcml0eWAgKG9wdGlvbmFsKSB7TnVtYmVyfSBEZXRlcm1pbmVzIHN0YWNraW5nIG9yZGVyLiBMb3dlciBwcmlvcml0eSBpdGVtcyBhcmVcbiAgLy8gICAgIGZvcmNlZCBjbG9zZXIgdG8gdGhlIGVkZ2VzIG9mIHRoZSB3aW5kb3cuIChkZWZhdWx0OiAxMDApXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UGFuZWx9XG4gIGFkZEhlYWRlclBhbmVsIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUGFuZWwoJ2hlYWRlcicsIG9wdGlvbnMpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEdldCBhbiB7QXJyYXl9IG9mIGFsbCB0aGUgcGFuZWwgaXRlbXMgaW4gdGhlIGZvb3Rlci5cbiAgZ2V0Rm9vdGVyUGFuZWxzICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYW5lbHMoJ2Zvb3RlcicpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEFkZHMgYSBwYW5lbCBpdGVtIHRvIHRoZSBmb290ZXIuXG4gIC8vXG4gIC8vICogYG9wdGlvbnNgIHtPYmplY3R9XG4gIC8vICAgKiBgaXRlbWAgWW91ciBwYW5lbCBjb250ZW50LiBJdCBjYW4gYmUgRE9NIGVsZW1lbnQsIGEgalF1ZXJ5IGVsZW1lbnQsIG9yXG4gIC8vICAgICBhIG1vZGVsIHdpdGggYSB2aWV3IHJlZ2lzdGVyZWQgdmlhIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0uIFdlIHJlY29tbWVuZCB0aGVcbiAgLy8gICAgIGxhdHRlci4gU2VlIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIC8vICAgKiBgdmlzaWJsZWAgKG9wdGlvbmFsKSB7Qm9vbGVhbn0gZmFsc2UgaWYgeW91IHdhbnQgdGhlIHBhbmVsIHRvIGluaXRpYWxseSBiZSBoaWRkZW5cbiAgLy8gICAgIChkZWZhdWx0OiB0cnVlKVxuICAvLyAgICogYHByaW9yaXR5YCAob3B0aW9uYWwpIHtOdW1iZXJ9IERldGVybWluZXMgc3RhY2tpbmcgb3JkZXIuIExvd2VyIHByaW9yaXR5IGl0ZW1zIGFyZVxuICAvLyAgICAgZm9yY2VkIGNsb3NlciB0byB0aGUgZWRnZXMgb2YgdGhlIHdpbmRvdy4gKGRlZmF1bHQ6IDEwMClcbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lbH1cbiAgYWRkRm9vdGVyUGFuZWwgKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRQYW5lbCgnZm9vdGVyJywgb3B0aW9ucylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IGFuIHtBcnJheX0gb2YgYWxsIHRoZSBtb2RhbCBwYW5lbCBpdGVtc1xuICBnZXRNb2RhbFBhbmVscyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFuZWxzKCdtb2RhbCcpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEFkZHMgYSBwYW5lbCBpdGVtIGFzIGEgbW9kYWwgZGlhbG9nLlxuICAvL1xuICAvLyAqIGBvcHRpb25zYCB7T2JqZWN0fVxuICAvLyAgICogYGl0ZW1gIFlvdXIgcGFuZWwgY29udGVudC4gSXQgY2FuIGJlIGEgRE9NIGVsZW1lbnQsIGEgalF1ZXJ5IGVsZW1lbnQsIG9yXG4gIC8vICAgICBhIG1vZGVsIHdpdGggYSB2aWV3IHJlZ2lzdGVyZWQgdmlhIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0uIFdlIHJlY29tbWVuZCB0aGVcbiAgLy8gICAgIG1vZGVsIG9wdGlvbi4gU2VlIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIC8vICAgKiBgdmlzaWJsZWAgKG9wdGlvbmFsKSB7Qm9vbGVhbn0gZmFsc2UgaWYgeW91IHdhbnQgdGhlIHBhbmVsIHRvIGluaXRpYWxseSBiZSBoaWRkZW5cbiAgLy8gICAgIChkZWZhdWx0OiB0cnVlKVxuICAvLyAgICogYHByaW9yaXR5YCAob3B0aW9uYWwpIHtOdW1iZXJ9IERldGVybWluZXMgc3RhY2tpbmcgb3JkZXIuIExvd2VyIHByaW9yaXR5IGl0ZW1zIGFyZVxuICAvLyAgICAgZm9yY2VkIGNsb3NlciB0byB0aGUgZWRnZXMgb2YgdGhlIHdpbmRvdy4gKGRlZmF1bHQ6IDEwMClcbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lbH1cbiAgYWRkTW9kYWxQYW5lbCAob3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUGFuZWwoJ21vZGFsJywgb3B0aW9ucylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogUmV0dXJucyB0aGUge1BhbmVsfSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGl0ZW0uIFJldHVybnNcbiAgLy8gYG51bGxgIHdoZW4gdGhlIGl0ZW0gaGFzIG5vIHBhbmVsLlxuICAvL1xuICAvLyAqIGBpdGVtYCBJdGVtIHRoZSBwYW5lbCBjb250YWluc1xuICBwYW5lbEZvckl0ZW0gKGl0ZW0pIHtcbiAgICBmb3IgKGxldCBsb2NhdGlvbiBpbiB0aGlzLnBhbmVsQ29udGFpbmVycykge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5wYW5lbENvbnRhaW5lcnNbbG9jYXRpb25dXG4gICAgICBjb25zdCBwYW5lbCA9IGNvbnRhaW5lci5wYW5lbEZvckl0ZW0oaXRlbSlcbiAgICAgIGlmIChwYW5lbCAhPSBudWxsKSB7IHJldHVybiBwYW5lbCB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBnZXRQYW5lbHMgKGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMucGFuZWxDb250YWluZXJzW2xvY2F0aW9uXS5nZXRQYW5lbHMoKVxuICB9XG5cbiAgYWRkUGFuZWwgKGxvY2F0aW9uLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkgeyBvcHRpb25zID0ge30gfVxuICAgIHJldHVybiB0aGlzLnBhbmVsQ29udGFpbmVyc1tsb2NhdGlvbl0uYWRkUGFuZWwobmV3IFBhbmVsKG9wdGlvbnMsIHRoaXMudmlld1JlZ2lzdHJ5KSlcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFNlYXJjaGluZyBhbmQgUmVwbGFjaW5nXG4gICovXG5cbiAgLy8gUHVibGljOiBQZXJmb3JtcyBhIHNlYXJjaCBhY3Jvc3MgYWxsIGZpbGVzIGluIHRoZSB3b3Jrc3BhY2UuXG4gIC8vXG4gIC8vICogYHJlZ2V4YCB7UmVnRXhwfSB0byBzZWFyY2ggd2l0aC5cbiAgLy8gKiBgb3B0aW9uc2AgKG9wdGlvbmFsKSB7T2JqZWN0fVxuICAvLyAgICogYHBhdGhzYCBBbiB7QXJyYXl9IG9mIGdsb2IgcGF0dGVybnMgdG8gc2VhcmNoIHdpdGhpbi5cbiAgLy8gICAqIGBvblBhdGhzU2VhcmNoZWRgIChvcHRpb25hbCkge0Z1bmN0aW9ufSB0byBiZSBwZXJpb2RpY2FsbHkgY2FsbGVkXG4gIC8vICAgICB3aXRoIG51bWJlciBvZiBwYXRocyBzZWFyY2hlZC5cbiAgLy8gICAqIGBsZWFkaW5nQ29udGV4dExpbmVDb3VudGAge051bWJlcn0gZGVmYXVsdCBgMGA7IFRoZSBudW1iZXIgb2YgbGluZXNcbiAgLy8gICAgICBiZWZvcmUgdGhlIG1hdGNoZWQgbGluZSB0byBpbmNsdWRlIGluIHRoZSByZXN1bHRzIG9iamVjdC5cbiAgLy8gICAqIGB0cmFpbGluZ0NvbnRleHRMaW5lQ291bnRgIHtOdW1iZXJ9IGRlZmF1bHQgYDBgOyBUaGUgbnVtYmVyIG9mIGxpbmVzXG4gIC8vICAgICAgYWZ0ZXIgdGhlIG1hdGNoZWQgbGluZSB0byBpbmNsdWRlIGluIHRoZSByZXN1bHRzIG9iamVjdC5cbiAgLy8gKiBgaXRlcmF0b3JgIHtGdW5jdGlvbn0gY2FsbGJhY2sgb24gZWFjaCBmaWxlIGZvdW5kLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge1Byb21pc2V9IHdpdGggYSBgY2FuY2VsKClgIG1ldGhvZCB0aGF0IHdpbGwgY2FuY2VsIGFsbFxuICAvLyBvZiB0aGUgdW5kZXJseWluZyBzZWFyY2hlcyB0aGF0IHdlcmUgc3RhcnRlZCBhcyBwYXJ0IG9mIHRoaXMgc2Nhbi5cbiAgc2NhbiAocmVnZXgsIG9wdGlvbnMgPSB7fSwgaXRlcmF0b3IpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKG9wdGlvbnMpKSB7XG4gICAgICBpdGVyYXRvciA9IG9wdGlvbnNcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIC8vIEZpbmQgYSBzZWFyY2hlciBmb3IgZXZlcnkgRGlyZWN0b3J5IGluIHRoZSBwcm9qZWN0LiBFYWNoIHNlYXJjaGVyIHRoYXQgaXMgbWF0Y2hlZFxuICAgIC8vIHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIGFuIEFycmF5IG9mIERpcmVjdG9yeSBvYmplY3RzIGluIHRoZSBNYXAuXG4gICAgY29uc3QgZGlyZWN0b3JpZXNGb3JTZWFyY2hlciA9IG5ldyBNYXAoKVxuICAgIGZvciAoY29uc3QgZGlyZWN0b3J5IG9mIHRoaXMucHJvamVjdC5nZXREaXJlY3RvcmllcygpKSB7XG4gICAgICBsZXQgc2VhcmNoZXIgPSB0aGlzLmRlZmF1bHREaXJlY3RvcnlTZWFyY2hlclxuICAgICAgZm9yIChjb25zdCBkaXJlY3RvcnlTZWFyY2hlciBvZiB0aGlzLmRpcmVjdG9yeVNlYXJjaGVycykge1xuICAgICAgICBpZiAoZGlyZWN0b3J5U2VhcmNoZXIuY2FuU2VhcmNoRGlyZWN0b3J5KGRpcmVjdG9yeSkpIHtcbiAgICAgICAgICBzZWFyY2hlciA9IGRpcmVjdG9yeVNlYXJjaGVyXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV0IGRpcmVjdG9yaWVzID0gZGlyZWN0b3JpZXNGb3JTZWFyY2hlci5nZXQoc2VhcmNoZXIpXG4gICAgICBpZiAoIWRpcmVjdG9yaWVzKSB7XG4gICAgICAgIGRpcmVjdG9yaWVzID0gW11cbiAgICAgICAgZGlyZWN0b3JpZXNGb3JTZWFyY2hlci5zZXQoc2VhcmNoZXIsIGRpcmVjdG9yaWVzKVxuICAgICAgfVxuICAgICAgZGlyZWN0b3JpZXMucHVzaChkaXJlY3RvcnkpXG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSBvblBhdGhzU2VhcmNoZWQgY2FsbGJhY2suXG4gICAgbGV0IG9uUGF0aHNTZWFyY2hlZFxuICAgIGlmIChfLmlzRnVuY3Rpb24ob3B0aW9ucy5vblBhdGhzU2VhcmNoZWQpKSB7XG4gICAgICAvLyBNYWludGFpbiBhIG1hcCBvZiBkaXJlY3RvcmllcyB0byB0aGUgbnVtYmVyIG9mIHNlYXJjaCByZXN1bHRzLiBXaGVuIG5vdGlmaWVkIG9mIGEgbmV3IGNvdW50LFxuICAgICAgLy8gcmVwbGFjZSB0aGUgZW50cnkgaW4gdGhlIG1hcCBhbmQgdXBkYXRlIHRoZSB0b3RhbC5cbiAgICAgIGNvbnN0IG9uUGF0aHNTZWFyY2hlZE9wdGlvbiA9IG9wdGlvbnMub25QYXRoc1NlYXJjaGVkXG4gICAgICBsZXQgdG90YWxOdW1iZXJPZlBhdGhzU2VhcmNoZWQgPSAwXG4gICAgICBjb25zdCBudW1iZXJPZlBhdGhzU2VhcmNoZWRGb3JTZWFyY2hlciA9IG5ldyBNYXAoKVxuICAgICAgb25QYXRoc1NlYXJjaGVkID0gZnVuY3Rpb24gKHNlYXJjaGVyLCBudW1iZXJPZlBhdGhzU2VhcmNoZWQpIHtcbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBudW1iZXJPZlBhdGhzU2VhcmNoZWRGb3JTZWFyY2hlci5nZXQoc2VhcmNoZXIpXG4gICAgICAgIGlmIChvbGRWYWx1ZSkge1xuICAgICAgICAgIHRvdGFsTnVtYmVyT2ZQYXRoc1NlYXJjaGVkIC09IG9sZFZhbHVlXG4gICAgICAgIH1cbiAgICAgICAgbnVtYmVyT2ZQYXRoc1NlYXJjaGVkRm9yU2VhcmNoZXIuc2V0KHNlYXJjaGVyLCBudW1iZXJPZlBhdGhzU2VhcmNoZWQpXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZQYXRoc1NlYXJjaGVkICs9IG51bWJlck9mUGF0aHNTZWFyY2hlZFxuICAgICAgICByZXR1cm4gb25QYXRoc1NlYXJjaGVkT3B0aW9uKHRvdGFsTnVtYmVyT2ZQYXRoc1NlYXJjaGVkKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvblBhdGhzU2VhcmNoZWQgPSBmdW5jdGlvbiAoKSB7fVxuICAgIH1cblxuICAgIC8vIEtpY2sgb2ZmIGFsbCBvZiB0aGUgc2VhcmNoZXMgYW5kIHVuaWZ5IHRoZW0gaW50byBvbmUgUHJvbWlzZS5cbiAgICBjb25zdCBhbGxTZWFyY2hlcyA9IFtdXG4gICAgZGlyZWN0b3JpZXNGb3JTZWFyY2hlci5mb3JFYWNoKChkaXJlY3Rvcmllcywgc2VhcmNoZXIpID0+IHtcbiAgICAgIGNvbnN0IHNlYXJjaE9wdGlvbnMgPSB7XG4gICAgICAgIGluY2x1c2lvbnM6IG9wdGlvbnMucGF0aHMgfHwgW10sXG4gICAgICAgIGluY2x1ZGVIaWRkZW46IHRydWUsXG4gICAgICAgIGV4Y2x1ZGVWY3NJZ25vcmVzOiB0aGlzLmNvbmZpZy5nZXQoJ2NvcmUuZXhjbHVkZVZjc0lnbm9yZWRQYXRocycpLFxuICAgICAgICBleGNsdXNpb25zOiB0aGlzLmNvbmZpZy5nZXQoJ2NvcmUuaWdub3JlZE5hbWVzJyksXG4gICAgICAgIGZvbGxvdzogdGhpcy5jb25maWcuZ2V0KCdjb3JlLmZvbGxvd1N5bWxpbmtzJyksXG4gICAgICAgIGxlYWRpbmdDb250ZXh0TGluZUNvdW50OiBvcHRpb25zLmxlYWRpbmdDb250ZXh0TGluZUNvdW50IHx8IDAsXG4gICAgICAgIHRyYWlsaW5nQ29udGV4dExpbmVDb3VudDogb3B0aW9ucy50cmFpbGluZ0NvbnRleHRMaW5lQ291bnQgfHwgMCxcbiAgICAgICAgZGlkTWF0Y2g6IHJlc3VsdCA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnByb2plY3QuaXNQYXRoTW9kaWZpZWQocmVzdWx0LmZpbGVQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yKHJlc3VsdClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRpZEVycm9yIChlcnJvcikge1xuICAgICAgICAgIHJldHVybiBpdGVyYXRvcihudWxsLCBlcnJvcilcbiAgICAgICAgfSxcbiAgICAgICAgZGlkU2VhcmNoUGF0aHMgKGNvdW50KSB7XG4gICAgICAgICAgcmV0dXJuIG9uUGF0aHNTZWFyY2hlZChzZWFyY2hlciwgY291bnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpcmVjdG9yeVNlYXJjaGVyID0gc2VhcmNoZXIuc2VhcmNoKGRpcmVjdG9yaWVzLCByZWdleCwgc2VhcmNoT3B0aW9ucylcbiAgICAgIGFsbFNlYXJjaGVzLnB1c2goZGlyZWN0b3J5U2VhcmNoZXIpXG4gICAgfSlcbiAgICBjb25zdCBzZWFyY2hQcm9taXNlID0gUHJvbWlzZS5hbGwoYWxsU2VhcmNoZXMpXG5cbiAgICBmb3IgKGxldCBidWZmZXIgb2YgdGhpcy5wcm9qZWN0LmdldEJ1ZmZlcnMoKSkge1xuICAgICAgaWYgKGJ1ZmZlci5pc01vZGlmaWVkKCkpIHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBidWZmZXIuZ2V0UGF0aCgpXG4gICAgICAgIGlmICghdGhpcy5wcm9qZWN0LmNvbnRhaW5zKGZpbGVQYXRoKSkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1hdGNoZXMgPSBbXVxuICAgICAgICBidWZmZXIuc2NhbihyZWdleCwgbWF0Y2ggPT4gbWF0Y2hlcy5wdXNoKG1hdGNoKSlcbiAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGl0ZXJhdG9yKHtmaWxlUGF0aCwgbWF0Y2hlc30pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIFByb21pc2UgdGhhdCBpcyByZXR1cm5lZCB0byB0aGUgY2xpZW50IGlzIGNhbmNlbGFibGUuIFRvIGJlIGNvbnNpc3RlbnRcbiAgICAvLyB3aXRoIHRoZSBleGlzdGluZyBiZWhhdmlvciwgaW5zdGVhZCBvZiBjYW5jZWwoKSByZWplY3RpbmcgdGhlIHByb21pc2UsIGl0IHNob3VsZFxuICAgIC8vIHJlc29sdmUgaXQgd2l0aCB0aGUgc3BlY2lhbCB2YWx1ZSAnY2FuY2VsbGVkJy4gQXQgbGVhc3QgdGhlIGJ1aWx0LWluIGZpbmQtYW5kLXJlcGxhY2VcbiAgICAvLyBwYWNrYWdlIHJlbGllcyBvbiB0aGlzIGJlaGF2aW9yLlxuICAgIGxldCBpc0NhbmNlbGxlZCA9IGZhbHNlXG4gICAgY29uc3QgY2FuY2VsbGFibGVQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgb25TdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoaXNDYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXNvbHZlKCdjYW5jZWxsZWQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUobnVsbClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBvbkZhaWx1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAobGV0IHByb21pc2Ugb2YgYWxsU2VhcmNoZXMpIHsgcHJvbWlzZS5jYW5jZWwoKSB9XG4gICAgICAgIHJlamVjdCgpXG4gICAgICB9XG5cbiAgICAgIHNlYXJjaFByb21pc2UudGhlbihvblN1Y2Nlc3MsIG9uRmFpbHVyZSlcbiAgICB9KVxuICAgIGNhbmNlbGxhYmxlUHJvbWlzZS5jYW5jZWwgPSAoKSA9PiB7XG4gICAgICBpc0NhbmNlbGxlZCA9IHRydWVcbiAgICAgIC8vIE5vdGUgdGhhdCBjYW5jZWxsaW5nIGFsbCBvZiB0aGUgbWVtYmVycyBvZiBhbGxTZWFyY2hlcyB3aWxsIGNhdXNlIGFsbCBvZiB0aGUgc2VhcmNoZXNcbiAgICAgIC8vIHRvIHJlc29sdmUsIHdoaWNoIGNhdXNlcyBzZWFyY2hQcm9taXNlIHRvIHJlc29sdmUsIHdoaWNoIGlzIHVsdGltYXRlbHkgd2hhdCBjYXVzZXNcbiAgICAgIC8vIGNhbmNlbGxhYmxlUHJvbWlzZSB0byByZXNvbHZlLlxuICAgICAgYWxsU2VhcmNoZXMubWFwKChwcm9taXNlKSA9PiBwcm9taXNlLmNhbmNlbCgpKVxuICAgIH1cblxuICAgIC8vIEFsdGhvdWdoIHRoaXMgbWV0aG9kIGNsYWltcyB0byByZXR1cm4gYSBgUHJvbWlzZWAsIHRoZSBgUmVzdWx0c1BhbmVWaWV3Lm9uU2VhcmNoKClgXG4gICAgLy8gbWV0aG9kIGluIHRoZSBmaW5kLWFuZC1yZXBsYWNlIHBhY2thZ2UgZXhwZWN0cyB0aGUgb2JqZWN0IHJldHVybmVkIGJ5IHRoaXMgbWV0aG9kIHRvIGhhdmUgYVxuICAgIC8vIGBkb25lKClgIG1ldGhvZC4gSW5jbHVkZSBhIGRvbmUoKSBtZXRob2QgdW50aWwgZmluZC1hbmQtcmVwbGFjZSBjYW4gYmUgdXBkYXRlZC5cbiAgICBjYW5jZWxsYWJsZVByb21pc2UuZG9uZSA9IG9uU3VjY2Vzc09yRmFpbHVyZSA9PiB7XG4gICAgICBjYW5jZWxsYWJsZVByb21pc2UudGhlbihvblN1Y2Nlc3NPckZhaWx1cmUsIG9uU3VjY2Vzc09yRmFpbHVyZSlcbiAgICB9XG4gICAgcmV0dXJuIGNhbmNlbGxhYmxlUHJvbWlzZVxuICB9XG5cbiAgLy8gUHVibGljOiBQZXJmb3JtcyBhIHJlcGxhY2UgYWNyb3NzIGFsbCB0aGUgc3BlY2lmaWVkIGZpbGVzIGluIHRoZSBwcm9qZWN0LlxuICAvL1xuICAvLyAqIGByZWdleGAgQSB7UmVnRXhwfSB0byBzZWFyY2ggd2l0aC5cbiAgLy8gKiBgcmVwbGFjZW1lbnRUZXh0YCB7U3RyaW5nfSB0byByZXBsYWNlIGFsbCBtYXRjaGVzIG9mIHJlZ2V4IHdpdGguXG4gIC8vICogYGZpbGVQYXRoc2AgQW4ge0FycmF5fSBvZiBmaWxlIHBhdGggc3RyaW5ncyB0byBydW4gdGhlIHJlcGxhY2Ugb24uXG4gIC8vICogYGl0ZXJhdG9yYCBBIHtGdW5jdGlvbn0gY2FsbGJhY2sgb24gZWFjaCBmaWxlIHdpdGggcmVwbGFjZW1lbnRzOlxuICAvLyAgICogYG9wdGlvbnNgIHtPYmplY3R9IHdpdGgga2V5cyBgZmlsZVBhdGhgIGFuZCBgcmVwbGFjZW1lbnRzYC5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQcm9taXNlfS5cbiAgcmVwbGFjZSAocmVnZXgsIHJlcGxhY2VtZW50VGV4dCwgZmlsZVBhdGhzLCBpdGVyYXRvcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgYnVmZmVyXG4gICAgICBjb25zdCBvcGVuUGF0aHMgPSB0aGlzLnByb2plY3QuZ2V0QnVmZmVycygpLm1hcChidWZmZXIgPT4gYnVmZmVyLmdldFBhdGgoKSlcbiAgICAgIGNvbnN0IG91dE9mUHJvY2Vzc1BhdGhzID0gXy5kaWZmZXJlbmNlKGZpbGVQYXRocywgb3BlblBhdGhzKVxuXG4gICAgICBsZXQgaW5Qcm9jZXNzRmluaXNoZWQgPSAhb3BlblBhdGhzLmxlbmd0aFxuICAgICAgbGV0IG91dE9mUHJvY2Vzc0ZpbmlzaGVkID0gIW91dE9mUHJvY2Vzc1BhdGhzLmxlbmd0aFxuICAgICAgY29uc3QgY2hlY2tGaW5pc2hlZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKG91dE9mUHJvY2Vzc0ZpbmlzaGVkICYmIGluUHJvY2Vzc0ZpbmlzaGVkKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFvdXRPZlByb2Nlc3NGaW5pc2hlZC5sZW5ndGgpIHtcbiAgICAgICAgbGV0IGZsYWdzID0gJ2cnXG4gICAgICAgIGlmIChyZWdleC5pZ25vcmVDYXNlKSB7IGZsYWdzICs9ICdpJyB9XG5cbiAgICAgICAgY29uc3QgdGFzayA9IFRhc2sub25jZShcbiAgICAgICAgICByZXF1aXJlLnJlc29sdmUoJy4vcmVwbGFjZS1oYW5kbGVyJyksXG4gICAgICAgICAgb3V0T2ZQcm9jZXNzUGF0aHMsXG4gICAgICAgICAgcmVnZXguc291cmNlLFxuICAgICAgICAgIGZsYWdzLFxuICAgICAgICAgIHJlcGxhY2VtZW50VGV4dCxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBvdXRPZlByb2Nlc3NGaW5pc2hlZCA9IHRydWVcbiAgICAgICAgICAgIGNoZWNrRmluaXNoZWQoKVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuXG4gICAgICAgIHRhc2sub24oJ3JlcGxhY2U6cGF0aC1yZXBsYWNlZCcsIGl0ZXJhdG9yKVxuICAgICAgICB0YXNrLm9uKCdyZXBsYWNlOmZpbGUtZXJyb3InLCBlcnJvciA9PiB7IGl0ZXJhdG9yKG51bGwsIGVycm9yKSB9KVxuICAgICAgfVxuXG4gICAgICBmb3IgKGJ1ZmZlciBvZiB0aGlzLnByb2plY3QuZ2V0QnVmZmVycygpKSB7XG4gICAgICAgIGlmICghZmlsZVBhdGhzLmluY2x1ZGVzKGJ1ZmZlci5nZXRQYXRoKCkpKSB7IGNvbnRpbnVlIH1cbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRzID0gYnVmZmVyLnJlcGxhY2UocmVnZXgsIHJlcGxhY2VtZW50VGV4dCwgaXRlcmF0b3IpXG4gICAgICAgIGlmIChyZXBsYWNlbWVudHMpIHtcbiAgICAgICAgICBpdGVyYXRvcih7ZmlsZVBhdGg6IGJ1ZmZlci5nZXRQYXRoKCksIHJlcGxhY2VtZW50c30pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW5Qcm9jZXNzRmluaXNoZWQgPSB0cnVlXG4gICAgICBjaGVja0ZpbmlzaGVkKClcbiAgICB9KVxuICB9XG5cbiAgY2hlY2tvdXRIZWFkUmV2aXNpb24gKGVkaXRvcikge1xuICAgIGlmIChlZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICBjb25zdCBjaGVja291dEhlYWQgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeShuZXcgRGlyZWN0b3J5KGVkaXRvci5nZXREaXJlY3RvcnlQYXRoKCkpKVxuICAgICAgICAgIC50aGVuKHJlcG9zaXRvcnkgPT4gcmVwb3NpdG9yeSAhPSBudWxsID8gcmVwb3NpdG9yeS5jaGVja291dEhlYWRGb3JFZGl0b3IoZWRpdG9yKSA6IHVuZGVmaW5lZClcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29uZmlnLmdldCgnZWRpdG9yLmNvbmZpcm1DaGVja291dEhlYWRSZXZpc2lvbicpKSB7XG4gICAgICAgIHRoaXMuYXBwbGljYXRpb25EZWxlZ2F0ZS5jb25maXJtKHtcbiAgICAgICAgICBtZXNzYWdlOiAnQ29uZmlybSBDaGVja291dCBIRUFEIFJldmlzaW9uJyxcbiAgICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGlzY2FyZCBhbGwgY2hhbmdlcyB0byBcIiR7ZWRpdG9yLmdldEZpbGVOYW1lKCl9XCIgc2luY2UgdGhlIGxhc3QgR2l0IGNvbW1pdD9gLFxuICAgICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAgIE9LOiBjaGVja291dEhlYWQsXG4gICAgICAgICAgICBDYW5jZWw6IG51bGxcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY2hlY2tvdXRIZWFkKClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSlcbiAgICB9XG4gIH1cbn1cbiJdfQ==