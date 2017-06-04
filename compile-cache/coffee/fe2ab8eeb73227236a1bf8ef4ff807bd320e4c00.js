(function() {
  var slice = [].slice;

  module.exports = {
    setConfig: function(keyPath, value) {
      var base;
      if (this.originalConfigs == null) {
        this.originalConfigs = {};
      }
      if ((base = this.originalConfigs)[keyPath] == null) {
        base[keyPath] = atom.config.isDefault(keyPath) ? null : atom.config.get(keyPath);
      }
      return atom.config.set(keyPath, value);
    },
    restoreConfigs: function() {
      var keyPath, ref, results, value;
      if (this.originalConfigs) {
        ref = this.originalConfigs;
        results = [];
        for (keyPath in ref) {
          value = ref[keyPath];
          results.push(atom.config.set(keyPath, value));
        }
        return results;
      }
    },
    callAsync: function(timeout, async, next) {
      var done, nextArgs, ref;
      if (typeof timeout === 'function') {
        ref = [timeout, async], async = ref[0], next = ref[1];
        timeout = 5000;
      }
      done = false;
      nextArgs = null;
      runs(function() {
        return async(function() {
          var args;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          done = true;
          return nextArgs = args;
        });
      });
      waitsFor(function() {
        return done;
      }, null, timeout);
      if (next != null) {
        return runs(function() {
          return next.apply(this, nextArgs);
        });
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9MZW55bW8vLmF0b20vcGFja2FnZXMvc3luYy1zZXR0aW5ncy9zcGVjL3NwZWMtaGVscGVycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxTQUFBLEVBQVcsU0FBQyxPQUFELEVBQVUsS0FBVjtBQUNULFVBQUE7O1FBQUEsSUFBQyxDQUFBLGtCQUFtQjs7O1lBQ0gsQ0FBQSxPQUFBLElBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFaLENBQXNCLE9BQXRCLENBQUgsR0FBc0MsSUFBdEMsR0FBZ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLE9BQWhCOzthQUM3RSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsT0FBaEIsRUFBeUIsS0FBekI7SUFIUyxDQUFYO0lBS0EsY0FBQSxFQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLGVBQUo7QUFDRTtBQUFBO2FBQUEsY0FBQTs7dUJBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLE9BQWhCLEVBQXlCLEtBQXpCO0FBREY7dUJBREY7O0lBRGMsQ0FMaEI7SUFVQSxTQUFBLEVBQVcsU0FBQyxPQUFELEVBQVUsS0FBVixFQUFpQixJQUFqQjtBQUNULFVBQUE7TUFBQSxJQUFHLE9BQU8sT0FBUCxLQUFrQixVQUFyQjtRQUNFLE1BQWdCLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FBaEIsRUFBQyxjQUFELEVBQVE7UUFDUixPQUFBLEdBQVUsS0FGWjs7TUFHQSxJQUFBLEdBQU87TUFDUCxRQUFBLEdBQVc7TUFFWCxJQUFBLENBQUssU0FBQTtlQUNILEtBQUEsQ0FBTSxTQUFBO0FBQ0osY0FBQTtVQURLO1VBQ0wsSUFBQSxHQUFPO2lCQUNQLFFBQUEsR0FBVztRQUZQLENBQU47TUFERyxDQUFMO01BTUEsUUFBQSxDQUFTLFNBQUE7ZUFDUDtNQURPLENBQVQsRUFFRSxJQUZGLEVBRVEsT0FGUjtNQUlBLElBQUcsWUFBSDtlQUNFLElBQUEsQ0FBSyxTQUFBO2lCQUNILElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxFQUFpQixRQUFqQjtRQURHLENBQUwsRUFERjs7SUFqQlMsQ0FWWDs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgc2V0Q29uZmlnOiAoa2V5UGF0aCwgdmFsdWUpIC0+XG4gICAgQG9yaWdpbmFsQ29uZmlncyA/PSB7fVxuICAgIEBvcmlnaW5hbENvbmZpZ3Nba2V5UGF0aF0gPz0gaWYgYXRvbS5jb25maWcuaXNEZWZhdWx0IGtleVBhdGggdGhlbiBudWxsIGVsc2UgYXRvbS5jb25maWcuZ2V0IGtleVBhdGhcbiAgICBhdG9tLmNvbmZpZy5zZXQga2V5UGF0aCwgdmFsdWVcblxuICByZXN0b3JlQ29uZmlnczogLT5cbiAgICBpZiBAb3JpZ2luYWxDb25maWdzXG4gICAgICBmb3Iga2V5UGF0aCwgdmFsdWUgb2YgQG9yaWdpbmFsQ29uZmlnc1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQga2V5UGF0aCwgdmFsdWVcblxuICBjYWxsQXN5bmM6ICh0aW1lb3V0LCBhc3luYywgbmV4dCkgLT5cbiAgICBpZiB0eXBlb2YgdGltZW91dCBpcyAnZnVuY3Rpb24nXG4gICAgICBbYXN5bmMsIG5leHRdID0gW3RpbWVvdXQsIGFzeW5jXVxuICAgICAgdGltZW91dCA9IDUwMDBcbiAgICBkb25lID0gZmFsc2VcbiAgICBuZXh0QXJncyA9IG51bGxcblxuICAgIHJ1bnMgLT5cbiAgICAgIGFzeW5jIChhcmdzLi4uKSAtPlxuICAgICAgICBkb25lID0gdHJ1ZVxuICAgICAgICBuZXh0QXJncyA9IGFyZ3NcblxuXG4gICAgd2FpdHNGb3IgLT5cbiAgICAgIGRvbmVcbiAgICAsIG51bGwsIHRpbWVvdXRcblxuICAgIGlmIG5leHQ/XG4gICAgICBydW5zIC0+XG4gICAgICAgIG5leHQuYXBwbHkodGhpcywgbmV4dEFyZ3MpXG4iXX0=
