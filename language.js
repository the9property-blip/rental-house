/* Shared Thai/English UI. Source sheet values, filter values and credentials are never rewritten. */
(function () {
  'use strict';
  var language = 'th';
  try { language = localStorage.getItem('property_language') === 'en' ? 'en' : 'th'; } catch (_) {}
  var phrases = {
    'แผนที่บ้านเช่า เชียงใหม่': 'Chiang Mai rental map', 'แผนที่บ้านเช่า': 'Rental map',
    'แผนที่ทรัพย์เช่าแล้ว': 'Rented property map', 'บ้านเช่า เชียงใหม่': 'Chiang Mai rentals',
    'ไม่พบหน้าที่ค้นหา': 'Page not found', 'ไม่พบหน้านี้': 'Page not found',
    'ลิงก์ที่คุณกดอาจไม่ถูกต้องหรือถูกลบไปแล้ว': 'This link may be incorrect or no longer available.',
    'กลับไปดูแคตตาล็อกบ้านเช่ากันเถอะ': 'Browse our rental catalog.', 'กลับหน้าหลัก': 'Back to home',
    'ค้นหาหมู่บ้าน โครงการ ทำเล หรือรหัสทรัพย์': 'Search village, project, location or property code',
    'ค้นหาหมู่บ้านหรือรหัสทรัพย์': 'Search village or property code', 'หมู่บ้าน / รหัส': 'Village / code',
    'ค้นหาโครงการ, ทำเล, รหัส...': 'Project, location, code...',
    'ค้นหาสถานที่ หรือพิกัด เช่น มช. / 18.80,99.01': 'Search place or coordinates, e.g. CMU / 18.80,99.01',
    'ค้นหาสถานที่หรือพิกัด': 'Search place or coordinates', 'ค้นหาสถานที่': 'Search place',
    'ล้างการค้นหาและตัวกรองทั้งหมด': 'Clear all searches and filters', 'ล้างการค้นหาตำแหน่ง': 'Clear location search',
    'ไปยังเว็บทรัพย์ขาย': 'View properties for sale', 'ดูบ้านทั้งหมดบนแผนที่': 'View all properties on the map',
    'ทรัพย์ให้เช่า': 'Rentals', 'ทรัพย์เช่าแล้ว': 'Rented properties', 'ทรัพย์ขาย': 'For sale',
    'ลูกค้าหาเช่า': 'Tenant requests', 'ประเภททรัพย์อื่น': 'Other property types', 'ประเภทอื่น': 'Other types',
    'ราคาต่ำสุด': 'Min price', 'ราคาสูงสุด': 'Max price', 'ชั้นต่ำสุด': 'Min floor', 'ชั้นสูงสุด': 'Max floor',
    'ขนาดที่ดินต่ำสุด (ตร.ว.)': 'Min land area (sq.wah)', 'ขนาดที่ดินสูงสุด (ตร.ว.)': 'Max land area (sq.wah)',
    'พื้นที่ใช้สอยต่ำสุด (ตร.ม.)': 'Min floor area (m²)', 'พื้นที่ใช้สอยสูงสุด (ตร.ม.)': 'Max floor area (m²)',
    'ที่ดินต่ำ(ตรว.)': 'Min land (sq.wah)', 'ที่ดินสูง(ตรว.)': 'Max land (sq.wah)',
    'ใช้สอยต่ำ(ตรม.)': 'Min area (m²)', 'ใช้สอยสูง(ตรม.)': 'Max area (m²)',
    'ไม่มีห้องนอนชั้นล่าง': 'No ground-floor bedroom', 'มีห้องนอนชั้นล่าง': 'Ground-floor bedroom',
    'ห้องนอนชั้นล่าง': 'Ground-floor bedroom', 'นอนชั้นล่าง': 'Ground-floor bedroom',
    'ไม่มีห้องแม่บ้าน': 'No maid’s room', 'มีห้องแม่บ้าน': 'Maid’s room', 'ห้องแม่บ้าน': 'Maid’s room',
    'ไม่มีสระว่ายน้ำ': 'No swimming pool', 'มีสระว่ายน้ำ': 'Swimming pool', 'สระว่ายน้ำ': 'Swimming pool',
    'ไม่มีฟิตเนส': 'No gym', 'มีฟิตเนส': 'Gym', 'ฟิตเนส': 'Gym',
    'บ้านเดี่ยว': 'Detached house', 'ทาวน์เฮ้าส์': 'Townhouse', 'ทาวน์โฮม': 'Townhouse', 'ทาวน์': 'Townhouse',
    'พูลวิลล่า': 'Pool villa', 'คอนโด': 'Condo', 'อาคารพาณิชย์': 'Commercial building',
    'สำนักงาน': 'Office', 'หอพัก': 'Apartment building', 'โกดัง': 'Warehouse', 'ที่ดิน': 'Land',
    'ไม่รับสัตว์เลี้ยง': 'No pets', 'รับสัตว์เลี้ยง': 'Pets allowed', 'สัตว์เลี้ยง': 'Pets',
    'ทุกห้องน้ำ': 'All bathrooms', 'ทุกขนาด': 'All bedrooms', 'ทุกสถานะ': 'All statuses', 'ทุกเกรด': 'All grades',
    'ราคา ถูก→แพง': 'Price: low to high', 'ราคา แพง→ถูก': 'Price: high to low',
    'ชื่อโครงการ A-Z': 'Project: A–Z', 'ห้องนอน น้อย→มาก': 'Bedrooms: low to high',
    'พร้อมเข้าพัก': 'Available', 'พร้อมเช่า': 'Available', 'ประกาศล่วงหน้า': 'Available later',
    'เร็วๆ นี้': 'Coming soon', 'เร็วๆ': 'Soon', 'พร้อม': 'Available',
    'สถานที่สำคัญ': 'Places of interest', 'หลังบนแผนที่': 'properties on map',
    'ดูแผนที่': 'View map', 'กลับแคตตาล็อก': 'Back to catalog', 'แคตตาล็อก': 'Catalog',
    'รายละเอียดทรัพย์': 'Property details', 'ปิดรายละเอียด': 'Close details', 'รายละเอียด': 'Details',
    'ยังไม่มีรูปภาพ': 'No image yet', 'ไม่มีรูปภาพ': 'No image', 'ยังไม่มีรูป': 'No image yet', 'ยังไม่มีข้อมูล': 'No data yet',
    'ไม่พบทรัพย์ที่ตรงกับการค้นหา': 'No matching properties', 'ไม่พบข้อมูล': 'No results',
    'ลองเปลี่ยนเงื่อนไขการค้นหา': 'Try changing your search filters', 'กำลังโหลดข้อมูล...': 'Loading properties...',
    'กำลังโหลด...': 'Loading...', 'โหลดใหม่': 'Refresh', 'โหลดข้อมูลสำเร็จ': 'Loaded successfully',
    'ข้อมูลทีมงาน (Staff Only)': 'Staff details', 'ช่องทางการติดต่อ': 'Contact channel',
    'คัดลอกชื่อเจ้าของ': 'Copy owner name', 'คัดลอกเบอร์โทร': 'Copy phone number',
    'คัดลอกช่องทางการติดต่อ': 'Copy contact channel', 'คัดลอกลิงก์ Google Maps': 'Copy Google Maps link',
    'คัดลอกทั้งหมด': 'Copy all', 'คัดลอกแล้ว': 'Copied', 'คัดลอกไม่สำเร็จ': 'Copy failed',
    'ข้อความประกาศ': 'Listing text', 'เปิดโพสต์': 'Open post', 'โพส FB': 'Facebook post',
    'ไม่มีลิงก์แผนที่': 'No map link', 'เข้าสู่ระบบทีมงาน': 'Staff sign in',
    'เฉพาะทีมงาน The 9 Property — ดูข้อมูลเจ้าของ ดาวน์โหลดภาพ และบันทึกทรัพย์เช่าแล้ว': 'The 9 Property staff only — owner details, photo downloads and rental management',
    'กรุณากรอกรหัสผ่าน': 'Please enter your password', 'รหัสผ่านไม่ถูกต้อง': 'Incorrect password',
    'รหัสผ่าน': 'Password', 'เข้าสู่ระบบ': 'Sign in', 'กำลังตรวจสอบ...': 'Verifying...',
    'ออกจากระบบ': 'Sign out', 'ยกเลิก': 'Cancel', 'ตกลง': 'OK', 'Staff (ออก)': 'Staff (out)',
    'ดาวน์โหลดรูปทั้งหมด (ZIP)': 'Download all photos (ZIP)', 'ดาวน์โหลดรูป (ล็อกอิน)': 'Download photos (sign in)',
    'บันทึกรูปทั้งหมด': 'Save all photos', 'บันทึกรูป (ล็อกอิน)': 'Save photos (sign in)',
    'ดาวน์โหลด ZIP แทน': 'Download ZIP instead', 'ปิดการดาวน์โหลด': 'Close download', 'ดาวน์โหลดรูปภาพ': 'Photo download',
    'บันทึก / แชร์ไฟล์': 'Save / share file', 'บันทึก ZIP': 'Save ZIP', 'กำลังรวมรูป…': 'Preparing photos…',
    'เช่าแล้ว': 'Rented', 'นำทรัพย์กลับไปปล่อยเช่า': 'Return to rentals', 'ลบข้อมูล': 'Delete listing',
    'กำลังบันทึก…': 'Saving…', 'กำลังลบ…': 'Deleting…', 'ยืนยันลบ': 'Confirm deletion',
    'กรอกรหัสผ่านเพื่อยืนยันการลบ': 'Enter password to confirm deletion',
    'โทรสอบถาม': 'Call us', 'สอบถาม': 'Enquire', 'ติดต่อ': 'Contact', 'เบอร์โทร': 'Phone',
    'เจ้าของ': 'Owner', 'สถานะ': 'Status', 'ทำเล': 'Location', 'ประเภท': 'Type', 'รหัสทรัพย์': 'Property code',
    'ห้องนอน': 'Bedrooms', 'ห้องน้ำ': 'Bathrooms', 'เกรด': 'Grade', 'ติดทรัพย์': 'Direct listing',
    'รับได้': 'Allowed', 'ไม่รับ': 'Not allowed', 'ทั้งหมด': 'All', 'สถานที่': 'Place', 'ล้าง': 'Clear',
    'บาท/เดือน': 'THB/month', 'บาท / เดือน': 'THB / month', 'บาท /เดือน': 'THB /month', 'บาท': 'THB',
    'ทรัพย์': 'properties', 'รายการ': 'properties', 'แสดง': 'Showing', 'โทร': 'Call', 'บ้าน': 'House'
  };
  Object.assign(phrases, {
  "ไม่รับสัตว์": "No pets",
  "กลับหน้าแคตตาล็อก": "Back to catalog",
  "เชียงใหม่": "Chiang Mai",
  "ดูทั้งหมด": "View all",
  "ดูรายละเอียด": "View details",
  "ไม่พบรายการที่ตรงกัน": "No matching properties",
  "ลองเปลี่ยนตัวกรองหรือค้นหาใหม่": "Try different filters or a new search",
  "โหลดข้อมูลไม่สำเร็จ": "Unable to load properties",
  "เชื่อมต่อไม่ได้:": "Connection failed:",
  "ไม่ทราบสาเหตุ": "Unknown error",
  "สถานที่อยู่นอกขอบเขตแผนที่ประเทศไทย": "This place is outside the Thailand map area",
  "ตำแหน่งอยู่นอกขอบเขตแผนที่ประเทศไทย": "This location is outside the Thailand map area",
  "แผนที่รองรับเฉพาะพื้นที่ประเทศไทย": "The map supports locations in Thailand only",
  "เข้าถึงตำแหน่งไม่ได้ (อนุญาตสิทธิ์ตำแหน่งก่อน)": "Location unavailable (please allow location access)",
  "กำลังหาตำแหน่ง…": "Finding your location…",
  "ตำแหน่งของฉัน": "My location",
  "แตะเพื่อดูตำแหน่งบนแผนที่": "Tap to view on the map",
  "แตะเพื่อดูราคา": "Tap to see prices",
  "ไม่พบพิกัด": "Coordinates not found",
  "ไม่มีข้อมูลให้คัดลอก": "No data to copy",
  "กรุณาพิมพ์สถานที่ที่ต้องการค้นหา": "Please enter a place to search",
  "กรุณาใส่รหัสผ่าน": "Please enter your password",
  "เข้าสู่ระบบสำเร็จ": "Signed in successfully",
  "ออกจากระบบแล้ว": "Signed out",
  "ระบบบันทึกเช่าแล้วยังโหลดไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ": "Rental management failed to load. Please refresh the page.",
  "กำลังตรวจสอบรูปที่บันทึกไว้ของ ": "Checking saved photos for ",
  "กำลังรวมรูปทั้งหมดของ ": "Preparing a photo ZIP for ",
  "กำลังเตรียมรูปทั้งหมดของ ": "Preparing all photos for ",
  " เมื่อพร้อมแล้วให้แตะบันทึกอีกครั้ง…": "; tap Save again when ready…",
  " เป็น ZIP กรุณารอสักครู่…": ". Please wait…",
  "เตรียมครบ ": "Prepared ",
  " รูปแล้ว แตะ “บันทึกรูปทั้งหมด” แล้วเลือกบันทึกหรือแอปปลายทางในเมนูของเครื่อง": " photos. Tap “Save all photos”, then select Save or an app in your device’s menu.",
  "รวมรูปครบ ": "Prepared ",
  " รูปแล้ว กำลังเริ่มดาวน์โหลด หากไฟล์ไม่เริ่มโหลด ให้แตะ “บันทึก ZIP”": " photos. Starting download; if it does not start, tap “Save ZIP”.",
  "ส่งรูปให้เมนูของเครื่องแล้ว หากต้องการบันทึกอีกครั้ง ให้แตะปุ่มด้านล่าง": "Photos sent to your device’s menu. Tap below to save again.",
  "ปิดเมนูแล้ว สามารถแตะ “บันทึกรูปทั้งหมด” เพื่อลองอีกครั้งได้": "Menu closed. Tap “Save all photos” to try again.",
  "เครื่องไม่สามารถบันทึกรูปชุดนี้ได้ ลองอีกครั้งหรือดาวน์โหลด ZIP แทน": "Unable to save these photos. Try again or download a ZIP instead.",
  "เครื่องหรือเบราว์เซอร์นี้ไม่รองรับการบันทึกรูปทั้งหมดพร้อมกัน ลองเปิดใน Safari หรือ Chrome หรือใช้ ZIP แทน": "This browser cannot save all photos together. Try Safari or Chrome, or download a ZIP.",
  "แชร์ไฟล์ไม่ได้ กรุณาใช้ปุ่ม “บันทึก ZIP”": "Unable to share the file. Please use “Save ZIP”.",
  "ยังไม่พบโฟลเดอร์รูปของทรัพย์นี้": "Photo folder not found for this property",
  "ยังไม่มีรูปภาพในโฟลเดอร์ทรัพย์นี้": "This property has no photos yet",
  "รูปทั้งหมดเกินขีดจำกัด ": "Photos exceed the limit of ",
  " MB หรือ ": " MB or ",
  " รูป จึงยังเตรียมไฟล์ไม่ได้ กรุณาติดต่อผู้ดูแล": " photos. Please contact the administrator.",
  "รหัสทรัพย์ไม่ถูกต้อง กรุณาโหลดหน้าเว็บใหม่": "Invalid property code. Please refresh the page.",
  "รวมรูปไม่สำเร็จ กรุณาลองอีกครั้ง": "Unable to prepare photos. Please try again.",
  "ระบบดาวน์โหลดยังไม่พร้อม กรุณาติดต่อผู้ดูแลให้อัปเดตระบบ": "Downloads are unavailable. Please ask the administrator to update the system.",
  "ใช้เวลารวมรูปนานเกินไป กรุณาลองอีกครั้ง": "Photo preparation timed out. Please try again.",
  "เชื่อมต่อระบบดาวน์โหลดไม่ได้ กรุณาลองอีกครั้ง หากยังไม่ได้ ให้เปิดเว็บใน Safari หรือ Chrome": "Unable to connect to downloads. Try again, or open the site in Safari or Chrome.",
  "ได้รับรูปไม่ครบหรือระบบยังไม่รองรับ กรุณาลองอีกครั้งหรือติดต่อผู้ดูแลให้อัปเดตระบบ": "Photos are incomplete or unsupported. Try again or contact the administrator.",
  "ไฟล์ ZIP ไม่สมบูรณ์ กรุณาลองอีกครั้ง": "Invalid ZIP file. Please try again.",
  "มีรายการกำลังบันทึกอยู่ กรุณารอสักครู่แล้วลองใหม่": "Another action is in progress. Please wait and try again.",
  "กรุณายืนยันว่าทรัพย์ถูกเช่าแล้วก่อนบันทึก": "Please confirm that the property has been rented.",
  "รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง": "Incorrect password. Please check and try again.",
  "รหัสทรัพย์ไม่ถูกต้อง": "Invalid property code",
  "ข้อมูลทรัพย์ยังไม่พร้อม กรุณาโหลดข้อมูลใหม่แล้วลองอีกครั้ง": "Property data is not ready. Refresh and try again.",
  "ไม่พบแท็บรายชื่อบ้านเช่าหรือเช่าแล้ว กรุณาติดต่อผู้ดูแล": "Rental sheet not found. Please contact the administrator.",
  "ไม่พบรหัสนี้ในแถบต้นทาง กรุณาโหลดข้อมูลใหม่": "Property code not found in the source sheet. Please refresh.",
  "ข้อมูลทรัพย์เปลี่ยนไป กรุณาโหลดข้อมูลใหม่ก่อนยืนยันอีกครั้ง": "Property data has changed. Refresh before confirming again.",
  "พบรหัสซ้ำในรายชื่อบ้านเช่า กรุณาตรวจสอบข้อมูลก่อน": "Duplicate property code found. Please check the rental sheet.",
  "ไม่พบโฟลเดอร์รหัสนี้ในโฟลเดอร์ต้นทาง จึงยังไม่ได้ย้ายทรัพย์": "Source photo folder not found. The property has not been moved.",
  "ยังไม่ได้ระบุประเภททรัพย์ กรุณาตรวจสอบข้อมูล": "Property type is missing. Please check the data.",
  "จำนวนครั้งในคอลัมน์ AC ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป": "Column AC must contain a non-negative integer.",
  "ไม่พบโฟลเดอร์ปลายทางที่ถูกต้องภายใน Rent กรุณาติดต่อผู้ดูแล": "Destination folder not found within Rent. Please contact the administrator.",
  "โฟลเดอร์ของทรัพย์ไม่อยู่ในขอบเขต Rent จึงหยุดการย้าย": "The property folder is outside Rent. Moving was stopped.",
  "ค้นหาโฟลเดอร์ไม่ครบในเวลาที่กำหนด ยังไม่ได้เริ่มย้ายข้อมูล กรุณาลองใหม่": "Folder search timed out. No data has been moved. Please try again.",
  "พบโฟลเดอร์รหัสเดียวกันจำนวนมาก กรุณาตรวจสอบกับผู้ดูแล": "Too many folders share this code. Please contact the administrator.",
  "แหล่งข้อมูลไม่ถูกต้อง กรุณาโหลดหน้าเว็บใหม่": "Invalid data source. Please refresh the page.",
  "มีการลบทรัพย์ค้างอยู่ กรุณาทำรายการลบเดิมให้เสร็จก่อน": "A deletion is pending. Please complete it first.",
  "ยังลบไม่ครบทุกขั้นตอน กรุณาลองลบรายการเดิมอีกครั้ง ระบบจะตรวจสอบก่อนทำต่อ": "Deletion is incomplete. Retry the same listing to resume safely.",
  "ข้อมูลที่สำรองไว้ไม่ตรงกับรายการเดิม กรุณาให้ผู้ดูแลตรวจสอบก่อนทำต่อ": "The backup does not match. Please ask the administrator to check before continuing.",
  "ยังไม่ยืนยันว่าบันทึกครบทุกขั้นตอน กรุณาลองอีกครั้ง ระบบจะตรวจรายการเดิมก่อนทำต่อ": "Completion is not confirmed. Try again to check and resume the same action.",
  "กำลังคัดลอกข้อมูลและย้ายโฟลเดอร์ กรุณารอ…": "Copying the listing and moving folders. Please wait…",
  "กำลังลบข้อมูลและย้ายโฟลเดอร์รูปไปถังขยะ กรุณารอ…": "Deleting the listing and moving photo folders to Trash. Please wait…",
  "ยังไม่ได้รับผลยืนยัน กรุณาโหลดข้อมูลใหม่หรือลองอีกครั้ง ระบบจะตรวจรายการเดิมก่อนทำต่อ": "No confirmation received. Refresh or retry to check and resume the same action.",
  "ยืนยันว่าทรัพย์รหัส ": "Confirm that property ",
  " ถูกเช่าแล้ว?": " has been rented?",
  "ยืนยันนำทรัพย์รหัส ": "Return property ",
  " กลับไปปล่อยเช่า พร้อมย้ายข้อมูลและโฟลเดอร์รูปตามประเภททรัพย์?": " to rentals and move its data and photo folders to the correct property category?",
  "ยืนยันลบทรัพย์รหัส ": "Delete property ",
  "? แถวข้อมูลจะถูกลบออกจากแถบ ": "? Its row will be removed from ",
  "รายชื่อบ้านเช่า": "Active rentals",
  " และโฟลเดอร์รูปทั้งหมดของรหัสนี้ในแหล่งเดียวกันจะถูกย้ายไปถังขยะ": " and all photo folders for this code in that data source will be moved to Trash.",
  "ลบข้อมูลและโฟลเดอร์รูปทรัพย์ ": "Deleted listing and photo folders for ",
  "บันทึกว่าทรัพย์ ": "Property ",
  "นำทรัพย์ ": "Property ",
  " กลับไปปล่อยเช่าสำเร็จ": " returned to rentals",
  " เช่าแล้วสำเร็จ": " marked as rented",
  " สำเร็จ": " successfully",
  "ไม่ระบุโครงการ": "Unnamed project",
  "ไม่ระบุทำเล": "Location not specified",
  "ยังไม่มีไฟล์ประกาศ (รหัส-1)": "No listing text file yet (code-1)",
  "โหลดไม่สำเร็จ": "Failed to load",
  "เรียงบ้านตามระยะใกล้ ": "Sorted by distance from ",
  "เรียงตามระยะใกล้ ": "Sorted by distance from "
});
  Object.assign(phrases, {"เมนูรายละเอียดทรัพย์":"Property navigation","ภาพรวม":"Overview","สิ่งอำนวยความสะดวก":"Amenities","คัดลอกลิงก์ทรัพย์":"Copy listing link","รูปภาพทรัพย์":"Property photos","สรุปข้อมูลทรัพย์":"Property summary","ขนาดที่ดิน (ตร.ว.)":"Land area (sq.wah)","พื้นที่ใช้สอย (ตร.ม.)":"Floor area (m²)","ติดต่อ The 9 Property":"Contact The 9 Property","สนใจนัดชมทรัพย์หรือต้องการข้อมูลเพิ่มเติม":"Contact us to arrange a viewing or request more information.","ราคาเช่า":"Monthly rent","เข้าสู่ระบบเพื่อดูข้อมูลทีมงาน":"Sign in to view staff details","ดูรูปทั้งหมด":"View all photos","ดูรูปภาพ":"View photo","ปิดรูปภาพ":"Close photos","รูปก่อนหน้า":"Previous photo","รูปถัดไป":"Next photo","ยังไม่ระบุ":"Not specified","ชั้น":"Floor","เฟอร์นิเจอร์และเครื่องใช้ไฟฟ้า":"Furniture and appliances","เฟอร์นิเจอร์":"Furniture","เช่าระยะสั้น":"Short-term rental","ระยะสัญญา":"Lease term","เงินประกัน":"Deposit","รายละเอียดเพิ่มเติม":"Additional details","ความปลอดภัยและส่วนกลาง":"Security and shared facilities","จุดเด่นทำเล":"Location highlights","ไม่พบข้อมูลทรัพย์":"Property not found","โหลดรายละเอียดไม่สำเร็จ กรุณาลองใหม่":"Unable to load property details. Please try again.","ออกจากระบบทีมงาน?":"Sign out of your staff account?","รหัสผ่านไม่ถูกต้อง หรือระบบไม่พร้อมใช้งาน":"Incorrect password or service unavailable","ไม่ระบุ":"Not specified"});
  Object.assign(phrases, {"บ้านใกล้เคียง":"Nearby homes","ภายในระยะ 20 กม.":"Within 20 km","ทรัพย์ในทำเลเดียวกัน":"Properties in the same area","เรียงจากข้อมูลในทำเลเดียวกัน":"Listings in the same area","ยังไม่พบทรัพย์ใกล้เคียงในขณะนี้":"No nearby properties available at the moment","โหลดทรัพย์ใกล้เคียงไม่สำเร็จ กรุณาลองใหม่":"Unable to load nearby properties. Please try again.","ทำเลและแผนที่":"Location and map","เปิดแผนที่ขนาดใหญ่":"Open larger map","แผนที่ตำแหน่งทรัพย์":"Property location map","ยังไม่มีพิกัดของทรัพย์นี้":"Coordinates are not available for this property","โหลดแผนที่ไม่สำเร็จ กรุณาเปิดแผนที่ขนาดใหญ่":"Unable to load the map. Please open the larger map."," กม.":" km"});
  var originalTitle = document.title;
  var keys = Object.keys(phrases).sort(function(a,b) { return b.length - a.length; });
  function translate(text) {
    if (language !== 'en' || typeof text !== 'string' || !/[ก-๙]/.test(text)) return text;
    var exactFlags = {'มี':'Yes','ไม่มี':'No','รับ':'Allowed','ได้':'Yes','ไม่ได้':'No'};
    if (exactFlags[text.trim()]) return text.replace(text.trim(),exactFlags[text.trim()]);
    var output = text;
    keys.forEach(function(key) { output = output.split(key).join(phrases[key]); });
    return output.replace(/(\d+\+?)\s+นอน/g, '$1 beds').replace(/(\d+\+?)\s+น้ำ/g, '$1 baths')
      .replace(/(\d+)\s+ห้อง/g, '$1 rooms').replace(/\/ด\./g, '/mo.');
  }
  // Do not translate user data or text that is copied to clients.
  var skip = 'script,style,textarea,pre,[data-no-translate],.card-project,.card-location,.card-code,.mc-name,.mc-loc,.pp-name,.pp-loc,#dProject,#dSub,#dLocation,#dCode,#dOwnerName,#dOwnerTel,#dOwnerContact,#dCoords,#dFacebookVal,#dCaptionText,.geo-dropdown-item,#geoActiveText,.np-text,.pill-text';
  var originals = new WeakMap(), attributes = new WeakMap(), observer;
  function textNode(node) {
    if (!node.parentElement) return;
    var fixedFacebookAction = node.parentElement.closest('#dFacebookVal a');
    var existing = originals.get(node);
    var originalText = existing && node.nodeValue === existing.output ? existing.source : node.nodeValue;
    var fixedPlaceholder = ['— ยังไม่มีไฟล์ประกาศ (รหัส-1)', '— โหลดไม่สำเร็จ', '— ไม่มีลิงก์แผนที่'].indexOf(originalText.trim()) !== -1;
    if (node.parentElement.closest(skip) && !fixedFacebookAction && !fixedPlaceholder) return;
    var record = originals.get(node);
    var source = record && node.nodeValue === record.output ? record.source : node.nodeValue;
    var output = translate(source);
    originals.set(node, {source:source,output:output});
    if (node.nodeValue !== output) node.nodeValue = output;
  }
  function element(node) {
    if (node.closest(skip)) return;
    // Options without explicit values derive their values from text; freeze those values before translation.
    if (node.tagName === 'OPTION' && !node.hasAttribute('value')) node.setAttribute('value', node.value);
    var saved = attributes.get(node) || {};
    ['placeholder','title','aria-label'].forEach(function(name) {
      var value=node.getAttribute(name); if (value === null) return;
      var record=saved[name], source=record && value===record.output ? record.source : value;
      var output=translate(source);saved[name]={source:source,output:output};
      if(value!==output) node.setAttribute(name,output);
    });
    attributes.set(node,saved);
  }
  function scan(root) {
    if(root.nodeType===3) {textNode(root);return;}
    if(root.nodeType!==1 || (root.closest(skip) && !root.closest('#dFacebookVal a')))return;
    element(root);
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    var node;while((node=walker.nextNode())){if(node.nodeType===3)textNode(node);else element(node);}
  }
  function positionSwitch() {
    var group=document.querySelector('.staff-controls .language-switch'), staff=document.getElementById('staffBtn');
    if(group && staff) group.style.right=(staff.offsetWidth+4)+'px';
  }
  function observe() { observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']}); }
  function refresh() {
    if(!document.body)return;
    if(observer)observer.disconnect();
    scan(document.body);
    document.documentElement.lang=language;
    document.title=translate(originalTitle);
    document.querySelectorAll('[data-language]').forEach(function(button){
      var selected=button.dataset.language===language;button.setAttribute('aria-pressed',String(selected));
    });
    positionSwitch();
    if(observer)observe();
  }
  function setLanguage(value,persist) {
    language=value==='en'?'en':'th';
    if(persist!==false)try{localStorage.setItem('property_language',language);}catch(_){}
    refresh();
  }
  window.PropertyLanguage={set:setLanguage,t:translate,refresh:refresh,get:function(){return language;}};
  function init() {
    var target=document.querySelector('.staff-controls')||document.querySelector('.header-row1')||document.querySelector('.box');
    if(target){
      var group=document.createElement('div');group.className='language-switch';group.setAttribute('role','group');group.setAttribute('aria-label','Language / ภาษา');
      ['th','en'].forEach(function(value){var button=document.createElement('button');button.type='button';button.dataset.language=value;button.textContent=value==='th'?'ไทย':'EN';button.setAttribute('lang',value);button.onclick=function(){setLanguage(value);};group.appendChild(button);});
      var staff=document.getElementById('staffBtn');if(staff&&staff.parentElement===target)target.insertBefore(group,staff);else target.appendChild(group);
    }
    observer=new MutationObserver(function(changes){
      observer.disconnect();
      changes.forEach(function(change){if(change.type==='childList')change.addedNodes.forEach(scan);else if(change.type==='characterData')textNode(change.target);else element(change.target);});
      positionSwitch();
      observe();
    });
    refresh();
    window.addEventListener('resize',positionSwitch);
    window.addEventListener('storage',function(event){if(event.key==='property_language')setLanguage(event.newValue,false);});
    ['alert','confirm'].forEach(function(name){var original=window[name];if(typeof original==='function')window[name]=function(message){return original.call(window,translate(message));};});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
