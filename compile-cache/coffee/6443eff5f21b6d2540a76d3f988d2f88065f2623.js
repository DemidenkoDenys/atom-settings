(function() {
  var a, colors, ex, k, toCamelCase, tocamelCase, v;

  colors = {
    alice_blue: '#f0f8ff',
    antique_white: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanched_almond: '#ffebcd',
    blue: '#0000ff',
    blue_violet: '#8a2be2',
    brown: '#a52a2a',
    burly_wood: '#deb887',
    cadet_blue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    corn_silk: '#fff8dc',
    cornflower_blue: '#6495ed',
    crimson: '#dc143c',
    cyan: '#00ffff',
    dark_blue: '#00008b',
    dark_cyan: '#008b8b',
    dark_golden_rod: '#b8860b',
    dark_gray: '#a9a9a9',
    dark_green: '#006400',
    dark_grey: '#a9a9a9',
    dark_khaki: '#bdb76b',
    dark_magenta: '#8b008b',
    dark_olive_green: '#556b2f',
    dark_orange: '#ff8c00',
    dark_orchid: '#9932cc',
    dark_red: '#8b0000',
    dark_salmon: '#e9967a',
    dark_seagreen: '#8fbc8f',
    dark_slateblue: '#483d8b',
    dark_slategray: '#2f4f4f',
    dark_slategrey: '#2f4f4f',
    dark_turquoise: '#00ced1',
    dark_violet: '#9400d3',
    deep_pink: '#ff1493',
    deep_skyblue: '#00bfff',
    dim_gray: '#696969',
    dim_grey: '#696969',
    dodger_blue: '#1e90ff',
    fire_brick: '#b22222',
    floral_white: '#fffaf0',
    forest_green: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghost_white: '#f8f8ff',
    gold: '#ffd700',
    golden_rod: '#daa520',
    gray: '#808080',
    green: '#008000',
    green_yellow: '#adff2f',
    grey: '#808080',
    honey_dew: '#f0fff0',
    hot_pink: '#ff69b4',
    indian_red: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavender_blush: '#fff0f5',
    lawn_green: '#7cfc00',
    lemon_chiffon: '#fffacd',
    light_blue: '#add8e6',
    light_coral: '#f08080',
    light_cyan: '#e0ffff',
    light_golden_rod_yellow: '#fafad2',
    light_gray: '#d3d3d3',
    light_green: '#90ee90',
    light_grey: '#d3d3d3',
    light_pink: '#ffb6c1',
    light_salmon: '#ffa07a',
    light_sea_green: '#20b2aa',
    light_sky_blue: '#87cefa',
    light_slate_gray: '#778899',
    light_slate_grey: '#778899',
    light_steel_blue: '#b0c4de',
    light_yellow: '#ffffe0',
    lime: '#00ff00',
    lime_green: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    medium_aquamarine: '#66cdaa',
    medium_blue: '#0000cd',
    medium_orchid: '#ba55d3',
    medium_purple: '#9370db',
    medium_sea_green: '#3cb371',
    medium_slate_blue: '#7b68ee',
    medium_spring_green: '#00fa9a',
    medium_turquoise: '#48d1cc',
    medium_violet_red: '#c71585',
    midnight_blue: '#191970',
    mint_cream: '#f5fffa',
    misty_rose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajo_white: '#ffdead',
    navy: '#000080',
    old_lace: '#fdf5e6',
    olive: '#808000',
    olive_drab: '#6b8e23',
    orange: '#ffa500',
    orange_red: '#ff4500',
    orchid: '#da70d6',
    pale_golden_rod: '#eee8aa',
    pale_green: '#98fb98',
    pale_turquoise: '#afeeee',
    pale_violet_red: '#db7093',
    papaya_whip: '#ffefd5',
    peach_puff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powder_blue: '#b0e0e6',
    purple: '#800080',
    rebecca_purple: '#663399',
    red: '#ff0000',
    rosy_brown: '#bc8f8f',
    royal_blue: '#4169e1',
    saddle_brown: '#8b4513',
    salmon: '#fa8072',
    sandy_brown: '#f4a460',
    sea_green: '#2e8b57',
    sea_shell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    sky_blue: '#87ceeb',
    slate_blue: '#6a5acd',
    slate_gray: '#708090',
    slate_grey: '#708090',
    snow: '#fffafa',
    spring_green: '#00ff7f',
    steel_blue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    white_smoke: '#f5f5f5',
    yellow: '#ffff00',
    yellow_green: '#9acd32'
  };

  module.exports = ex = {
    lower_snake: colors,
    UPPER_SNAKE: {},
    lowercase: {},
    UPPERCASE: {},
    camelCase: {},
    CamelCase: {},
    allCases: {}
  };

  toCamelCase = function(s) {
    return s[0].toUpperCase() + s.slice(1);
  };

  tocamelCase = function(s, i) {
    if (i === 0) {
      return s;
    } else {
      return s[0].toUpperCase() + s.slice(1);
    }
  };

  for (k in colors) {
    v = colors[k];
    a = k.split('_');
    ex.allCases[k] = ex.allCases[a.map(toCamelCase).join('')] = ex.allCases[a.map(tocamelCase).join('')] = ex.allCases[a.join('_').toUpperCase()] = ex.allCases[a.join('')] = ex.allCases[a.join('').toUpperCase()] = ex.CamelCase[a.map(toCamelCase).join('')] = ex.camelCase[a.map(tocamelCase).join('')] = ex.UPPER_SNAKE[a.join('_').toUpperCase()] = ex.lowercase[a.join('')] = ex.UPPERCASE[a.join('').toUpperCase()] = v;
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9MZW55bW8vLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL3N2Zy1jb2xvcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFBLEdBQ0U7SUFBQSxVQUFBLEVBQVksU0FBWjtJQUNBLGFBQUEsRUFBZSxTQURmO0lBRUEsSUFBQSxFQUFNLFNBRk47SUFHQSxVQUFBLEVBQVksU0FIWjtJQUlBLEtBQUEsRUFBTyxTQUpQO0lBS0EsS0FBQSxFQUFPLFNBTFA7SUFNQSxNQUFBLEVBQVEsU0FOUjtJQU9BLEtBQUEsRUFBTyxTQVBQO0lBUUEsZUFBQSxFQUFpQixTQVJqQjtJQVNBLElBQUEsRUFBTSxTQVROO0lBVUEsV0FBQSxFQUFhLFNBVmI7SUFXQSxLQUFBLEVBQU8sU0FYUDtJQVlBLFVBQUEsRUFBWSxTQVpaO0lBYUEsVUFBQSxFQUFZLFNBYlo7SUFjQSxVQUFBLEVBQVksU0FkWjtJQWVBLFNBQUEsRUFBVyxTQWZYO0lBZ0JBLEtBQUEsRUFBTyxTQWhCUDtJQWlCQSxTQUFBLEVBQVcsU0FqQlg7SUFrQkEsZUFBQSxFQUFpQixTQWxCakI7SUFtQkEsT0FBQSxFQUFTLFNBbkJUO0lBb0JBLElBQUEsRUFBTSxTQXBCTjtJQXFCQSxTQUFBLEVBQVcsU0FyQlg7SUFzQkEsU0FBQSxFQUFXLFNBdEJYO0lBdUJBLGVBQUEsRUFBaUIsU0F2QmpCO0lBd0JBLFNBQUEsRUFBVyxTQXhCWDtJQXlCQSxVQUFBLEVBQVksU0F6Qlo7SUEwQkEsU0FBQSxFQUFXLFNBMUJYO0lBMkJBLFVBQUEsRUFBWSxTQTNCWjtJQTRCQSxZQUFBLEVBQWMsU0E1QmQ7SUE2QkEsZ0JBQUEsRUFBa0IsU0E3QmxCO0lBOEJBLFdBQUEsRUFBYSxTQTlCYjtJQStCQSxXQUFBLEVBQWEsU0EvQmI7SUFnQ0EsUUFBQSxFQUFVLFNBaENWO0lBaUNBLFdBQUEsRUFBYSxTQWpD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QUFNLFdBQU4sQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixFQUF4QixDQUFBLENBQWIsR0FDQSxFQUFFLENBQUMsV0FBWSxDQUFBLENBQUMsQ0FBQyxJQUFGLENBQU8sR0FBUCxDQUFXLENBQUMsV0FBWixDQUFBLENBQUEsQ0FBZixHQUNBLEVBQUUsQ0FBQyxTQUFVLENBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxFQUFQLENBQUEsQ0FBYixHQUNBLEVBQUUsQ0FBQyxTQUFVLENBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxFQUFQLENBQVUsQ0FBQyxXQUFYLENBQUEsQ0FBQSxDQUFiLEdBQXlDO0FBWjNDO0FBbEtBIiwic291cmNlc0NvbnRlbnQiOlsiY29sb3JzID1cbiAgYWxpY2VfYmx1ZTogJyNmMGY4ZmYnXG4gIGFudGlxdWVfd2hpdGU6ICcjZmFlYmQ3J1xuICBhcXVhOiAnIzAwZmZmZidcbiAgYXF1YW1hcmluZTogJyM3ZmZmZDQnXG4gIGF6dXJlOiAnI2YwZmZmZidcbiAgYmVpZ2U6ICcjZjVmNWRjJ1xuICBiaXNxdWU6ICcjZmZlNGM0J1xuICBibGFjazogJyMwMDAwMDAnXG4gIGJsYW5jaGVkX2FsbW9uZDogJyNmZmViY2QnXG4gIGJsdWU6ICcjMDAwMGZmJ1xuICBibHVlX3Zpb2xldDogJyM4YTJiZTInXG4gIGJyb3duOiAnI2E1MmEyYSdcbiAgYnVybHlfd29vZDogJyNkZWI4ODcnXG4gIGNhZGV0X2JsdWU6ICcjNWY5ZWEwJ1xuICBjaGFydHJldXNlOiAnIzdmZmYwMCdcbiAgY2hvY29sYXRlOiAnI2QyNjkxZSdcbiAgY29yYWw6ICcjZmY3ZjUwJ1xuICBjb3JuX3NpbGs6ICcjZmZmOGRjJ1xuICBjb3JuZmxvd2VyX2JsdWU6ICcjNjQ5NWVkJ1xuICBjcmltc29uOiAnI2RjMTQzYydcbiAgY3lhbjogJyMwMGZmZmYnXG4gIGRhcmtfYmx1ZTogJyMwMDAwOGInXG4gIGRhcmtfY3lhbjogJyMwMDhiOGInXG4gIGRhcmtfZ29sZGVuX3JvZDogJyNiODg2MGInXG4gIGRhcmtfZ3JheTogJyNhOWE5YTknXG4gIGRhcmtfZ3JlZW46ICcjMDA2NDAwJ1xuICBkYXJrX2dyZXk6ICcjYTlhOWE5J1xuICBkYXJrX2toYWtpOiAnI2JkYjc2YidcbiAgZGFya19tYWdlbnRhOiAnIzhiMDA4YidcbiAgZGFya19vbGl2ZV9ncmVlbjogJyM1NTZiMmYnXG4gIGRhcmtfb3JhbmdlOiAnI2ZmOGMwMCdcbiAgZGFya19vcmNoaWQ6ICcjOTkzMmNjJ1xuICBkYXJrX3JlZDogJyM4YjAwMDAnXG4gIGRhcmtfc2FsbW9uOiAnI2U5OTY3YSdcbiAgZGFya19zZWFncmVlbjogJyM4ZmJjOGYnXG4gIGRhcmtfc2xhdGVibHVlOiAnIzQ4M2Q4YidcbiAgZGFya19zbGF0ZWdyYXk6ICcjMmY0ZjRmJ1xuICBkYXJrX3NsYXRlZ3JleTogJyMyZjRmNGYnXG4gIGRhcmtfdHVycXVvaXNlOiAnIzAwY2VkMSdcbiAgZGFya192aW9sZXQ6ICcjOTQwMGQzJ1xuICBkZWVwX3Bpbms6ICcjZmYxNDkzJ1xuICBkZWVwX3NreWJsdWU6ICcjMDBiZmZmJ1xuICBkaW1fZ3JheTogJyM2OTY5NjknXG4gIGRpbV9ncmV5OiAnIzY5Njk2OSdcbiAgZG9kZ2VyX2JsdWU6ICcjMWU5MGZmJ1xuICBmaXJlX2JyaWNrOiAnI2IyMjIyMidcbiAgZmxvcmFsX3doaXRlOiAnI2ZmZmFmMCdcbiAgZm9yZXN0X2dyZWVuOiAnIzIyOGIyMidcbiAgZnVjaHNpYTogJyNmZjAwZmYnXG4gIGdhaW5zYm9ybzogJyNkY2RjZGMnXG4gIGdob3N0X3doaXRlOiAnI2Y4ZjhmZidcbiAgZ29sZDogJyNmZmQ3MDAnXG4gIGdvbGRlbl9yb2Q6ICcjZGFhNTIwJ1xuICBncmF5OiAnIzgwODA4MCdcbiAgZ3JlZW46ICcjMDA4MDAwJ1xuICBncmVlbl95ZWxsb3c6ICcjYWRmZjJmJ1xuICBncmV5OiAnIzgwODA4MCdcbiAgaG9uZXlfZGV3OiAnI2YwZmZmMCdcbiAgaG90X3Bpbms6ICcjZmY2OWI0J1xuICBpbmRpYW5fcmVkOiAnI2NkNWM1YydcbiAgaW5kaWdvOiAnIzRiMDA4MidcbiAgaXZvcnk6ICcjZmZmZmYwJ1xuICBraGFraTogJyNmMGU2OGMnXG4gIGxhdmVuZGVyOiAnI2U2ZTZmYSdcbiAgbGF2ZW5kZXJfYmx1c2g6ICcjZmZmMGY1J1xuICBsYXduX2dyZWVuOiAnIzdjZmMwMCdcbiAgbGVtb25fY2hpZmZvbjogJyNmZmZhY2QnXG4gIGxpZ2h0X2JsdWU6ICcjYWRkOGU2J1xuICBsaWdodF9jb3JhbDogJyNmMDgwODAnXG4gIGxpZ2h0X2N5YW46ICcjZTBmZmZmJ1xuICBsaWdodF9nb2xkZW5fcm9kX3llbGxvdzogJyNmYWZhZDInXG4gIGxpZ2h0X2dyYXk6ICcjZDNkM2QzJ1xuICBsaWdodF9ncmVlbjogJyM5MGVlOTAnXG4gIGxpZ2h0X2dyZXk6ICcjZDNkM2QzJ1xuICBsaWdodF9waW5rOiAnI2ZmYjZjMSdcbiAgbGlnaHRfc2FsbW9uOiAnI2ZmYTA3YSdcbiAgbGlnaHRfc2VhX2dyZWVuOiAnIzIwYjJhYSdcbiAgbGlnaHRfc2t5X2JsdWU6ICcjODdjZWZhJ1xuICBsaWdodF9zbGF0ZV9ncmF5OiAnIzc3ODg5OSdcbiAgbGlnaHRfc2xhdGVfZ3JleTogJyM3Nzg4OTknXG4gIGxpZ2h0X3N0ZWVsX2JsdWU6ICcjYjBjNGRlJ1xuICBsaWdodF95ZWxsb3c6ICcjZmZmZmUwJ1xuICBsaW1lOiAnIzAwZmYwMCdcbiAgbGltZV9ncmVlbjogJyMzMmNkMzInXG4gIGxpbmVuOiAnI2ZhZjBlNidcbiAgbWFnZW50YTogJyNmZjAwZmYnXG4gIG1hcm9vbjogJyM4MDAwMDAnXG4gIG1lZGl1bV9hcXVhbWFyaW5lOiAnIzY2Y2RhYSdcbiAgbWVkaXVtX2JsdWU6ICcjMDAwMGNkJ1xuICBtZWRpdW1fb3JjaGlkOiAnI2JhNTVkMydcbiAgbWVkaXVtX3B1cnBsZTogJyM5MzcwZGInXG4gIG1lZGl1bV9zZWFfZ3JlZW46ICcjM2NiMzcxJ1xuICBtZWRpdW1fc2xhdGVfYmx1ZTogJyM3YjY4ZWUnXG4gIG1lZGl1bV9zcHJpbmdfZ3JlZW46ICcjMDBmYTlhJ1xuICBtZWRpdW1fdHVycXVvaXNlOiAnIzQ4ZDFjYydcbiAgbWVkaXVtX3Zpb2xldF9yZWQ6ICcjYzcxNTg1J1xuICBtaWRuaWdodF9ibHVlOiAnIzE5MTk3MCdcbiAgbWludF9jcmVhbTogJyNmNWZmZmEnXG4gIG1pc3R5X3Jvc2U6ICcjZmZlNGUxJ1xuICBtb2NjYXNpbjogJyNmZmU0YjUnXG4gIG5hdmFqb193aGl0ZTogJyNmZmRlYWQnXG4gIG5hdnk6ICcjMDAwMDgwJ1xuICBvbGRfbGFjZTogJyNmZGY1ZTYnXG4gIG9saXZlOiAnIzgwODAwMCdcbiAgb2xpdmVfZHJhYjogJyM2YjhlMjMnXG4gIG9yYW5nZTogJyNmZmE1MDAnXG4gIG9yYW5nZV9yZWQ6ICcjZmY0NTAwJ1xuICBvcmNoaWQ6ICcjZGE3MGQ2J1xuICBwYWxlX2dvbGRlbl9yb2Q6ICcjZWVlOGFhJ1xuICBwYWxlX2dyZWVuOiAnIzk4ZmI5OCdcbiAgcGFsZV90dXJxdW9pc2U6ICcjYWZlZWVlJ1xuICBwYWxlX3Zpb2xldF9yZWQ6ICcjZGI3MDkzJ1xuICBwYXBheWFfd2hpcDogJyNmZmVmZDUnXG4gIHBlYWNoX3B1ZmY6ICcjZmZkYWI5J1xuICBwZXJ1OiAnI2NkODUzZidcbiAgcGluazogJyNmZmMwY2InXG4gIHBsdW06ICcjZGRhMGRkJ1xuICBwb3dkZXJfYmx1ZTogJyNiMGUwZTYnXG4gIHB1cnBsZTogJyM4MDAwODAnXG4gIHJlYmVjY2FfcHVycGxlOiAnIzY2MzM5OSdcbiAgcmVkOiAnI2ZmMDAwMCdcbiAgcm9zeV9icm93bjogJyNiYzhmOGYnXG4gIHJveWFsX2JsdWU6ICcjNDE2OWUxJ1xuICBzYWRkbGVfYnJvd246ICcjOGI0NTEzJ1xuICBzYWxtb246ICcjZmE4MDcyJ1xuICBzYW5keV9icm93bjogJyNmNGE0NjAnXG4gIHNlYV9ncmVlbjogJyMyZThiNTcnXG4gIHNlYV9zaGVsbDogJyNmZmY1ZWUnXG4gIHNpZW5uYTogJyNhMDUyMmQnXG4gIHNpbHZlcjogJyNjMGMwYzAnXG4gIHNreV9ibHVlOiAnIzg3Y2VlYidcbiAgc2xhdGVfYmx1ZTogJyM2YTVhY2QnXG4gIHNsYXRlX2dyYXk6ICcjNzA4MDkwJ1xuICBzbGF0ZV9ncmV5OiAnIzcwODA5MCdcbiAgc25vdzogJyNmZmZhZmEnXG4gIHNwcmluZ19ncmVlbjogJyMwMGZmN2YnXG4gIHN0ZWVsX2JsdWU6ICcjNDY4MmI0J1xuICB0YW46ICcjZDJiNDhjJ1xuICB0ZWFsOiAnIzAwODA4MCdcbiAgdGhpc3RsZTogJyNkOGJmZDgnXG4gIHRvbWF0bzogJyNmZjYzNDcnXG4gIHR1cnF1b2lzZTogJyM0MGUwZDAnXG4gIHZpb2xldDogJyNlZTgyZWUnXG4gIHdoZWF0OiAnI2Y1ZGViMydcbiAgd2hpdGU6ICcjZmZmZmZmJ1xuICB3aGl0ZV9zbW9rZTogJyNmNWY1ZjUnXG4gIHllbGxvdzogJyNmZmZmMDAnXG4gIHllbGxvd19ncmVlbjogJyM5YWNkMzInXG5cbm1vZHVsZS5leHBvcnRzID0gZXggPVxuICBsb3dlcl9zbmFrZTogY29sb3JzXG4gIFVQUEVSX1NOQUtFOiB7fVxuICBsb3dlcmNhc2U6IHt9XG4gIFVQUEVSQ0FTRToge31cbiAgY2FtZWxDYXNlOiB7fVxuICBDYW1lbENhc2U6IHt9XG4gIGFsbENhc2VzOiB7fVxuXG50b0NhbWVsQ2FzZSA9IChzKSAtPiBzWzBdLnRvVXBwZXJDYXNlKCkgKyBzWzEuLi0xXVxudG9jYW1lbENhc2UgPSAocyxpKSAtPiBpZiBpIGlzIDAgdGhlbiBzIGVsc2Ugc1swXS50b1VwcGVyQ2FzZSgpICsgc1sxLi4tMV1cblxuZm9yIGssdiBvZiBjb2xvcnNcbiAgYSA9IGsuc3BsaXQoJ18nKVxuICBleC5hbGxDYXNlc1trXSA9XG4gIGV4LmFsbENhc2VzW2EubWFwKHRvQ2FtZWxDYXNlKS5qb2luKCcnKV0gPVxuICBleC5hbGxDYXNlc1thLm1hcCh0b2NhbWVsQ2FzZSkuam9pbignJyldID1cbiAgZXguYWxsQ2FzZXNbYS5qb2luKCdfJykudG9VcHBlckNhc2UoKV0gPVxuICBleC5hbGxDYXNlc1thLmpvaW4oJycpXSA9XG4gIGV4LmFsbENhc2VzW2Euam9pbignJykudG9VcHBlckNhc2UoKV0gPVxuICBleC5DYW1lbENhc2VbYS5tYXAodG9DYW1lbENhc2UpLmpvaW4oJycpXSA9XG4gIGV4LmNhbWVsQ2FzZVthLm1hcCh0b2NhbWVsQ2FzZSkuam9pbignJyldID1cbiAgZXguVVBQRVJfU05BS0VbYS5qb2luKCdfJykudG9VcHBlckNhc2UoKV0gPVxuICBleC5sb3dlcmNhc2VbYS5qb2luKCcnKV0gPVxuICBleC5VUFBFUkNBU0VbYS5qb2luKCcnKS50b1VwcGVyQ2FzZSgpXSA9IHZcbiJdfQ==
