(function() {
  var $, CompositeDisposable, ForkGistIdInputView, TextEditorView, View, oldView, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, TextEditorView = ref.TextEditorView, View = ref.View;

  oldView = null;

  module.exports = ForkGistIdInputView = (function(superClass) {
    extend(ForkGistIdInputView, superClass);

    function ForkGistIdInputView() {
      return ForkGistIdInputView.__super__.constructor.apply(this, arguments);
    }

    ForkGistIdInputView.content = function() {
      return this.div({
        "class": 'command-palette'
      }, (function(_this) {
        return function() {
          return _this.subview('selectEditor', new TextEditorView({
            mini: true,
            placeholderText: 'Gist ID to fork'
          }));
        };
      })(this));
    };

    ForkGistIdInputView.prototype.initialize = function() {
      if (oldView != null) {
        oldView.destroy();
      }
      oldView = this;
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.commands.add('atom-text-editor', 'core:confirm', (function(_this) {
        return function() {
          return _this.confirm();
        };
      })(this)));
      this.disposables.add(atom.commands.add('atom-text-editor', 'core:cancel', (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      return this.attach();
    };

    ForkGistIdInputView.prototype.destroy = function() {
      this.disposables.dispose();
      return this.detach();
    };

    ForkGistIdInputView.prototype.attach = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.selectEditor.focus();
    };

    ForkGistIdInputView.prototype.detach = function() {
      this.panel.destroy();
      return ForkGistIdInputView.__super__.detach.apply(this, arguments);
    };

    ForkGistIdInputView.prototype.confirm = function() {
      var gistId;
      gistId = this.selectEditor.getText();
      this.callbackInstance.forkGistId(gistId);
      return this.destroy();
    };

    ForkGistIdInputView.prototype.setCallbackInstance = function(callbackInstance) {
      return this.callbackInstance = callbackInstance;
    };

    return ForkGistIdInputView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9MZW55bW8vLmF0b20vcGFja2FnZXMvc3luYy1zZXR0aW5ncy9saWIvZm9yay1naXN0aWQtaW5wdXQtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLCtFQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBRCxFQUFJLG1DQUFKLEVBQW9COztFQUVwQixPQUFBLEdBQVU7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDUTs7Ozs7OztJQUNKLG1CQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxpQkFBUDtPQUFMLEVBQStCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDN0IsS0FBQyxDQUFBLE9BQUQsQ0FBUyxjQUFULEVBQTZCLElBQUEsY0FBQSxDQUFlO1lBQUEsSUFBQSxFQUFNLElBQU47WUFBWSxlQUFBLEVBQWlCLGlCQUE3QjtXQUFmLENBQTdCO1FBRDZCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtJQURROztrQ0FJVixVQUFBLEdBQVksU0FBQTs7UUFDVixPQUFPLENBQUUsT0FBVCxDQUFBOztNQUNBLE9BQUEsR0FBVTtNQUVWLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUFzQyxjQUF0QyxFQUFzRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RCxDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDLGFBQXRDLEVBQXFELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJELENBQWpCO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQVBVOztrQ0FTWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUZPOztrQ0FJVCxNQUFBLEdBQVEsU0FBQTs7UUFDTixJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3Qjs7TUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTthQUNBLElBQUMsQ0FBQSxZQUFZLENBQUMsS0FBZCxDQUFBO0lBSE07O2tDQUtSLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUE7YUFDQSxpREFBQSxTQUFBO0lBRk07O2tDQUlSLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsWUFBWSxDQUFDLE9BQWQsQ0FBQTtNQUNULElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxVQUFsQixDQUE2QixNQUE3QjthQUNBLElBQUMsQ0FBQSxPQUFELENBQUE7SUFITzs7a0NBS1QsbUJBQUEsR0FBcUIsU0FBQyxnQkFBRDthQUNuQixJQUFDLENBQUEsZ0JBQUQsR0FBb0I7SUFERDs7OztLQWhDVztBQU5wQyIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVGV4dEVkaXRvclZpZXcsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm9sZFZpZXcgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY2xhc3MgRm9ya0dpc3RJZElucHV0VmlldyBleHRlbmRzIFZpZXdcbiAgICBAY29udGVudDogLT5cbiAgICAgIEBkaXYgY2xhc3M6ICdjb21tYW5kLXBhbGV0dGUnLCA9PlxuICAgICAgICBAc3VidmlldyAnc2VsZWN0RWRpdG9yJywgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogJ0dpc3QgSUQgdG8gZm9yaycpXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgb2xkVmlldz8uZGVzdHJveSgpXG4gICAgICBvbGRWaWV3ID0gdGhpc1xuXG4gICAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICdjb3JlOmNvbmZpcm0nLCA9PiBAY29uZmlybSgpXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgJ2NvcmU6Y2FuY2VsJywgPT4gQGRlc3Ryb3koKVxuICAgICAgQGF0dGFjaCgpXG5cbiAgICBkZXN0cm95OiAtPlxuICAgICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgQGRldGFjaCgpXG5cbiAgICBhdHRhY2g6IC0+XG4gICAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgICAgQHBhbmVsLnNob3coKVxuICAgICAgQHNlbGVjdEVkaXRvci5mb2N1cygpXG5cbiAgICBkZXRhY2g6IC0+XG4gICAgICBAcGFuZWwuZGVzdHJveSgpXG4gICAgICBzdXBlclxuXG4gICAgY29uZmlybTogLT5cbiAgICAgIGdpc3RJZCA9IEBzZWxlY3RFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBAY2FsbGJhY2tJbnN0YW5jZS5mb3JrR2lzdElkKGdpc3RJZClcbiAgICAgIEBkZXN0cm95KClcblxuICAgIHNldENhbGxiYWNrSW5zdGFuY2U6IChjYWxsYmFja0luc3RhbmNlKSAtPlxuICAgICAgQGNhbGxiYWNrSW5zdGFuY2UgPSBjYWxsYmFja0luc3RhbmNlXG4iXX0=
