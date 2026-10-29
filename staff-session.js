(function () {
  'use strict';
  var path = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1) || '/';
  var key = 'property_staff_session:' + path, channel = null, pending = '', token = '', hadCookie = false;
  function cookie() {
    try {
      var item = document.cookie.split(';').map(function (s) { return s.trim(); }).find(function (s) { return s.indexOf('staff_token=') === 0; });
      return item ? decodeURIComponent(item.slice(12)) : '';
    } catch (_) { return ''; }
  }
  function stored() { try { return sessionStorage.getItem(key) || ''; } catch (_) { return ''; } }
  function remember(value) {
    token = value;
    try { if (value) sessionStorage.setItem(key, value); else sessionStorage.removeItem(key); } catch (_) {}
  }
  function writeCookie(value) {
    try { document.cookie = 'staff_token=' + encodeURIComponent(value) + '; path=' + path + (value ? '' : '; Max-Age=0') + '; SameSite=Strict' + (location.protocol === 'https:' ? '; Secure' : ''); } catch (_) {}
  }
  function emit() {
    try { window.dispatchEvent(new StorageEvent('storage', { key: 'staff_auth_changed' })); } catch (_) {}
  }
  function send(message) { if (channel) { try { channel.postMessage(message); } catch (_) {} } }
  function read() {
    var value = cookie();
    if (value) { hadCookie = true; if (value !== token) remember(value); }
    else if (hadCookie) { hadCookie = false; remember(''); }
    return value || token;
  }
  function set(value) { remember(String(value || '')); writeCookie(token); hadCookie = !!cookie(); }
  function clear() {
    pending = ''; remember(''); writeCookie(''); hadCookie = false;
    try { sessionStorage.removeItem('staff_token'); } catch (_) {}
    send({ type: 'changed', token: '' });
  }
  function request() {
    pending = String(Date.now()) + ':' + Math.random().toString(36).slice(2);
    send({ type: 'request', id: pending });
  }
  var initial = cookie() || stored();
  remember(initial);
  if (initial && !cookie()) writeCookie(initial);
  hadCookie = !!cookie();
  window.PropertyStaffSession = {
    get: read,
    set: set,
    clear: clear,
    publish: function () { send({ type: 'changed', token: read() }); }
  };
  try {
    channel = new BroadcastChannel(key);
    channel.onmessage = function (event) {
      var message = event.data;
      if (!message || typeof message.type !== 'string') return;
      if (message.type === 'request') {
        var value = read();
        if (value) send({ type: 'response', id: message.id, token: value });
      } else if (message.type === 'response') {
        if (!pending || message.id !== pending || typeof message.token !== 'string' || !message.token) return;
        pending = ''; var changed = read() !== message.token; set(message.token); if (changed) emit();
      } else if (message.type === 'changed' && typeof message.token === 'string') {
        pending = ''; set(message.token); emit();
      }
    };
    request();
  } catch (_) {}
  window.addEventListener('storage', function (event) {
    if (event.key !== 'staff_auth_changed') return;
    read();
  });
  function resume() {
    var previous = token, value = read();
    if (previous !== value) emit();
    request();
  }
  window.addEventListener('focus', resume);
  window.addEventListener('pageshow', function (event) { if (event.persisted) resume(); });
})();
