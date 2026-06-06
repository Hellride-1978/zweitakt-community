(function(){
  var palettes={
    blue: {a:'rgb(155,195,214)',b:'rgb(175,210,225)',c:'rgb(210,230,238)',d:'rgb(100,155,180)'},
    pink: {a:'#FF5C8F',b:'#ff85aa',c:'#ffb3cb',d:'#e0366a'},
    sage: {a:'#7DC4A0',b:'#9DD4B8',c:'#C5E8D6',d:'#4FA87A'},
    amber:{a:'#E8A045',b:'#F0BB78',c:'#F8DCBA',d:'#C07820'},
    lilac:{a:'#A99BD4',b:'#C2B8E0',c:'#DDD8EF',d:'#7A68B8'}
  };
  var key=localStorage.getItem('zh-palette')||'blue';
  var p=palettes[key]||palettes.blue;
  var r=document.documentElement.style;
  r.setProperty('--accent',p.a);r.setProperty('--accent-2',p.b);r.setProperty('--accent-3',p.c);r.setProperty('--accent-ink',p.d);
  r.setProperty('--accent-hot',p.a);r.setProperty('--accent-hot-2',p.b);r.setProperty('--accent-hot-3',p.c);
})();
