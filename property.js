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
function clearStaffDetails(){currentStaff=false;hideLocationMap();el('dStaffSection').hidden=true;el('staffInvite').hidden=false;['dOwnerName','dOwnerTel','dOwnerContact','dCaptionText'].forEach(function(id){el(id).textContent='';});['staffMapLink','staffFacebook'].forEach(function(id){el(id).removeAttribute('href');});if(window.PropertyRental)PropertyRental.setDetail(null);updateStaffBtn();}
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
  text('breadcrumbCode',p.code);text('dProject',p.project);text('dLocation',p.location);text('propertyCode',p.code);text('publicPrice',money(p.price));text('dPrice',money(p.price));
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
  loadNearbyProperties(p);
}
var nearbyMap = null;
function propertyCoordinates(property){
  if(!property || property.lat==null || property.lng==null || property.lat==='' || property.lng==='')return null;
  var lat=Number(property.lat),lng=Number(property.lng);
  if(!isFinite(lat)||!isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180 || (lat===0&&lng===0))return null;
  return {lat:lat,lng:lng};
}
function propertyDistance(a,b){
  var radians=Math.PI/180,dLat=(b.lat-a.lat)*radians,dLng=(b.lng-a.lng)*radians;
  var v=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a.lat*radians)*Math.cos(b.lat*radians)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 6371*2*Math.atan2(Math.sqrt(Math.min(1,v)),Math.sqrt(Math.max(0,1-v)));
}
function selectNearbyProperties(property,properties){
  var code=String(property.code||'').toUpperCase(),record=properties.find(function(p){return String(p.code||'').toUpperCase()===code;})||property;
  var origin=propertyCoordinates(record)||propertyCoordinates(property);
  var location=String(record.location||property.location||'').trim().toLowerCase();
  var residential=['บ้านเดี่ยว','ทาวน์เฮ้าส์','ทาวน์โฮม','พูลวิลล่า','บ้าน','คอนโด'];
  var seen={};
  var candidates=properties.filter(function(p){var key=String(p.code||'').toUpperCase();if(!key||key===code||seen[key]||residential.indexOf(p.type)<0)return false;seen[key]=true;return true;});
  var selected=[];
  candidates.forEach(function(p){
    var coordinates=propertyCoordinates(p);
    if(origin){if(!coordinates)return;var distance=propertyDistance(origin,coordinates);if(distance<=20)selected.push({property:p,distance:distance});}
    else if(location&&String(p.location||'').trim().toLowerCase()===location)selected.push({property:p,distance:null});
  });
  if(origin)selected.sort(function(a,b){return a.distance-b.distance;});
  return {origin:origin,items:selected.slice(0,6)};
}
function nearbyCard(item){
  var property=item.property,link=make('a','nearby-card');
  link.href='property.html?code='+encodeURIComponent(property.code);
  var media=make('div','nearby-photo');
  if(property.thumb&&/^[A-Za-z0-9_-]+$/.test(property.thumb)){var img=image({id:property.thumb},480,true);img.alt=property.project||'';media.appendChild(img);}else media.appendChild(make('span',null,'ไม่มีรูปภาพ'));
  var status=make('span','nearby-availability',property.ready?'✓ พร้อมเข้าพัก':'ประกาศล่วงหน้า');media.appendChild(status);link.appendChild(media);
  var content=make('div','nearby-info'),price=make('div','nearby-price','฿'+money(property.price));price.appendChild(make('small',null,' บาท / เดือน'));content.appendChild(price);
  var title=make('h3',null,property.project||property.code);title.setAttribute('data-no-translate','');content.appendChild(title);
  var location=make('p','nearby-location',property.location||'–');location.setAttribute('data-no-translate','');content.appendChild(location);
  var specs=make('div','nearby-specs');specs.appendChild(make('span',null,'🛏 '+(property.bedroom||'–')+' นอน'));specs.appendChild(make('span',null,'🚿 '+(property.bathroom||'–')+' น้ำ'));
  if(item.distance!==null)specs.appendChild(make('span','nearby-distance',item.distance.toFixed(1)+' กม.'));
  content.appendChild(specs);link.appendChild(content);return link;
}
function hideLocationMap(){
  el('propertyMapSection').hidden=true;el('propertyMapNav').hidden=true;
  el('propertyLocationMap').hidden=true;el('largerPropertyMap').hidden=true;
  el('largerPropertyMap').removeAttribute('href');
  if(nearbyMap){nearbyMap.remove();nearbyMap=null;}
}
function renderLocationMap(origin){
  if(!currentStaff || !getStaffToken()){hideLocationMap();return;}
  el('propertyMapSection').hidden=false;el('propertyMapNav').hidden=false;
  var mapEl=el('propertyLocationMap'),status=el('propertyMapStatus'),larger=el('largerPropertyMap');
  if(nearbyMap){nearbyMap.remove();nearbyMap=null;}
  mapEl.hidden=true;larger.hidden=true;
  if(!origin){status.hidden=false;status.textContent='ยังไม่มีพิกัดของทรัพย์นี้';return;}
  larger.href='https://www.google.com/maps?q='+origin.lat+','+origin.lng;larger.hidden=false;
  if(!window.L){status.hidden=false;status.textContent='โหลดแผนที่ไม่สำเร็จ กรุณาเปิดแผนที่ขนาดใหญ่';return;}
  status.hidden=true;mapEl.hidden=false;
  nearbyMap=L.map(mapEl,{scrollWheelZoom:false,dragging:!L.Browser.mobile,tap:false}).setView([origin.lat,origin.lng],14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(nearbyMap);
  L.circleMarker([origin.lat,origin.lng],{radius:9,color:'#fff',weight:3,fillColor:'#244e72',fillOpacity:1}).addTo(nearbyMap);
  nearbyMap.invalidateSize();
}
async function loadNearbyProperties(property){
  var generation=detailGeneration,signal=requestAbort.signal;
  el('nearbyCards').replaceChildren();el('nearbyStatus').hidden=false;el('nearbyStatus').textContent='กำลังโหลดข้อมูล...';
  try{
    // Public catalog only: credentials and Staff token are intentionally omitted.
    var response=await fetch(SCRIPT_URL,{cache:'no-store',credentials:'omit',signal:signal});var result=await response.json();
    if(generation!==detailGeneration)return;
    if(!response.ok||!result.ok||!Array.isArray(result.data))throw Error('unavailable');
    var selection=selectNearbyProperties(property,result.data);
    if(!selection.origin&&propertyDataset==='rented'){
      var archived=await(await fetch(SCRIPT_URL+'?action=rentedMap',{credentials:'omit',cache:'no-store',signal:signal})).json();
      if(generation!==detailGeneration)return;
      var archivedProperty=(archived.data||[]).find(function(p){return String(p.code||'').toUpperCase()===propertyCode;});
      if(archivedProperty)selection=selectNearbyProperties(archivedProperty,result.data);
    }
    el('nearbyTitle').textContent=selection.origin?'บ้านใกล้เคียง':'ทรัพย์ในทำเลเดียวกัน';
    el('nearbyHint').textContent=selection.origin?'ภายในระยะ 20 กม.':'เรียงจากข้อมูลในทำเลเดียวกัน';
    selection.items.forEach(function(item){el('nearbyCards').appendChild(nearbyCard(item));});
    el('nearbyStatus').hidden=!!selection.items.length;
    if(!selection.items.length)el('nearbyStatus').textContent='ยังไม่พบทรัพย์ใกล้เคียงในขณะนี้';
    renderLocationMap(selection.origin);
  }catch(error){if(generation!==detailGeneration||error.name==='AbortError')return;el('nearbyStatus').textContent='โหลดทรัพย์ใกล้เคียงไม่สำเร็จ กรุณาลองใหม่';renderLocationMap(propertyCoordinates(property));}
}
function image(photo,size,lazy){var img=make('img');img.src=photoUrl(photo.id,size);img.alt='';img.decoding='async';img.loading=lazy?'lazy':'eager';img.onerror=function(){if(!img.dataset.fallback){img.dataset.fallback='1';img.src='https://drive.google.com/thumbnail?id='+encodeURIComponent(photo.id)+'&sz=w'+size;}else{img.hidden=true;if(img.parentElement&&!img.parentElement.querySelector('.image-error'))img.parentElement.appendChild(make('span','image-error','ไม่มีรูปภาพ'));}};return img;}
function renderGallery(p){
  var grid=el('galleryGrid');grid.replaceChildren();el('photoThumbs').replaceChildren();
  p.photos.slice(0,5).forEach(function(photo,index){var button=make('button');button.type='button';button.setAttribute('aria-label','ดูรูปภาพ '+(index+1));var img=image(photo,index===0?1200:600,index>0);if(index===0)img.fetchPriority='high';button.appendChild(img);button.onclick=function(){openViewer(index);};grid.appendChild(button);});
  if(!p.photos.length)grid.appendChild(make('div','gallery-placeholder','ไม่มีรูปภาพ'));
  el('showAllPhotos').hidden=!p.photos.length;el('showAllPhotos').textContent='ดูรูปทั้งหมด ('+p.photos.length+')';
  currentPhoto=0;
}
function fitPhotoViewer(){
  var viewer=el('photoViewer');if(!viewer.open)return;
  var viewport=window.visualViewport;
  if(viewport && viewport.scale>1)return; // Preserve deliberate pinch zoom.
  viewer.style.setProperty('--viewer-height',Math.floor(viewport?viewport.height:window.innerHeight)+'px');
  viewer.style.setProperty('--viewer-width',Math.floor(viewport?viewport.width:window.innerWidth)+'px');
}
window.addEventListener('resize',fitPhotoViewer);
if(window.visualViewport)window.visualViewport.addEventListener('resize',fitPhotoViewer);
function openViewer(index){if(!currentProperty||!currentProperty.photos.length)return;var thumbs=el('photoThumbs');if(!thumbs.childNodes.length)currentProperty.photos.forEach(function(photo,i){var button=make('button');button.type='button';button.setAttribute('aria-label','ดูรูปภาพ '+(i+1));button.appendChild(image(photo,180,true));button.onclick=function(){activatePhoto(i);};thumbs.appendChild(button);});el('photoViewer').showModal();fitPhotoViewer();activatePhoto(index);}
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
