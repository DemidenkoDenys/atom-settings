Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

exports.consumeElementIcons = consumeElementIcons;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var _atom = require('atom');

var _eventKit = require('event-kit');

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _models = require('./models');

var _utils = require('./utils');

var addIconToElement = null;

/**
 * Consumer for file-icons
 * https://github.com/DanBrooker/file-icons
 */

function consumeElementIcons(cb) {
    addIconToElement = cb;
    return new _atom.Disposable(function () {
        addIconToElement = null;
    });
}

var AdvancedOpenFileView = (function () {
    function AdvancedOpenFileView() {
        var _this = this;

        _classCallCheck(this, AdvancedOpenFileView);

        this.emitter = new _eventKit.Emitter();
        this.cursorIndex = null;
        this._updatingPath = false;

        // Element references
        this.pathInput = this.content.querySelector('.path-input');
        this.pathList = this.content.querySelector('.list-group');
        this.parentDirectoryListItem = this.content.querySelector('.parent-directory');

        // Initialize text editor
        this.pathEditor = this.pathInput.getModel();
        this.pathEditor.setPlaceholderText('/path/to/file.txt');
        this.pathEditor.setSoftWrapped(false);

        // Update the path list whenever the path changes.
        this.pathEditor.onDidChange(function () {
            var newPath = new _models.Path(_this.pathEditor.getText());

            _this.parentDirectoryListItem.dataset.fileName = newPath.parent().full;

            _this.setPathList(newPath.matchingPaths(), {
                hideParent: newPath.fragment !== '' || newPath.isRoot(),
                sort: !(config.get('fuzzyMatch') && newPath.fragment !== '')
            });
        });

        this.content.addEventListener('click', function (ev) {
            // Keep focus on the text input and do not propagate so that the
            // outside click handler doesn't pick up the event.
            ev.stopPropagation();
            _this.pathInput.focus();
        });

        this.content.addEventListener('click', function (ev) {
            var _context;

            if ((_context = ev.target, _utils.closest).call(_context, '.add-project-folder') !== null) {
                var _context2;

                var _listItem = (_context2 = ev.target, _utils.closest).call(_context2, '.list-item');
                _this.emitter.emit('did-click-add-project-folder', _listItem.dataset.fileName);
                return; // Don't try to enter the folder too!
            }

            var listItem = (_context = ev.target, _utils.closest).call(_context, '.list-item');
            if (listItem !== null) {
                _this.emitter.emit('did-click-file', listItem.dataset.fileName);
            }
        });
    }

    _createDecoratedClass(AdvancedOpenFileView, [{
        key: 'createPathListItem',
        value: function createPathListItem(path) {
            var icon = path.isDirectory() ? 'icon-file-directory' : 'icon-file-text';
            return '\n            <li class="list-item ' + (path.isDirectory() ? 'directory' : '') + '"\n                data-file-name="' + path.full + '">\n                <span class="filename icon ' + icon + '"\n                      data-name="' + path.fragment + '">\n                    ' + path.fragment + '\n                </span>\n                ' + (path.isDirectory() && !path.isProjectDirectory() ? this.addProjectButton() : '') + '\n            </li>\n        ';
        }
    }, {
        key: 'addProjectButton',
        value: function addProjectButton() {
            return '\n            <span class="add-project-folder icon icon-plus"\n                title="Open as project folder">\n            </span>\n        ';
        }
    }, {
        key: 'createModalPanel',
        value: function createModalPanel() {
            var _this2 = this;

            var panel = atom.workspace.addModalPanel({
                item: this.content
            });

            // Bind the outside click handler and destroy it when the panel is
            // destroyed.
            var outsideClickHandler = function outsideClickHandler(ev) {
                var _context3;

                if ((_context3 = ev.target, _utils.closest).call(_context3, '.advanced-open-file') === null) {
                    _this2.emitter.emit('did-click-outside');
                }
            };

            document.documentElement.addEventListener('click', outsideClickHandler);
            panel.onDidDestroy(function () {
                document.documentElement.removeEventListener('click', outsideClickHandler);
            });

            var modal = this.content.parentNode;
            modal.style.maxHeight = document.body.clientHeight - modal.offsetTop + 'px';
            modal.style.display = 'flex';
            modal.style.flexDirection = 'column';

            this.pathInput.focus();

            return panel;
        }

        /**
         * Re-render list item for the given path, if it exists.
         */
    }, {
        key: 'refreshPathListItem',
        value: function refreshPathListItem(path) {
            var listItem = this.content.querySelector('.list-item[data-file-name="' + path.full + '"]');
            if (listItem) {
                var newListItem = (0, _utils.dom)(this.createPathListItem(path));
                listItem.parentNode.replaceChild(newListItem, listItem);
            }
        }
    }, {
        key: 'onDidClickFile',
        value: function onDidClickFile(callback) {
            this.emitter.on('did-click-file', callback);
        }
    }, {
        key: 'onDidClickAddProjectFolder',
        value: function onDidClickAddProjectFolder(callback) {
            this.emitter.on('did-click-add-project-folder', callback);
        }
    }, {
        key: 'onDidClickOutside',
        value: function onDidClickOutside(callback) {
            this.emitter.on('did-click-outside', callback);
        }

        /**
         * Subscribe to user-initiated changes in the path.
         */
    }, {
        key: 'onDidPathChange',
        value: function onDidPathChange(callback) {
            var _this3 = this;

            this.pathEditor.onDidChange(function () {
                if (!_this3._updatingPath) {
                    callback(new _models.Path(_this3.pathEditor.getText()));
                }
            });
        }
    }, {
        key: 'selectedPath',
        value: function selectedPath() {
            if (this.cursorIndex !== null) {
                var selected = this.pathList.querySelector('.list-item.selected');
                if (selected !== null) {
                    return new _models.Path(selected.dataset.fileName);
                }
            }

            return null;
        }
    }, {
        key: 'firstPath',
        value: function firstPath() {
            var pathItems = this.pathList.querySelectorAll('.list-item:not(.parent-directory)');
            if (pathItems.length > 0) {
                return new _models.Path(pathItems[0].dataset.fileName);
            } else {
                return null;
            }
        }
    }, {
        key: 'pathListLength',
        value: function pathListLength() {
            return this.pathList.querySelectorAll('.list-item:not(.hidden)').length;
        }
    }, {
        key: 'setPath',
        value: function setPath(path) {
            this._updatingPath = true;

            this.pathEditor.setText(path.full);
            this.pathEditor.scrollToCursorPosition();

            this._updatingPath = false;
        }
    }, {
        key: 'forEachListItem',
        value: function forEachListItem(selector, callback) {
            var listItems = this.pathList.querySelectorAll(selector);
            for (var k = 0; k < listItems.length; k++) {
                callback(listItems[k]);
            }
        }
    }, {
        key: 'setPathList',
        value: function setPathList(paths) {
            var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var _ref$hideParent = _ref.hideParent;
            var hideParent = _ref$hideParent === undefined ? false : _ref$hideParent;
            var _ref$sort = _ref.sort;
            var sort = _ref$sort === undefined ? true : _ref$sort;

            this.cursorIndex = null;

            this.forEachListItem('.list-item.selected', function (listItem) {
                listItem.classList.remove('selected');
            });

            this.forEachListItem('.list-item:not(.parent-directory)', function (listItem) {
                listItem.remove();
            });

            if (paths.length === 0 || hideParent) {
                this.parentDirectoryListItem.classList.add('hidden');
            } else {
                this.parentDirectoryListItem.classList.remove('hidden');
            }

            if (paths.length > 0) {
                if (sort) {
                    // Split list into directories and files and sort them.
                    paths = paths.sort(_models.Path.compare);
                    var directoryPaths = paths.filter(function (path) {
                        return path.isDirectory();
                    });
                    var filePaths = paths.filter(function (path) {
                        return path.isFile();
                    });
                    this._appendToPathList(directoryPaths);
                    this._appendToPathList(filePaths);
                } else {
                    this._appendToPathList(paths);
                }
            }
        }
    }, {
        key: '_appendToPathList',
        value: function _appendToPathList(paths) {
            for (var path of paths) {
                if (path.exists()) {
                    var listItem = (0, _utils.dom)(this.createPathListItem(path));
                    if (addIconToElement) {
                        var filenameElement = listItem.querySelector('.filename.icon');
                        filenameElement.classList.remove('icon-file-text', 'icon-file-directory');
                        addIconToElement(filenameElement, path.absolute);
                    }
                    this.pathList.appendChild(listItem);
                }
            }
        }
    }, {
        key: 'setCursorIndex',
        value: function setCursorIndex(index) {
            if (index < 0 || index >= this.pathListLength()) {
                index = null;
            }

            this.cursorIndex = index;
            this.forEachListItem('.list-item.selected', function (listItem) {
                listItem.classList.remove('selected');
            });

            if (this.cursorIndex !== null) {
                var listItems = this.pathList.querySelectorAll('.list-item:not(.hidden)');
                if (listItems.length > index) {
                    var selected = listItems[index];
                    selected.classList.add('selected');

                    // If the selected element is out of view, scroll it into view.
                    var parentElement = selected.parentElement;
                    var selectedTop = selected.offsetTop;
                    var parentScrollBottom = parentElement.scrollTop + parentElement.clientHeight;
                    if (selectedTop < parentElement.scrollTop) {
                        parentElement.scrollTop = selectedTop;
                    } else if (selectedTop >= parentScrollBottom) {
                        var selectedBottom = selectedTop + selected.clientHeight;
                        parentElement.scrollTop += selectedBottom - parentScrollBottom;
                    }
                }
            }
        }
    }, {
        key: 'content',
        decorators: [_utils.cachedProperty],
        get: function get() {
            return (0, _utils.dom)('\n            <div class="advanced-open-file">\n                <p class="info-message icon icon-file-add">\n                    Enter the path for the file to open or create.\n                </p>\n                <div class="path-input-container">\n                    <atom-text-editor class="path-input" mini></atom-text-editor>\n                </div>\n                <ul class="list-group">\n                    <li class="list-item parent-directory">\n                        <span class="icon icon-file-directory">..</span>\n                    </li>\n                </ul>\n            </div>\n        ');
        }
    }]);

    return AdvancedOpenFileView;
})();

