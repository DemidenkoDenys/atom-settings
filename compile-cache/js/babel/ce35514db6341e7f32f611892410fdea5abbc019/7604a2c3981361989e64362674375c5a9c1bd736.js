Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.provideEventService = provideEventService;
/** @babel */

var _controller = require('./controller');

// Instance of the controller, constructed on activation.
var controller = null;

var _config = require('./config');

Object.defineProperty(exports, 'config', {
    enumerable: true,
    get: function get() {
        return _config.config;
    }
});

var _view = require('./view');

Object.defineProperty(exports, 'consumeElementIcons', {
    enumerable: true,
    get: function get() {
        return _view.consumeElementIcons;
    }
});

function activate(state) {
    controller = new _controller.AdvancedOpenFileController();
}

function deactivate() {
    controller.detach();
    controller.destroy();
    controller = null;
}

/**
 * Provide a service object allowing other packages to subscribe to our
 * events.
 */

function provideEventService() {
    return {
        onDidOpenPath: function onDidOpenPath(callback) {
            return _controller.emitter.on('did-open-path', callback);
        },

        onDidCreatePath: function onDidCreatePath(callback) {
            return _controller.emitter.on('did-create-path', callback);
        }
    };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvTGVueW1vLy5hdG9tL3BhY2thZ2VzL2FkdmFuY2VkLW9wZW4tZmlsZS9saWIvYWR2YW5jZWQtb3Blbi1maWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzBCQUNrRCxjQUFjOzs7QUFJaEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFBOztzQkFFQSxVQUFVOzs7Ozt1QkFBdkIsTUFBTTs7OztvQkFDb0IsUUFBUTs7Ozs7cUJBQWxDLG1CQUFtQjs7OztBQUVwQixTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDNUIsY0FBVSxHQUFHLDRDQUFnQyxDQUFDO0NBQ2pEOztBQUVNLFNBQVMsVUFBVSxHQUFHO0FBQ3pCLGNBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNwQixjQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsY0FBVSxHQUFHLElBQUksQ0FBQztDQUNyQjs7Ozs7OztBQU1NLFNBQVMsbUJBQW1CLEdBQUc7QUFDbEMsV0FBTztBQUNILHFCQUFhLEVBQUEsdUJBQUMsUUFBUSxFQUFFO0FBQ3BCLG1CQUFPLG9CQUFRLEVBQUUsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDaEQ7O0FBRUQsdUJBQWUsRUFBQSx5QkFBQyxRQUFRLEVBQUU7QUFDdEIsbUJBQU8sb0JBQVEsRUFBRSxDQUFDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2xEO0tBQ0osQ0FBQztDQUNMIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvTGVueW1vLy5hdG9tL3BhY2thZ2VzL2FkdmFuY2VkLW9wZW4tZmlsZS9saWIvYWR2YW5jZWQtb3Blbi1maWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuaW1wb3J0IHtBZHZhbmNlZE9wZW5GaWxlQ29udHJvbGxlciwgZW1pdHRlcn0gZnJvbSAnLi9jb250cm9sbGVyJztcblxuXG4vLyBJbnN0YW5jZSBvZiB0aGUgY29udHJvbGxlciwgY29uc3RydWN0ZWQgb24gYWN0aXZhdGlvbi5cbmxldCBjb250cm9sbGVyID0gbnVsbFxuXG5leHBvcnQge2NvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuZXhwb3J0IHtjb25zdW1lRWxlbWVudEljb25zfSBmcm9tICcuL3ZpZXcnO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGUpIHtcbiAgICBjb250cm9sbGVyID0gbmV3IEFkdmFuY2VkT3BlbkZpbGVDb250cm9sbGVyKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICAgIGNvbnRyb2xsZXIuZGV0YWNoKCk7XG4gICAgY29udHJvbGxlci5kZXN0cm95KCk7XG4gICAgY29udHJvbGxlciA9IG51bGw7XG59XG5cbi8qKlxuICogUHJvdmlkZSBhIHNlcnZpY2Ugb2JqZWN0IGFsbG93aW5nIG90aGVyIHBhY2thZ2VzIHRvIHN1YnNjcmliZSB0byBvdXJcbiAqIGV2ZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVFdmVudFNlcnZpY2UoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25EaWRPcGVuUGF0aChjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGVtaXR0ZXIub24oJ2RpZC1vcGVuLXBhdGgnLCBjYWxsYmFjayk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EaWRDcmVhdGVQYXRoKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZW1pdHRlci5vbignZGlkLWNyZWF0ZS1wYXRoJywgY2FsbGJhY2spO1xuICAgICAgICB9LFxuICAgIH07XG59XG4iXX0=