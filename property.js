'use strict';
var currentProperty = null, currentStaff = false, detailGeneration = 0, requestAbort = null, currentPhoto = 0, toastTimer;
var query = new URLSearchParams(location.search), propertyCode = String(query.get('code') || '').trim().toUpperCase();
var propertyDataset = query.get('dataset') === 'rented' ? 'rented' : 'active';
function getStaffToken() {
  try {
    var prefix = 'staff_token=';
    var cookie = document.cookie.split(';').map(function(value) { return value.trim(); }).find(function(value) { return value.indexOf(prefix) === 0; });
    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : '';
  } catch(e) { return ''; }
}
function setStaffToken(token) {
  var path = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1) || '/';
  document.cookie = 'staff_token=' + encodeURIComponent(token) + '; path=' + path + '; SameSite=Strict' + (location.protocol === 'https:' ? '; Secure' : '');
}
function clearStaffToken() {
  var path = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1) || '/';
  document.cookie = 'staff_token=; path=' + path + '; Max-Age=0; SameSite=Strict' + (location.protocol === 'https:' ? '; Secure' : '');
  try { sessionStorage.removeItem('staff_token'); } catch(e) {}
}
function notifyStaffSessionChange() {
  try { localStorage.setItem('staff_auth_changed', String(Date.now())); } catch(e) {}
}
// Upgrade the current tab's old login to a session shared by new tabs.
try {
  var previousStaffToken = sessionStorage.getItem('staff_token');
  if (previousStaffToken && !getStaffToken()) setStaffToken(previousStaffToken);
  sessionStorage.removeItem('staff_token');
} catch(e) {}
function isStaffLoggedIn() { return !!getStaffToken(); }

