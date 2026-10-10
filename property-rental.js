/* Staff-only rental archiving shared by the catalog and map. */
window.PropertyRental = (function () {
  'use strict';
  var config, detail = null, active = null, button = null, deleteButton = null, status = null, confirmation = null;
  var messages = {
    busy: 'มีรายการกำลังบันทึกอยู่ กรุณารอสักครู่แล้วลองใหม่',
    confirmation_required: 'กรุณายืนยันว่าทรัพย์ถูกเช่าแล้วก่อนบันทึก',
    invalid_code: 'รหัสทรัพย์ไม่ถูกต้อง',
    invalid_version: 'ข้อมูลทรัพย์ยังไม่พร้อม กรุณาโหลดข้อมูลใหม่แล้วลองอีกครั้ง',
    missing_sheet: 'ไม่พบแท็บรายชื่อบ้านเช่าหรือเช่าแล้ว กรุณาติดต่อผู้ดูแล',
    source_missing: 'ไม่พบรหัสนี้ในแถบต้นทาง กรุณาโหลดข้อมูลใหม่',
    source_changed: 'ข้อมูลทรัพย์เปลี่ยนไป กรุณาโหลดข้อมูลใหม่ก่อนยืนยันอีกครั้ง',
    duplicate_code: 'พบรหัสซ้ำในรายชื่อบ้านเช่า กรุณาตรวจสอบข้อมูลก่อน',
    no_rent_folder: 'ไม่พบโฟลเดอร์รหัสนี้ในโฟลเดอร์ต้นทาง จึงยังไม่ได้ย้ายทรัพย์',
    unsupported_type: 'ยังไม่ได้ระบุประเภททรัพย์ กรุณาตรวจสอบข้อมูล',
    invalid_return_count: 'จำนวนครั้งในคอลัมน์ AC ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป',
    destination_mismatch: 'ไม่พบโฟลเดอร์ปลายทางที่ถูกต้องภายใน Rent กรุณาติดต่อผู้ดูแล',
    outside_rent: 'โฟลเดอร์ของทรัพย์ไม่อยู่ในขอบเขต Rent จึงหยุดการย้าย',
    folder_scan_timeout: 'ค้นหาโฟลเดอร์ไม่ครบในเวลาที่กำหนด ยังไม่ได้เริ่มย้ายข้อมูล กรุณาลองใหม่',
    too_many_folders: 'พบโฟลเดอร์รหัสเดียวกันจำนวนมาก กรุณาตรวจสอบกับผู้ดูแล',
    invalid_dataset: 'แหล่งข้อมูลไม่ถูกต้อง กรุณาโหลดหน้าเว็บใหม่',
    deletion_pending: 'มีการลบทรัพย์ค้างอยู่ กรุณาทำรายการลบเดิมให้เสร็จก่อน',
    deletion_incomplete: 'ยังลบไม่ครบทุกขั้นตอน กรุณาลองลบรายการเดิมอีกครั้ง ระบบจะตรวจสอบก่อนทำต่อ',
    archive_conflict: 'ข้อมูลที่สำรองไว้ไม่ตรงกับรายการเดิม กรุณาให้ผู้ดูแลตรวจสอบก่อนทำต่อ',
    rental_incomplete: 'ยังไม่ยืนยันว่าบันทึกครบทุกขั้นตอน กรุณาลองอีกครั้ง ระบบจะตรวจรายการเดิมก่อนทำต่อ'
  };
  function returning() { return config && config.action === 'restoreRental'; }
  function refresh() {
    if (button) {
      button.disabled = !!active || !detail || !config.getToken() || !/^[a-f0-9]{64}$/.test(detail.version);
      button.textContent = active && !active.deleting && active.saving && detail && active.code === detail.code ? 'กำลังบันทึก…' : (returning() ? 'นำทรัพย์กลับไปปล่อยเช่า' : 'เช่าแล้ว');
    }
    if (deleteButton) {
      deleteButton.disabled = !!active || !detail || !config.getToken() || !/^[a-f0-9]{64}$/.test(detail.version);
      deleteButton.textContent = active && active.deleting && active.saving && detail && active.code === detail.code ? 'กำลังลบ…' : 'ลบข้อมูล';
    }
  }
  function report(message, error) {
    if (!status) return;
    status.textContent = message;
    status.setAttribute('role', error ? 'alert' : 'status');
  }
  function cancelConfirmation() { if (confirmation) confirmation.finish(false); }
  function confirmRental(request) {
    return new Promise(function (resolve) {
      var box = document.createElement('section'); box.className = 'rental-confirmation';
      box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-labelledby', 'rentalConfirmTitle');
      var title = document.createElement('p'); title.id = 'rentalConfirmTitle';
      title.textContent = request.deleting ? 'ยืนยันลบทรัพย์รหัส ' + request.code + '? แถวข้อมูลจะถูกลบออกจากแถบ ' + (returning() ? 'เช่าแล้ว' : 'รายชื่อบ้านเช่า') + ' และโฟลเดอร์รูปทั้งหมดของรหัสนี้ในแหล่งเดียวกันจะถูกย้ายไปถังขยะ' : (returning() ? 'ยืนยันนำทรัพย์รหัส ' + request.code + ' กลับไปปล่อยเช่า พร้อมย้ายข้อมูลและโฟลเดอร์รูปตามประเภททรัพย์?' : 'ยืนยันว่าทรัพย์รหัส ' + request.code + ' ถูกเช่าแล้ว?'); box.appendChild(title);
      var actions = document.createElement('div'); actions.className = 'rental-confirmation-actions';
      var cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'ยกเลิก';
      var agree = document.createElement('button'); agree.type = 'button'; agree.textContent = 'ตกลง'; agree.className = 'rental-confirm-agree';
      if (request.deleting) { agree.textContent = 'ยืนยันลบ'; agree.className += ' rental-confirm-delete'; }
      var pending = { finish: function (accepted) {
        if (confirmation !== pending) return;
        confirmation = null; box.remove(); resolve(accepted);
        if (button && button.focus) button.focus();
      } };
      confirmation = pending;
      cancel.onclick = function () { pending.finish(false); };
      agree.onclick = function () { pending.finish(true); };
      box.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); pending.finish(false); }
      });
      actions.appendChild(cancel); actions.appendChild(agree); box.appendChild(actions);
      document.getElementById('dRentalAction').appendChild(box);
      if (cancel.focus) cancel.focus();
      if (box.scrollIntoView) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }
  function markRented() { return performAction(false); }
  function deleteRental() { return performAction(true); }
  async function performAction(deleting) {
    if (active || !detail) return;
    var token = config.getToken();
    if (!token) { config.requestLogin(); return; }
    if (!/^[a-f0-9]{64}$/.test(detail.version)) { report(messages.invalid_version, true); return; }
    var request = { code: detail.code, version: detail.version, deleting: deleting };
    active = request;
    refresh(); report('', false);
    var timer;
    try {
      if (!(await confirmRental(request))) return;
      if (config.getToken() !== token || !detail || detail.code !== request.code || detail.version !== request.version) return;
      active.saving = true;
      refresh(); report(deleting ? 'กำลังลบข้อมูลและย้ายโฟลเดอร์รูปไปถังขยะ กรุณารอ…' : 'กำลังคัดลอกข้อมูลและย้ายโฟลเดอร์ กรุณารอ…', false);
      var controller = new AbortController();
      timer = setTimeout(function () { controller.abort(); }, 120000);
      var response = await fetch(config.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ action: deleting ? 'deleteRental' : (config.action || 'markRented'), dataset: returning() ? 'rented' : 'active', token: token, code: request.code, version: request.version, confirmed: true }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('network');
      var result = await response.json();
      if (config.getToken() !== token) return;
      if (!result.ok) {
        if (result.error === 'unauthorized') {
          config.onUnauthorized(); config.requestLogin(); return;
        }
        if (detail && detail.code === request.code) report(messages[result.error] || messages.rental_incomplete, true);
        return;
      }
      if (result.code !== request.code) throw new Error('invalid_response');
      if (detail && detail.code === request.code) detail = null;
      config.onComplete(request.code);
      config.notify(deleting ? 'ลบข้อมูลและโฟลเดอร์รูปทรัพย์ ' + request.code + ' สำเร็จ' : (returning() ? 'นำทรัพย์ ' + request.code + ' กลับไปปล่อยเช่าสำเร็จ' : 'บันทึกว่าทรัพย์ ' + request.code + ' เช่าแล้วสำเร็จ'));
    } catch (err) {
      if (config.getToken() === token && detail && detail.code === request.code)
        report('ยังไม่ได้รับผลยืนยัน กรุณาโหลดข้อมูลใหม่หรือลองอีกครั้ง ระบบจะตรวจรายการเดิมก่อนทำต่อ', true);
    } finally {
      if (timer) clearTimeout(timer);
      active = null; refresh();
    }
  }
  return {
    configure: function (options) { config = options; },
    setDetail: function (property) {
      cancelConfirmation();
      detail = property ? { code: String(property.code || '').trim().toUpperCase(), version: String(property.rentalVersion || '') } : null;
      var slot = document.getElementById('dRentalAction');
      if (!slot) return;
      slot.textContent = ''; button = deleteButton = status = null;
      if (!detail || !config.getToken()) return;
      button = document.createElement('button');
      button.type = 'button'; button.className = 'rental-action-button'; button.onclick = markRented;
      slot.appendChild(button);
      deleteButton = document.createElement('button');
      deleteButton.type = 'button'; deleteButton.className = 'rental-action-button rental-delete-button'; deleteButton.onclick = deleteRental;
      slot.appendChild(deleteButton);
      status = document.createElement('p'); status.className = 'rental-action-status'; status.setAttribute('role', 'status');
      slot.appendChild(status); refresh();
      if (!/^[a-f0-9]{64}$/.test(detail.version)) report(messages.invalid_version, true);
      else if (active && active.saving && active.code === detail.code) report('กำลังคัดลอกข้อมูลและย้ายโฟลเดอร์ กรุณารอ…', false);
    },
    markRented: markRented,
    deleteRental: deleteRental,
    cancelConfirmation: cancelConfirmation
  };
})();