exports['default'] = AdvancedOpenFileView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvTGVueW1vLy5hdG9tL3BhY2thZ2VzL2FkdmFuY2VkLW9wZW4tZmlsZS9saWIvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFDeUIsTUFBTTs7d0JBQ1QsV0FBVzs7c0JBRVQsVUFBVTs7SUFBdEIsTUFBTTs7c0JBQ0MsVUFBVTs7cUJBQ2MsU0FBUzs7QUFFcEQsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7Ozs7Ozs7QUFNckIsU0FBUyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUU7QUFDcEMsb0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFdBQU8scUJBQWUsWUFBTTtBQUN4Qix3QkFBZ0IsR0FBRyxJQUFJLENBQUM7S0FDM0IsQ0FBQyxDQUFDO0NBQ047O0lBRW9CLG9CQUFvQjtBQUMxQixhQURNLG9CQUFvQixHQUN2Qjs7OzhCQURHLG9CQUFvQjs7QUFFakMsWUFBSSxDQUFDLE9BQU8sR0FBRyx1QkFBYSxDQUFDO0FBQzdCLFlBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDOzs7QUFHM0IsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzRCxZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzFELFlBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOzs7QUFHL0UsWUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzVDLFlBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN4RCxZQUFJLENBQUMsVUFBVSxD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VyxJQUFJLGtCQUFrQixFQUFFO0FBQzFDLDRCQUFJLGNBQWMsR0FBRyxXQUFXLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztBQUN6RCxxQ0FBYSxDQUFDLFNBQVMsSUFBSSxjQUFjLEdBQUcsa0JBQWtCLENBQUM7cUJBQ2xFO2lCQUNKO2FBQ0o7U0FDSjs7OzthQXpOVSxlQUFHO0FBQ1YsbUJBQU8sdW5CQWNMLENBQUM7U0FDTjs7O1dBbEVnQixvQkFBb0I7OztxQkFBcEIsb0JBQW9CIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvTGVueW1vLy5hdG9tL3BhY2thZ2VzL2FkdmFuY2VkLW9wZW4tZmlsZS9saWIvdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbmltcG9ydCB7RGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2V2ZW50LWtpdCc7XG5cbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge1BhdGh9IGZyb20gJy4vbW9kZWxzJztcbmltcG9ydCB7Y2FjaGVkUHJvcGVydHksIGNsb3Nlc3QsIGRvbX0gZnJvbSAnLi91dGlscyc7XG5cbmxldCBhZGRJY29uVG9FbGVtZW50ID0gbnVsbDtcblxuLyoqXG4gKiBDb25zdW1lciBmb3IgZmlsZS1pY29uc1xuICogaHR0cHM6Ly9naXRodWIuY29tL0RhbkJyb29rZXIvZmlsZS1pY29uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZUVsZW1lbnRJY29ucyhjYikge1xuICAgIGFkZEljb25Ub0VsZW1lbnQgPSBjYjtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBhZGRJY29uVG9FbGVtZW50ID0gbnVsbDtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWR2YW5jZWRPcGVuRmlsZVZpZXcge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAgICB0aGlzLmN1cnNvckluZGV4ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fdXBkYXRpbmdQYXRoID0gZmFsc2U7XG5cbiAgICAgICAgLy8gRWxlbWVudCByZWZlcmVuY2VzXG4gICAgICAgIHRoaXMucGF0aElucHV0ID0gdGhpcy5jb250ZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYXRoLWlucHV0Jyk7XG4gICAgICAgIHRoaXMucGF0aExpc3QgPSB0aGlzLmNvbnRlbnQucXVlcnlTZWxlY3RvcignLmxpc3QtZ3JvdXAnKTtcbiAgICAgICAgdGhpcy5wYXJlbnREaXJlY3RvcnlMaXN0SXRlbSA9IHRoaXMuY29udGVudC5xdWVyeVNlbGVjdG9yKCcucGFyZW50LWRpcmVjdG9yeScpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgdGV4dCBlZGl0b3JcbiAgICAgICAgdGhpcy5wYXRoRWRpdG9yID0gdGhpcy5wYXRoSW5wdXQuZ2V0TW9kZWwoKTtcbiAgICAgICAgdGhpcy5wYXRoRWRpdG9yLnNldFBsYWNlaG9sZGVyVGV4dCgnL3BhdGgvdG8vZmlsZS50eHQnKTtcbiAgICAgICAgdGhpcy5wYXRoRWRpdG9yLnNldFNvZnRXcmFwcGVkKGZhbHNlKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIHBhdGggbGlzdCB3aGVuZXZlciB0aGUgcGF0aCBjaGFuZ2VzLlxuICAgICAgICB0aGlzLnBhdGhFZGl0b3Iub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG5ld1BhdGggPSBuZXcgUGF0aCh0aGlzLnBhdGhFZGl0b3IuZ2V0VGV4dCgpKTtcblxuICAgICAgICAgICAgdGhpcy5wYXJlbnREaXJlY3RvcnlMaXN0SXRlbS5kYXRhc2V0LmZpbGVOYW1lID0gbmV3UGF0aC5wYXJlbnQoKS5mdWxsO1xuXG4gICAgICAgICAgICB0aGlzLnNldFBhdGhMaXN0KG5ld1BhdGgubWF0Y2hpbmdQYXRocygpLCB7XG4gICAgICAgICAgICAgICAgaGlkZVBhcmVudDogbmV3UGF0aC5mcmFnbWVudCAhPT0gJycgfHwgbmV3UGF0aC5pc1Jvb3QoKSxcbiAgICAgICAgICAgICAgICBzb3J0OiAhKGNvbmZpZy5nZXQoJ2Z1enp5TWF0Y2gnKSAmJiBuZXdQYXRoLmZyYWdtZW50ICE9PSAnJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2KSA9PiB7XG4gICAgICAgICAgICAvLyBLZWVwIGZvY3VzIG9uIHRoZSB0ZXh0IGlucHV0IGFuZCBkbyBub3QgcHJvcGFnYXRlIHNvIHRoYXQgdGhlXG4gICAgICAgICAgICAvLyBvdXRzaWRlIGNsaWNrIGhhbmRsZXIgZG9lc24ndCBwaWNrIHVwIHRoZSBldmVudC5cbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5wYXRoSW5wdXQuZm9jdXMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXYudGFyZ2V0OjpjbG9zZXN0KCcuYWRkLXByb2plY3QtZm9sZGVyJykgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGlzdEl0ZW0gPSBldi50YXJnZXQ6OmNsb3Nlc3QoJy5saXN0LWl0ZW0nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNsaWNrLWFkZC1wcm9qZWN0LWZvbGRlcicsIGxpc3RJdGVtLmRhdGFzZXQuZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gRG9uJ3QgdHJ5IHRvIGVudGVyIHRoZSBmb2xkZXIgdG9vIVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgbGlzdEl0ZW0gPSBldi50YXJnZXQ6OmNsb3Nlc3QoJy5saXN0LWl0ZW0nKTtcbiAgICAgICAgICAgIGlmIChsaXN0SXRlbSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2xpY2stZmlsZScsIGxpc3RJdGVtLmRhdGFzZXQuZmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBAY2FjaGVkUHJvcGVydHlcbiAgICBnZXQgY29udGVudCgpIHtcbiAgICAgICAgcmV0dXJuIGRvbShgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWR2YW5jZWQtb3Blbi1maWxlXCI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbmZvLW1lc3NhZ2UgaWNvbiBpY29uLWZpbGUtYWRkXCI+XG4gICAgICAgICAgICAgICAgICAgIEVudGVyIHRoZSBwYXRoIGZvciB0aGUgZmlsZSB0byBvcGVuIG9yIGNyZWF0ZS5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhdGgtaW5wdXQtY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxhdG9tLXRleHQtZWRpdG9yIGNsYXNzPVwicGF0aC1pbnB1dFwiIG1pbmk+PC9hdG9tLXRleHQtZWRpdG9yPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cImxpc3QtZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwibGlzdC1pdGVtIHBhcmVudC1kaXJlY3RvcnlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvbiBpY29uLWZpbGUtZGlyZWN0b3J5XCI+Li48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgKTtcbiAgICB9XG5cbiAgICBjcmVhdGVQYXRoTGlzdEl0ZW0ocGF0aCkge1xuICAgICAgICBsZXQgaWNvbiA9IHBhdGguaXNEaXJlY3RvcnkoKSA/ICdpY29uLWZpbGUtZGlyZWN0b3J5JyA6ICdpY29uLWZpbGUtdGV4dCc7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJsaXN0LWl0ZW0gJHtwYXRoLmlzRGlyZWN0b3J5KCkgPyAnZGlyZWN0b3J5JyA6ICcnfVwiXG4gICAgICAgICAgICAgICAgZGF0YS1maWxlLW5hbWU9XCIke3BhdGguZnVsbH1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZpbGVuYW1lIGljb24gJHtpY29ufVwiXG4gICAgICAgICAgICAgICAgICAgICAgZGF0YS1uYW1lPVwiJHtwYXRoLmZyYWdtZW50fVwiPlxuICAgICAgICAgICAgICAgICAgICAke3BhdGguZnJhZ21lbnR9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICR7cGF0aC5pc0RpcmVjdG9yeSgpICYmICFwYXRoLmlzUHJvamVjdERpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgICAgID8gdGhpcy5hZGRQcm9qZWN0QnV0dG9uKClcbiAgICAgICAgICAgICAgICAgICAgOiAnJ31cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgIGA7XG4gICAgfVxuXG4gICAgYWRkUHJvamVjdEJ1dHRvbigpIHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYWRkLXByb2plY3QtZm9sZGVyIGljb24gaWNvbi1wbHVzXCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIk9wZW4gYXMgcHJvamVjdCBmb2xkZXJcIj5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgYDtcbiAgICB9XG5cbiAgICBjcmVhdGVNb2RhbFBhbmVsKCkge1xuICAgICAgICBsZXQgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtcbiAgICAgICAgICAgIGl0ZW06IHRoaXMuY29udGVudCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQmluZCB0aGUgb3V0c2lkZSBjbGljayBoYW5kbGVyIGFuZCBkZXN0cm95IGl0IHdoZW4gdGhlIHBhbmVsIGlzXG4gICAgICAgIC8vIGRlc3Ryb3llZC5cbiAgICAgICAgbGV0IG91dHNpZGVDbGlja0hhbmRsZXIgPSAoZXYpID0+IHtcbiAgICAgICAgICAgIGlmIChldi50YXJnZXQ6OmNsb3Nlc3QoJy5hZHZhbmNlZC1vcGVuLWZpbGUnKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2xpY2stb3V0c2lkZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG91dHNpZGVDbGlja0hhbmRsZXIpO1xuICAgICAgICBwYW5lbC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb3V0c2lkZUNsaWNrSGFuZGxlcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBtb2RhbCA9IHRoaXMuY29udGVudC5wYXJlbnROb2RlO1xuICAgICAgICBtb2RhbC5zdHlsZS5tYXhIZWlnaHQgPSBgJHtkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodCAtIG1vZGFsLm9mZnNldFRvcH1weGA7XG4gICAgICAgIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgICAgIG1vZGFsLnN0eWxlLmZsZXhEaXJlY3Rpb24gPSAnY29sdW1uJztcblxuICAgICAgICB0aGlzLnBhdGhJbnB1dC5mb2N1cygpO1xuXG4gICAgICAgIHJldHVybiBwYW5lbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZS1yZW5kZXIgbGlzdCBpdGVtIGZvciB0aGUgZ2l2ZW4gcGF0aCwgaWYgaXQgZXhpc3RzLlxuICAgICAqL1xuICAgIHJlZnJlc2hQYXRoTGlzdEl0ZW0ocGF0aCkge1xuICAgICAgICBsZXQgbGlzdEl0ZW0gPSB0aGlzLmNvbnRlbnQucXVlcnlTZWxlY3RvcihgLmxpc3QtaXRlbVtkYXRhLWZpbGUtbmFtZT1cIiR7cGF0aC5mdWxsfVwiXWApO1xuICAgICAgICBpZiAobGlzdEl0ZW0pIHtcbiAgICAgICAgICAgIGxldCBuZXdMaXN0SXRlbSA9IGRvbSh0aGlzLmNyZWF0ZVBhdGhMaXN0SXRlbShwYXRoKSk7XG4gICAgICAgICAgICBsaXN0SXRlbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdMaXN0SXRlbSwgbGlzdEl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25EaWRDbGlja0ZpbGUoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2xpY2stZmlsZScsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBvbkRpZENsaWNrQWRkUHJvamVjdEZvbGRlcihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jbGljay1hZGQtcHJvamVjdC1mb2xkZXInLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgb25EaWRDbGlja091dHNpZGUoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2xpY2stb3V0c2lkZScsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmUgdG8gdXNlci1pbml0aWF0ZWQgY2hhbmdlcyBpbiB0aGUgcGF0aC5cbiAgICAgKi9cbiAgICBvbkRpZFBhdGhDaGFuZ2UoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5wYXRoRWRpdG9yLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fdXBkYXRpbmdQYXRoKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobmV3IFBhdGgodGhpcy5wYXRoRWRpdG9yLmdldFRleHQoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZWxlY3RlZFBhdGgoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnNvckluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSB0aGlzLnBhdGhMaXN0LnF1ZXJ5U2VsZWN0b3IoJy5saXN0LWl0ZW0uc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUGF0aChzZWxlY3RlZC5kYXRhc2V0LmZpbGVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZpcnN0UGF0aCgpIHtcbiAgICAgICAgbGV0IHBhdGhJdGVtcyA9IHRoaXMucGF0aExpc3QucXVlcnlTZWxlY3RvckFsbCgnLmxpc3QtaXRlbTpub3QoLnBhcmVudC1kaXJlY3RvcnkpJyk7XG4gICAgICAgIGlmIChwYXRoSXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQYXRoKHBhdGhJdGVtc1swXS5kYXRhc2V0LmZpbGVOYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGF0aExpc3RMZW5ndGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGhMaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5saXN0LWl0ZW06bm90KC5oaWRkZW4pJykubGVuZ3RoO1xuICAgIH1cblxuICAgIHNldFBhdGgocGF0aCkge1xuICAgICAgICB0aGlzLl91cGRhdGluZ1BhdGggPSB0cnVlO1xuXG4gICAgICAgIHRoaXMucGF0aEVkaXRvci5zZXRUZXh0KHBhdGguZnVsbCk7XG4gICAgICAgIHRoaXMucGF0aEVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5fdXBkYXRpbmdQYXRoID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZm9yRWFjaExpc3RJdGVtKHNlbGVjdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgbGlzdEl0ZW1zID0gdGhpcy5wYXRoTGlzdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBsaXN0SXRlbXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGxpc3RJdGVtc1trXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRQYXRoTGlzdChwYXRocywge2hpZGVQYXJlbnQ9ZmFsc2UsIHNvcnQ9dHJ1ZX09e30pIHtcbiAgICAgICAgdGhpcy5jdXJzb3JJbmRleCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5mb3JFYWNoTGlzdEl0ZW0oJy5saXN0LWl0ZW0uc2VsZWN0ZWQnLCAobGlzdEl0ZW0pID0+IHtcbiAgICAgICAgICAgIGxpc3RJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZm9yRWFjaExpc3RJdGVtKCcubGlzdC1pdGVtOm5vdCgucGFyZW50LWRpcmVjdG9yeSknLCAobGlzdEl0ZW0pID0+IHtcbiAgICAgICAgICAgIGxpc3RJdGVtLnJlbW92ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocGF0aHMubGVuZ3RoID09PSAwIHx8IGhpZGVQYXJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50RGlyZWN0b3J5TGlzdEl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudERpcmVjdG9yeUxpc3RJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmIChzb3J0KSB7XG4gICAgICAgICAgICAgICAgLy8gU3BsaXQgbGlzdCBpbnRvIGRpcmVjdG9yaWVzIGFuZCBmaWxlcyBhbmQgc29ydCB0aGVtLlxuICAgICAgICAgICAgICAgIHBhdGhzID0gcGF0aHMuc29ydChQYXRoLmNvbXBhcmUpO1xuICAgICAgICAgICAgICAgIGxldCBkaXJlY3RvcnlQYXRocyA9IHBhdGhzLmZpbHRlcigocGF0aCkgPT4gcGF0aC5pc0RpcmVjdG9yeSgpKTtcbiAgICAgICAgICAgICAgICBsZXQgZmlsZVBhdGhzID0gcGF0aHMuZmlsdGVyKChwYXRoKSA9PiBwYXRoLmlzRmlsZSgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hcHBlbmRUb1BhdGhMaXN0KGRpcmVjdG9yeVBhdGhzKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hcHBlbmRUb1BhdGhMaXN0KGZpbGVQYXRocyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FwcGVuZFRvUGF0aExpc3QocGF0aHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2FwcGVuZFRvUGF0aExpc3QocGF0aHMpIHtcbiAgICAgICAgZm9yIChsZXQgcGF0aCBvZiBwYXRocykge1xuICAgICAgICAgICAgaWYgKHBhdGguZXhpc3RzKCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGlzdEl0ZW0gPSBkb20odGhpcy5jcmVhdGVQYXRoTGlzdEl0ZW0ocGF0aCkpO1xuICAgICAgICAgICAgICAgIGlmIChhZGRJY29uVG9FbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmaWxlbmFtZUVsZW1lbnQgPSBsaXN0SXRlbS5xdWVyeVNlbGVjdG9yKCcuZmlsZW5hbWUuaWNvbicpO1xuICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaWNvbi1maWxlLXRleHQnLCAnaWNvbi1maWxlLWRpcmVjdG9yeScpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJY29uVG9FbGVtZW50KGZpbGVuYW1lRWxlbWVudCwgcGF0aC5hYnNvbHV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucGF0aExpc3QuYXBwZW5kQ2hpbGQobGlzdEl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0Q3Vyc29ySW5kZXgoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLnBhdGhMaXN0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3Vyc29ySW5kZXggPSBpbmRleDtcbiAgICAgICAgdGhpcy5mb3JFYWNoTGlzdEl0ZW0oJy5saXN0LWl0ZW0uc2VsZWN0ZWQnLCAobGlzdEl0ZW0pID0+IHtcbiAgICAgICAgICAgIGxpc3RJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnNvckluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgbGlzdEl0ZW1zID0gdGhpcy5wYXRoTGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcubGlzdC1pdGVtOm5vdCguaGlkZGVuKScpO1xuICAgICAgICAgICAgaWYgKGxpc3RJdGVtcy5sZW5ndGggPiBpbmRleCkge1xuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZCA9IGxpc3RJdGVtc1tpbmRleF07XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzZWxlY3RlZCBlbGVtZW50IGlzIG91dCBvZiB2aWV3LCBzY3JvbGwgaXQgaW50byB2aWV3LlxuICAgICAgICAgICAgICAgIGxldCBwYXJlbnRFbGVtZW50ID0gc2VsZWN0ZWQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRUb3AgPSBzZWxlY3RlZC5vZmZzZXRUb3A7XG4gICAgICAgICAgICAgICAgbGV0IHBhcmVudFNjcm9sbEJvdHRvbSA9IHBhcmVudEVsZW1lbnQuc2Nyb2xsVG9wICsgcGFyZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkVG9wIDwgcGFyZW50RWxlbWVudC5zY3JvbGxUb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudC5zY3JvbGxUb3AgPSBzZWxlY3RlZFRvcDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkVG9wID49IHBhcmVudFNjcm9sbEJvdHRvbSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRCb3R0b20gPSBzZWxlY3RlZFRvcCArIHNlbGVjdGVkLmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudC5zY3JvbGxUb3AgKz0gc2VsZWN0ZWRCb3R0b20gLSBwYXJlbnRTY3JvbGxCb3R0b207XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19