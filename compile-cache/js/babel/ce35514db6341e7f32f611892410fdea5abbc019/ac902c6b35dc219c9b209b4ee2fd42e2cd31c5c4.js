Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.$range = $range;
exports.$file = $file;
exports.copySelection = copySelection;
exports.getPathOfMessage = getPathOfMessage;
exports.getEditorsMap = getEditorsMap;
exports.filterMessages = filterMessages;
exports.filterMessagesByRangeOrPoint = filterMessagesByRangeOrPoint;
exports.visitMessage = visitMessage;
exports.htmlToText = htmlToText;
exports.openExternally = openExternally;
exports.sortMessages = sortMessages;
exports.sortSolutions = sortSolutions;
exports.applySolution = applySolution;

var _atom = require('atom');

var _electron = require('electron');

var severityScore = {
  error: 3,
  warning: 2,
  info: 1
};

exports.severityScore = severityScore;
var severityNames = {
  error: 'Error',
  warning: 'Warning',
  info: 'Info'
};

exports.severityNames = severityNames;

function $range(message) {
  return message.version === 1 ? message.range : message.location.position;
}

function $file(message) {
  return message.version === 1 ? message.filePath : message.location.file;
}

function copySelection() {
  var selection = getSelection();
  if (selection) {
    atom.clipboard.write(selection.toString());
  }
}

function getPathOfMessage(message) {
  return atom.project.relativizePath($file(message) || '')[1];
}

function getEditorsMap(editors) {
  var editorsMap = {};
  var filePaths = [];
  for (var entry of editors.editors) {
    var filePath = entry.textEditor.getPath();
    if (editorsMap[filePath]) {
      editorsMap[filePath].editors.push(entry);
    } else {
      editorsMap[filePath] = {
        added: [],
        removed: [],
        editors: [entry]
      };
      filePaths.push(filePath);
    }
  }
  return { editorsMap: editorsMap, filePaths: filePaths };
}

function filterMessages(messages, filePath) {
  var severity = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var filtered = [];
  messages.forEach(function (message) {
    if ((filePath === null || $file(message) === filePath) && (!severity || message.severity === severity)) {
      filtered.push(message);
    }
  });
  return filtered;
}

function filterMessagesByRangeOrPoint(messages, filePath, rangeOrPoint) {
  var filtered = [];
  var expectedRange = rangeOrPoint.constructor.name === 'Point' ? new _atom.Range(rangeOrPoint, rangeOrPoint) : _atom.Range.fromObject(rangeOrPoint);
  messages.forEach(function (message) {
    var file = $file(message);
    var range = $range(message);
    if (file && range && file === filePath && range.intersectsWith(expectedRange)) {
      filtered.push(message);
    }
  });
  return filtered;
}

function visitMessage(message) {
  var reference = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var messageFile = undefined;
  var messagePosition = undefined;
  if (reference) {
    if (message.version !== 2) {
      console.warn('[Linter-UI-Default] Only messages v2 are allowed in jump to reference. Ignoring');
      return;
    }
    if (!message.reference || !message.reference.file) {
      console.warn('[Linter-UI-Default] Message does not have a valid reference. Ignoring');
      return;
    }
    messageFile = message.reference.file;
    messagePosition = message.reference.position;
  } else {
    var messageRange = $range(message);
    messageFile = $file(message);
    if (messageRange) {
      messagePosition = messageRange.start;
    }
  }
  atom.workspace.open(messageFile, { searchAllPanes: true }).then(function () {
    var textEditor = atom.workspace.getActiveTextEditor();
    if (messagePosition && textEditor && textEditor.getPath() === messageFile) {
      textEditor.setCursorBufferPosition(messagePosition);
    }
  });
}

// NOTE: Code Point 160 === &nbsp;
var replacementRegex = new RegExp(String.fromCodePoint(160), 'g');

