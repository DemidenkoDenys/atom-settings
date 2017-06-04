Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _eventKit = require('event-kit');

var _osenv = require('osenv');

var _osenv2 = _interopRequireDefault(_osenv);

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _models = require('./models');

var _utils = require('./utils');

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

// Emitter for outside packages to subscribe to. Subscription functions
// are exponsed in ./advanced-open-file
var emitter = new _eventKit.Emitter();

exports.emitter = emitter;

var AdvancedOpenFileController = (function () {
    function AdvancedOpenFileController() {
        _classCallCheck(this, AdvancedOpenFileController);

        this.view = new _view2['default']();
        this.panel = null;

        this.currentPath = null;
        this.pathHistory = [];
        this.disposables = new _atom.CompositeDisposable();

        this.disposables.add(atom.commands.add('atom-workspace', {
            'advanced-open-file:toggle': this.toggle.bind(this)
        }));
        this.disposables.add(atom.commands.add('.advanced-open-file', {
            'core:confirm': this.confirm.bind(this),
            'core:cancel': this.detach.bind(this),
            'application:add-project-folder': this.addSelectedProjectFolder.bind(this),
            'advanced-open-file:autocomplete': this.autocomplete.bind(this),
            'advanced-open-file:undo': this.undo.bind(this),
            'advanced-open-file:move-cursor-down': this.moveCursorDown.bind(this),
            'advanced-open-file:move-cursor-up': this.moveCursorUp.bind(this),
            'advanced-open-file:move-cursor-bottom': this.moveCursorBottom.bind(this),
            'advanced-open-file:move-cursor-top': this.moveCursorTop.bind(this),
            'advanced-open-file:confirm-selected-or-first': this.confirmSelectedOrFirst.bind(this),
            'advanced-open-file:delete-path-component': this.deletePathComponent.bind(this),

            'pane:split-left': this.splitConfirm(function (pane) {
                return pane.splitLeft();
            }),
            'pane:split-right': this.splitConfirm(function (pane) {
                return pane.splitRight();
            }),
            'pane:split-up': this.splitConfirm(function (pane) {
                return pane.splitUp();
            }),
            'pane:split-down': this.splitConfirm(function (pane) {
                return pane.splitDown();
            })
        }));

        this.view.onDidClickFile(this.clickFile.bind(this));
        this.view.onDidClickAddProjectFolder(this.addProjectFolder.bind(this));
        this.view.onDidClickOutside(this.detach.bind(this));
        this.view.onDidPathChange(this.pathChange.bind(this));
    }

    _createClass(AdvancedOpenFileController, [{
        key: 'destroy',
        value: function destroy() {
            this.disposables.dispose();
        }
    }, {
        key: 'clickFile',
        value: function clickFile(fileName) {
            this.selectPath(new _models.Path(fileName));
        }
    }, {
        key: 'pathChange',
        value: function pathChange(newPath) {
            this.currentPath = newPath;

            var replace = false;

            // Since the user typed this, apply fast-dir-switch
            // shortcuts.
            if (config.get('helmDirSwitch')) {
                if (newPath.hasShortcut('')) {
                    // Empty shortcut == '//'
                    newPath = newPath.root();
                    replace = true;
                } else if (newPath.hasShortcut('~')) {
                    newPath = new _models.Path(_osenv2['default'].home() + _path2['default'].sep);
                    replace = true;
                } else if (newPath.hasShortcut(':')) {
                    var projectPath = (0, _utils.getProjectPath)();
                    if (projectPath) {
                        newPath = new _models.Path(projectPath + newPath.sep);
                        replace = true;
                    }
                }
            }

            // If we're replacing the path, save it in the history and set the path.
            // If we aren't, the user is just typing and we don't need the history
            // and want to avoid setting the path which resets the cursor.
            if (replace) {
                this.updatePath(newPath);
            }
        }
    }, {
        key: 'selectPath',
        value: function selectPath(newPath) {
            var split = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            if (newPath.isDirectory()) {
                if (split !== false) {
                    atom.beep();
                } else {
                    this.updatePath(newPath.asDirectory());
                }
            } else if (split !== false) {
                this.splitOpenPath(newPath, split);
            } else {
                this.openPath(newPath);
            }
        }
    }, {
        key: 'updatePath',
        value: function updatePath(newPath) {
            var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var _ref$saveHistory = _ref.saveHistory;
            var saveHistory = _ref$saveHistory === undefined ? true : _ref$saveHistory;

            if (saveHistory) {
                this.pathHistory.push(this.currentPath);
            }

            this.currentPath = newPath;
            this.view.setPath(newPath);
        }
    }, {
        key: 'splitOpenPath',
        value: function splitOpenPath(path, split) {
            split(atom.workspace.getActivePane());
            this.openPath(path);
        }
    }, {
        key: 'openPath',
        value: function openPath(path) {
            if (path.exists()) {
                if (path.isFile()) {
                    atom.workspace.open(path.absolute);
                    emitter.emit('did-open-path', path.absolute);
                    this.detach();
                } else {
                    atom.beep();
                }
            } else if (path.fragment) {
                try {
                    path.createDirectories();
                    if (config.get('createFileInstantly')) {
                        path.createFile();
                        emitter.emit('did-create-path', path.absolute);
                    }
                    atom.workspace.open(path.absolute);
                    emitter.emit('did-open-path', path.absolute);
                } catch (err) {
                    atom.notifications.addError('Could not open file', {
                        detail: err,
                        icon: 'alert'
                    });
                } finally {
                    this.detach();
                }
            } else if (config.get('createDirectories')) {
                try {
                    path.createDirectories();
                    atom.notifications.addSuccess('Directory created', {
                        detail: 'Created directory "' + path.full + '".',
                        icon: 'file-directory'
                    });
                    emitter.emit('did-create-path', path.absolute);
                    this.detach();
                } catch (err) {
                    atom.notifications.addError('Could not create directory', {
                        detail: err,
                        icon: 'file-directory'
                    });
                } finally {
                    this.detach();
                }
            } else {
                atom.beep();
            }
        }
    }, {
        key: 'deletePathComponent',
        value: function deletePathComponent() {
            if (this.currentPath.isRoot()) {
                atom.beep();
            } else {
                this.updatePath(this.currentPath.parent());
            }
        }
    }, {
        key: 'addProjectFolder',
        value: function addProjectFolder(fileName) {
            var folderPath = new _models.Path(fileName);
            if (folderPath.isDirectory() && !folderPath.isProjectDirectory()) {
                atom.project.addPath(folderPath.absolute);
                atom.notifications.addSuccess('Added project folder', {
                    detail: 'Added "' + folderPath.full + '" as a project folder.',
                    icon: 'file-directory'
                });
                this.view.refreshPathListItem(folderPath);
            } else {
                atom.beep();
            }
        }
    }, {
        key: 'addSelectedProjectFolder',
        value: function addSelectedProjectFolder(event) {
            event.stopPropagation();

            var selectedPath = this.view.selectedPath();
            if (selectedPath !== null && !selectedPath.equals(this.currentPath.parent())) {
                this.addProjectFolder(selectedPath.full);
            } else {
                atom.beep();
            }
        }

        /**
         * Autocomplete the current input to the longest common prefix among
         * paths matching the current input. If no change is made to the
         * current path, beep.
         */
    }, {
        key: 'autocomplete',
        value: function autocomplete() {
            var matchingPaths = this.currentPath.matchingPaths();
            if (matchingPaths.length === 0) {
                atom.beep();
            } else if (matchingPaths.length === 1 || config.get('fuzzyMatch')) {
                var newPath = matchingPaths[0];
                if (newPath.isDirectory()) {
                    this.updatePath(newPath.asDirectory());
                } else {
                    this.updatePath(newPath);
                }
            } else {
                var newPath = _models.Path.commonPrefix(matchingPaths);
                if (newPath.equals(this.currentPath)) {
                    atom.beep();
                } else {
                    this.updatePath(newPath);
                }
            }
        }
    }, {
        key: 'toggle',
        value: function toggle() {
            if (this.panel) {
                this.detach();
            } else {
                this.attach();
            }
        }
    }, {
        key: 'splitConfirm',
        value: function splitConfirm(split) {
            return this.confirm.bind(this, undefined, split);
        }
    }, {
        key: 'confirm',
        value: function confirm(event) {
            var split = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var selectedPath = this.view.selectedPath();
            if (selectedPath !== null) {
                this.selectPath(selectedPath, split);
            } else {
                this.selectPath(this.currentPath, split);
            }
        }
    }, {
        key: 'confirmSelectedOrFirst',
        value: function confirmSelectedOrFirst() {
            var selectedPath = this.view.selectedPath();
            if (selectedPath !== null) {
                this.selectPath(selectedPath);
            } else {
                var firstPath = this.view.firstPath();
                if (firstPath !== null) {
                    this.selectPath(firstPath);
                } else {
                    this.selectPath(this.currentPath);
                }
            }
        }
    }, {
        key: 'undo',
        value: function undo() {
            if (this.pathHistory.length > 0) {
                this.updatePath(this.pathHistory.pop(), { saveHistory: false });
            } else {
                var initialPath = _models.Path.initial();
                if (!this.currentPath.equals(initialPath)) {
                    this.updatePath(initialPath, { saveHistory: false });
                } else {
                    atom.beep();
                }
            }
        }
    }, {
        key: 'moveCursorDown',
        value: function moveCursorDown() {
            var index = this.view.cursorIndex;
            if (index === null || index === this.view.pathListLength() - 1) {
                index = 0;
            } else {
                index++;
            }

            this.view.setCursorIndex(index);
        }
    }, {
        key: 'moveCursorUp',
        value: function moveCursorUp() {
            var index = this.view.cursorIndex;
            if (index === null || index === 0) {
                index = this.view.pathListLength() - 1;
            } else {
                index--;
            }

            this.view.setCursorIndex(index);
        }
    }, {
        key: 'moveCursorTop',
        value: function moveCursorTop() {
            this.view.setCursorIndex(0);
        }
    }, {
        key: 'moveCursorBottom',
        value: function moveCursorBottom() {
            this.view.setCursorIndex(this.view.pathListLength() - 1);
        }
    }, {
        key: 'detach',
        value: function detach() {
            if (this.panel === null) {
                return;
            }

            this.panel.destroy();
            this.panel = null;
            atom.workspace.getActivePane().activate();
        }
    }, {
        key: 'attach',
        value: function attach() {
            if (this.panel !== null) {
                return;
            }

            var initialPath = _models.Path.initial();
            this.pathHistory = [];
            this.currentPath = initialPath;
            this.updatePath(_models.Path.initial(), { saveHistory: false });
            this.panel = this.view.createModalPanel();
        }
    }]);

    return AdvancedOpenFileController;
})();

