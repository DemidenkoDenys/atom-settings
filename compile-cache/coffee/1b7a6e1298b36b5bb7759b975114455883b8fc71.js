(function() {
  var Point, Range, actionUtils, editorUtils, emmet, insertSnippet, normalize, path, preprocessSnippet, ref, resources, tabStops, utils, visualize;

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  path = require('path');

  emmet = require('emmet');

  utils = require('emmet/lib/utils/common');

  tabStops = require('emmet/lib/assets/tabStops');

  resources = require('emmet/lib/assets/resources');

  editorUtils = require('emmet/lib/utils/editor');

  actionUtils = require('emmet/lib/utils/action');

  insertSnippet = function(snippet, editor) {
    var ref1, ref2, ref3, ref4;
    if ((ref1 = atom.packages.getLoadedPackage('snippets')) != null) {
      if ((ref2 = ref1.mainModule) != null) {
        ref2.insert(snippet, editor);
      }
    }
    return editor.snippetExpansion = (ref3 = atom.packages.getLoadedPackage('snippets')) != null ? (ref4 = ref3.mainModule) != null ? ref4.getExpansions(editor)[0] : void 0 : void 0;
  };

  visualize = function(str) {
    return str.replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\s/g, '\\s');
  };

  normalize = function(text, editor) {
    return editorUtils.normalize(text, {
      indentation: editor.getTabText(),
      newline: '\n'
    });
  };

  preprocessSnippet = function(value) {
    var order, tabstopOptions;
    order = [];
    tabstopOptions = {
      tabstop: function(data) {
        var group, placeholder;
        group = parseInt(data.group, 10);
        if (group === 0) {
          order.push(-1);
          group = order.length;
        } else {
          if (order.indexOf(group) === -1) {
            order.push(group);
          }
          group = order.indexOf(group) + 1;
        }
        placeholder = data.placeholder || '';
        if (placeholder) {
          placeholder = tabStops.processText(placeholder, tabstopOptions);
        }
        if (placeholder) {
          return "${" + group + ":" + placeholder + "}";
        } else {
          return "${" + group + "}";
        }
      },
      escape: function(ch) {
        if (ch === '$') {
          return '\\$';
        } else {
          return ch;
        }
      }
    };
    return tabStops.processText(value, tabstopOptions);
  };

  module.exports = {
    setup: function(editor1, selectionIndex) {
      var buf, bufRanges;
      this.editor = editor1;
      this.selectionIndex = selectionIndex != null ? selectionIndex : 0;
      buf = this.editor.getBuffer();
      bufRanges = this.editor.getSelectedBufferRanges();
      return this._selection = {
        index: 0,
        saved: new Array(bufRanges.length),
        bufferRanges: bufRanges,
        indexRanges: bufRanges.map(function(range) {
          return {
            start: buf.characterIndexForPosition(range.start),
            end: buf.characterIndexForPosition(range.end)
          };
        })
      };
    },
    exec: function(fn) {
      var ix, success;
      ix = this._selection.bufferRanges.length - 1;
      this._selection.saved = [];
      success = true;
      while (ix >= 0) {
        this._selection.index = ix;
        if (fn(this._selection.index) === false) {
          success = false;
          break;
        }
        ix--;
      }
      if (success && this._selection.saved.length > 1) {
        return this._setSelectedBufferRanges(this._selection.saved);
      }
    },
    _setSelectedBufferRanges: function(sels) {
      var filteredSels;
      filteredSels = sels.filter(function(s) {
        return !!s;
      });
      if (filteredSels.length) {
        return this.editor.setSelectedBufferRanges(filteredSels);
      }
    },
    _saveSelection: function(delta) {
      var i, range, results;
      this._selection.saved[this._selection.index] = this.editor.getSelectedBufferRange();
      if (delta) {
        i = this._selection.index;
        delta = Point.fromObject([delta, 0]);
        results = [];
        while (++i < this._selection.saved.length) {
          range = this._selection.saved[i];
          if (range) {
            results.push(this._selection.saved[i] = new Range(range.start.translate(delta), range.end.translate(delta)));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    },
    selectionList: function() {
      return this._selection.indexRanges;
    },
    getCaretPos: function() {
      return this.getSelectionRange().start;
    },
    setCaretPos: function(pos) {
      return this.createSelection(pos);
    },
    getSelectionRange: function() {
      return this._selection.indexRanges[this._selection.index];
    },
    getSelectionBufferRange: function() {
      return this._selection.bufferRanges[this._selection.index];
    },
    createSelection: function(start, end) {
      var buf, sels;
      if (end == null) {
        end = start;
      }
      sels = this._selection.bufferRanges;
      buf = this.editor.getBuffer();
      sels[this._selection.index] = new Range(buf.positionForCharacterIndex(start), buf.positionForCharacterIndex(end));
      return this._setSelectedBufferRanges(sels);
    },
    getSelection: function() {
      return this.editor.getTextInBufferRange(this.getSelectionBufferRange());
    },
    getCurrentLineRange: function() {
      var index, lineLength, row, sel;
      sel = this.getSelectionBufferRange();
      row = sel.getRows()[0];
      lineLength = this.editor.lineTextForBufferRow(row).length;
      index = this.editor.getBuffer().characterIndexForPosition({
        row: row,
        column: 0
      });
      return {
        start: index,
        end: index + lineLength
      };
    },
    getCurrentLine: function() {
      var row, sel;
      sel = this.getSelectionBufferRange();
      row = sel.getRows()[0];
      return this.editor.lineTextForBufferRow(row);
    },
    getContent: function() {
      return this.editor.getText();
    },
    replaceContent: function(value, start, end, noIndent) {
      var buf, caret, changeRange, oldValue;
      if (end == null) {
        end = start == null ? this.getContent().length : start;
      }
      if (start == null) {
        start = 0;
      }
      value = normalize(value, this.editor);
      buf = this.editor.getBuffer();
      changeRange = new Range(Point.fromObject(buf.positionForCharacterIndex(start)), Point.fromObject(buf.positionForCharacterIndex(end)));
      oldValue = this.editor.getTextInBufferRange(changeRange);
      buf.setTextInRange(changeRange, '');
      caret = buf.positionForCharacterIndex(start);
      this.editor.setSelectedBufferRange(new Range(caret, caret));
      insertSnippet(preprocessSnippet(value), this.editor);
      this._saveSelection(utils.splitByLines(value).length - utils.splitByLines(oldValue).length);
      return value;
    },
    getGrammar: function() {
      return this.editor.getGrammar().scopeName.toLowerCase();
    },
    getSyntax: function() {
      var m, ref1, scope, sourceSyntax, syntax;
      scope = this.getCurrentScope().join(' ');
      if (~scope.indexOf('xsl')) {
        return 'xsl';
      }
      if (!/\bstring\b/.test(scope) && /\bsource\.(js|ts)x?\b/.test(scope)) {
        return 'jsx';
      }
      sourceSyntax = (ref1 = scope.match(/\bsource\.([\w\-]+)/)) != null ? ref1[0] : void 0;
      if (!/\bstring\b/.test(scope) && sourceSyntax && resources.hasSyntax(sourceSyntax)) {
        syntax = sourceSyntax;
      } else {
        m = scope.match(/\b(source|text)\.[\w\-\.]+/);
        syntax = m != null ? m[0].split('.').reduceRight(function(result, token) {
          return result || (resources.hasSyntax(token) ? token : void 0);
        }, null) : void 0;
      }
      return actionUtils.detectSyntax(this, syntax || 'html');
    },
    getCurrentScope: function() {
      var range;
      range = this._selection.bufferRanges[this._selection.index];
      return this.editor.scopeDescriptorForBufferPosition(range.start).getScopesArray();
    },
    getProfileName: function() {
      if (this.getCurrentScope().some(function(scope) {
        return /\bstring\.quoted\b/.test(scope);
      })) {
        return 'line';
      } else {
        return actionUtils.detectProfile(this);
      }
    },
    getFilePath: function() {
      return this.editor.buffer.file.path;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9MZW55bW8vLmF0b20vcGFja2FnZXMvZW1tZXQtYXRvbS9saWIvZWRpdG9yLXByb3h5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUNSLElBQUEsR0FBaUIsT0FBQSxDQUFRLE1BQVI7O0VBRWpCLEtBQUEsR0FBYyxPQUFBLENBQVEsT0FBUjs7RUFDZCxLQUFBLEdBQWMsT0FBQSxDQUFRLHdCQUFSOztFQUNkLFFBQUEsR0FBYyxPQUFBLENBQVEsMkJBQVI7O0VBQ2QsU0FBQSxHQUFjLE9BQUEsQ0FBUSw0QkFBUjs7RUFDZCxXQUFBLEdBQWMsT0FBQSxDQUFRLHdCQUFSOztFQUNkLFdBQUEsR0FBYyxPQUFBLENBQVEsd0JBQVI7O0VBRWQsYUFBQSxHQUFnQixTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2QsUUFBQTs7O1lBQXNELENBQUUsTUFBeEQsQ0FBK0QsT0FBL0QsRUFBd0UsTUFBeEU7OztXQUdBLE1BQU0sQ0FBQyxnQkFBUCx3R0FBZ0YsQ0FBRSxhQUF4RCxDQUFzRSxNQUF0RSxDQUE4RSxDQUFBLENBQUE7RUFKMUY7O0VBTWhCLFNBQUEsR0FBWSxTQUFDLEdBQUQ7V0FDVixHQUNFLENBQUMsT0FESCxDQUNXLEtBRFgsRUFDa0IsS0FEbEIsQ0FFRSxDQUFDLE9BRkgsQ0FFVyxLQUZYLEVBRWtCLEtBRmxCLENBR0UsQ0FBQyxPQUhILENBR1csS0FIWCxFQUdrQixLQUhsQjtFQURVOztFQVdaLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxNQUFQO1dBQ1YsV0FBVyxDQUFDLFNBQVosQ0FBc0IsSUFBdEIsRUFDRTtNQUFBLFdBQUEsRUFBYSxNQUFNLENBQUMsVUFBUCxDQUFBLENBQWI7TUFDQSxPQUFBLEVBQVMsSUFEVDtLQURGO0VBRFU7O0VBUVos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QUFOLENBQVksNEJBQVo7UUFDSixNQUFBLGVBQVMsQ0FBRyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQU4sQ0FBWSxHQUFaLENBQWdCLENBQUMsV0FBakIsQ0FBNkIsU0FBQyxNQUFELEVBQVMsS0FBVDtpQkFDbEMsTUFBQSxJQUFVLENBQVUsU0FBUyxDQUFDLFNBQVYsQ0FBb0IsS0FBcEIsQ0FBVCxHQUFBLEtBQUEsR0FBQSxNQUFEO1FBRHdCLENBQTdCLEVBRUwsSUFGSyxXQUxYOzthQVNBLFdBQVcsQ0FBQyxZQUFaLENBQXlCLElBQXpCLEVBQTRCLE1BQUEsSUFBVSxNQUF0QztJQWhCUyxDQWpKWDtJQW1LQSxlQUFBLEVBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxVQUFVLENBQUMsWUFBYSxDQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWjthQUNqQyxJQUFDLENBQUEsTUFBTSxDQUFDLGdDQUFSLENBQXlDLEtBQUssQ0FBQyxLQUEvQyxDQUFxRCxDQUFDLGNBQXRELENBQUE7SUFGZSxDQW5LakI7SUEwS0EsY0FBQSxFQUFnQixTQUFBO01BQ1AsSUFBRyxJQUFDLENBQUEsZUFBRCxDQUFBLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsU0FBQyxLQUFEO2VBQVcsb0JBQW9CLENBQUMsSUFBckIsQ0FBMEIsS0FBMUI7TUFBWCxDQUF4QixDQUFIO2VBQTRFLE9BQTVFO09BQUEsTUFBQTtlQUF3RixXQUFXLENBQUMsYUFBWixDQUEwQixJQUExQixFQUF4Rjs7SUFETyxDQTFLaEI7SUE4S0EsV0FBQSxFQUFhLFNBQUE7YUFFWCxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFGVCxDQTlLYjs7QUE3REYiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5wYXRoICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG5cbmVtbWV0ICAgICAgID0gcmVxdWlyZSAnZW1tZXQnXG51dGlscyAgICAgICA9IHJlcXVpcmUgJ2VtbWV0L2xpYi91dGlscy9jb21tb24nXG50YWJTdG9wcyAgICA9IHJlcXVpcmUgJ2VtbWV0L2xpYi9hc3NldHMvdGFiU3RvcHMnXG5yZXNvdXJjZXMgICA9IHJlcXVpcmUgJ2VtbWV0L2xpYi9hc3NldHMvcmVzb3VyY2VzJ1xuZWRpdG9yVXRpbHMgPSByZXF1aXJlICdlbW1ldC9saWIvdXRpbHMvZWRpdG9yJ1xuYWN0aW9uVXRpbHMgPSByZXF1aXJlICdlbW1ldC9saWIvdXRpbHMvYWN0aW9uJ1xuXG5pbnNlcnRTbmlwcGV0ID0gKHNuaXBwZXQsIGVkaXRvcikgLT5cbiAgYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCdzbmlwcGV0cycpPy5tYWluTW9kdWxlPy5pbnNlcnQoc25pcHBldCwgZWRpdG9yKVxuXG4gICMgRmV0Y2ggZXhwYW5zaW9ucyBhbmQgYXNzaWduIHRvIGVkaXRvclxuICBlZGl0b3Iuc25pcHBldEV4cGFuc2lvbiA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgnc25pcHBldHMnKT8ubWFpbk1vZHVsZT8uZ2V0RXhwYW5zaW9ucyhlZGl0b3IpWzBdXG5cbnZpc3VhbGl6ZSA9IChzdHIpIC0+XG4gIHN0clxuICAgIC5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JylcbiAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXG4gICAgLnJlcGxhY2UoL1xccy9nLCAnXFxcXHMnKVxuXG4jIE5vcm1hbGl6ZXMgdGV4dCBiZWZvcmUgaXQgZ29lcyB0byBlZGl0b3I6IHJlcGxhY2VzIGluZGVudGF0aW9uXG4jIGFuZCBuZXdsaW5lcyB3aXRoIG9uZXMgdXNlZCBpbiBlZGl0b3JcbiMgQHBhcmFtICB7U3RyaW5nfSB0ZXh0ICAgVGV4dCB0byBub3JtYWxpemVcbiMgQHBhcmFtICB7RWRpdG9yfSBlZGl0b3IgQnJhY2tldHMgZWRpdG9yIGluc3RhbmNlXG4jIEByZXR1cm4ge1N0cmluZ31cbm5vcm1hbGl6ZSA9ICh0ZXh0LCBlZGl0b3IpIC0+XG4gIGVkaXRvclV0aWxzLm5vcm1hbGl6ZSB0ZXh0LFxuICAgIGluZGVudGF0aW9uOiBlZGl0b3IuZ2V0VGFiVGV4dCgpLFxuICAgIG5ld2xpbmU6ICdcXG4nXG5cbiMgUHJvcHJvY2VzcyB0ZXh0IGRhdGEgdGhhdCBzaG91bGQgYmUgdXNlZCBhcyBzbmlwcGV0IGNvbnRlbnRcbiMgQ3VycmVudGx5LCBBdG9t4oCZcyBzbmlwcGV0cyBpbXBsZW1lbnRhdGlvbiBoYXMgdGhlIGZvbGxvd2luZyBpc3N1ZXM6XG4jICogbXVsdGlwbGUgJDAgYXJlIG5vdCB0cmVhdGVkIGFzIGRpc3RpbmN0IGZpbmFsIHRhYnN0b3BzXG5wcmVwcm9jZXNzU25pcHBldCA9ICh2YWx1ZSkgLT5cbiAgb3JkZXIgPSBbXVxuXG4gIHRhYnN0b3BPcHRpb25zID1cbiAgICB0YWJzdG9wOiAoZGF0YSkgLT5cbiAgICAgIGdyb3VwID0gcGFyc2VJbnQoZGF0YS5ncm91cCwgMTApXG4gICAgICBpZiBncm91cCBpcyAwXG4gICAgICAgIG9yZGVyLnB1c2goLTEpXG4gICAgICAgIGdyb3VwID0gb3JkZXIubGVuZ3RoXG4gICAgICBlbHNlXG4gICAgICAgIG9yZGVyLnB1c2goZ3JvdXApIGlmIG9yZGVyLmluZGV4T2YoZ3JvdXApIGlzIC0xXG4gICAgICAgIGdyb3VwID0gb3JkZXIuaW5kZXhPZihncm91cCkgKyAxXG5cbiAgICAgIHBsYWNlaG9sZGVyID0gZGF0YS5wbGFjZWhvbGRlciBvciAnJ1xuICAgICAgaWYgcGxhY2Vob2xkZXJcbiAgICAgICAgIyByZWN1cnNpdmVseSB1cGRhdGUgbmVzdGVkIHRhYnN0b3BzXG4gICAgICAgIHBsYWNlaG9sZGVyID0gdGFiU3RvcHMucHJvY2Vzc1RleHQocGxhY2Vob2xkZXIsIHRhYnN0b3BPcHRpb25zKVxuXG4gICAgICBpZiBwbGFjZWhvbGRlciB0aGVuIFwiJHsje2dyb3VwfToje3BsYWNlaG9sZGVyfX1cIiBlbHNlIFwiJHsje2dyb3VwfX1cIlxuXG4gICAgZXNjYXBlOiAoY2gpIC0+XG4gICAgICBpZiBjaCA9PSAnJCcgdGhlbiAnXFxcXCQnIGVsc2UgY2hcblxuICB0YWJTdG9wcy5wcm9jZXNzVGV4dCh2YWx1ZSwgdGFic3RvcE9wdGlvbnMpXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2V0dXA6IChAZWRpdG9yLCBAc2VsZWN0aW9uSW5kZXg9MCkgLT5cbiAgICBidWYgPSBAZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgYnVmUmFuZ2VzID0gQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpXG4gICAgQF9zZWxlY3Rpb24gPVxuICAgICAgaW5kZXg6IDBcbiAgICAgIHNhdmVkOiBuZXcgQXJyYXkoYnVmUmFuZ2VzLmxlbmd0aClcbiAgICAgIGJ1ZmZlclJhbmdlczogYnVmUmFuZ2VzXG4gICAgICBpbmRleFJhbmdlczogYnVmUmFuZ2VzLm1hcCAocmFuZ2UpIC0+XG4gICAgICAgICAgc3RhcnQ6IGJ1Zi5jaGFyYWN0ZXJJbmRleEZvclBvc2l0aW9uKHJhbmdlLnN0YXJ0KVxuICAgICAgICAgIGVuZDogICBidWYuY2hhcmFjdGVySW5kZXhGb3JQb3NpdGlvbihyYW5nZS5lbmQpXG5cbiAgIyBFeGVjdXRlcyBnaXZlbiBmdW5jdGlvbiBmb3IgZXZlcnkgc2VsZWN0aW9uXG4gIGV4ZWM6IChmbikgLT5cbiAgICBpeCA9IEBfc2VsZWN0aW9uLmJ1ZmZlclJhbmdlcy5sZW5ndGggLSAxXG4gICAgQF9zZWxlY3Rpb24uc2F2ZWQgPSBbXVxuICAgIHN1Y2Nlc3MgPSB0cnVlXG4gICAgd2hpbGUgaXggPj0gMFxuICAgICAgQF9zZWxlY3Rpb24uaW5kZXggPSBpeFxuICAgICAgaWYgZm4oQF9zZWxlY3Rpb24uaW5kZXgpIGlzIGZhbHNlXG4gICAgICAgIHN1Y2Nlc3MgPSBmYWxzZVxuICAgICAgICBicmVha1xuICAgICAgaXgtLVxuXG4gICAgaWYgc3VjY2VzcyBhbmQgQF9zZWxlY3Rpb24uc2F2ZWQubGVuZ3RoID4gMVxuICAgICAgQF9zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhAX3NlbGVjdGlvbi5zYXZlZClcblxuICBfc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXM6IChzZWxzKSAtPlxuICAgIGZpbHRlcmVkU2VscyA9IHNlbHMuZmlsdGVyIChzKSAtPiAhIXNcbiAgICBpZiBmaWx0ZXJlZFNlbHMubGVuZ3RoXG4gICAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKGZpbHRlcmVkU2VscylcblxuICBfc2F2ZVNlbGVjdGlvbjogKGRlbHRhKSAtPlxuICAgIEBfc2VsZWN0aW9uLnNhdmVkW0Bfc2VsZWN0aW9uLmluZGV4XSA9IEBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpXG4gICAgaWYgZGVsdGFcbiAgICAgIGkgPSBAX3NlbGVjdGlvbi5pbmRleFxuICAgICAgZGVsdGEgPSBQb2ludC5mcm9tT2JqZWN0KFtkZWx0YSwgMF0pXG4gICAgICB3aGlsZSArK2kgPCBAX3NlbGVjdGlvbi5zYXZlZC5sZW5ndGhcbiAgICAgICAgcmFuZ2UgPSBAX3NlbGVjdGlvbi5zYXZlZFtpXVxuICAgICAgICBpZiByYW5nZVxuICAgICAgICAgIEBfc2VsZWN0aW9uLnNhdmVkW2ldID0gbmV3IFJhbmdlKHJhbmdlLnN0YXJ0LnRyYW5zbGF0ZShkZWx0YSksIHJhbmdlLmVuZC50cmFuc2xhdGUoZGVsdGEpKVxuXG4gIHNlbGVjdGlvbkxpc3Q6IC0+XG4gICAgQF9zZWxlY3Rpb24uaW5kZXhSYW5nZXNcblxuICAjIFJldHVybnMgdGhlIGN1cnJlbnQgY2FyZXQgcG9zaXRpb24uXG4gIGdldENhcmV0UG9zOiAtPlxuICAgIEBnZXRTZWxlY3Rpb25SYW5nZSgpLnN0YXJ0XG5cbiAgIyBTZXRzIHRoZSBjdXJyZW50IGNhcmV0IHBvc2l0aW9uLlxuICBzZXRDYXJldFBvczogKHBvcykgLT5cbiAgICBAY3JlYXRlU2VsZWN0aW9uKHBvcylcblxuICAjIEZldGNoZXMgdGhlIGNoYXJhY3RlciBpbmRleGVzIG9mIHRoZSBzZWxlY3RlZCB0ZXh0LlxuICAjIFJldHVybnMgYW4ge09iamVjdH0gd2l0aCBgc3RhcnRgIGFuZCBgZW5kYCBwcm9wZXJ0aWVzLlxuICBnZXRTZWxlY3Rpb25SYW5nZTogLT5cbiAgICBAX3NlbGVjdGlvbi5pbmRleFJhbmdlc1tAX3NlbGVjdGlvbi5pbmRleF1cblxuICBnZXRTZWxlY3Rpb25CdWZmZXJSYW5nZTogLT5cbiAgICBAX3NlbGVjdGlvbi5idWZmZXJSYW5nZXNbQF9zZWxlY3Rpb24uaW5kZXhdXG5cbiAgIyBDcmVhdGVzIGEgc2VsZWN0aW9uIGZyb20gdGhlIGBzdGFydGAgdG8gYGVuZGAgY2hhcmFjdGVyIGluZGV4ZXMuXG4gICNcbiAgIyBJZiBgZW5kYCBpcyBvbW1pdGVkLCB0aGlzIG1ldGhvZCBzaG91bGQgcGxhY2UgYSBjYXJldCBhdCB0aGUgYHN0YXJ0YCBpbmRleC5cbiAgI1xuICAjIHN0YXJ0IC0gQSB7TnVtYmVyfSByZXByZXNlbnRpbmcgdGhlIHN0YXJ0aW5nIGNoYXJhY3RlciBpbmRleFxuICAjIGVuZCAtIEEge051bWJlcn0gcmVwcmVzZW50aW5nIHRoZSBlbmRpbmcgY2hhcmFjdGVyIGluZGV4XG4gIGNyZWF0ZVNlbGVjdGlvbjogKHN0YXJ0LCBlbmQ9c3RhcnQpIC0+XG4gICAgc2VscyA9IEBfc2VsZWN0aW9uLmJ1ZmZlclJhbmdlc1xuICAgIGJ1ZiA9IEBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICBzZWxzW0Bfc2VsZWN0aW9uLmluZGV4XSA9IG5ldyBSYW5nZShidWYucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChzdGFydCksIGJ1Zi5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KGVuZCkpXG4gICAgQF9zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhzZWxzKVxuXG4gICMgUmV0dXJucyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHRleHQuXG4gIGdldFNlbGVjdGlvbjogLT5cbiAgICBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKEBnZXRTZWxlY3Rpb25CdWZmZXJSYW5nZSgpKVxuXG4gICMgRmV0Y2hlcyB0aGUgY3VycmVudCBsaW5lJ3Mgc3RhcnQgYW5kIGVuZCBpbmRleGVzLlxuICAjXG4gICMgUmV0dXJucyBhbiB7T2JqZWN0fSB3aXRoIGBzdGFydGAgYW5kIGBlbmRgIHByb3BlcnRpZXNcbiAgZ2V0Q3VycmVudExpbmVSYW5nZTogLT5cbiAgICBzZWwgPSBAZ2V0U2VsZWN0aW9uQnVmZmVyUmFuZ2UoKVxuICAgIHJvdyA9IHNlbC5nZXRSb3dzKClbMF1cbiAgICBsaW5lTGVuZ3RoID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpLmxlbmd0aFxuICAgIGluZGV4ID0gQGVkaXRvci5nZXRCdWZmZXIoKS5jaGFyYWN0ZXJJbmRleEZvclBvc2l0aW9uKHtyb3c6IHJvdywgY29sdW1uOiAwfSlcbiAgICByZXR1cm4ge1xuICAgICAgc3RhcnQ6IGluZGV4XG4gICAgICBlbmQ6IGluZGV4ICsgbGluZUxlbmd0aFxuICAgIH1cblxuICAjIFJldHVybnMgdGhlIGN1cnJlbnQgbGluZS5cbiAgZ2V0Q3VycmVudExpbmU6IC0+XG4gICAgc2VsID0gQGdldFNlbGVjdGlvbkJ1ZmZlclJhbmdlKClcbiAgICByb3cgPSBzZWwuZ2V0Um93cygpWzBdXG4gICAgcmV0dXJuIEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVxuXG4gICMgUmV0dXJucyB0aGUgZWRpdG9yIGNvbnRlbnQuXG4gIGdldENvbnRlbnQ6IC0+XG4gICAgcmV0dXJuIEBlZGl0b3IuZ2V0VGV4dCgpXG5cbiAgIyBSZXBsYWNlIHRoZSBlZGl0b3IncyBjb250ZW50IChvciBwYXJ0IG9mIGl0LCBpZiB1c2luZyBgc3RhcnRgIHRvXG4gICMgYGVuZGAgaW5kZXgpLlxuICAjXG4gICMgSWYgYHZhbHVlYCBjb250YWlucyBgY2FyZXRfcGxhY2Vob2xkZXJgLCB0aGUgZWRpdG9yIHB1dHMgYSBjYXJldCBpbnRvXG4gICMgdGhpcyBwb3NpdGlvbi4gSWYgeW91IHNraXAgdGhlIGBzdGFydGAgYW5kIGBlbmRgIGFyZ3VtZW50cywgdGhlIHdob2xlIHRhcmdldCdzXG4gICMgY29udGVudCBpcyByZXBsYWNlZCB3aXRoIGB2YWx1ZWAuXG4gICNcbiAgIyBJZiB5b3UgcGFzcyBqdXN0IHRoZSBgc3RhcnRgIGFyZ3VtZW50LCB0aGUgYHZhbHVlYCBpcyBwbGFjZWQgYXQgdGhlIGBzdGFydGAgc3RyaW5nXG4gICMgaW5kZXggb2YgdGhyIGN1cnJlbnQgY29udGVudC5cbiAgI1xuICAjIElmIHlvdSBwYXNzIGJvdGggYHN0YXJ0YCBhbmQgYGVuZGAgYXJndW1lbnRzLCB0aGUgY29ycmVzcG9uZGluZyBzdWJzdHJpbmcgb2ZcbiAgIyB0aGUgY3VycmVudCB0YXJnZXQncyBjb250ZW50IGlzIHJlcGxhY2VkIHdpdGggYHZhbHVlYC5cbiAgI1xuICAjIHZhbHVlIC0gQSB7U3RyaW5nfSBvZiBjb250ZW50IHlvdSB3YW50IHRvIHBhc3RlXG4gICMgc3RhcnQgLSBUaGUgb3B0aW9uYWwgc3RhcnQgaW5kZXgge051bWJlcn0gb2YgdGhlIGVkaXRvcidzIGNvbnRlbnRcbiAgIyBlbmQgLSBUaGUgb3B0aW9uYWwgZW5kIGluZGV4IHtOdW1iZXJ9IG9mIHRoZSBlZGl0b3IncyBjb250ZW50XG4gICMgbm9JZGVudCAtIEFuIG9wdGlvbmFsIHtCb29sZWFufSB3aGljaCwgaWYgYHRydWVgLCBkb2VzIG5vdCBhdHRlbXB0IHRvIGF1dG8gaW5kZW50IGB2YWx1ZWBcbiAgcmVwbGFjZUNvbnRlbnQ6ICh2YWx1ZSwgc3RhcnQsIGVuZCwgbm9JbmRlbnQpIC0+XG4gICAgdW5sZXNzIGVuZD9cbiAgICAgIGVuZCA9IHVubGVzcyBzdGFydD8gdGhlbiBAZ2V0Q29udGVudCgpLmxlbmd0aCBlbHNlIHN0YXJ0XG4gICAgc3RhcnQgPSAwIHVubGVzcyBzdGFydD9cblxuICAgIHZhbHVlID0gbm9ybWFsaXplKHZhbHVlLCBAZWRpdG9yKVxuICAgIGJ1ZiA9IEBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICBjaGFuZ2VSYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgIFBvaW50LmZyb21PYmplY3QoYnVmLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgoc3RhcnQpKSxcbiAgICAgIFBvaW50LmZyb21PYmplY3QoYnVmLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgoZW5kKSlcbiAgICApXG5cbiAgICBvbGRWYWx1ZSA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoY2hhbmdlUmFuZ2UpXG4gICAgYnVmLnNldFRleHRJblJhbmdlKGNoYW5nZVJhbmdlLCAnJylcbiAgICAjIEJlZm9yZSBpbnNlcnRpbmcgc25pcHBldCB3ZSBoYXZlIHRvIHJlc2V0IGFsbCBhdmFpbGFibGUgc2VsZWN0aW9uc1xuICAgICMgdG8gaW5zZXJ0IHNuaXBwZW50IHJpZ2h0IGluIHJlcXVpcmVkIHBsYWNlLiBPdGhlcndpc2Ugc25pcHBldFxuICAgICMgd2lsbCBiZSBpbnNlcnRlZCBmb3IgZWFjaCBzZWxlY3Rpb24gaW4gZWRpdG9yXG5cbiAgICAjIFJpZ2h0IGFmdGVyIHRoYXQgd2Ugc2hvdWxkIHNhdmUgZmlyc3QgYXZhaWxhYmxlIHNlbGVjdGlvbiBhcyBidWZmZXIgcmFuZ2VcbiAgICBjYXJldCA9IGJ1Zi5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KHN0YXJ0KVxuICAgIEBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShuZXcgUmFuZ2UoY2FyZXQsIGNhcmV0KSlcbiAgICBpbnNlcnRTbmlwcGV0IHByZXByb2Nlc3NTbmlwcGV0KHZhbHVlKSwgQGVkaXRvclxuICAgIEBfc2F2ZVNlbGVjdGlvbih1dGlscy5zcGxpdEJ5TGluZXModmFsdWUpLmxlbmd0aCAtIHV0aWxzLnNwbGl0QnlMaW5lcyhvbGRWYWx1ZSkubGVuZ3RoKVxuICAgIHZhbHVlXG5cbiAgZ2V0R3JhbW1hcjogLT5cbiAgICBAZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUudG9Mb3dlckNhc2UoKVxuXG4gICMgUmV0dXJucyB0aGUgZWRpdG9yJ3Mgc3ludGF4IG1vZGUuXG4gIGdldFN5bnRheDogLT5cbiAgICBzY29wZSA9IEBnZXRDdXJyZW50U2NvcGUoKS5qb2luKCcgJylcbiAgICByZXR1cm4gJ3hzbCcgaWYgfnNjb3BlLmluZGV4T2YoJ3hzbCcpXG4gICAgcmV0dXJuICdqc3gnIGlmIG5vdCAvXFxic3RyaW5nXFxiLy50ZXN0KHNjb3BlKSAmJiAvXFxic291cmNlXFwuKGpzfHRzKXg/XFxiLy50ZXN0KHNjb3BlKVxuXG4gICAgc291cmNlU3ludGF4ID0gc2NvcGUubWF0Y2goL1xcYnNvdXJjZVxcLihbXFx3XFwtXSspLyk/WzBdXG5cbiAgICBpZiBub3QgL1xcYnN0cmluZ1xcYi8udGVzdChzY29wZSkgJiYgc291cmNlU3ludGF4ICYmIHJlc291cmNlcy5oYXNTeW50YXgoc291cmNlU3ludGF4KVxuICAgICAgc3ludGF4ID0gc291cmNlU3ludGF4O1xuICAgIGVsc2VcbiAgICAgICMgcHJvYmUgc3ludGF4IGJhc2VkIG9uIGN1cnJlbnQgc2VsZWN0b3JcbiAgICAgIG0gPSBzY29wZS5tYXRjaCgvXFxiKHNvdXJjZXx0ZXh0KVxcLltcXHdcXC1cXC5dKy8pXG4gICAgICBzeW50YXggPSBtP1swXS5zcGxpdCgnLicpLnJlZHVjZVJpZ2h0IChyZXN1bHQsIHRva2VuKSAtPlxuICAgICAgICAgIHJlc3VsdCBvciAodG9rZW4gaWYgcmVzb3VyY2VzLmhhc1N5bnRheCB0b2tlbilcbiAgICAgICAgLCBudWxsXG5cbiAgICBhY3Rpb25VdGlscy5kZXRlY3RTeW50YXgoQCwgc3ludGF4IG9yICdodG1sJylcblxuICBnZXRDdXJyZW50U2NvcGU6IC0+XG4gICAgcmFuZ2UgPSBAX3NlbGVjdGlvbi5idWZmZXJSYW5nZXNbQF9zZWxlY3Rpb24uaW5kZXhdXG4gICAgQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihyYW5nZS5zdGFydCkuZ2V0U2NvcGVzQXJyYXkoKVxuXG4gICMgUmV0dXJucyB0aGUgY3VycmVudCBvdXRwdXQgcHJvZmlsZSBuYW1lXG4gICNcbiAgIyBTZWUgZW1tZXQuc2V0dXBQcm9maWxlIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICBnZXRQcm9maWxlTmFtZTogLT5cbiAgICByZXR1cm4gaWYgQGdldEN1cnJlbnRTY29wZSgpLnNvbWUoKHNjb3BlKSAtPiAvXFxic3RyaW5nXFwucXVvdGVkXFxiLy50ZXN0IHNjb3BlKSB0aGVuICdsaW5lJyBlbHNlIGFjdGlvblV0aWxzLmRldGVjdFByb2ZpbGUoQClcblxuICAjIFJldHVybnMgdGhlIGN1cnJlbnQgZWRpdG9yJ3MgZmlsZSBwYXRoXG4gIGdldEZpbGVQYXRoOiAtPlxuICAgICMgaXMgdGhlcmUgYSBiZXR0ZXIgd2F5IHRvIGdldCB0aGlzP1xuICAgIEBlZGl0b3IuYnVmZmVyLmZpbGUucGF0aFxuIl19
