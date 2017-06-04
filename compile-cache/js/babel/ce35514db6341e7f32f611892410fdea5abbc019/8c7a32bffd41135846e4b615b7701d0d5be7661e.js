Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.get = get;
/** @babel */

var DEFAULT_ACTIVE_FILE_DIR = 'Active file\'s directory';
exports.DEFAULT_ACTIVE_FILE_DIR = DEFAULT_ACTIVE_FILE_DIR;
var DEFAULT_PROJECT_ROOT = 'Project root';
exports.DEFAULT_PROJECT_ROOT = DEFAULT_PROJECT_ROOT;
var DEFAULT_EMPTY = 'Empty';

exports.DEFAULT_EMPTY = DEFAULT_EMPTY;

function get(key) {
    return atom.config.get('advanced-open-file.' + key);
}

var config = {
    createDirectories: {
        title: 'Create directories',
        description: 'When opening a path to a directory that doesn\'t\n                      exist, create the directory instead of beeping.',
        type: 'boolean',
        'default': false
    },
    createFileInstantly: {
        title: 'Create files instantly',
        description: 'When opening files that don\'t exist, create them\n                      immediately instead of on save.',
        type: 'boolean',
        'default': false
    },
    helmDirSwitch: {
        title: 'Shortcuts for fast directory switching',
        description: 'See README for details.',
        type: 'boolean',
        'default': false
    },
    defaultInputValue: {
        title: 'Default input value',
        description: 'What should the path input default to when the dialog\n                      is opened?',
        type: 'string',
        'enum': [DEFAULT_ACTIVE_FILE_DIR, DEFAULT_PROJECT_ROOT, DEFAULT_EMPTY],
        'default': DEFAULT_ACTIVE_FILE_DIR
    },
    fuzzyMatch: {
        title: 'Use fuzzy matching for matching filenames',
        description: 'Replaces default prefix-based matching. See README for\n                      details.',
        type: 'boolean',
        'default': false
    }
};
exports.config = config;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvTGVueW1vLy5hdG9tL3BhY2thZ2VzL2FkdmFuY2VkLW9wZW4tZmlsZS9saWIvY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVPLElBQU0sdUJBQXVCLEdBQUcsMEJBQTBCLENBQUM7O0FBQzNELElBQU0sb0JBQW9CLEdBQUcsY0FBYyxDQUFDOztBQUM1QyxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUM7Ozs7QUFHOUIsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFO0FBQ3JCLFdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLHlCQUF1QixHQUFHLENBQUcsQ0FBQztDQUN2RDs7QUFHTSxJQUFJLE1BQU0sR0FBRztBQUNoQixxQkFBaUIsRUFBRTtBQUNmLGFBQUssRUFBRSxvQkFBb0I7QUFDM0IsbUJBQVcsMkhBQ21EO0FBQzlELFlBQUksRUFBRSxTQUFTO0FBQ2YsbUJBQVMsS0FBSztLQUNqQjtBQUNELHVCQUFtQixFQUFFO0FBQ2pCLGFBQUssRUFBRSx3QkFBd0I7QUFDL0IsbUJBQVcsNEdBQ21DO0FBQzlDLFlBQUksRUFBRSxTQUFTO0FBQ2YsbUJBQVMsS0FBSztLQUNqQjtBQUNELGlCQUFhLEVBQUU7QUFDWCxhQUFLLEVBQUUsd0NBQXdDO0FBQy9DLG1CQUFXLEVBQUUseUJBQXlCO0FBQ3RDLFlBQUksRUFBRSxTQUFTO0FBQ2YsbUJBQVMsS0FBSztLQUNqQjtBQUNELHFCQUFpQixFQUFFO0FBQ2YsYUFBSyxFQUFFLHFCQUFxQjtBQUM1QixtQkFBVywyRkFDYztBQUN6QixZQUFJLEVBQUUsUUFBUTtBQUNkLGdCQUFNLENBQUMsdUJBQXVCLEVBQUUsb0JBQW9CLEVBQUUsYUFBYSxDQUFDO0FBQ3BFLG1CQUFTLHVCQUF1QjtLQUNuQztBQUNELGNBQVUsRUFBRTtBQUNSLGFBQUssRUFBRSwyQ0FBMkM7QUFDbEQsbUJBQVcsMEZBQ1k7QUFDdkIsWUFBSSxFQUFFLFNBQVM7QUFDZixtQkFBUyxLQUFLO0tBQ2pCO0NBQ0osQ0FBQyIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL0xlbnltby8uYXRvbS9wYWNrYWdlcy9hZHZhbmNlZC1vcGVuLWZpbGUvbGliL2NvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQUNUSVZFX0ZJTEVfRElSID0gJ0FjdGl2ZSBmaWxlXFwncyBkaXJlY3RvcnknO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPSkVDVF9ST09UID0gJ1Byb2plY3Qgcm9vdCc7XG5leHBvcnQgY29uc3QgREVGQVVMVF9FTVBUWSA9ICdFbXB0eSc7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldChrZXkpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KGBhZHZhbmNlZC1vcGVuLWZpbGUuJHtrZXl9YCk7XG59XG5cblxuZXhwb3J0IGxldCBjb25maWcgPSB7XG4gICAgY3JlYXRlRGlyZWN0b3JpZXM6IHtcbiAgICAgICAgdGl0bGU6ICdDcmVhdGUgZGlyZWN0b3JpZXMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogYFdoZW4gb3BlbmluZyBhIHBhdGggdG8gYSBkaXJlY3RvcnkgdGhhdCBkb2Vzbid0XG4gICAgICAgICAgICAgICAgICAgICAgZXhpc3QsIGNyZWF0ZSB0aGUgZGlyZWN0b3J5IGluc3RlYWQgb2YgYmVlcGluZy5gLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgY3JlYXRlRmlsZUluc3RhbnRseToge1xuICAgICAgICB0aXRsZTogJ0NyZWF0ZSBmaWxlcyBpbnN0YW50bHknLFxuICAgICAgICBkZXNjcmlwdGlvbjogYFdoZW4gb3BlbmluZyBmaWxlcyB0aGF0IGRvbid0IGV4aXN0LCBjcmVhdGUgdGhlbVxuICAgICAgICAgICAgICAgICAgICAgIGltbWVkaWF0ZWx5IGluc3RlYWQgb2Ygb24gc2F2ZS5gLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgaGVsbURpclN3aXRjaDoge1xuICAgICAgICB0aXRsZTogJ1Nob3J0Y3V0cyBmb3IgZmFzdCBkaXJlY3Rvcnkgc3dpdGNoaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTZWUgUkVBRE1FIGZvciBkZXRhaWxzLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBkZWZhdWx0SW5wdXRWYWx1ZToge1xuICAgICAgICB0aXRsZTogJ0RlZmF1bHQgaW5wdXQgdmFsdWUnLFxuICAgICAgICBkZXNjcmlwdGlvbjogYFdoYXQgc2hvdWxkIHRoZSBwYXRoIGlucHV0IGRlZmF1bHQgdG8gd2hlbiB0aGUgZGlhbG9nXG4gICAgICAgICAgICAgICAgICAgICAgaXMgb3BlbmVkP2AsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBlbnVtOiBbREVGQVVMVF9BQ1RJVkVfRklMRV9ESVIsIERFRkFVTFRfUFJPSkVDVF9ST09ULCBERUZBVUxUX0VNUFRZXSxcbiAgICAgICAgZGVmYXVsdDogREVGQVVMVF9BQ1RJVkVfRklMRV9ESVIsXG4gICAgfSxcbiAgICBmdXp6eU1hdGNoOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIGZ1enp5IG1hdGNoaW5nIGZvciBtYXRjaGluZyBmaWxlbmFtZXMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogYFJlcGxhY2VzIGRlZmF1bHQgcHJlZml4LWJhc2VkIG1hdGNoaW5nLiBTZWUgUkVBRE1FIGZvclxuICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHMuYCxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9XG59O1xuIl19