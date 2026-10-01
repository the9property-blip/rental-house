/* Shared by the catalog and map. The server rechecks the staff token for every ZIP. */
window.PropertyPhotos = (function () {
  'use strict';
  var config, pendingCode = null, activeCode = null, controller = null;
  var generation = 0, objectUrl = null, panel = null;

  function escapeAttr(value) {
    return String(value || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function label() {
    return config && config.getToken() ? '⬇ ดาวน์โหลดรูปทั้งหมด (ZIP)' : '🔒 ดาวน์โหลดรูป (ล็อกอิน)';
  }
  function buttonHtml(code) {
    return '<button type="button" class="photo-download-button" data-photo-code="' + escapeAttr(code) +
      '" onclick="event.stopPropagation();PropertyPhotos.download(this.dataset.photoCode)">' + label() + '</button>';
  }
  function refreshButtons() {
    document.querySelectorAll('[data-photo-code]').forEach(function (button) {
      button.disabled = !!activeCode;
      button.textContent = activeCode === button.dataset.photoCode ? '⏳ กำลังรวมรูป…' : label();
    });
  }
  function cleanup() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    if (panel) panel.remove();
    panel = null;
  }
  function reset() {
    generation++;
    if (controller) controller.abort();
    controller = null;
    activeCode = null;
    pendingCode = null;
    cleanup();
    refreshButtons();
  }
  function showPanel(message, isError) {
    cleanup();
    panel = document.createElement('section');
    panel.className = 'photo-download-panel';
    panel.setAttribute('aria-label', 'ดาวน์โหลดรูปภาพ');
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'photo-download-close';
    close.setAttribute('aria-label', 'ปิดการดาวน์โหลด');
    close.textContent = '×';
    close.onclick = reset;
    var status = document.createElement('p');
    status.setAttribute('role', isError ? 'alert' : 'status');
    status.textContent = message;
    panel.appendChild(close);
    panel.appendChild(status);
    document.body.appendChild(panel);
    return status;
  }
  function decodeZip(base64) {
    var chunks = [];
    // Decode aligned chunks to avoid a second full-size binary string on mobile.
    for (var offset = 0; offset < base64.length; offset += 32768) {
      var binary = atob(base64.slice(offset, offset + 32768));
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      chunks.push(bytes);
    }
    if (!chunks.length || chunks[0][0] !== 80 || chunks[0][1] !== 75 || chunks[0][2] !== 3 || chunks[0][3] !== 4) {
      throw new Error('invalid_archive');
    }
    return new Blob(chunks, { type: 'application/zip' });
  }
  function showReady(blob, filename, count) {
    var status = showPanel('รวมรูปครบ ' + count + ' รูปแล้ว กำลังเริ่มดาวน์โหลด หากไฟล์ไม่เริ่มโหลด ให้แตะ “บันทึก ZIP”');
    objectUrl = URL.createObjectURL(blob);
    var save = document.createElement('a');
    save.className = 'photo-download-save';
    save.href = objectUrl;
    save.download = filename;
    save.textContent = '⬇ บันทึก ZIP';
    panel.appendChild(save);
    // File sharing needs a fresh user gesture (especially on iOS).
    try {
      var file = new File([blob], filename, { type: 'application/zip' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        var share = document.createElement('button');
        share.type = 'button';
        share.className = 'photo-download-save';
        share.textContent = 'บันทึก / แชร์ไฟล์';
        share.onclick = async function () {
          try { await navigator.share({ files: [file], title: filename }); }
          catch (err) {
            if (err.name !== 'AbortError') status.textContent = 'แชร์ไฟล์ไม่ได้ กรุณาใช้ปุ่ม “บันทึก ZIP”';
          }
        };
        panel.appendChild(share);
      }
    } catch (_) { /* File sharing is optional; the download link remains available. */ }
    save.click();
  }
  async function download(code) {
    if (!config || activeCode) return;
    code = String(code || '').trim().toUpperCase();
    if (!/^(?:R[A-Z]{2}|CO[A-Z]*)\d+$/.test(code)) {
      showPanel('รหัสทรัพย์ไม่ถูกต้อง กรุณาโหลดหน้าเว็บใหม่', true);
      return;
    }
    var token = config.getToken();
    if (!token) {
      pendingCode = code;
      config.requestLogin();
      return;
    }
    pendingCode = null;
    activeCode = code;
    var current = ++generation;
    controller = new AbortController();
    var requestController = controller;
    var signal = controller.signal;
    var timedOut = false;
    var timeout = setTimeout(function () { timedOut = true; requestController.abort(); }, 180000);
    showPanel('กำลังรวมรูปทั้งหมดของ ' + code + ' เป็น ZIP กรุณารอสักครู่…');
    refreshButtons();
    try {
      // text/plain keeps this a CORS simple request supported by Apps Script.
      // Never put the download credential in the URL or persist the generated ZIP.
      var response = await fetch(config.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ action: 'downloadPhotos', code: code, token: token }),
        credentials: 'omit', cache: 'no-store', redirect: 'follow', signal: signal
      });
      if (!response.ok) throw new Error('network');
      var result = await response.json();
      if (current !== generation) return;
      if (config.getToken() !== token) { cleanup(); return; }
      if (result.error === 'unauthorized') {
        config.onUnauthorized();
        pendingCode = code;
        cleanup();
        config.requestLogin();
        return;
      }
      if (!result.ok) {
        var messages = {
          no_folder: 'ยังไม่พบโฟลเดอร์รูปของทรัพย์นี้',
          no_photos: 'ยังไม่มีรูปภาพในโฟลเดอร์ทรัพย์นี้',
          too_large: 'รูปทั้งหมดเกินขีดจำกัด 25 MB หรือ 200 รูป จึงยังสร้าง ZIP ไม่ได้ กรุณาติดต่อผู้ดูแล',
          invalid_code: 'รหัสทรัพย์ไม่ถูกต้อง',
          archive_failed: 'รวมรูปไม่สำเร็จ กรุณาลองอีกครั้ง'
        };
        throw new Error(messages[result.error] || 'ระบบดาวน์โหลดยังไม่พร้อม กรุณาติดต่อผู้ดูแลให้อัปเดตระบบ');
      }
      if (result.mimeType !== 'application/zip' || typeof result.base64 !== 'string' || !result.count) {
        throw new Error('invalid_archive');
      }
      showReady(decodeZip(result.base64), code + '-photos.zip', result.count);
    } catch (err) {
      if (current !== generation) return;
      var message = timedOut ? 'ใช้เวลารวมรูปนานเกินไป กรุณาลองอีกครั้ง' :
        (err instanceof TypeError || err instanceof SyntaxError || err.message === 'network' ?
          'เชื่อมต่อระบบดาวน์โหลดไม่ได้ กรุณาลองอีกครั้ง หากยังไม่ได้ ให้เปิดเว็บใน Safari หรือ Chrome' :
          err.message === 'invalid_archive' ? 'ไฟล์ ZIP ไม่สมบูรณ์ กรุณาลองอีกครั้ง' : err.message);
      showPanel(message, true);
    } finally {
      clearTimeout(timeout);
      if (current === generation) {
        activeCode = null;
        controller = null;
        refreshButtons();
      }
    }
  }
  return {
    configure: function (options) { config = options; },
    buttonHtml: buttonHtml,
    setDetail: function (code) {
      var slot = document.getElementById('dPhotoDownload');
      if (slot) slot.innerHTML = buttonHtml(code);
      refreshButtons();
    },
    download: download,
    onLogin: function () {
      var code = pendingCode;
      pendingCode = null;
      refreshButtons();
      if (code) download(code);
    },
    cancelLogin: function () { pendingCode = null; },
    reset: reset
  };
})();