function htmlToText(html) {
  var element = document.createElement('div');
  if (typeof html === 'string') {
    element.innerHTML = html;
  } else {
    element.appendChild(html.cloneNode(true));
  }
  // NOTE: Convert &nbsp; to regular whitespace
  return element.textContent.replace(replacementRegex, ' ');
}

function openExternally(message) {
  if (message.version === 1 && message.type.toLowerCase() === 'trace') {
    visitMessage(message);
    return;
  }

  if (message.version === 2 && message.url) {
    _electron.shell.openExternal(message.url);
  }
}

function sortMessages(sortInfo, rows) {
  var sortColumns = {};

  sortInfo.forEach(function (entry) {
    sortColumns[entry.column] = entry.type;
  });

  return rows.slice().sort(function (a, b) {
    if (sortColumns.severity) {
      var multiplyWith = sortColumns.severity === 'asc' ? 1 : -1;
      var severityA = severityScore[a.severity];
      var severityB = severityScore[b.severity];
      if (severityA !== severityB) {
        return multiplyWith * (severityA > severityB ? 1 : -1);
      }
    }
    if (sortColumns.linterName) {
      var multiplyWith = sortColumns.linterName === 'asc' ? 1 : -1;
      var sortValue = a.severity.localeCompare(b.severity);
      if (sortValue !== 0) {
        return multiplyWith * sortValue;
      }
    }
    if (sortColumns.file) {
      var multiplyWith = sortColumns.file === 'asc' ? 1 : -1;
      var fileA = getPathOfMessage(a);
      var fileALength = fileA.length;
      var fileB = getPathOfMessage(b);
      var fileBLength = fileB.length;
      if (fileALength !== fileBLength) {
        return multiplyWith * (fileALength > fileBLength ? 1 : -1);
      } else if (fileA !== fileB) {
        return multiplyWith * fileA.localeCompare(fileB);
      }
    }
    if (sortColumns.line) {
      var multiplyWith = sortColumns.line === 'asc' ? 1 : -1;
      var rangeA = $range(a);
      var rangeB = $range(b);
      if (rangeA && !rangeB) {
        return 1;
      } else if (rangeB && !rangeA) {
        return -1;
      } else if (rangeA && rangeB) {
        if (rangeA.start.row !== rangeB.start.row) {
          return multiplyWith * (rangeA.start.row > rangeB.start.row ? 1 : -1);
        }
        if (rangeA.start.column !== rangeB.start.column) {
          return multiplyWith * (rangeA.start.column > rangeB.start.column ? 1 : -1);
        }
      }
    }

    return 0;
  });
}

function sortSolutions(solutions) {
  return solutions.slice().sort(function (a, b) {
    return b.priority - a.priority;
  });
}