function el(id) { return document.getElementById(id); }
function translated(text) { return window.PropertyLanguage ? PropertyLanguage.t(text) : text; }
function text(id,value) { el(id).textContent = value == null || value === '' ? '–' : String(value); }
function money(value) { return Number(value || 0).toLocaleString('en-US'); }
function make(tag,className,value) { var node=document.createElement(tag);if(className)node.className=className;if(value!=null)node.textContent=value;return node; }
function photoUrl(id,size) { return 'https://lh3.googleusercontent.com/d/'+encodeURIComponent(id)+'=w'+size; }
function validPhotos(property) { return (Array.isArray(property.photos)?property.photos:[]).filter(function(photo){return photo && /^[A-Za-z0-9_-]+$/.test(photo.id);}); }
function yesNo(value) { return value===true?'มี':value===false?'ไม่มี':'ยังไม่ระบุ'; }
function showToast(message) { clearTimeout(toastTimer);el('toast').textContent=message;el('toast').hidden=false;toastTimer=setTimeout(function(){el('toast').hidden=true;},3500); }
async function copyText(value) {
  if(!value || value==='–')return showToast('ไม่มีข้อมูลให้คัดลอก');
  try { await navigator.clipboard.writeText(value);showToast('✅ คัดลอกแล้ว'); }
  catch(_){var input=make('textarea');input.value=value;input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);input.select();try{if(!document.execCommand('copy'))throw Error();showToast('✅ คัดลอกแล้ว');}catch(e){showToast('คัดลอกไม่สำเร็จ');}input.remove();}
}
function copyField(id){return copyText(el(id).textContent);}
function copyMap(){return copyText(currentStaff && currentProperty ? currentProperty.mapsUrl : '');}
function safeLink(node,url) {try{var parsed=new URL(url);if(parsed.protocol!=='https:' && parsed.protocol!=='http:')throw Error();node.href=parsed.href;node.hidden=false;return true;}catch(_){node.removeAttribute('href');node.hidden=true;return false;} }
function updateStaffBtn(){var logged=currentStaff&&!!getStaffToken();el('staffBtn').textContent=logged?'⭐ Staff (ออก)':'🔐 Staff';el('staffBtn').classList.toggle('logged-in',logged);}
function clearStaffDetails(){currentStaff=false;el('dStaffSection').hidden=true;el('staffInvite').hidden=false;['dOwnerName','dOwnerTel','dOwnerContact','dCaptionText'].forEach(function(id){el(id).textContent='';});['staffMapLink','staffFacebook'].forEach(function(id){el(id).removeAttribute('href');});if(window.PropertyRental)PropertyRental.setDetail(null);updateStaffBtn();}
async function loadProperty(){
  var generation=++detailGeneration;if(requestAbort)requestAbort.abort();requestAbort=new AbortController();
  var token=getStaffToken();clearStaffDetails();currentProperty=null;
  el('pageStatus').hidden=false;el('pageStatus').textContent='กำลังโหลดข้อมูล...';el('propertyContent').hidden=true;
  if(!/^(?:R[A-Z]{2}|CO[A-Z]*)\d+$/.test(propertyCode)){el('pageStatus').textContent='ไม่พบข้อมูลทรัพย์';return false;}
  try{
    var response=await fetch(SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'propertyDetail',code:propertyCode,dataset:propertyDataset,token:token||undefined}),cache:'no-store',credentials:'omit',signal:requestAbort.signal});
    var result=await response.json();
    if(generation!==detailGeneration || token!==getStaffToken())return false;
    if(!response.ok || !result.ok || !result.property || result.property.code!==propertyCode)throw Error(result.error==='not_found'?'not_found':'unavailable');
    currentProperty=result.property;currentProperty.photos=validPhotos(currentProperty);currentStaff=result.staff===true&&!!token;
    if(token&&!currentStaff){clearStaffToken();notifyStaffSessionChange();PropertyPhotos.reset();}
    renderProperty(currentProperty);el('pageStatus').hidden=true;el('propertyContent').hidden=false;updateStaffBtn();return currentStaff;
  }catch(error){if(generation!==detailGeneration || error.name==='AbortError')return false;el('pageStatus').textContent=error.message==='not_found'?'ไม่พบข้อมูลทรัพย์':'โหลดรายละเอียดไม่สำเร็จ กรุณาลองใหม่';return false;}
}
function fact(container,label,value,raw){var row=make('div');row.appendChild(make('dt',null,label));var data=make('dd',null,value==null||value===''?'–':String(value));if(raw)data.setAttribute('data-no-translate','');row.appendChild(data);container.appendChild(row);}
function renderProperty(p){
  text('dProject',p.project);text('dLocation',p.location);text('propertyCode',p.code);text('publicPrice',money(p.price));text('dPrice',money(p.price));
  var status=propertyDataset==='rented'?'เช่าแล้ว':p.ready?'✓ พร้อมเข้าพัก':'📅 พร้อมเข้าพัก '+(p.availableDate||'เร็วๆ นี้');text('availability',status);
  el('summaryFacts').replaceChildren();
  [[p.code,'รหัสทรัพย์',true],[p.type,'ประเภท',false],[p.bedroom,'ห้องนอน',false],[p.bathroom,'ห้องน้ำ',false],[p.land,'ขนาดที่ดิน (ตร.ว.)',false],[p.usable,'พื้นที่ใช้สอย (ตร.ม.)',false]].forEach(function(pair){var box=make('div'),value=make('b',null,pair[0]||'–');if(pair[2])value.setAttribute('data-no-translate','');box.appendChild(value);box.appendChild(make('span',null,pair[1]));el('summaryFacts').appendChild(box);});
  var facts=el('propertyFacts');facts.replaceChildren();
  [['ประเภท',p.type],['สถานะ',status],['ห้องนอน',p.bedroom],['ห้องน้ำ',p.bathroom],['ชั้น',p.floor],['ขนาดที่ดิน (ตร.ว.)',p.land],['พื้นที่ใช้สอย (ตร.ม.)',p.usable],['สัตว์เลี้ยง',p.pet],['ห้องแม่บ้าน',yesNo(p.maidRoom)],['ห้องนอนชั้นล่าง',yesNo(p.downstairsBedroom)],['สระว่ายน้ำ',yesNo(p.pool)],['ฟิตเนส',yesNo(p.gym)],['เฟอร์นิเจอร์',p.furniture],['เช่าระยะสั้น',p.shortTerm]].forEach(function(pair){fact(facts,pair[0],pair[1]);});
  var terms=el('rentalTerms');terms.replaceChildren();fact(terms,'ระยะสัญญา',p.contract,true);fact(terms,'เงินประกัน',p.deposit,true);fact(terms,'สถานะ',status);
  var details=el('longDetails');details.replaceChildren();
  [['รายละเอียดเพิ่มเติม',p.roomDetails],['เฟอร์นิเจอร์และเครื่องใช้ไฟฟ้า',p.furnitureList],['ความปลอดภัยและส่วนกลาง',p.securityInfo],['จุดเด่นทำเล',p.locationHighlights],['ระยะสัญญา',p.contract],['เงินประกัน',p.deposit]].forEach(function(pair){if(!pair[1])return;details.appendChild(make('h3',null,pair[0]));var paragraph=make('p','long-text',pair[1]);paragraph.setAttribute('data-no-translate','');details.appendChild(paragraph);});
  var amenities=el('amenityList');amenities.replaceChildren();[['pool','สระว่ายน้ำ'],['gym','ฟิตเนส'],['maidRoom','ห้องแม่บ้าน'],['downstairsBedroom','ห้องนอนชั้นล่าง']].forEach(function(pair){if(p[pair[0]]===true)amenities.appendChild(make('span',null,'✓ '+pair[1]));});if(!amenities.childNodes.length)amenities.appendChild(make('span',null,'ยังไม่ระบุ'));
  renderGallery(p);
  if(currentStaff){el('dStaffSection').hidden=false;el('staffInvite').hidden=true;text('dOwnerName',p.ownerName);text('dOwnerTel',p.ownerTel);text('dOwnerContact',p.contact);el('staffMapRow').hidden=!safeLink(el('staffMapLink'),p.mapsUrl);safeLink(el('staffFacebook'),p.facebook);PropertyPhotos.setDetail(p.code);if(window.PropertyRental)PropertyRental.setDetail(p);loadCaption();}
  if(window.PropertyLanguage)PropertyLanguage.refresh();
}
function image(photo,size,lazy){var img=make('img');img.src=photoUrl(photo.id,size);img.alt='';img.decoding='async';img.loading=lazy?'lazy':'eager';img.onerror=function(){if(!img.dataset.fallback){img.dataset.fallback='1';img.src='https://drive.google.com/thumbnail?id='+encodeURIComponent(photo.id)+'&sz=w'+size;}else{img.hidden=true;if(img.parentElement&&!img.parentElement.querySelector('.image-error'))img.parentElement.appendChild(make('span','image-error','ไม่มีรูปภาพ'));}};return img;}
function renderGallery(p){
  var grid=el('galleryGrid');grid.replaceChildren();el('photoThumbs').replaceChildren();
  p.photos.slice(0,5).forEach(function(photo,index){var button=make('button');button.type='button';button.setAttribute('aria-label','ดูรูปภาพ '+(index+1));var img=image(photo,index===0?1200:600,index>0);if(index===0)img.fetchPriority='high';button.appendChild(img);button.onclick=function(){openViewer(index);};grid.appendChild(button);});
  if(!p.photos.length)grid.appendChild(make('div','gallery-placeholder','ไม่มีรูปภาพ'));
  el('showAllPhotos').hidden=!p.photos.length;el('showAllPhotos').textContent='ดูรูปทั้งหมด ('+p.photos.length+')';
  currentPhoto=0;
}
function openViewer(index){if(!currentProperty||!currentProperty.photos.length)return;var thumbs=el('photoThumbs');if(!thumbs.childNodes.length)currentProperty.photos.forEach(function(photo,i){var button=make('button');button.type='button';button.setAttribute('aria-label','ดูรูปภาพ '+(i+1));button.appendChild(image(photo,180,true));button.onclick=function(){activatePhoto(i);};thumbs.appendChild(button);});el('photoViewer').showModal();activatePhoto(index);}
function activatePhoto(index){var photos=currentProperty.photos;currentPhoto=(index+photos.length)%photos.length;var img=image(photos[currentPhoto],1600,false);img.id='viewerImage';img.alt=translated('รูปภาพทรัพย์')+' '+(currentPhoto+1);el('viewerImageWrap').replaceChildren(img);text('photoCounter',(currentPhoto+1)+' / '+photos.length);Array.from(el('photoThumbs').children).forEach(function(button,i){button.setAttribute('aria-current',String(i===currentPhoto));});el('prevPhoto').disabled=el('nextPhoto').disabled=photos.length<2;}
async function loadCaption(){var generation=detailGeneration,token=getStaffToken();text('dCaptionText','');try{var response=await fetch(SCRIPT_URL+'?action=caption&code='+encodeURIComponent(propertyCode)+'&dataset='+propertyDataset+'&token='+encodeURIComponent(token),{cache:'no-store'}),result=await response.json();if(generation!==detailGeneration||token!==getStaffToken()||!currentStaff)return;text('dCaptionText',result.caption||result.text||'— ยังไม่มีไฟล์ประกาศ (รหัส-1)');}catch(_){if(generation===detailGeneration&&currentStaff)text('dCaptionText','— โหลดไม่สำเร็จ');}}
function openStaffModal(){el('staffLoginErr').textContent='';el('staffPasswordInput').value='';if(!el('staffLoginModal').open)el('staffLoginModal').showModal();el('staffPasswordInput').focus();}
function closeStaffModal(keep){if(!keep)PropertyPhotos.cancelLogin();el('staffLoginModal').close();}
function staffBtnClick(){if(getStaffToken()){if(!confirm(translated('ออกจากระบบทีมงาน?')))return;clearStaffToken();notifyStaffSessionChange();PropertyPhotos.reset();clearStaffDetails();loadProperty();}else openStaffModal();}
el('loginForm').addEventListener('submit',async function(event){event.preventDefault();var password=el('staffPasswordInput').value;if(!password)return;el('loginSubmit').disabled=true;setStaffToken(password);try{var success=await loadProperty();if(success){notifyStaffSessionChange();closeStaffModal(true);PropertyPhotos.onLogin();}else{clearStaffToken();PropertyPhotos.reset();el('staffLoginErr').textContent='รหัสผ่านไม่ถูกต้อง หรือระบบไม่พร้อมใช้งาน';}}finally{el('loginSubmit').disabled=false;el('staffPasswordInput').value='';}});
el('staffLoginModal').addEventListener('cancel',function(){PropertyPhotos.cancelLogin();});
el('showAllPhotos').onclick=function(){openViewer(0);};el('closeViewer').onclick=function(){el('photoViewer').close();};el('prevPhoto').onclick=function(){activatePhoto(currentPhoto-1);};el('nextPhoto').onclick=function(){activatePhoto(currentPhoto+1);};
el('photoViewer').addEventListener('keydown',function(event){if(event.key==='ArrowLeft'){event.preventDefault();activatePhoto(currentPhoto-1);}if(event.key==='ArrowRight'){event.preventDefault();activatePhoto(currentPhoto+1);}});
var touchStart=null;el('viewerImageWrap').addEventListener('touchstart',function(event){touchStart=event.touches[0].clientX;},{passive:true});el('viewerImageWrap').addEventListener('touchend',function(event){if(touchStart!==null){var dx=event.changedTouches[0].clientX-touchStart;if(Math.abs(dx)>50)activatePhoto(currentPhoto+(dx<0?1:-1));touchStart=null;}},{passive:true});
el('shareListing').onclick=function(){copyText(location.origin+location.pathname+'?code='+encodeURIComponent(propertyCode)+(propertyDataset==='rented'?'&dataset=rented':''));};
window.addEventListener('storage',function(event){if(event.key==='staff_auth_changed'){PropertyPhotos.reset();clearStaffDetails();loadProperty();}});
PropertyPhotos.configure({endpoint:SCRIPT_URL,dataset:propertyDataset,getToken:getStaffToken,requestLogin:openStaffModal,onUnauthorized:function(){clearStaffToken();notifyStaffSessionChange();clearStaffDetails();loadProperty();}});
if(window.PropertyRental)PropertyRental.configure({endpoint:SCRIPT_URL,action:propertyDataset==='rented'?'restoreRental':'markRented',getToken:getStaffToken,requestLogin:openStaffModal,notify:showToast,onUnauthorized:function(){clearStaffToken();notifyStaffSessionChange();clearStaffDetails();loadProperty();},onComplete:function(){PropertyPhotos.reset();location.href=propertyDataset==='rented'?'map-rented.html':'index.html';}});
loadProperty();
