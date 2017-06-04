function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

module.exports = {
  activate: function activate() {
    this.instance = new _main2['default']();
  },
  consumeStatusBar: function consumeStatusBar(statusBar) {
    this.instance.attach(statusBar);
  },
  providerRegistry: function providerRegistry() {
    return this.instance.registry;
  },
  deactivate: function deactivate() {
    this.instance.dispose();
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvTGVueW1vLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztvQkFFdUIsUUFBUTs7OztBQUcvQixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFBLG9CQUFHO0FBQ1QsUUFBSSxDQUFDLFFBQVEsR0FBRyx1QkFBZ0IsQ0FBQTtHQUNqQztBQUNELGtCQUFnQixFQUFBLDBCQUFDLFNBQWlCLEVBQUU7QUFDbEMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7R0FDaEM7QUFDRCxrQkFBZ0IsRUFBQSw0QkFBbUI7QUFDakMsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQTtHQUM5QjtBQUNELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDeEI7Q0FDRixDQUFBIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvTGVueW1vLy5hdG9tL3BhY2thZ2VzL2J1c3ktc2lnbmFsL2xpYi9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBCdXN5U2lnbmFsIGZyb20gJy4vbWFpbidcbmltcG9ydCB0eXBlIFNpZ25hbFJlZ2lzdHJ5IGZyb20gJy4vcmVnaXN0cnknXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmluc3RhbmNlID0gbmV3IEJ1c3lTaWduYWwoKVxuICB9LFxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcjogT2JqZWN0KSB7XG4gICAgdGhpcy5pbnN0YW5jZS5hdHRhY2goc3RhdHVzQmFyKVxuICB9LFxuICBwcm92aWRlclJlZ2lzdHJ5KCk6IFNpZ25hbFJlZ2lzdHJ5IHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZS5yZWdpc3RyeVxuICB9LFxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuaW5zdGFuY2UuZGlzcG9zZSgpXG4gIH0sXG59XG4iXX0=