exports.AdvancedOpenFileController = AdvancedOpenFileController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvTGVueW1vLy5hdG9tL3BhY2thZ2VzL2FkdmFuY2VkLW9wZW4tZmlsZS9saWIvY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFFb0IsTUFBTTs7OztvQkFFUSxNQUFNOzt3QkFFbEIsV0FBVzs7cUJBQ2YsT0FBTzs7OztzQkFFRCxVQUFVOztJQUF0QixNQUFNOztzQkFDQyxVQUFVOztxQkFDQSxTQUFTOztvQkFDTCxRQUFROzs7Ozs7QUFLbEMsSUFBSSxPQUFPLEdBQUcsdUJBQWEsQ0FBQzs7OztJQUd0QiwwQkFBMEI7QUFDeEIsYUFERiwwQkFBMEIsR0FDckI7OEJBREwsMEJBQTBCOztBQUUvQixZQUFJLENBQUMsSUFBSSxHQUFHLHVCQUEwQixDQUFDO0FBQ3ZDLFlBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDOztBQUVsQixZQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN4QixZQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN0QixZQUFJLENBQUMsV0FBVyxHQUFHLCtCQUF5QixDQUFDOztBQUU3QyxZQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNyRCx1Q0FBMkIsRUFBSSxJQUFJLENBQUMsTUFBTSxNQUFYLElBQUksQ0FBTztTQUM3QyxDQUFDLENBQUMsQ0FBQztBQUNKLFlBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFO0FBQzFELDBCQUFjLEVBQUksSUFBSSxDQUFDLE9BQU8sTUFBWixJQUFJLENBQVE7QUFDOUIseUJBQWEsRUFBSSxJQUFJLENBQUMsTUFBTSxNQUFYLElBQUksQ0FBTztBQUM1Qiw0Q0FBZ0MsRUFBSSxJQUFJLENBQUMsd0JBQXdCLE1BQTdCLElBQUksQ0FBeUI7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QUFLLEVBQUMsQ0FBQyxDQUFDO0FBQ3RELGdCQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUM3Qzs7O1dBclRRLDBCQUEwQiIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL0xlbnltby8uYXRvbS9wYWNrYWdlcy9hZHZhbmNlZC1vcGVuLWZpbGUvbGliL2NvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG5cbmltcG9ydCBzdGRQYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQgb3NlbnYgZnJvbSAnb3NlbnYnO1xuXG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtQYXRofSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQge2dldFByb2plY3RQYXRofSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBBZHZhbmNlZE9wZW5GaWxlVmlldyBmcm9tICcuL3ZpZXcnO1xuXG5cbi8vIEVtaXR0ZXIgZm9yIG91dHNpZGUgcGFja2FnZXMgdG8gc3Vic2NyaWJlIHRvLiBTdWJzY3JpcHRpb24gZnVuY3Rpb25zXG4vLyBhcmUgZXhwb25zZWQgaW4gLi9hZHZhbmNlZC1vcGVuLWZpbGVcbmV4cG9ydCBsZXQgZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cblxuZXhwb3J0IGNsYXNzIEFkdmFuY2VkT3BlbkZpbGVDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IEFkdmFuY2VkT3BlbkZpbGVWaWV3KCk7XG4gICAgICAgIHRoaXMucGFuZWwgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3VycmVudFBhdGggPSBudWxsO1xuICAgICAgICB0aGlzLnBhdGhIaXN0b3J5ID0gW107XG4gICAgICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgICAgICdhZHZhbmNlZC1vcGVuLWZpbGU6dG9nZ2xlJzogOjp0aGlzLnRvZ2dsZVxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCcuYWR2YW5jZWQtb3Blbi1maWxlJywge1xuICAgICAgICAgICAgJ2NvcmU6Y29uZmlybSc6IDo6dGhpcy5jb25maXJtLFxuICAgICAgICAgICAgJ2NvcmU6Y2FuY2VsJzogOjp0aGlzLmRldGFjaCxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXInOiA6OnRoaXMuYWRkU2VsZWN0ZWRQcm9qZWN0Rm9sZGVyLFxuICAgICAgICAgICAgJ2FkdmFuY2VkLW9wZW4tZmlsZTphdXRvY29tcGxldGUnOiA6OnRoaXMuYXV0b2NvbXBsZXRlLFxuICAgICAgICAgICAgJ2FkdmFuY2VkLW9wZW4tZmlsZTp1bmRvJzogOjp0aGlzLnVuZG8sXG4gICAgICAgICAgICAnYWR2YW5jZWQtb3Blbi1maWxlOm1vdmUtY3Vyc29yLWRvd24nOiA6OnRoaXMubW92ZUN1cnNvckRvd24sXG4gICAgICAgICAgICAnYWR2YW5jZWQtb3Blbi1maWxlOm1vdmUtY3Vyc29yLXVwJzogOjp0aGlzLm1vdmVDdXJzb3JVcCxcbiAgICAgICAgICAgICdhZHZhbmNlZC1vcGVuLWZpbGU6bW92ZS1jdXJzb3ItYm90dG9tJzogOjp0aGlzLm1vdmVDdXJzb3JCb3R0b20sXG4gICAgICAgICAgICAnYWR2YW5jZWQtb3Blbi1maWxlOm1vdmUtY3Vyc29yLXRvcCc6IDo6dGhpcy5tb3ZlQ3Vyc29yVG9wLFxuICAgICAgICAgICAgJ2FkdmFuY2VkLW9wZW4tZmlsZTpjb25maXJtLXNlbGVjdGVkLW9yLWZpcnN0JzogOjp0aGlzLmNvbmZpcm1TZWxlY3RlZE9yRmlyc3QsXG4gICAgICAgICAgICAnYWR2YW5jZWQtb3Blbi1maWxlOmRlbGV0ZS1wYXRoLWNvbXBvbmVudCc6IDo6dGhpcy5kZWxldGVQYXRoQ29tcG9uZW50LFxuXG4gICAgICAgICAgICAncGFuZTpzcGxpdC1sZWZ0JzogdGhpcy5zcGxpdENvbmZpcm0oKHBhbmUpID0+IHBhbmUuc3BsaXRMZWZ0KCkpLFxuICAgICAgICAgICAgJ3BhbmU6c3BsaXQtcmlnaHQnOiB0aGlzLnNwbGl0Q29uZmlybSgocGFuZSkgPT4gcGFuZS5zcGxpdFJpZ2h0KCkpLFxuICAgICAgICAgICAgJ3BhbmU6c3BsaXQtdXAnOiB0aGlzLnNwbGl0Q29uZmlybSgocGFuZSkgPT4gcGFuZS5zcGxpdFVwKCkpLFxuICAgICAgICAgICAgJ3BhbmU6c3BsaXQtZG93bic6IHRoaXMuc3BsaXRDb25maXJtKChwYW5lKSA9PiBwYW5lLnNwbGl0RG93bigpKSxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMudmlldy5vbkRpZENsaWNrRmlsZSg6OnRoaXMuY2xpY2tGaWxlKTtcbiAgICAgICAgdGhpcy52aWV3Lm9uRGlkQ2xpY2tBZGRQcm9qZWN0Rm9sZGVyKDo6dGhpcy5hZGRQcm9qZWN0Rm9sZGVyKTtcbiAgICAgICAgdGhpcy52aWV3Lm9uRGlkQ2xpY2tPdXRzaWRlKDo6dGhpcy5kZXRhY2gpO1xuICAgICAgICB0aGlzLnZpZXcub25EaWRQYXRoQ2hhbmdlKDo6dGhpcy5wYXRoQ2hhbmdlKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBjbGlja0ZpbGUoZmlsZU5hbWUpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RQYXRoKG5ldyBQYXRoKGZpbGVOYW1lKSk7XG4gICAgfVxuXG4gICAgcGF0aENoYW5nZShuZXdQYXRoKSAge1xuICAgICAgICB0aGlzLmN1cnJlbnRQYXRoID0gbmV3UGF0aDtcblxuICAgICAgICBsZXQgcmVwbGFjZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIFNpbmNlIHRoZSB1c2VyIHR5cGVkIHRoaXMsIGFwcGx5IGZhc3QtZGlyLXN3aXRjaFxuICAgICAgICAvLyBzaG9ydGN1dHMuXG4gICAgICAgIGlmIChjb25maWcuZ2V0KCdoZWxtRGlyU3dpdGNoJykpIHtcbiAgICAgICAgICAgIGlmIChuZXdQYXRoLmhhc1Nob3J0Y3V0KCcnKSkgeyAgLy8gRW1wdHkgc2hvcnRjdXQgPT0gJy8vJ1xuICAgICAgICAgICAgICAgIG5ld1BhdGggPSBuZXdQYXRoLnJvb3QoKTtcbiAgICAgICAgICAgICAgICByZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3UGF0aC5oYXNTaG9ydGN1dCgnficpKSB7XG4gICAgICAgICAgICAgICAgbmV3UGF0aCA9IG5ldyBQYXRoKG9zZW52LmhvbWUoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgICAgICByZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3UGF0aC5oYXNTaG9ydGN1dCgnOicpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb2plY3RQYXRoID0gZ2V0UHJvamVjdFBhdGgoKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IG5ldyBQYXRoKHByb2plY3RQYXRoICsgbmV3UGF0aC5zZXApO1xuICAgICAgICAgICAgICAgICAgICByZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSdyZSByZXBsYWNpbmcgdGhlIHBhdGgsIHNhdmUgaXQgaW4gdGhlIGhpc3RvcnkgYW5kIHNldCB0aGUgcGF0aC5cbiAgICAgICAgLy8gSWYgd2UgYXJlbid0LCB0aGUgdXNlciBpcyBqdXN0IHR5cGluZyBhbmQgd2UgZG9uJ3QgbmVlZCB0aGUgaGlzdG9yeVxuICAgICAgICAvLyBhbmQgd2FudCB0byBhdm9pZCBzZXR0aW5nIHRoZSBwYXRoIHdoaWNoIHJlc2V0cyB0aGUgY3Vyc29yLlxuICAgICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQYXRoKG5ld1BhdGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VsZWN0UGF0aChuZXdQYXRoLCBzcGxpdD1mYWxzZSkge1xuICAgICAgICBpZiAobmV3UGF0aC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICBpZiAoc3BsaXQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGF0aChuZXdQYXRoLmFzRGlyZWN0b3J5KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNwbGl0ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5zcGxpdE9wZW5QYXRoKG5ld1BhdGgsIHNwbGl0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub3BlblBhdGgobmV3UGF0aCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVQYXRoKG5ld1BhdGgsIHtzYXZlSGlzdG9yeT10cnVlfT17fSkge1xuICAgICAgICBpZiAoc2F2ZUhpc3RvcnkpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aEhpc3RvcnkucHVzaCh0aGlzLmN1cnJlbnRQYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3VycmVudFBhdGggPSBuZXdQYXRoO1xuICAgICAgICB0aGlzLnZpZXcuc2V0UGF0aChuZXdQYXRoKTtcbiAgICB9XG5cbiAgICBzcGxpdE9wZW5QYXRoKHBhdGgsIHNwbGl0KSB7XG4gICAgICAgIHNwbGl0KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSk7XG4gICAgICAgIHRoaXMub3BlblBhdGgocGF0aCk7XG4gICAgfVxuXG4gICAgb3BlblBhdGgocGF0aCkge1xuICAgICAgICBpZiAocGF0aC5leGlzdHMoKSkge1xuICAgICAgICAgICAgaWYgKHBhdGguaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGguYWJzb2x1dGUpO1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdCgnZGlkLW9wZW4tcGF0aCcsIHBhdGguYWJzb2x1dGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF0b20uYmVlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHBhdGguZnJhZ21lbnQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGF0aC5jcmVhdGVEaXJlY3RvcmllcygpO1xuICAgICAgICAgICAgICAgIGlmIChjb25maWcuZ2V0KCdjcmVhdGVGaWxlSW5zdGFudGx5JykpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aC5jcmVhdGVGaWxlKCk7XG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdCgnZGlkLWNyZWF0ZS1wYXRoJywgcGF0aC5hYnNvbHV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aC5hYnNvbHV0ZSk7XG4gICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KCdkaWQtb3Blbi1wYXRoJywgcGF0aC5hYnNvbHV0ZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0NvdWxkIG5vdCBvcGVuIGZpbGUnLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDogZXJyLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnYWxlcnQnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRldGFjaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGNvbmZpZy5nZXQoJ2NyZWF0ZURpcmVjdG9yaWVzJykpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGF0aC5jcmVhdGVEaXJlY3RvcmllcygpO1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdEaXJlY3RvcnkgY3JlYXRlZCcsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiBgQ3JlYXRlZCBkaXJlY3RvcnkgXCIke3BhdGguZnVsbH1cIi5gLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnZmlsZS1kaXJlY3RvcnknLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdCgnZGlkLWNyZWF0ZS1wYXRoJywgcGF0aC5hYnNvbHV0ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhY2goKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignQ291bGQgbm90IGNyZWF0ZSBkaXJlY3RvcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDogZXJyLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnZmlsZS1kaXJlY3RvcnknLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRldGFjaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWxldGVQYXRoQ29tcG9uZW50KCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGF0aC5pc1Jvb3QoKSkge1xuICAgICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBhdGgodGhpcy5jdXJyZW50UGF0aC5wYXJlbnQoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRQcm9qZWN0Rm9sZGVyKGZpbGVOYW1lKSB7XG4gICAgICAgIGxldCBmb2xkZXJQYXRoID0gbmV3IFBhdGgoZmlsZU5hbWUpO1xuICAgICAgICBpZiAoZm9sZGVyUGF0aC5pc0RpcmVjdG9yeSgpICYmICFmb2xkZXJQYXRoLmlzUHJvamVjdERpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICBhdG9tLnByb2plY3QuYWRkUGF0aChmb2xkZXJQYXRoLmFic29sdXRlKTtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdBZGRlZCBwcm9qZWN0IGZvbGRlcicsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWw6IGBBZGRlZCBcIiR7Zm9sZGVyUGF0aC5mdWxsfVwiIGFzIGEgcHJvamVjdCBmb2xkZXIuYCxcbiAgICAgICAgICAgICAgICBpY29uOiAnZmlsZS1kaXJlY3RvcnknLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnZpZXcucmVmcmVzaFBhdGhMaXN0SXRlbShmb2xkZXJQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF0b20uYmVlcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkU2VsZWN0ZWRQcm9qZWN0Rm9sZGVyKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGxldCBzZWxlY3RlZFBhdGggPSB0aGlzLnZpZXcuc2VsZWN0ZWRQYXRoKCk7XG4gICAgICAgIGlmIChzZWxlY3RlZFBhdGggIT09IG51bGwgJiYgIXNlbGVjdGVkUGF0aC5lcXVhbHModGhpcy5jdXJyZW50UGF0aC5wYXJlbnQoKSkpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUHJvamVjdEZvbGRlcihzZWxlY3RlZFBhdGguZnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF1dG9jb21wbGV0ZSB0aGUgY3VycmVudCBpbnB1dCB0byB0aGUgbG9uZ2VzdCBjb21tb24gcHJlZml4IGFtb25nXG4gICAgICogcGF0aHMgbWF0Y2hpbmcgdGhlIGN1cnJlbnQgaW5wdXQuIElmIG5vIGNoYW5nZSBpcyBtYWRlIHRvIHRoZVxuICAgICAqIGN1cnJlbnQgcGF0aCwgYmVlcC5cbiAgICAgKi9cbiAgICBhdXRvY29tcGxldGUoKSB7XG4gICAgICAgIGxldCBtYXRjaGluZ1BhdGhzID0gdGhpcy5jdXJyZW50UGF0aC5tYXRjaGluZ1BhdGhzKCk7XG4gICAgICAgIGlmIChtYXRjaGluZ1BhdGhzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hpbmdQYXRocy5sZW5ndGggPT09IDEgfHwgY29uZmlnLmdldCgnZnV6enlNYXRjaCcpKSB7XG4gICAgICAgICAgICBsZXQgbmV3UGF0aCA9IG1hdGNoaW5nUGF0aHNbMF07XG4gICAgICAgICAgICBpZiAobmV3UGF0aC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXRoKG5ld1BhdGguYXNEaXJlY3RvcnkoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGF0aChuZXdQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBuZXdQYXRoID0gUGF0aC5jb21tb25QcmVmaXgobWF0Y2hpbmdQYXRocyk7XG4gICAgICAgICAgICBpZiAobmV3UGF0aC5lcXVhbHModGhpcy5jdXJyZW50UGF0aCkpIHtcbiAgICAgICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXRoKG5ld1BhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9nZ2xlKCkge1xuICAgICAgICBpZiAodGhpcy5wYW5lbCkge1xuICAgICAgICAgICAgdGhpcy5kZXRhY2goKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzcGxpdENvbmZpcm0oc3BsaXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlybS5iaW5kKHRoaXMsIHVuZGVmaW5lZCwgc3BsaXQpO1xuICAgIH1cblxuICAgIGNvbmZpcm0oZXZlbnQsIHNwbGl0PWZhbHNlKSB7XG4gICAgICAgIGxldCBzZWxlY3RlZFBhdGggPSB0aGlzLnZpZXcuc2VsZWN0ZWRQYXRoKCk7XG4gICAgICAgIGlmIChzZWxlY3RlZFBhdGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0UGF0aChzZWxlY3RlZFBhdGgsIHNwbGl0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0UGF0aCh0aGlzLmN1cnJlbnRQYXRoLCBzcGxpdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25maXJtU2VsZWN0ZWRPckZpcnN0KCkge1xuICAgICAgICBsZXQgc2VsZWN0ZWRQYXRoID0gdGhpcy52aWV3LnNlbGVjdGVkUGF0aCgpO1xuICAgICAgICBpZiAoc2VsZWN0ZWRQYXRoICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdFBhdGgoc2VsZWN0ZWRQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBmaXJzdFBhdGggPSB0aGlzLnZpZXcuZmlyc3RQYXRoKCk7XG4gICAgICAgICAgICBpZiAoZmlyc3RQYXRoICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RQYXRoKGZpcnN0UGF0aCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0UGF0aCh0aGlzLmN1cnJlbnRQYXRoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdW5kbygpIHtcbiAgICAgICAgaWYgKHRoaXMucGF0aEhpc3RvcnkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQYXRoKHRoaXMucGF0aEhpc3RvcnkucG9wKCksIHtzYXZlSGlzdG9yeTogZmFsc2V9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBpbml0aWFsUGF0aCA9IFBhdGguaW5pdGlhbCgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRQYXRoLmVxdWFscyhpbml0aWFsUGF0aCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVBhdGgoaW5pdGlhbFBhdGgsIHtzYXZlSGlzdG9yeTogZmFsc2V9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlQ3Vyc29yRG93bigpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy52aWV3LmN1cnNvckluZGV4O1xuICAgICAgICBpZiAoaW5kZXggPT09IG51bGwgfHwgaW5kZXggPT09IHRoaXMudmlldy5wYXRoTGlzdExlbmd0aCgpIC0gMSkge1xuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudmlldy5zZXRDdXJzb3JJbmRleChpbmRleCk7XG4gICAgfVxuXG4gICAgbW92ZUN1cnNvclVwKCkge1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnZpZXcuY3Vyc29ySW5kZXg7XG4gICAgICAgIGlmIChpbmRleCA9PT0gbnVsbCB8fCBpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLnZpZXcucGF0aExpc3RMZW5ndGgoKSAtIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aWV3LnNldEN1cnNvckluZGV4KGluZGV4KTtcbiAgICB9XG5cbiAgICBtb3ZlQ3Vyc29yVG9wKCkge1xuICAgICAgICB0aGlzLnZpZXcuc2V0Q3Vyc29ySW5kZXgoMCk7XG4gICAgfVxuXG4gICAgbW92ZUN1cnNvckJvdHRvbSgpIHtcbiAgICAgICAgdGhpcy52aWV3LnNldEN1cnNvckluZGV4KHRoaXMudmlldy5wYXRoTGlzdExlbmd0aCgpIC0gMSk7XG4gICAgfVxuXG4gICAgZGV0YWNoKCkge1xuICAgICAgICBpZiAodGhpcy5wYW5lbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKTtcbiAgICB9XG5cbiAgICBhdHRhY2goKSB7XG4gICAgICAgIGlmICh0aGlzLnBhbmVsICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW5pdGlhbFBhdGggPSBQYXRoLmluaXRpYWwoKTtcbiAgICAgICAgdGhpcy5wYXRoSGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLmN1cnJlbnRQYXRoID0gaW5pdGlhbFBhdGg7XG4gICAgICAgIHRoaXMudXBkYXRlUGF0aChQYXRoLmluaXRpYWwoKSwge3NhdmVIaXN0b3J5OiBmYWxzZX0pO1xuICAgICAgICB0aGlzLnBhbmVsID0gdGhpcy52aWV3LmNyZWF0ZU1vZGFsUGFuZWwoKTtcbiAgICB9XG59XG4iXX0=