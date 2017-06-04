Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fuzzaldrinPlus = require('fuzzaldrin-plus');

var _fuzzaldrinPlus2 = _interopRequireDefault(_fuzzaldrinPlus);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _touch = require('touch');

var _touch2 = _interopRequireDefault(_touch);

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _utils = require('./utils');

/**
 * Wrapper for dealing with filesystem paths.
 */

var Path = (function () {
    function Path() {
        var path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        _classCallCheck(this, Path);

        // The last path segment is the "fragment". Paths that end in a
        // separator have a blank fragment.
        var sep = (0, _utils.preferredSeparatorFor)(path);
        var parts = path.split(sep);
        var fragment = parts[parts.length - 1];
        var directory = path.substring(0, path.length - fragment.length);

        // Set non-writable properties.
        (0, _utils.defineImmutable)(this, 'directory', directory);
        (0, _utils.defineImmutable)(this, 'fragment', fragment);
        (0, _utils.defineImmutable)(this, 'full', path);
        (0, _utils.defineImmutable)(this, 'sep', sep);
    }

    /**
     * Return whether the filename matches the given path fragment.
     */

    _createDecoratedClass(Path, [{
        key: 'isDirectory',
        value: function isDirectory() {
            return this.stat ? this.stat.isDirectory() : null;
        }
    }, {
        key: 'isFile',
        value: function isFile() {
            return this.stat ? !this.stat.isDirectory() : null;
        }
    }, {
        key: 'isProjectDirectory',
        value: function isProjectDirectory() {
            return atom.project.getPaths().indexOf(this.absolute) !== -1;
        }
    }, {
        key: 'isRoot',
        value: function isRoot() {
            return _path2['default'].dirname(this.absolute) === this.absolute;
        }
    }, {
        key: 'hasCaseSensitiveFragment',
        value: function hasCaseSensitiveFragment() {
            return this.fragment !== '' && this.fragment !== this.fragment.toLowerCase();
        }
    }, {
        key: 'exists',
        value: function exists() {
            return this.stat !== null;
        }
    }, {
        key: 'asDirectory',
        value: function asDirectory() {
            return new Path(this.full + (this.fragment ? this.sep : ''));
        }
    }, {
        key: 'parent',
        value: function parent() {
            if (this.isRoot()) {
                return this;
            } else if (this.fragment) {
                return new Path(this.directory);
            } else {
                return new Path(_path2['default'].dirname(this.directory) + this.sep);
            }
        }

        /**
         * Return path for the root directory for the drive this path is on.
         */
    }, {
        key: 'root',
        value: function root() {
            var last = null;
            var current = this.absolute;
            while (current !== last) {
                last = current;
                current = _path2['default'].dirname(current);
            }

            return new Path(current);
        }

        /**
         * Create an empty file at the given path if it doesn't already exist.
         */
    }, {
        key: 'createFile',
        value: function createFile() {
            _touch2['default'].sync(this.absolute);
        }

        /**
         * Create directories for the file this path points to, or do nothing
         * if they already exist.
         */
    }, {
        key: 'createDirectories',
        value: function createDirectories() {
            try {
                _mkdirp2['default'].sync((0, _utils.absolutify)(this.directory));
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    throw err;
                }
            }
        }
    }, {
        key: 'matchingPaths',
        value: function matchingPaths() {
            var _this = this;

            var caseSensitive = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var absoluteDir = (0, _utils.absolutify)(this.directory);
            var filenames = null;

            try {
                filenames = _fs2['default'].readdirSync(absoluteDir);
            } catch (err) {
                return []; // TODO: Catch permissions error and display a message.
            }

            if (this.fragment) {
                if (config.get('fuzzyMatch')) {
                    filenames = _fuzzaldrinPlus2['default'].filter(filenames, this.fragment);
                } else {
                    if (caseSensitive === null) {
                        caseSensitive = this.hasCaseSensitiveFragment();
                    }

                    filenames = filenames.filter(function (fn) {
                        return matchFragment(_this.fragment, fn, caseSensitive);
                    });
                }
            }

            return filenames.map(function (fn) {
                return new Path(_this.directory + fn);
            });
        }

        /**
         * Check if the last path fragment in this path is equal to the given
         * shortcut string, and the path ends in a separator.
         *
         * For example, ':/' and '/foo/bar/:/' have the ':' shortcut, but
         * '/foo/bar:/' and '/blah/:' do not.
         */
    }, {
        key: 'hasShortcut',
        value: function hasShortcut(shortcut) {
            shortcut = shortcut + this.sep;
            return !this.fragment && (this.directory.endsWith(this.sep + shortcut) || this.directory === shortcut);
        }
    }, {
        key: 'equals',
        value: function equals(otherPath) {
            return this.full === otherPath.full;
        }

        /**
         * Return the path to show initially in the path input.
         */
    }, {
        key: 'absolute',
        decorators: [_utils.cachedProperty],
        get: function get() {
            return (0, _utils.absolutify)(this.full);
        }
    }, {
        key: 'stat',
        decorators: [_utils.cachedProperty],
        get: function get() {
            try {
                return _fs2['default'].statSync(this.absolute);
            } catch (err) {
                return null;
            }
        }
    }], [{
        key: 'initial',
        value: function initial() {
            switch (config.get('defaultInputValue')) {
                case config.DEFAULT_ACTIVE_FILE_DIR:
                    var editor = atom.workspace.getActiveTextEditor();
                    if (editor && editor.getPath()) {
                        return new Path(_path2['default'].dirname(editor.getPath()) + _path2['default'].sep);
                    }
                // No break so that we fall back to project root.
                case config.DEFAULT_PROJECT_ROOT:
                    var projectPath = (0, _utils.getProjectPath)();
                    if (projectPath) {
                        return new Path(projectPath + _path2['default'].sep);
                    }
            }

            return new Path('');
        }

        /**
         * Compare two paths lexicographically.
         */
    }, {
        key: 'compare',
        value: function compare(path1, path2) {
            return path1.full.localeCompare(path2.full);
        }

        /**
         * Return a new path instance with the common prefix of all the
         * given paths.
         */
    }, {
        key: 'commonPrefix',
        value: function commonPrefix(paths) {
            var caseSensitive = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            if (paths.length < 2) {
                throw new Error('Cannot find common prefix for lists shorter than two elements.');
            }

            paths = paths.map(function (path) {
                return path.full;
            }).sort();
            var first = paths[0];
            var last = paths[paths.length - 1];

            var prefix = '';
            var prefixMaxLength = Math.min(first.length, last.length);
            for (var k = 0; k < prefixMaxLength; k++) {
                if (first[k] === last[k]) {
                    prefix += first[k];
                } else if (!caseSensitive && first[k].toLowerCase() === last[k].toLowerCase()) {
                    prefix += first[k].toLowerCase();
                } else {
                    break;
                }
            }

            return new Path(prefix);
        }
    }]);

    return Path;
})();