function applySolution(textEditor, version, solution) {
  if (solution.apply) {
    solution.apply();
    return true;
  }
  var range = version === 1 ? solution.range : solution.position;
  var currentText = version === 1 ? solution.oldText : solution.currentText;
  var replaceWith = version === 1 ? solution.newText : solution.replaceWith;
  if (currentText) {
    var textInRange = textEditor.getTextInBufferRange(range);
    if (currentText !== textInRange) {
      console.warn('[linter-ui-default] Not applying fix because text did not match the expected one', 'expected', currentText, 'but got', textInRange);
      return false;
    }
  }
  textEditor.setTextInBufferRange(range, replaceWith);
  return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvTGVueW1vLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQUVzQixNQUFNOzt3QkFDTixVQUFVOztBQUt6QixJQUFNLGFBQWEsR0FBRztBQUMzQixPQUFLLEVBQUUsQ0FBQztBQUNSLFNBQU8sRUFBRSxDQUFDO0FBQ1YsTUFBSSxFQUFFLENBQUM7Q0FDUixDQUFBOzs7QUFFTSxJQUFNLGFBQWEsR0FBRztBQUMzQixPQUFLLEVBQUUsT0FBTztBQUNkLFNBQU8sRUFBRSxTQUFTO0FBQ2xCLE1BQUksRUFBRSxNQUFNO0NBQ2IsQ0FBQTs7OztBQUVNLFNBQVMsTUFBTSxDQUFDLE9BQXNCLEVBQVc7QUFDdEQsU0FBTyxPQUFPLENBQUMsT0FBTyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFBO0NBQ3pFOztBQUNNLFNBQVMsS0FBSyxDQUFDLE9BQXNCLEVBQVc7QUFDckQsU0FBTyxPQUFPLENBQUMsT0FBTyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFBO0NBQ3hFOztBQUNNLFNBQVMsYUFBYSxHQUFHO0FBQzlCLE1BQU0sU0FBUyxHQUFHLFlBQVksRUFBRSxDQUFBO0FBQ2hDLE1BQUksU0FBUyxFQUFFO0FBQ2IsUUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7R0FDM0M7Q0FDRjs7QUFDTSxTQUFTLGdCQUFnQixDQUFDLE9BQXNCLEVBQVU7QUFDL0QsU0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7Q0FDNUQ7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Q0FBQyxLQUFLLEVBQUU7QUFDbEIsWUFBUSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ2hCLFdBQU8sSUFBSSxDQUFBO0dBQ1o7QUFDRCxNQUFNLEtBQUssR0FBRyxPQUFPLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQTtBQUNoRSxNQUFNLFdBQVcsR0FBRyxPQUFPLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQTtBQUMzRSxNQUFNLFdBQVcsR0FBRyxPQUFPLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQTtBQUMzRSxNQUFJLFdBQVcsRUFBRTtBQUNmLFFBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUMxRCxRQUFJLFdBQVcsS0FBSyxXQUFXLEVBQUU7QUFDL0IsYUFBTyxDQUFDLElBQUksQ0FBQyxrRkFBa0YsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQTtBQUNqSixhQUFPLEtBQUssQ0FBQTtLQUNiO0dBQ0Y7QUFDRCxZQUFVLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0FBQ25ELFNBQU8sSUFBSSxDQUFBO0NBQ1oiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9MZW55bW8vLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBSYW5nZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBzaGVsbCB9IGZyb20gJ2VsZWN0cm9uJ1xuaW1wb3J0IHR5cGUgeyBQb2ludCwgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSBFZGl0b3JzIGZyb20gJy4vZWRpdG9ycydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBjb25zdCBzZXZlcml0eVNjb3JlID0ge1xuICBlcnJvcjogMyxcbiAgd2FybmluZzogMixcbiAgaW5mbzogMSxcbn1cblxuZXhwb3J0IGNvbnN0IHNldmVyaXR5TmFtZXMgPSB7XG4gIGVycm9yOiAnRXJyb3InLFxuICB3YXJuaW5nOiAnV2FybmluZycsXG4gIGluZm86ICdJbmZvJyxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uICRyYW5nZShtZXNzYWdlOiBMaW50ZXJNZXNzYWdlKTogP09iamVjdCB7XG4gIHJldHVybiBtZXNzYWdlLnZlcnNpb24gPT09IDEgPyBtZXNzYWdlLnJhbmdlIDogbWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvblxufVxuZXhwb3J0IGZ1bmN0aW9uICRmaWxlKG1lc3NhZ2U6IExpbnRlck1lc3NhZ2UpOiA/c3RyaW5nIHtcbiAgcmV0dXJuIG1lc3NhZ2UudmVyc2lvbiA9PT0gMSA/IG1lc3NhZ2UuZmlsZVBhdGggOiBtZXNzYWdlLmxvY2F0aW9uLmZpbGVcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb3B5U2VsZWN0aW9uKCkge1xuICBjb25zdCBzZWxlY3Rpb24gPSBnZXRTZWxlY3Rpb24oKVxuICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoc2VsZWN0aW9uLnRvU3RyaW5nKCkpXG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXRoT2ZNZXNzYWdlKG1lc3NhZ2U6IExpbnRlck1lc3NhZ2UpOiBzdHJpbmcge1xuICByZXR1cm4gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKCRmaWxlKG1lc3NhZ2UpIHx8ICcnKVsxXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWRpdG9yc01hcChlZGl0b3JzOiBFZGl0b3JzKTogeyBlZGl0b3JzTWFwOiBPYmplY3QsIGZpbGVQYXRoczogQXJyYXk8c3RyaW5nPiB9IHtcbiAgY29uc3QgZWRpdG9yc01hcCA9IHt9XG4gIGNvbnN0IGZpbGVQYXRocyA9IFtdXG4gIGZvciAoY29uc3QgZW50cnkgb2YgZWRpdG9ycy5lZGl0b3JzKSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlbnRyeS50ZXh0RWRpdG9yLmdldFBhdGgoKVxuICAgIGlmIChlZGl0b3JzTWFwW2ZpbGVQYXRoXSkge1xuICAgICAgZWRpdG9yc01hcFtmaWxlUGF0aF0uZWRpdG9ycy5wdXNoKGVudHJ5KVxuICAgIH0gZWxzZSB7XG4gICAgICBlZGl0b3JzTWFwW2ZpbGVQYXRoXSA9IHtcbiAgICAgICAgYWRkZWQ6IFtdLFxuICAgICAgICByZW1vdmVkOiBbXSxcbiAgICAgICAgZWRpdG9yczogW2VudHJ5XSxcbiAgICAgIH1cbiAgICAgIGZpbGVQYXRocy5wdXNoKGZpbGVQYXRoKVxuICAgIH1cbiAgfVxuICByZXR1cm4geyBlZGl0b3JzTWFwLCBmaWxlUGF0aHMgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWVzc2FnZXMobWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+LCBmaWxlUGF0aDogP3N0cmluZywgc2V2ZXJpdHk6ID9zdHJpbmcgPSBudWxsKTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICBjb25zdCBmaWx0ZXJlZCA9IFtdXG4gIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGlmICgoZmlsZVBhdGggPT09IG51bGwgfHwgJGZpbGUobWVzc2FnZSkgPT09IGZpbGVQYXRoKSAmJiAoIXNldmVyaXR5IHx8IG1lc3NhZ2Uuc2V2ZXJpdHkgPT09IHNldmVyaXR5KSkge1xuICAgICAgZmlsdGVyZWQucHVzaChtZXNzYWdlKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGZpbHRlcmVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJNZXNzYWdlc0J5UmFuZ2VPclBvaW50KG1lc3NhZ2VzOiBTZXQ8TGludGVyTWVzc2FnZT4gfCBBcnJheTxMaW50ZXJNZXNzYWdlPiwgZmlsZVBhdGg6IHN0cmluZywgcmFuZ2VPclBvaW50OiBQb2ludCB8IFJhbmdlKTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICBjb25zdCBmaWx0ZXJlZCA9IFtdXG4gIGNvbnN0IGV4cGVjdGVkUmFuZ2UgPSByYW5nZU9yUG9pbnQuY29uc3RydWN0b3IubmFtZSA9PT0gJ1BvaW50JyA/IG5ldyBSYW5nZShyYW5nZU9yUG9pbnQsIHJhbmdlT3JQb2ludCkgOiBSYW5nZS5mcm9tT2JqZWN0KHJhbmdlT3JQb2ludClcbiAgbWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgY29uc3QgZmlsZSA9ICRmaWxlKG1lc3NhZ2UpXG4gICAgY29uc3QgcmFuZ2UgPSAkcmFuZ2UobWVzc2FnZSlcbiAgICBpZiAoZmlsZSAmJiByYW5nZSAmJiBmaWxlID09PSBmaWxlUGF0aCAmJiByYW5nZS5pbnRlcnNlY3RzV2l0aChleHBlY3RlZFJhbmdlKSkge1xuICAgICAgZmlsdGVyZWQucHVzaChtZXNzYWdlKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGZpbHRlcmVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdE1lc3NhZ2UobWVzc2FnZTogTGludGVyTWVzc2FnZSwgcmVmZXJlbmNlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgbGV0IG1lc3NhZ2VGaWxlXG4gIGxldCBtZXNzYWdlUG9zaXRpb25cbiAgaWYgKHJlZmVyZW5jZSkge1xuICAgIGlmIChtZXNzYWdlLnZlcnNpb24gIT09IDIpIHtcbiAgICAgIGNvbnNvbGUud2FybignW0xpbnRlci1VSS1EZWZhdWx0XSBPbmx5IG1lc3NhZ2VzIHYyIGFyZSBhbGxvd2VkIGluIGp1bXAgdG8gcmVmZXJlbmNlLiBJZ25vcmluZycpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFtZXNzYWdlLnJlZmVyZW5jZSB8fCAhbWVzc2FnZS5yZWZlcmVuY2UuZmlsZSkge1xuICAgICAgY29uc29sZS53YXJuKCdbTGludGVyLVVJLURlZmF1bHRdIE1lc3NhZ2UgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIHJlZmVyZW5jZS4gSWdub3JpbmcnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG1lc3NhZ2VGaWxlID0gbWVzc2FnZS5yZWZlcmVuY2UuZmlsZVxuICAgIG1lc3NhZ2VQb3NpdGlvbiA9IG1lc3NhZ2UucmVmZXJlbmNlLnBvc2l0aW9uXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbWVzc2FnZVJhbmdlID0gJHJhbmdlKG1lc3NhZ2UpXG4gICAgbWVzc2FnZUZpbGUgPSAkZmlsZShtZXNzYWdlKVxuICAgIGlmIChtZXNzYWdlUmFuZ2UpIHtcbiAgICAgIG1lc3NhZ2VQb3NpdGlvbiA9IG1lc3NhZ2VSYW5nZS5zdGFydFxuICAgIH1cbiAgfVxuICBhdG9tLndvcmtzcGFjZS5vcGVuKG1lc3NhZ2VGaWxlLCB7IHNlYXJjaEFsbFBhbmVzOiB0cnVlIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIChtZXNzYWdlUG9zaXRpb24gJiYgdGV4dEVkaXRvciAmJiB0ZXh0RWRpdG9yLmdldFBhdGgoKSA9PT0gbWVzc2FnZUZpbGUpIHtcbiAgICAgIHRleHRFZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obWVzc2FnZVBvc2l0aW9uKVxuICAgIH1cbiAgfSlcbn1cblxuLy8gTk9URTogQ29kZSBQb2ludCAxNjAgPT09ICZuYnNwO1xuY29uc3QgcmVwbGFjZW1lbnRSZWdleCA9IG5ldyBSZWdFeHAoU3RyaW5nLmZyb21Db2RlUG9pbnQoMTYwKSwgJ2cnKVxuZXhwb3J0IGZ1bmN0aW9uIGh0bWxUb1RleHQoaHRtbDogYW55KTogc3RyaW5nIHtcbiAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIGlmICh0eXBlb2YgaHRtbCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGh0bWxcbiAgfSBlbHNlIHtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGh0bWwuY2xvbmVOb2RlKHRydWUpKVxuICB9XG4gIC8vIE5PVEU6IENvbnZlcnQgJm5ic3A7IHRvIHJlZ3VsYXIgd2hpdGVzcGFjZVxuICByZXR1cm4gZWxlbWVudC50ZXh0Q29udGVudC5yZXBsYWNlKHJlcGxhY2VtZW50UmVnZXgsICcgJylcbn1cbmV4cG9ydCBmdW5jdGlvbiBvcGVuRXh0ZXJuYWxseShtZXNzYWdlOiBMaW50ZXJNZXNzYWdlKTogdm9pZCB7XG4gIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDEgJiYgbWVzc2FnZS50eXBlLnRvTG93ZXJDYXNlKCkgPT09ICd0cmFjZScpIHtcbiAgICB2aXNpdE1lc3NhZ2UobWVzc2FnZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIgJiYgbWVzc2FnZS51cmwpIHtcbiAgICBzaGVsbC5vcGVuRXh0ZXJuYWwobWVzc2FnZS51cmwpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRNZXNzYWdlcyhzb3J0SW5mbzogQXJyYXk8eyBjb2x1bW46IHN0cmluZywgdHlwZTogJ2FzYycgfCAnZGVzYycgfT4sIHJvd3M6IEFycmF5PExpbnRlck1lc3NhZ2U+KTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICBjb25zdCBzb3J0Q29sdW1ucyA6IHtcbiAgICBzZXZlcml0eT86ICdhc2MnIHwgJ2Rlc2MnLFxuICAgIGxpbnRlck5hbWU/OiAnYXNjJyB8ICdkZXNjJyxcbiAgICBmaWxlPzogJ2FzYycgfCAnZGVzYycsXG4gICAgbGluZT86ICdhc2MnIHwgJ2Rlc2MnXG4gIH0gPSB7fVxuXG4gIHNvcnRJbmZvLmZvckVhY2goZnVuY3Rpb24oZW50cnkpIHtcbiAgICBzb3J0Q29sdW1uc1tlbnRyeS5jb2x1bW5dID0gZW50cnkudHlwZVxuICB9KVxuXG4gIHJldHVybiByb3dzLnNsaWNlKCkuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYgKHNvcnRDb2x1bW5zLnNldmVyaXR5KSB7XG4gICAgICBjb25zdCBtdWx0aXBseVdpdGggPSBzb3J0Q29sdW1ucy5zZXZlcml0eSA9PT0gJ2FzYycgPyAxIDogLTFcbiAgICAgIGNvbnN0IHNldmVyaXR5QSA9IHNldmVyaXR5U2NvcmVbYS5zZXZlcml0eV1cbiAgICAgIGNvbnN0IHNldmVyaXR5QiA9IHNldmVyaXR5U2NvcmVbYi5zZXZlcml0eV1cbiAgICAgIGlmIChzZXZlcml0eUEgIT09IHNldmVyaXR5Qikge1xuICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogKHNldmVyaXR5QSA+IHNldmVyaXR5QiA/IDEgOiAtMSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNvcnRDb2x1bW5zLmxpbnRlck5hbWUpIHtcbiAgICAgIGNvbnN0IG11bHRpcGx5V2l0aCA9IHNvcnRDb2x1bW5zLmxpbnRlck5hbWUgPT09ICdhc2MnID8gMSA6IC0xXG4gICAgICBjb25zdCBzb3J0VmFsdWUgPSBhLnNldmVyaXR5LmxvY2FsZUNvbXBhcmUoYi5zZXZlcml0eSlcbiAgICAgIGlmIChzb3J0VmFsdWUgIT09IDApIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIHNvcnRWYWx1ZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc29ydENvbHVtbnMuZmlsZSkge1xuICAgICAgY29uc3QgbXVsdGlwbHlXaXRoID0gc29ydENvbHVtbnMuZmlsZSA9PT0gJ2FzYycgPyAxIDogLTFcbiAgICAgIGNvbnN0IGZpbGVBID0gZ2V0UGF0aE9mTWVzc2FnZShhKVxuICAgICAgY29uc3QgZmlsZUFMZW5ndGggPSBmaWxlQS5sZW5ndGhcbiAgICAgIGNvbnN0IGZpbGVCID0gZ2V0UGF0aE9mTWVzc2FnZShiKVxuICAgICAgY29uc3QgZmlsZUJMZW5ndGggPSBmaWxlQi5sZW5ndGhcbiAgICAgIGlmIChmaWxlQUxlbmd0aCAhPT0gZmlsZUJMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIChmaWxlQUxlbmd0aCA+IGZpbGVCTGVuZ3RoID8gMSA6IC0xKVxuICAgICAgfSBlbHNlIGlmIChmaWxlQSAhPT0gZmlsZUIpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIGZpbGVBLmxvY2FsZUNvbXBhcmUoZmlsZUIpXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzb3J0Q29sdW1ucy5saW5lKSB7XG4gICAgICBjb25zdCBtdWx0aXBseVdpdGggPSBzb3J0Q29sdW1ucy5saW5lID09PSAnYXNjJyA/IDEgOiAtMVxuICAgICAgY29uc3QgcmFuZ2VBID0gJHJhbmdlKGEpXG4gICAgICBjb25zdCByYW5nZUIgPSAkcmFuZ2UoYilcbiAgICAgIGlmIChyYW5nZUEgJiYgIXJhbmdlQikge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfSBlbHNlIGlmIChyYW5nZUIgJiYgIXJhbmdlQSkge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH0gZWxzZSBpZiAocmFuZ2VBICYmIHJhbmdlQikge1xuICAgICAgICBpZiAocmFuZ2VBLnN0YXJ0LnJvdyAhPT0gcmFuZ2VCLnN0YXJ0LnJvdykge1xuICAgICAgICAgIHJldHVybiBtdWx0aXBseVdpdGggKiAocmFuZ2VBLnN0YXJ0LnJvdyA+IHJhbmdlQi5zdGFydC5yb3cgPyAxIDogLTEpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJhbmdlQS5zdGFydC5jb2x1bW4gIT09IHJhbmdlQi5zdGFydC5jb2x1bW4pIHtcbiAgICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogKHJhbmdlQS5zdGFydC5jb2x1bW4gPiByYW5nZUIuc3RhcnQuY29sdW1uID8gMSA6IC0xKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIDBcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRTb2x1dGlvbnMoc29sdXRpb25zOiBBcnJheTxPYmplY3Q+KTogQXJyYXk8T2JqZWN0PiB7XG4gIHJldHVybiBzb2x1dGlvbnMuc2xpY2UoKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYi5wcmlvcml0eSAtIGEucHJpb3JpdHlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U29sdXRpb24odGV4dEVkaXRvcjogVGV4dEVkaXRvciwgdmVyc2lvbjogMSB8IDIsIHNvbHV0aW9uOiBPYmplY3QpOiBib29sZWFuIHtcbiAgaWYgKHNvbHV0aW9uLmFwcGx5KSB7XG4gICAgc29sdXRpb24uYXBwbHkoKVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgY29uc3QgcmFuZ2UgPSB2ZXJzaW9uID09PSAxID8gc29sdXRpb24ucmFuZ2UgOiBzb2x1dGlvbi5wb3NpdGlvblxuICBjb25zdCBjdXJyZW50VGV4dCA9IHZlcnNpb24gPT09IDEgPyBzb2x1dGlvbi5vbGRUZXh0IDogc29sdXRpb24uY3VycmVudFRleHRcbiAgY29uc3QgcmVwbGFjZVdpdGggPSB2ZXJzaW9uID09PSAxID8gc29sdXRpb24ubmV3VGV4dCA6IHNvbHV0aW9uLnJlcGxhY2VXaXRoXG4gIGlmIChjdXJyZW50VGV4dCkge1xuICAgIGNvbnN0IHRleHRJblJhbmdlID0gdGV4dEVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBpZiAoY3VycmVudFRleHQgIT09IHRleHRJblJhbmdlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tsaW50ZXItdWktZGVmYXVsdF0gTm90IGFwcGx5aW5nIGZpeCBiZWNhdXNlIHRleHQgZGlkIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgb25lJywgJ2V4cGVjdGVkJywgY3VycmVudFRleHQsICdidXQgZ290JywgdGV4dEluUmFuZ2UpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgdGV4dEVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgcmVwbGFjZVdpdGgpXG4gIHJldHVybiB0cnVlXG59XG4iXX0=