exports.Path = Path;
function matchFragment(fragment, filename) {
    var caseSensitive = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    if (!caseSensitive) {
        fragment = fragment.toLowerCase();
        filename = filename.toLowerCase();
    }

    return filename.startsWith(fragment);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvTGVueW1vLy5hdG9tL3BhY2thZ2VzL2FkdmFuY2VkLW9wZW4tZmlsZS9saWIvbW9kZWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2tCQUVlLElBQUk7Ozs7b0JBQ0MsTUFBTTs7Ozs4QkFFSCxpQkFBaUI7Ozs7c0JBQ3JCLFFBQVE7Ozs7cUJBQ1QsT0FBTzs7OztzQkFFRCxVQUFVOztJQUF0QixNQUFNOztxQkFPWCxTQUFTOzs7Ozs7SUFNSCxJQUFJO0FBQ0YsYUFERixJQUFJLEdBQ1E7WUFBVCxJQUFJLHlEQUFDLEVBQUU7OzhCQURWLElBQUk7Ozs7QUFJVCxZQUFJLEdBQUcsR0FBRyxrQ0FBc0IsSUFBSSxDQUFDLENBQUM7QUFDdEMsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QixZQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0FBR2pFLG9DQUFnQixJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzlDLG9DQUFnQixJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzVDLG9DQUFnQixJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLG9DQUFnQixJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3JDOzs7Ozs7MEJBZFEsSUFBSTs7ZUE4QkYsdUJBQUc7QUFDVixtQkFBTyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQ3JEOzs7ZUFFSyxrQkFBRztB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QUFFLENBQUM7QUFDaEIsZ0JBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUQsaUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEMsb0JBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUN0QiwwQkFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdEIsTUFBTSxJQUFJLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7QUFDM0UsMEJBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQ3BDLE1BQU07QUFDSCwwQkFBTTtpQkFDVDthQUNKOztBQUVELG1CQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNCOzs7V0E3TVEsSUFBSTs7OztBQW1OakIsU0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBdUI7UUFBckIsYUFBYSx5REFBQyxLQUFLOztBQUMxRCxRQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2hCLGdCQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2xDLGdCQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3JDOztBQUVELFdBQU8sUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUN4QyIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL0xlbnltby8uYXRvbS9wYWNrYWdlcy9hZHZhbmNlZC1vcGVuLWZpbGUvbGliL21vZGVscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBzdGRQYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgZnV6emFsZHJpbiBmcm9tICdmdXp6YWxkcmluLXBsdXMnO1xuaW1wb3J0IG1rZGlycCBmcm9tICdta2RpcnAnO1xuaW1wb3J0IHRvdWNoIGZyb20gJ3RvdWNoJztcblxuaW1wb3J0ICogYXMgY29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7XG4gICAgYWJzb2x1dGlmeSxcbiAgICBjYWNoZWRQcm9wZXJ0eSxcbiAgICBkZWZpbmVJbW11dGFibGUsXG4gICAgZ2V0UHJvamVjdFBhdGgsXG4gICAgcHJlZmVycmVkU2VwYXJhdG9yRm9yXG59IGZyb20gJy4vdXRpbHMnO1xuXG5cbi8qKlxuICogV3JhcHBlciBmb3IgZGVhbGluZyB3aXRoIGZpbGVzeXN0ZW0gcGF0aHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihwYXRoPScnKSB7XG4gICAgICAgIC8vIFRoZSBsYXN0IHBhdGggc2VnbWVudCBpcyB0aGUgXCJmcmFnbWVudFwiLiBQYXRocyB0aGF0IGVuZCBpbiBhXG4gICAgICAgIC8vIHNlcGFyYXRvciBoYXZlIGEgYmxhbmsgZnJhZ21lbnQuXG4gICAgICAgIGxldCBzZXAgPSBwcmVmZXJyZWRTZXBhcmF0b3JGb3IocGF0aCk7XG4gICAgICAgIGxldCBwYXJ0cyA9IHBhdGguc3BsaXQoc2VwKTtcbiAgICAgICAgbGV0IGZyYWdtZW50ID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGxldCBkaXJlY3RvcnkgPSBwYXRoLnN1YnN0cmluZygwLCBwYXRoLmxlbmd0aCAtIGZyYWdtZW50Lmxlbmd0aCk7XG5cbiAgICAgICAgLy8gU2V0IG5vbi13cml0YWJsZSBwcm9wZXJ0aWVzLlxuICAgICAgICBkZWZpbmVJbW11dGFibGUodGhpcywgJ2RpcmVjdG9yeScsIGRpcmVjdG9yeSk7XG4gICAgICAgIGRlZmluZUltbXV0YWJsZSh0aGlzLCAnZnJhZ21lbnQnLCBmcmFnbWVudCk7XG4gICAgICAgIGRlZmluZUltbXV0YWJsZSh0aGlzLCAnZnVsbCcsIHBhdGgpO1xuICAgICAgICBkZWZpbmVJbW11dGFibGUodGhpcywgJ3NlcCcsIHNlcCk7XG4gICAgfVxuXG4gICAgQGNhY2hlZFByb3BlcnR5XG4gICAgZ2V0IGFic29sdXRlKCkge1xuICAgICAgICByZXR1cm4gYWJzb2x1dGlmeSh0aGlzLmZ1bGwpO1xuICAgIH1cblxuICAgIEBjYWNoZWRQcm9wZXJ0eVxuICAgIGdldCBzdGF0KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGZzLnN0YXRTeW5jKHRoaXMuYWJzb2x1dGUpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNEaXJlY3RvcnkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXQgPyB0aGlzLnN0YXQuaXNEaXJlY3RvcnkoKSA6IG51bGw7XG4gICAgfVxuXG4gICAgaXNGaWxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ID8gIXRoaXMuc3RhdC5pc0RpcmVjdG9yeSgpIDogbnVsbDtcbiAgICB9XG5cbiAgICBpc1Byb2plY3REaXJlY3RvcnkoKSB7XG4gICAgICAgIHJldHVybiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5pbmRleE9mKHRoaXMuYWJzb2x1dGUpICE9PSAtMTtcbiAgICB9XG5cbiAgICBpc1Jvb3QoKSB7XG4gICAgICAgIHJldHVybiBzdGRQYXRoLmRpcm5hbWUodGhpcy5hYnNvbHV0ZSkgPT09IHRoaXMuYWJzb2x1dGU7XG4gICAgfVxuXG4gICAgaGFzQ2FzZVNlbnNpdGl2ZUZyYWdtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mcmFnbWVudCAhPT0gJycgJiYgdGhpcy5mcmFnbWVudCAhPT0gdGhpcy5mcmFnbWVudC50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIGV4aXN0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdCAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICBhc0RpcmVjdG9yeSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoKHRoaXMuZnVsbCArICh0aGlzLmZyYWdtZW50ID8gdGhpcy5zZXAgOiAnJykpO1xuICAgIH1cblxuICAgIHBhcmVudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNSb290KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZnJhZ21lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUGF0aCh0aGlzLmRpcmVjdG9yeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFBhdGgoc3RkUGF0aC5kaXJuYW1lKHRoaXMuZGlyZWN0b3J5KSArIHRoaXMuc2VwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiBwYXRoIGZvciB0aGUgcm9vdCBkaXJlY3RvcnkgZm9yIHRoZSBkcml2ZSB0aGlzIHBhdGggaXMgb24uXG4gICAgICovXG4gICAgcm9vdCgpIHtcbiAgICAgICAgbGV0IGxhc3QgPSBudWxsO1xuICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMuYWJzb2x1dGU7XG4gICAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBsYXN0KSB7XG4gICAgICAgICAgICBsYXN0ID0gY3VycmVudDtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBzdGRQYXRoLmRpcm5hbWUoY3VycmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFBhdGgoY3VycmVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFuIGVtcHR5IGZpbGUgYXQgdGhlIGdpdmVuIHBhdGggaWYgaXQgZG9lc24ndCBhbHJlYWR5IGV4aXN0LlxuICAgICAqL1xuICAgIGNyZWF0ZUZpbGUoKSB7XG4gICAgICAgIHRvdWNoLnN5bmModGhpcy5hYnNvbHV0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGRpcmVjdG9yaWVzIGZvciB0aGUgZmlsZSB0aGlzIHBhdGggcG9pbnRzIHRvLCBvciBkbyBub3RoaW5nXG4gICAgICogaWYgdGhleSBhbHJlYWR5IGV4aXN0LlxuICAgICAqL1xuICAgIGNyZWF0ZURpcmVjdG9yaWVzKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbWtkaXJwLnN5bmMoYWJzb2x1dGlmeSh0aGlzLmRpcmVjdG9yeSkpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuY29kZSAhPT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtYXRjaGluZ1BhdGhzKGNhc2VTZW5zaXRpdmU9bnVsbCkge1xuICAgICAgICBsZXQgYWJzb2x1dGVEaXIgPSBhYnNvbHV0aWZ5KHRoaXMuZGlyZWN0b3J5KTtcbiAgICAgICAgbGV0IGZpbGVuYW1lcyA9IG51bGw7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZpbGVuYW1lcyA9IGZzLnJlYWRkaXJTeW5jKGFic29sdXRlRGlyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gW107IC8vIFRPRE86IENhdGNoIHBlcm1pc3Npb25zIGVycm9yIGFuZCBkaXNwbGF5IGEgbWVzc2FnZS5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmZyYWdtZW50KSB7XG4gICAgICAgICAgICBpZiAoY29uZmlnLmdldCgnZnV6enlNYXRjaCcpKSB7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWVzID0gZnV6emFsZHJpbi5maWx0ZXIoZmlsZW5hbWVzLCB0aGlzLmZyYWdtZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGNhc2VTZW5zaXRpdmUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZVNlbnNpdGl2ZSA9IHRoaXMuaGFzQ2FzZVNlbnNpdGl2ZUZyYWdtZW50KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZmlsZW5hbWVzID0gZmlsZW5hbWVzLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgKGZuKSA9PiBtYXRjaEZyYWdtZW50KHRoaXMuZnJhZ21lbnQsIGZuLCBjYXNlU2Vuc2l0aXZlKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmlsZW5hbWVzLm1hcCgoZm4pID0+IG5ldyBQYXRoKHRoaXMuZGlyZWN0b3J5ICsgZm4pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgbGFzdCBwYXRoIGZyYWdtZW50IGluIHRoaXMgcGF0aCBpcyBlcXVhbCB0byB0aGUgZ2l2ZW5cbiAgICAgKiBzaG9ydGN1dCBzdHJpbmcsIGFuZCB0aGUgcGF0aCBlbmRzIGluIGEgc2VwYXJhdG9yLlxuICAgICAqXG4gICAgICogRm9yIGV4YW1wbGUsICc6LycgYW5kICcvZm9vL2Jhci86LycgaGF2ZSB0aGUgJzonIHNob3J0Y3V0LCBidXRcbiAgICAgKiAnL2Zvby9iYXI6LycgYW5kICcvYmxhaC86JyBkbyBub3QuXG4gICAgICovXG4gICAgaGFzU2hvcnRjdXQoc2hvcnRjdXQpIHtcbiAgICAgICAgc2hvcnRjdXQgPSBzaG9ydGN1dCArIHRoaXMuc2VwO1xuICAgICAgICByZXR1cm4gIXRoaXMuZnJhZ21lbnQgJiYgKFxuICAgICAgICAgICAgdGhpcy5kaXJlY3RvcnkuZW5kc1dpdGgodGhpcy5zZXAgKyBzaG9ydGN1dClcbiAgICAgICAgICAgIHx8IHRoaXMuZGlyZWN0b3J5ID09PSBzaG9ydGN1dFxuICAgICAgICApXG4gICAgfVxuXG4gICAgZXF1YWxzKG90aGVyUGF0aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mdWxsID09PSBvdGhlclBhdGguZnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHBhdGggdG8gc2hvdyBpbml0aWFsbHkgaW4gdGhlIHBhdGggaW5wdXQuXG4gICAgICovXG4gICAgc3RhdGljIGluaXRpYWwoKSB7XG4gICAgICAgIHN3aXRjaCAoY29uZmlnLmdldCgnZGVmYXVsdElucHV0VmFsdWUnKSkge1xuICAgICAgICAgICAgY2FzZSBjb25maWcuREVGQVVMVF9BQ1RJVkVfRklMRV9ESVI6XG4gICAgICAgICAgICAgICAgbGV0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgICAgICAgICBpZiAoZWRpdG9yICYmIGVkaXRvci5nZXRQYXRoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQYXRoKHN0ZFBhdGguZGlybmFtZShlZGl0b3IuZ2V0UGF0aCgpKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gTm8gYnJlYWsgc28gdGhhdCB3ZSBmYWxsIGJhY2sgdG8gcHJvamVjdCByb290LlxuICAgICAgICAgICAgY2FzZSBjb25maWcuREVGQVVMVF9QUk9KRUNUX1JPT1Q6XG4gICAgICAgICAgICAgICAgbGV0IHByb2plY3RQYXRoID0gZ2V0UHJvamVjdFBhdGgoKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQYXRoKHByb2plY3RQYXRoICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUGF0aCgnJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZSB0d28gcGF0aHMgbGV4aWNvZ3JhcGhpY2FsbHkuXG4gICAgICovXG4gICAgc3RhdGljIGNvbXBhcmUocGF0aDEsIHBhdGgyKSB7XG4gICAgICAgIHJldHVybiBwYXRoMS5mdWxsLmxvY2FsZUNvbXBhcmUocGF0aDIuZnVsbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgbmV3IHBhdGggaW5zdGFuY2Ugd2l0aCB0aGUgY29tbW9uIHByZWZpeCBvZiBhbGwgdGhlXG4gICAgICogZ2l2ZW4gcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGNvbW1vblByZWZpeChwYXRocywgY2FzZVNlbnNpdGl2ZT1mYWxzZSkge1xuICAgICAgICBpZiAocGF0aHMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICdDYW5ub3QgZmluZCBjb21tb24gcHJlZml4IGZvciBsaXN0cyBzaG9ydGVyIHRoYW4gdHdvIGVsZW1lbnRzLidcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBwYXRocyA9IHBhdGhzLm1hcCgocGF0aCkgPT4gcGF0aC5mdWxsKS5zb3J0KCk7XG4gICAgICAgIGxldCBmaXJzdCA9IHBhdGhzWzBdO1xuICAgICAgICBsZXQgbGFzdCA9IHBhdGhzW3BhdGhzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIGxldCBwcmVmaXggPSAnJztcbiAgICAgICAgbGV0IHByZWZpeE1heExlbmd0aCA9IE1hdGgubWluKGZpcnN0Lmxlbmd0aCwgbGFzdC5sZW5ndGgpO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHByZWZpeE1heExlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3Rba10gPT09IGxhc3Rba10pIHtcbiAgICAgICAgICAgICAgICBwcmVmaXggKz0gZmlyc3Rba107XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjYXNlU2Vuc2l0aXZlICYmIGZpcnN0W2tdLnRvTG93ZXJDYXNlKCkgPT09IGxhc3Rba10udG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgIHByZWZpeCArPSBmaXJzdFtrXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUGF0aChwcmVmaXgpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXR1cm4gd2hldGhlciB0aGUgZmlsZW5hbWUgbWF0Y2hlcyB0aGUgZ2l2ZW4gcGF0aCBmcmFnbWVudC5cbiAqL1xuZnVuY3Rpb24gbWF0Y2hGcmFnbWVudChmcmFnbWVudCwgZmlsZW5hbWUsIGNhc2VTZW5zaXRpdmU9ZmFsc2UpIHtcbiAgICBpZiAoIWNhc2VTZW5zaXRpdmUpIHtcbiAgICAgICAgZnJhZ21lbnQgPSBmcmFnbWVudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBmaWxlbmFtZSA9IGZpbGVuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGVuYW1lLnN0YXJ0c1dpdGgoZnJhZ21lbnQpO1xufVxuIl19