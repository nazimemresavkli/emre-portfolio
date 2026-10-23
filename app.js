(function(){
  'use strict';
  var CFG=window.SITE_CONFIG||{}, DEF=window.DEFAULT_CONTENT, CAT=window.TECH_CATALOG;
  var root=document.documentElement;
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var hasGsap=typeof gsap!=='undefined' && typeof ScrollTrigger!=='undefined';
  var animated=hasGsap && !reduced;
  var loader=document.querySelector('.loader');

  /* ================= UI strings ================= */
  var T={
    tr:{
      _title:'Emre Şavklı — Flutter ve Full-Stack Geliştirici',
      _desc:'10 yılı aşkın yazılım deneyimine sahip serbest Flutter ve full-stack geliştirici: platformlar arası mobil uygulamalar, web panelleri, kurumsal çözümler ve arkalarındaki backend\'ler; SEO ve GEO.',
      loader:'Portfolyo 2026', nav_work:'İşler', nav_services:'Hizmetler', nav_exp:'Deneyim', nav_talk:'Konuşalım',
      st_available:'Serbest ve sözleşmeli işlere açık', st_limited:'Sınırlı müsaitlik', st_busy:'Şu an bir projedeyim', from:function(d){ return d+' itibarıyla müsait'; },
      rr_label:'Flutter ve Full-Stack Geliştirici',
      roles:['Mobil uygulamalar','Web panelleri','Backend ve API\'ler','Kurumsal çözümler','Uçtan uca MVP','SEO ve GEO'], trust1:'10+ yıl yazılım deneyimi', ft_role:'Flutter ve Full-Stack Geliştirici', city:'İstanbul',
      cta_work:'İşlerimi gör', cta_start:'Proje başlat', chip1:'Yayın onaylandı', chip2:'Ücretsiz deneme başladı', chip2s:'Yıllık plan',
      about_k:'Hakkımda',
      st1:'Yıllık ürün geliştirme ve yayın deneyimi', st2u:'yıl', st2:'2006\'dan beri yazılım eğitmenliği', st3:'Kendi yayındaki uygulamalarımda desteklenen dil', st4:'Farabi BES üzerinden yapılan haftalık yoklama',
      work_h:'Seçili<br>işler', work_note:'Yayındaki ürünler ve konsept çalışmalar: mobil uygulama, web paneli ve arkalarındaki backend.', also_h:'Ayrıca geliştirdiklerim', also_p:'Yayındaki diğer işlerim', q_h:'Birlikte<br>çalıştıklarım',
      langs:'dil', cursor:'Keşfet', views:'Görünüm seç',
      stk_h:'Bir ürünün<br>tüm katmanları', stk_p:'Ekrandan veritabanına, ödemeden arama görünürlüğüne kadar her katmanda çalışıyorum. Bir teknolojiye dokunun; hangi projelerde kullandığımı görün.',
      stk_used:'Nerede kullandım', stk_hint:'Bir teknolojiye dokunun',
      used:function(n,t){ return n? t+' projenin '+n+' tanesinde kullanıldı' : 'Bu projelerin dışındaki işlerimde'; }, process:'Çalışma biçimimin parçası',
      svc_h:'Neler<br>yapıyorum', svc_p:'Tüm ürünü anlayan tek bir geliştiriciyle çalışırsınız. El değiştirme azalır, uygulama ile backend arasında hiçbir şey kaybolmaz.',
      sv1:'Mobil uygulamalar', sv1d:'Tek Flutter kod tabanından, yerel kalitede iOS ve Android uygulamaları; yayına çıkmak ve büyümek için geliştirilmiş.',
      sv2:'Web geliştirme', sv2d:'Next.js, React ve TypeScript ile hızlı, duyarlı tanıtım siteleri ve web uygulamaları.',
      sv3:'Kurumsal çözümler', sv3d:'Şirket içi süreçleri dijitalleştiren sistemler: onay akışları, raporlama, rol bazlı erişim ve mevcut yazılımlarla entegrasyon.',
      sv4:'Yönetim panelleri', sv4d:'İçeriği, kullanıcıları ve siparişleri kod yazmadan yönettiğiniz paneller. Bu sitenin içeriği de böyle bir panelden yönetiliyor.',
      sv5:'Backend ve API\'ler', sv5d:'Kimlik doğrulama, ödemeler ve gerçek zamanlı veri içeren Supabase, Go ve PostgreSQL backend\'leri.',
      sv6:'Ödemeler ve yayın', sv6d:'Uygulama içi abonelikler, ödeme entegrasyonları ve App Store ile Google Play yayın süreci.',
      sv7:'Yapay zekâ özellikleri', sv7d:'Ürünün içinde yapay zekâ destekli analizler ve asistanlar; maliyetler ve hata durumları düşünülerek.',
      sv8:'SEO ve GEO', sv8d:'Google\'da ve ChatGPT, Gemini, Perplexity gibi yapay zekâ asistanlarında bulunur olmak için teknik SEO, yapılandırılmış veri ve içerik yapısı.',
      sv9:'Uçtan uca ürün', sv9d:'Tüm geliştirme için tek iş ortağı: mimari, mobil, web, backend ve mağaza yayını. MVP\'sini yayına çıkarması gereken kurucular için ideal.',
      t_arch:'Mimari', t_release:'Mağaza yayını',
      t_prompt:'Prompt tasarımı', t_admin:'İçerik yönetimi', t_roles:'Roller ve yetkiler', t_integr:'Entegrasyonlar', t_reports:'Raporlama', t_schema:'Yapılandırılmış veri', t_speed:'Hız optimizasyonu',
      proc_h:'Nasıl<br>çalışırım', proc_p:'Keşiften yayına net bir süreç ve ürün yayına çıktıktan sonra da destek.',
      p1:'Keşif', p1d:'Tek satır kod yazılmadan önce sorun, kullanıcılar ve kapsam üzerinde anlaşırız.',
      p2:'Tasarım', p2d:'Temiz mimari ve net bir arayüz; böylece ürün sonradan kolayca değiştirilebilir.',
      p3:'Geliştirme', p3d:'İncelenmiş, istikrarlı ilerleme ve düzenli olarak deneyebileceğiniz çalışan sürümler.',
      p4:'Yayın', p4d:'Güvenlik incelemesi, mağazaya gönderim ve yayın; ardından ürün yayındayken destek.',
      exp_h:'Deneyim',
      x1y:'2016 — bugün', x1r:'Serbest Mobil ve Full-Stack Geliştirici', x1o:'Uzaktan', x1d:'İşletmeler için mobil ve web uygulamalarını, panellerini ve backend\'lerini tasarlıyor, geliştiriyor ve yayına alıyorum.',
      x2y:'2008 — bugün', x2r:'Bilişim Teknolojileri Öğretmeni', x2o:'Mesleki ve Teknik Anadolu Lisesi', x2d:'Yazılım geliştirme, web ve veritabanı dersleri veriyor; okulun bugün kullandığı Farabi BES dahil gerçek projelerde öğrencilere mentorluk yapıyorum.',
      x3r:'Yazılım Geliştirici', x3d:'Backend (SQL) ve frontend tarafında web ve yazılım projeleri geliştirdim, bakımlarını yaptım.',
      x4y:'2006 — bugün', x4r:'Yazılım Eğitmeni', x4o:'Bemar Kariyer Okulu ve diğer kurumlar', x4d:'Android (Java ve Kotlin), Flutter, web teknolojileri ve veritabanları üzerine uygulamalı eğitimler.',
      c_k:'İletişim', c_l1:'Birlikte', c_l2:'çalışalım.',
      copy:'E-postayı kopyala', copied:'Kopyalandı', orb:'Proje<br>başlat',
      ft_time:'Yerel saat', ft_mail:'E-posta', ft_social:'Sosyal',
      /* brief */
      br_h:'Projenizi<br>anlatın.', br_p:'Birkaç seçim ve kısa bir not yeterli. Detayları ilk görüşmede birlikte netleştiririz.',
      br_busy:function(d){ return 'Şu an bir projedeyim'+(d?'; '+d+' itibarıyla yeni işe başlayabilirim.':'. Yine de yazın, uygun olduğumda ilk size dönerim.'); },
      br_alt:'Form yerine e-posta mı?', close:'Kapat',
      bf_type:'Ne geliştiriyoruz?', bf_budget:'Tahmini bütçe', bf_time:'Ne zaman başlamalı?',
      o_type:['Mobil uygulama','Web uygulaması','Kurumsal sistem','Yönetim paneli','SEO ve GEO','Yapay zekâ özelliği','Henüz emin değilim'],
      o_budget:['$3K altı','$3K – 10K','$10K – 25K','$25K üzeri','Henüz bilmiyorum'],
      o_time:['Hemen','1–3 ay içinde','Esnek'],
      bf_name:'Adınız', bf_email:'E-posta', bf_company:'Şirket (isteğe bağlı)', bf_msg:'Proje hakkında',
      bf_msg_ph:'Ne yapmak istiyorsunuz, kimler kullanacak, şu an nerede takıldınız?',
      bf_send:'Gönder', bf_send_mail:'E-posta ile gönder', bf_sending:'Gönderiliyor…',
      e_name:'Adınızı yazın.', e_email:'Geçerli bir e-posta adresi yazın.', e_msg:'Projeyi birkaç cümleyle anlatın.',
      e_send:function(m){ return 'Mesaj gönderilemedi. Doğrudan '+m+' adresine yazabilirsiniz.'; },
      bd_h:'Teşekkürler, mesajınız ulaştı.', bd_p:'En kısa sürede e-posta ile dönüş yapacağım.',
      bd_h_mail:'E-posta uygulamanız açıldı.', bd_p_mail:'Hazırlanan mesajı gönderdiğinizde bana ulaşacak.',
      bd_close:'Siteye dön', subj:'Yeni proje'
    },
    en:{
      _title:'Emre Şavklı — Flutter & Full-Stack Developer',
      _desc:'Freelance Flutter and full-stack developer with 10+ years in software: cross-platform mobile apps, web panels, business systems and the backends behind them, plus SEO and GEO.',
      loader:'Portfolio 2026', nav_work:'Work', nav_services:'Services', nav_exp:'Experience', nav_talk:'Let\'s talk',
      st_available:'Open to freelance and contract work', st_limited:'Limited availability', st_busy:'Currently on a project', from:function(d){ return 'Available from '+d; },
      rr_label:'Flutter & Full-Stack Developer',
      roles:['Mobile apps','Web panels','Backends & APIs','Business systems','End-to-end MVPs','SEO & GEO'], trust1:'10+ years in software', ft_role:'Flutter & Full-Stack Developer', city:'Istanbul',
      cta_work:'View my work', cta_start:'Start a project', chip1:'Release approved', chip2:'Free trial started', chip2s:'Yearly plan',
      about_k:'About',
      st1:'Years building and shipping products', st2u:'yrs', st2:'Teaching software development since 2006', st3:'Languages supported in my own published apps', st4:'Attendance checks a week running through Farabi BES',
      work_h:'Selected<br>work', work_note:'Shipped products and concept work: the mobile app, the web panel and the backend behind them.', also_h:'Also built', also_p:'More shipped work', q_h:'Kind<br>words',
      langs:'languages', cursor:'Explore', views:'Choose view',
      stk_h:'Every layer<br>of a product', stk_p:'I work on every layer, from the screen to the database and from payments to search visibility. Tap a technology to see where I used it.',
      stk_used:'Where I used it', stk_hint:'Tap a technology',
      used:function(n,t){ return n? 'Used in '+n+' of '+t+' projects' : 'Used in work outside these projects'; }, process:'Part of how I work',
      svc_h:'What I<br>build', svc_p:'You work with one developer who understands the whole product, so there are fewer handoffs and nothing gets lost between the app and the backend.',
      sv1:'Mobile apps', sv1d:'Native-quality iOS and Android apps from a single Flutter codebase, built to ship and scale.',
      sv2:'Web development', sv2d:'Fast, responsive marketing sites and web applications in Next.js, React and TypeScript.',
      sv3:'Business systems', sv3d:'Systems that digitise internal processes: approval flows, reporting, role-based access and integration with the software you already use.',
      sv4:'Admin panels', sv4d:'Panels where you manage content, users and orders without code. This site\'s content is managed from one too.',
      sv5:'Backends & APIs', sv5d:'Supabase, Go and PostgreSQL backends with authentication, payments and real-time data.',
      sv6:'Payments & release', sv6d:'In-app subscriptions, payment integrations and the App Store and Google Play release process.',
      sv7:'AI features', sv7d:'AI-powered analysis and assistants inside the product, with costs and failure cases handled.',
      sv8:'SEO & GEO', sv8d:'Technical SEO, structured data and content structure so you can be found on Google and in AI assistants like ChatGPT, Gemini and Perplexity.',
      sv9:'Full product, end to end', sv9d:'One partner for the whole build: architecture, mobile, web, backend and store release. Ideal for founders who need an MVP shipped.',
      t_arch:'Architecture', t_release:'Store release',
      t_prompt:'Prompt design', t_admin:'Content management', t_roles:'Roles & permissions', t_integr:'Integrations', t_reports:'Reporting', t_schema:'Structured data', t_speed:'Speed optimisation',
      proc_h:'How I<br>work', proc_p:'A clear process from discovery to release, and support once the product is live.',
      p1:'Discovery', p1d:'We agree on the problem, the users and the scope before any code.',
      p2:'Design', p2d:'Clean architecture and a clear UI, so the product is easy to change later.',
      p3:'Build', p3d:'Steady, reviewed progress with regular working builds you can try.',
      p4:'Ship', p4d:'Security review, store submission and release, then support once it\'s live.',
      exp_h:'Experience',
      x1y:'2016 — now', x1r:'Freelance Mobile & Full-Stack Developer', x1o:'Remote', x1d:'Design, build and ship mobile and web applications, their panels and backends for businesses.',
      x2y:'2008 — now', x2r:'Information Technology Teacher', x2o:'Vocational & Technical Anatolian High School', x2d:'Teach software development, web and databases, and mentor students through real projects, including the Farabi BES platform the school runs on.',
      x3r:'Software Developer', x3d:'Built and maintained web and software projects across backend (SQL) and frontend.',
      x4y:'2006 — now', x4r:'Software Instructor', x4o:'Bemar Career School and other institutions', x4d:'Hands-on training in Android (Java and Kotlin), Flutter, web technologies and databases.',
      c_k:'Contact', c_l1:'Let\'s work', c_l2:'together.',
      copy:'Copy email', copied:'Copied', orb:'Start a<br>project',
      ft_time:'Local time', ft_mail:'Email', ft_social:'Social',
      br_h:'Tell me about<br>your project.', br_p:'A few choices and a short note are enough. We\'ll work out the details together on the first call.',
      br_busy:function(d){ return 'I\'m currently on a project'+(d?'; I can start new work from '+d+'.':'. Write anyway and you\'ll be first in line when I\'m free.'); },
      br_alt:'Prefer email?', close:'Close',
      bf_type:'What are we building?', bf_budget:'Estimated budget', bf_time:'When should it start?',
      o_type:['Mobile app','Web application','Business system','Admin panel','SEO & GEO','AI feature','Not sure yet'],
      o_budget:['Under $3K','$3K – 10K','$10K – 25K','Over $25K','Not sure yet'],
      o_time:['Right away','In 1–3 months','Flexible'],
      bf_name:'Your name', bf_email:'Email', bf_company:'Company (optional)', bf_msg:'About the project',
      bf_msg_ph:'What do you want to build, who will use it, and where are you stuck?',
      bf_send:'Send', bf_send_mail:'Send by email', bf_sending:'Sending…',
      e_name:'Enter your name.', e_email:'Enter a valid email address.', e_msg:'Describe the project in a few sentences.',
      e_send:function(m){ return 'The message could not be sent. You can write to '+m+' directly.'; },
      bd_h:'Thanks, your message arrived.', bd_p:'I\'ll reply by email as soon as I can.',
      bd_h_mail:'Your email app is open.', bd_p_mail:'Send the prepared message and it will reach me.',
      bd_close:'Back to the site', subj:'New project'
    }
  };

  /* ================= helpers ================= */
  var lang='tr';
  try{ var saved=localStorage.getItem('lang'); if(saved==='en'||saved==='tr') lang=saved; }catch(e){}
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function L(o){ if(o==null) return ''; if(typeof o==='string') return o; return o[lang]||o.tr||o.en||''; }
  function rich(s){ return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'); }
  function U(k){ return T[lang][k]; }
  function safeUrl(u){ u=String(u||'').trim(); if(/^(https:\/\/|data:image\/)/i.test(u)) return u; return /^[a-z0-9_\-\/]+\.(webp|png|jpe?g|gif|avif)$/i.test(u)&&u.indexOf('//')<0?u:''; }
  function merge(d){
    if(!d||typeof d!=='object') return DEF;
    return {
      settings:Object.assign({},DEF.settings,d.settings||{}),
      texts:Object.assign({},DEF.texts,d.texts||{}),
      projects:Array.isArray(d.projects)?d.projects:DEF.projects,
      testimonials:Array.isArray(d.testimonials)?d.testimonials:(DEF.testimonials||[]),
      services:Array.isArray(d.services)&&d.services.length?d.services:null,
      seo:d.seo&&typeof d.seo==='object'?d.seo:null
    };
  }
  var C=DEF;

  function sbBase(){ return String(CFG.supabaseUrl||'').replace(/\/$/,''); }
  function loadContent(){
    return new Promise(function(resolve){
      if(!CFG.supabaseUrl||!CFG.supabaseAnonKey){
        try{ var d=localStorage.getItem('demo_content'); if(d){ resolve(merge(JSON.parse(d))); return; } }catch(e){}
        resolve(DEF); return;
      }
      var done=false, finish=function(d){ if(done) return; done=true; clearTimeout(to); resolve(d); }, to=setTimeout(function(){ finish(DEF); },2500);
      var opt={headers:{apikey:CFG.supabaseAnonKey,Authorization:'Bearer '+CFG.supabaseAnonKey},cache:'no-store'}, json=function(r){ return r.ok?r.json():null; };
      /* CMS tables (site_payload) first; the legacy single-row blob only if the CMS migration isn't installed */
      fetch(sbBase()+'/rest/v1/rpc/site_payload',opt).then(json)
        .then(function(p){
          if(p && Array.isArray(p.projects)) return merge(p);
          return fetch(sbBase()+'/rest/v1/site_content?id=eq.1&select=data',opt).then(json).then(function(rows){ return rows&&rows[0]&&rows[0].data?merge(rows[0].data):DEF; });
        })
        .then(finish).catch(function(){ finish(DEF); });
    });
  }

  /* ================= split helpers ================= */
  function splitChars(el){
    var words=el.textContent.trim().split(/\s+/); el.textContent='';
    words.forEach(function(w,wi){
      var ws=document.createElement('span'); ws.className='word';
      for(var i=0;i<w.length;i++){ var c=document.createElement('span'); c.className='char'; c.textContent=w[i]; ws.appendChild(c); }
      el.appendChild(ws);
      if(wi<words.length-1) el.appendChild(document.createTextNode(' '));
    });
  }
  function splitWords(el){
    var words=el.textContent.trim().split(/\s+/); el.textContent='';
    words.forEach(function(w,i){ var s=document.createElement('span'); s.className='w'; s.textContent=w; el.appendChild(s); if(i<words.length-1) el.appendChild(document.createTextNode(' ')); });
  }
  function paintGrad(){ document.querySelectorAll('.grad').forEach(function(g){
    var gr=g.getBoundingClientRect(), w=gr.width||1;
    g.querySelectorAll('.char').forEach(function(c){ var r=c.getBoundingClientRect(); c.style.backgroundSize=w+'px 100%'; c.style.backgroundPosition=(gr.left-r.left)+'px 0'; });
  }); }

  /* ================= status ================= */
  var clockTime='';
  function renderStatus(){
    var s=C.settings, st=(s.status==='busy'||s.status==='limited')?s.status:'available', from=L(s.availableFrom);
    document.querySelectorAll('.status-cap').forEach(function(cap){
      cap.setAttribute('data-state',st);
      cap.querySelector('.st-text').textContent=U('st_'+st);
      cap.querySelector('.cap-time').textContent=(st!=='available'&&from)?U('from')(from):(U('city')+' '+clockTime);
    });
    var note=document.getElementById('briefBusy');
    if(note){ if(st==='busy'){ note.hidden=false; note.textContent=U('br_busy')(from); } else note.hidden=true; }
  }
  function tick(){
    try{ clockTime=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Istanbul'}).format(new Date()); }catch(e){ clockTime=''; }
    var ck=document.getElementById('clock'); if(ck) ck.textContent=clockTime+', '+U('city');
    renderStatus();
  }

  /* ================= rolling roles ================= */
  var rrIndex=0;
  function buildRoles(){
    var l=document.getElementById('rrList'); if(!l) return;
    var r=U('roles'); l.innerHTML=r.concat([r[0]]).map(function(x){ return '<span>'+esc(x)+'</span>'; }).join('');
    rrIndex=0; l.style.transition='none'; l.style.transform='translateY(0)';
  }
  function rollRoles(){
    var l=document.getElementById('rrList'); if(!l) return;
    var n=U('roles').length; rrIndex++;
    l.style.transition='transform .9s cubic-bezier(.16,1,.3,1)'; l.style.transform='translateY('+(-rrIndex*1.15)+'em)';
    if(rrIndex===n){ setTimeout(function(){ l.style.transition='none'; rrIndex=0; l.style.transform='translateY(0)'; },950); }
  }
  if(!reduced) setInterval(rollRoles,2600);

  /* ================= cases ================= */
  function visibleProjects(){ return (C.projects||[]).filter(function(p){ return p && p.visible!==false; }); }
  function titleHtml(name){ var n=esc(name).trim(), i=n.indexOf(' '); return i>0? n.slice(0,i)+'<br>'+n.slice(i+1) : n; }
  /* several "scene" images → one stage with a view switcher; picked view survives re-renders (language switch) */
  var sceneSel={};
  function scenesOf(media){ return media.filter(function(m){ return m && m.frame==='scene' && safeUrl(m.url); }); }
  function sceneIndex(id,scenes){
    var i=sceneSel[id]; if(i>=0 && i<scenes.length) return i;
    for(var k=0;k<scenes.length;k++) if(scenes[k].active) return k;
    return 0;
  }
  function mediaHtml(media,id){
    var scenes=scenesOf(media);
    if(scenes.length===1) return '<div class="tilt media-scene"><img src="'+esc(safeUrl(scenes[0].url))+'" alt="" loading="lazy" decoding="async"></div>';
    if(scenes.length>1){
      var on=sceneIndex(id,scenes);
      return '<div class="tilt media-scene multi" aria-hidden="true">'+scenes.map(function(m,i){ return '<img src="'+esc(safeUrl(m.url))+'" alt="" loading="lazy" decoding="async"'+(i===on?' class="on"':'')+'>'; }).join('')+'</div>'+
        '<div class="scene-tabs" role="group" aria-label="'+esc(U('views'))+'">'+scenes.map(function(m,i){ return '<button type="button" data-scene="'+i+'" data-cursor="link" aria-pressed="'+(i===on)+'">'+esc(L(m.label)||String(i+1))+'</button>'; }).join('')+'</div>';
    }
    var browsers=media.filter(function(m){ return m.frame==='browser' && safeUrl(m.url); });
    var phones=media.filter(function(m){ return m.frame!=='browser' && m.frame!=='scene' && safeUrl(m.url); });
    if(!browsers.length && !phones.length) return '';
    var ph=function(m){ return '<div class="phone"><div class="scr shot-scr"><img src="'+esc(safeUrl(m.url))+'" alt="" loading="lazy" decoding="async"></div></div>'; };
    var br=function(m){ return '<div class="browser shot"><div class="bbar"><i></i><i></i><i></i><span></span></div><img src="'+esc(safeUrl(m.url))+'" alt="" loading="lazy" decoding="async"></div>'; };
    if(browsers.length && phones.length) return '<div class="tilt media-mixed">'+br(browsers[0])+ph(phones[0])+'</div>';
    if(browsers.length) return '<div class="tilt media-browser">'+br(browsers[0])+'</div>';
    return '<div class="tilt media-phones">'+phones.slice(0,2).map(ph).join('')+'</div>';
  }
  function stageHtml(p){
    var m=Array.isArray(p.media)?mediaHtml(p.media,p.id):'';
    if(m) return m;
    var tpl=p.mock && document.getElementById('mock-'+p.mock);
    if(tpl) return tpl.innerHTML;
    var initials=L(p.name).split(/\s+/).map(function(w){ return w[0]||''; }).join('').slice(0,2).toUpperCase();
    return '<div class="tilt mono-mark"><span>'+esc(initials)+'</span></div>';
  }
  function renderCases(){
    var wrap=document.getElementById('cases'); if(!wrap) return;
    var list=visibleProjects().filter(function(p){ return p.featured!==false; }), total=list.length, pad=function(n){ return (n<10?'0':'')+n; };
    wrap.innerHTML=list.map(function(p,i){
      var th=CAT.themes[p.theme]||CAT.themes.cobalt;
      var tags=(p.tags&&(p.tags[lang]||p.tags.tr))||[];
      var facts=(p.facts||[]).filter(function(f){ return f && L(f.v).trim(); }).slice(0,3);
      var stage=stageHtml(p), hasTabs=stage.indexOf('scene-tabs')>-1;
      return '<article class="case'+(th.dark?' is-dark':'')+'" id="case-'+esc(p.id)+'" data-cursor="case" style="--cbg:'+th.bg+';--cfg:'+th.fg+';--cglow:'+th.glow+'">'+
        '<div class="case-info">'+
          '<div class="case-top"><span class="ct-left"><span class="case-idx">'+pad(i+1)+' / '+pad(total)+'</span>'+badgeHtml(p)+'</span><span>'+esc(L(p.cat))+'</span></div>'+
          '<h3>'+titleHtml(L(p.name))+'</h3>'+
          '<p class="case-desc">'+esc(L(p.desc))+'</p>'+
          (tags.length?'<div class="case-tags">'+tags.map(function(t){ return '<span>'+esc(t)+'</span>'; }).join('')+'</div>':'')+
          (facts.length?'<div class="case-facts">'+facts.map(function(f){ return '<div><small>'+esc(L(f.l))+'</small><b>'+esc(L(f.v))+'</b></div>'; }).join('')+'</div>':'')+
        '</div>'+
        '<div class="case-stage"'+(hasTabs?'':' aria-hidden="true"')+'>'+stage+'</div>'+
      '</article>';
    }).join('');
    wrap.querySelectorAll('[data-i18n]').forEach(function(el){ var v=U(el.dataset.i18n); if(typeof v==='string') el.textContent=v; });
    var c=document.getElementById('workCount'); if(c) c.textContent='('+pad(total)+')';
    renderAlso();
  }

  function badgeHtml(p){
    var b=p.badge && CAT.badges && CAT.badges[p.badge]; if(!b) return '';
    return '<span class="case-badge '+esc(p.badge)+'">'+esc(L(b))+'</span>';
  }
  function renderAlso(){
    var box=document.getElementById('also'), list=document.getElementById('alsoList'); if(!box) return;
    var items=visibleProjects().filter(function(p){ return p.featured===false; });
    box.hidden=!items.length;
    list.innerHTML=items.map(function(p){
      var th=CAT.themes[p.theme]||CAT.themes.cobalt, tags=(p.tags&&(p.tags[lang]||p.tags.tr))||[];
      var ini=L(p.name).split(/\s+/).map(function(w){ return w[0]||''; }).join('').slice(0,2).toUpperCase();
      return '<article class="also-item" id="case-'+esc(p.id)+'"><span class="also-sw" style="background:'+th.bg+';color:'+th.fg+'">'+esc(ini)+'</span><div><b>'+esc(L(p.name))+'</b><small>'+esc(L(p.cat))+(p.badge&&CAT.badges[p.badge]?' · '+esc(L(CAT.badges[p.badge])):'')+'</small>'+(L(p.desc)?'<p>'+esc(L(p.desc))+'</p>':'')+(tags.length?'<div class="also-tags">'+tags.map(function(t){ return '<span>'+esc(t)+'</span>'; }).join('')+'</div>':'')+'</div></article>';
    }).join('');
  }
  function renderQuotes(){
    var sec=document.getElementById('quotes'), grid=document.getElementById('quoteGrid'); if(!sec) return;
    var q=(C.testimonials||[]).filter(function(t){ return t && L(t.quote).trim(); });
    sec.hidden=!q.length;
    grid.innerHTML=q.map(function(t){
      var meta=[L(t.role),t.company].filter(Boolean).join(', ');
      return '<figure class="quote"><blockquote>'+esc(L(t.quote))+'</blockquote><figcaption><b>'+esc(t.name||'')+'</b>'+esc(meta)+'</figcaption></figure>';
    }).join('');
  }

  /* ================= stack map ================= */
  var activeTech='flutter';
  function techName(t){ return typeof t.name==='string'?t.name:L(t.name); }
  function renderStack(){
    var layersEl=document.getElementById('layers'), tilesEl=document.getElementById('useTiles'); if(!layersEl) return;
    layersEl.innerHTML=CAT.layers.map(function(ly,i){
      var chips=CAT.tech.filter(function(t){ return t.layer===ly.id; }).map(function(t){
        return '<button type="button" class="tech" data-tech="'+t.id+'" data-cursor="link" aria-pressed="false"><i></i>'+esc(techName(t))+'</button>';
      }).join('');
      return '<div class="layer-row" style="--lc:'+ly.color+'" data-layer="'+ly.id+'"><div class="lr-label"><span class="lr-n">0'+(i+1)+'</span><b>'+esc(L(ly.name))+'</b></div><div class="lr-chips">'+chips+'</div></div>';
    }).join('');
    tilesEl.innerHTML=visibleProjects().map(function(p){
      var th=CAT.themes[p.theme]||CAT.themes.cobalt;
      return '<a class="ut" href="#case-'+esc(p.id)+'" data-p="'+esc(p.id)+'" data-cursor="link"><span class="ut-sw" style="background:'+th.bg+'"></span><b>'+esc(L(p.name))+'</b><small>'+esc(L(p.cat))+'</small></a>';
    }).join('');
    showTech(activeTech,true);
  }
  function showTech(id,instant){
    var t=CAT.tech.find(function(x){ return x.id===id; }); if(!t) return;
    var ly=CAT.layers.find(function(l){ return l.id===t.layer; });
    var proc=!!(ly&&ly.process), list=visibleProjects(), users=proc?[]:list.filter(function(p){ return (p.tech||[]).indexOf(id)>-1; }).map(function(p){ return p.id; });
    var panel=document.querySelector('.usage');
    panel.style.setProperty('--lc',ly?ly.color:'#fff');
    var nameEl=document.getElementById('useName'), descEl=document.getElementById('useDesc'), cntEl=document.getElementById('useCount');
    var apply=function(){ nameEl.textContent=techName(t); descEl.textContent=L(t.d); cntEl.textContent=proc?U('process'):U('used')(users.length,list.length); };
    if(animated && !instant){ gsap.timeline().to([nameEl,descEl],{y:-10,opacity:0,duration:.18,ease:'power2.in',onComplete:apply}).to([nameEl,descEl],{y:0,opacity:1,duration:.45,ease:'expo.out'}); }
    else apply();
    document.querySelectorAll('.ut').forEach(function(u){ var on=users.indexOf(u.dataset.p)>-1; u.classList.toggle('on',on); u.classList.toggle('off',!proc && !on); });
    document.querySelectorAll('.tech').forEach(function(b){ b.classList.toggle('preview',b.dataset.tech===id); });
  }
  function bindStack(){
    var layersEl=document.getElementById('layers'); if(!layersEl) return;
    var hoverId=null;
    layersEl.addEventListener('mouseover',function(e){ var b=e.target.closest('.tech'); if(b && b.dataset.tech!==hoverId){ hoverId=b.dataset.tech; showTech(hoverId); } });
    layersEl.addEventListener('mouseleave',function(){ if(hoverId && hoverId!==activeTech){ hoverId=null; showTech(activeTech); } hoverId=null; });
    layersEl.addEventListener('click',function(e){ var b=e.target.closest('.tech'); if(!b) return; activeTech=b.dataset.tech; hoverId=activeTech; markActive(); showTech(activeTech); });
    layersEl.addEventListener('focusin',function(e){ var b=e.target.closest('.tech'); if(b){ showTech(b.dataset.tech); } });
    markActive();
  }
  function markActive(){ document.querySelectorAll('.tech').forEach(function(b){ var on=b.dataset.tech===activeTech; b.classList.toggle('active',on); b.setAttribute('aria-pressed',on?'true':'false'); }); }

  /* ================= services & socials (from the CMS; static markup stays when absent) ================= */
  function renderServices(){
    var wrap=document.querySelector('.svc'), list=C.services; if(!wrap || !list) return;
    /* rows are built once, before the .rv reveal tweens bind; later calls (language switch) only swap texts */
    if(wrap.dataset.n!==String(list.length)){
      wrap.innerHTML=list.map(function(s,i){ return '<div class="svc-row rv"><span class="svc-n">'+(i<9?'0':'')+(i+1)+'</span><span class="svc-t"></span><div class="svc-d"><span class="svc-dt"></span><div class="svc-tags"></div></div></div>'; }).join('');
      wrap.dataset.n=String(list.length);
    }
    wrap.querySelectorAll('.svc-row').forEach(function(row,i){
      var s=list[i]||{};
      row.querySelector('.svc-t').textContent=L(s.title);
      row.querySelector('.svc-dt').textContent=L(s.desc);
      row.querySelector('.svc-tags').innerHTML=(s.tags||[]).map(function(t){ return '<span>'+esc(L(t))+'</span>'; }).join('');
    });
  }
  var SOCIALS={linkedin:'LinkedIn',github:'GitHub',x:'X',instagram:'Instagram',behance:'Behance',dribbble:'Dribbble',youtube:'YouTube',medium:'Medium'};
  function renderSocials(){
    var s=C.settings.socials||{}, extra=Object.keys(SOCIALS).filter(function(k){ return k!=='linkedin' && /^https:\/\//i.test(s[k]||''); });
    var cell=document.querySelector('.foot [data-social-cell]')||document.querySelector('.foot > a[data-linkedin]');
    if(!cell || (!extra.length && cell.tagName==='A')) return;
    var links=(safeUrl(C.settings.linkedin)?[['linkedin',C.settings.linkedin]]:[]).concat(extra.map(function(k){ return [k,s[k]]; }));
    var div=document.createElement('div'); div.setAttribute('data-social-cell','');
    div.innerHTML='<span>'+esc(U('ft_social'))+'</span>'+links.map(function(l){ return '<b><a href="'+esc(l[1])+'" target="_blank" rel="noopener" data-cursor="link"'+(l[0]==='linkedin'?' data-linkedin':'')+'>'+SOCIALS[l[0]]+' ↗</a></b>'; }).join('');
    cell.replaceWith(div);
  }

  /* ================= texts & i18n ================= */
  function applyLang(){
    var d=T[lang];
    root.lang=lang;
    var seo=C.seo||{};
    document.title=L(seo.title)||d._title;
    var md=document.querySelector('meta[name="description"]'); if(md) md.setAttribute('content',L(seo.description)||d._desc);
    document.querySelectorAll('[data-i18n]').forEach(function(el){ var v=d[el.dataset.i18n]; if(typeof v==='string') el.textContent=v; });
    document.querySelectorAll('[data-i18n-html]').forEach(function(el){ var v=d[el.dataset.i18nHtml]; if(typeof v==='string') el.innerHTML=v; });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el){ var v=d[el.dataset.i18nPh]; if(typeof v==='string') el.setAttribute('placeholder',v); });
    document.querySelectorAll('[data-i18n-roll]').forEach(function(el){ var v=d[el.dataset.i18nRoll]; el.textContent=v; el.setAttribute('data-t',v); });
    document.querySelectorAll('[data-i18n-split]').forEach(function(el){ el.textContent=d[el.dataset.i18nSplit]; if(animated) splitChars(el); });
    var hl=document.querySelector('[data-c="hero_lede"]'); if(hl) hl.innerHTML=rich(L(C.texts.hero_lede));
    var cl=document.querySelector('[data-c="c_lede"]'); if(cl) cl.textContent=L(C.texts.c_lede);
    var am=document.querySelector('[data-c="about_more"]'); if(am){ am.textContent=L(C.texts.about_more); am.hidden=!am.textContent; }
    renderQuotes();
    var st=document.getElementById('statement'); if(st){ st.textContent=L(C.texts.statement); if(animated) splitWords(st); }
    document.querySelectorAll('.lang button').forEach(function(b){ b.setAttribute('aria-pressed',b.dataset.lang===lang?'true':'false'); });
    var lg=document.querySelector('.lang'); if(lg) lg.classList.toggle('en',lang==='en');
    document.querySelectorAll('a[data-mail]').forEach(function(a){ a.href='mailto:'+C.settings.email; if(a.dataset.mail==='text') a.textContent=C.settings.email; });
    document.querySelectorAll('[data-copy]').forEach(function(b){ b.dataset.copy=C.settings.email; });
    var li=document.querySelector('a[data-linkedin]'); if(li && safeUrl(C.settings.linkedin)) li.href=C.settings.linkedin;
    renderServices(); renderSocials();
    buildRoles(); renderCases(); renderStack(); markActive(); buildBriefChips(); tick();
    if(animated) paintGrad();
  }

  /* ================= header ================= */
  var head=document.querySelector('.head'), prog=document.querySelector('.lm-prog'), lastY=0, CIRC=2*Math.PI*18;
  if(prog){ prog.style.strokeDasharray=CIRC; prog.style.strokeDashoffset=CIRC; }
  function onScroll(){
    var y=window.scrollY||0, max=(document.documentElement.scrollHeight-innerHeight)||1;
    head.classList.toggle('floating',y>90);
    if(y>innerHeight*.8 && y>lastY+4 && !head.matches(':hover') && !head.contains(document.activeElement)) head.classList.add('hide');
    else if(y<lastY-4 || y<innerHeight*.8) head.classList.remove('hide');
    lastY=y;
    if(prog) prog.style.strokeDashoffset=CIRC*(1-Math.min(1,y/max));
  }
  addEventListener('scroll',onScroll,{passive:true});

  /* ================= copy ================= */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var done=function(){ b.textContent=U('copied'); setTimeout(function(){ b.textContent=U('copy'); },1800); };
      if(navigator.clipboard){ navigator.clipboard.writeText(b.dataset.copy).then(done,function(){}); }
    });
  });

  /* ================= brief (project form) ================= */
  var brief=document.getElementById('brief'), form=document.getElementById('briefForm'), lastFocus=null, lenis=null;
  var picks={type:[],budget:'',time:''};
  function buildBriefChips(){
    [['type','o_type',true],['budget','o_budget',false],['time','o_time',false]].forEach(function(g){
      var box=document.querySelector('.bf-chips[data-name="'+g[0]+'"]'); if(!box) return;
      var opts=U(g[1]);
      box.innerHTML=opts.map(function(o,i){
        var on=g[2]? picks.type.indexOf(i)>-1 : picks[g[0]]===i;
        return '<button type="button" class="bf-chip" data-i="'+i+'" aria-pressed="'+(on?'true':'false')+'">'+esc(o)+'</button>';
      }).join('');
    });
    var send=form&&form.querySelector('.bf-label'); if(send) send.textContent=C.settings.formAccessKey?U('bf_send'):U('bf_send_mail');
  }
  if(form){
    form.addEventListener('click',function(e){
      var b=e.target.closest('.bf-chip'); if(!b) return;
      var box=b.parentElement, name=box.dataset.name, i=+b.dataset.i;
      if(name==='type'){ var k=picks.type.indexOf(i); if(k>-1) picks.type.splice(k,1); else picks.type.push(i); b.setAttribute('aria-pressed',k>-1?'false':'true'); }
      else { picks[name]=picks[name]===i?'':i; box.querySelectorAll('.bf-chip').forEach(function(x){ x.setAttribute('aria-pressed',+x.dataset.i===picks[name]?'true':'false'); }); }
    });
  }
  function focusables(){ return Array.prototype.slice.call(brief.querySelectorAll('button:not([disabled]),a[href],input:not(.hp),textarea')).filter(function(el){ return el.offsetParent!==null; }); }
  function openBrief(){
    if(!brief || brief.classList.contains('open')) return;
    lastFocus=document.activeElement;
    brief.hidden=false; brief.classList.add('open'); root.classList.add('brief-open');
    if(lenis) lenis.stop();
    renderStatus();
    if(animated){
      gsap.fromTo(brief,{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',duration:.9,ease:'expo.inOut'});
      gsap.fromTo('.brief-h, .brief-intro > *:not(.brief-h), .bf-group, .bf-row, .bf-field-wide, .bf-submit',{y:40,opacity:0},{y:0,opacity:1,duration:1,ease:'expo.out',stagger:.05,delay:.35});
    }
    setTimeout(function(){ var f=brief.querySelector('.bf-chip'); if(f) f.focus({preventScroll:true}); },animated?700:0);
  }
  function closeBrief(){
    if(!brief || !brief.classList.contains('open')) return;
    var finish=function(){ brief.classList.remove('open'); brief.hidden=true; root.classList.remove('brief-open'); if(lenis) lenis.start(); if(lastFocus&&lastFocus.focus) lastFocus.focus({preventScroll:true}); resetBrief(); };
    if(animated) gsap.to(brief,{clipPath:'inset(0 0 100% 0)',duration:.75,ease:'expo.inOut',onComplete:finish}); else finish();
  }
  function resetBrief(){
    var done=document.getElementById('briefDone');
    if(done && !done.hidden){ done.hidden=true; form.hidden=false; form.reset(); picks={type:[],budget:'',time:''}; buildBriefChips(); }
  }
  document.addEventListener('click',function(e){
    var sb=e.target.closest('.scene-tabs [data-scene]');
    if(sb){
      var card=sb.closest('.case'), i=+sb.dataset.scene;
      if(card) sceneSel[card.id.replace(/^case-/,'')]=i;
      sb.parentNode.querySelectorAll('[data-scene]').forEach(function(b){ b.setAttribute('aria-pressed',String(b===sb)); });
      sb.parentNode.parentNode.querySelectorAll('.media-scene img').forEach(function(im,k){ im.classList.toggle('on',k===i); });
      return;
    }
    var o=e.target.closest('[data-open-brief]'); if(o){ e.preventDefault(); openBrief(); return; }
    if(e.target.closest('[data-close-brief]')){ e.preventDefault(); closeBrief(); }
  });
  document.addEventListener('keydown',function(e){
    if(!brief || !brief.classList.contains('open')) return;
    if(e.key==='Escape'){ closeBrief(); return; }
    if(e.key==='Tab'){
      var f=focusables(); if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  });
  function fieldError(name,msg){
    var fld=form.querySelector('[name="'+name+'"]').closest('.bf-field'), m=fld.querySelector('.bf-msg');
    fld.classList.toggle('err',!!msg); m.textContent=msg||'';
  }
  if(form){
    form.addEventListener('input',function(e){ var f=e.target.closest('.bf-field'); if(f&&f.classList.contains('err')){ f.classList.remove('err'); f.querySelector('.bf-msg').textContent=''; } });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var fd=new FormData(form), name=(fd.get('name')||'').trim(), email=(fd.get('email')||'').trim(), msg=(fd.get('message')||'').trim(), company=(fd.get('company')||'').trim();
      var ok=true;
      fieldError('name',name?'':U('e_name')); if(!name) ok=false;
      var em=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); fieldError('email',em?'':U('e_email')); if(!em) ok=false;
      fieldError('message',msg.length>=10?'':U('e_msg')); if(msg.length<10) ok=false;
      if(!ok){ var firstErr=form.querySelector('.bf-field.err input, .bf-field.err textarea'); if(firstErr) firstErr.focus(); return; }
      if(fd.get('botcheck')) return;
      var types=picks.type.map(function(i){ return U('o_type')[i]; }).join(', ');
      var budget=picks.budget!==''?U('o_budget')[picks.budget]:'';
      var time=picks.time!==''?U('o_time')[picks.time]:'';
      var lines=[
        (lang==='tr'?'Ad: ':'Name: ')+name, 'Email: '+email, company?((lang==='tr'?'Şirket: ':'Company: ')+company):'',
        types?((lang==='tr'?'Proje türü: ':'Project type: ')+types):'', budget?((lang==='tr'?'Bütçe: ':'Budget: ')+budget):'', time?((lang==='tr'?'Başlangıç: ':'Start: ')+time):'',
        '', msg
      ].filter(function(x,i){ return x!=='' || i===6; });
      var subject=U('subj')+(types?' — '+types:'')+' ('+name+')';
      var err=document.getElementById('bfError'); err.textContent='';
      var btn=form.querySelector('.bf-submit'), label=btn.querySelector('.bf-label');
      var showDone=function(viaMail){
        document.querySelector('#briefDone h3').textContent=viaMail?U('bd_h_mail'):U('bd_h');
        document.querySelector('#briefDone p').textContent=viaMail?U('bd_p_mail'):U('bd_p');
        form.hidden=true; var done=document.getElementById('briefDone'); done.hidden=false;
        if(animated) gsap.fromTo(done.children,{y:30,opacity:0},{y:0,opacity:1,duration:.9,ease:'expo.out',stagger:.08});
        var b=done.querySelector('button'); if(b) b.focus({preventScroll:true});
      };
      /* the message lands in the admin inbox (messages table) and, when a web3forms key is set, in the mailbox too */
      var saved=(CFG.supabaseUrl&&CFG.supabaseAnonKey)?fetch(sbBase()+'/rest/v1/messages',{method:'POST',headers:{apikey:CFG.supabaseAnonKey,Authorization:'Bearer '+CFG.supabaseAnonKey,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({
        name:name, email:email, company:company, project_type:types, budget:budget, start_when:time, message:msg, language:lang
      })}).then(function(r){ return r.text().then(function(){ return r.ok; }); }).catch(function(){ return false; }):Promise.resolve(false);
      btn.disabled=true; label.textContent=U('bf_sending');
      var reset=function(){ btn.disabled=false; label.textContent=U('bf_send'); };
      if(!C.settings.formAccessKey){
        saved.then(function(ok){
          reset();
          if(ok){ showDone(false); return; }
          location.href='mailto:'+C.settings.email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
          showDone(true);
        });
        return;
      }
      var mailed=fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({
        access_key:C.settings.formAccessKey, subject:subject, from_name:'Portfolio', name:name, email:email, replyto:email,
        company:company, project_type:types, budget:budget, start:time, message:msg, language:lang
      })}).then(function(r){ return r.json().catch(function(){ return {}; }); }).then(function(j){ return !!(j && j.success); }).catch(function(){ return false; });
      Promise.all([mailed,saved]).then(function(r){
        reset();
        if(r[0]||r[1]){ showDone(false); } else { err.textContent=U('e_send')(C.settings.email); }
      });
    });
  }

  /* ================= language switch ================= */
  var onLangChange=function(){};
  document.querySelectorAll('.lang button').forEach(function(b){
    b.addEventListener('click',function(){
      if(b.dataset.lang===lang) return;
      lang=b.dataset.lang;
      try{ localStorage.setItem('lang',lang); }catch(e){}
      if(animated){
        gsap.to('main',{opacity:0,duration:.25,ease:'power2.in',onComplete:function(){ applyLang(); onLangChange(); gsap.to('main',{opacity:1,duration:.5,ease:'power2.out'}); }});
      } else { applyLang(); }
    });
  });

  setInterval(tick,15000);
  document.getElementById('yr').textContent=new Date().getFullYear();

  /* ================= boot ================= */
  var contentReady=loadContent();

  if(!animated){
    if(loader) loader.style.display='none';
    root.classList.add('reduced');
    contentReady.then(function(c){ C=c; applyLang(); bindStack(); onScroll(); document.querySelectorAll('.count').forEach(function(x){ x.textContent=x.dataset.to; }); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* preloader runs while content loads */
  var count={v:0}, countEl=document.querySelector('.loader-count');
  gsap.from('.loader-name span',{yPercent:110,duration:1,ease:'expo.out'});
  gsap.set(loader,{clipPath:'inset(0 0 0% 0)'});
  gsap.to(count,{v:100,duration:1.9,ease:'power2.inOut',onUpdate:function(){ countEl.textContent=Math.round(count.v); }});
  var barDone=new Promise(function(res){ gsap.to('.loader-bar i',{scaleX:1,duration:1.9,ease:'power2.inOut',onComplete:res}); });

  contentReady.then(function(c){
    C=c;
    applyLang(); bindStack(); onScroll();
    document.querySelectorAll('.hero-name .split').forEach(splitChars);
    paintGrad();
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(paintGrad);
    addEventListener('resize',paintGrad);
    setupMotion();
    barDone.then(function(){
      gsap.timeline()
        .to('.loader-count, .loader-top, .loader-bar',{opacity:0,y:-30,duration:.5,ease:'power2.in'})
        .to(loader,{clipPath:'inset(0 0 100% 0)',duration:1.1,ease:'expo.inOut'},'-=0.1')
        .add(intro,'-=0.65')
        .set(loader,{display:'none'});
    });
  });
  setTimeout(function(){ if(loader && getComputedStyle(loader).display!=='none' && !root.classList.contains('booted')){ loader.style.display='none'; root.classList.add('reduced'); } },9000);

  function intro(){
    root.classList.add('booted');
    var tl=gsap.timeline({defaults:{ease:'expo.out'}});
    tl.to('.hero-name .char',{yPercent:0,duration:1.5,stagger:.035},0)
      .to('.head .bar',{yPercent:0,opacity:1,duration:1.2,clearProps:'transform,opacity'},.2)
      .to('.h-top',{y:0,opacity:1,duration:1.1,stagger:.15},.3)
      .to('.h-in',{y:0,opacity:1,duration:1.2,stagger:.1},.55)
      .to('.stage .layer',{y:0,opacity:1,duration:1.6,stagger:.12},.5)
      .add(function(){ if(lenis) lenis.start(); },.6);
  }

  function setupMotion(){
    /* smooth scroll */
    if(typeof Lenis!=='undefined'){
      lenis=new Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));},smoothWheel:true});
      lenis.on('scroll',ScrollTrigger.update);
      gsap.ticker.add(function(t){ lenis.raf(t*1000); });
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
      document.addEventListener('click',function(e){
        var a=e.target.closest('a[href^="#"]'); if(!a || a.hasAttribute('data-open-brief')) return;
        var id=a.getAttribute('href');
        if(id==='#top'){ e.preventDefault(); lenis.scrollTo(0,{duration:1.6}); return; }
        if(id.length>1){ var t=document.querySelector(id); if(t){ e.preventDefault(); lenis.scrollTo(t,{offset:-20,duration:1.6}); } }
      });
    }

    gsap.set('.hero-name .char',{yPercent:115});
    gsap.set('.h-top',{y:20,opacity:0});
    gsap.set('.h-in',{y:30,opacity:0});
    gsap.set('.stage .layer',{y:80,opacity:0});
    gsap.set('.head .bar',{yPercent:-120,opacity:0});

    /* hero parallax */
    gsap.to('.hero-name',{yPercent:30,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.stage',{y:-120,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero .aurora',{opacity:.3,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    if(fine){
      var layers=document.querySelectorAll('.stage .layer'), qx=[], qy=[];
      layers.forEach(function(l){ qx.push(gsap.quickTo(l,'x',{duration:1.2,ease:'power3'})); qy.push(gsap.quickTo(l,'y',{duration:1.2,ease:'power3'})); });
      document.querySelector('.hero').addEventListener('mousemove',function(e){
        var cx=e.clientX/innerWidth-.5, cy=e.clientY/innerHeight-.5;
        layers.forEach(function(l,i){ var d=parseFloat(l.dataset.depth)||1; qx[i](cx*28*d); qy[i](cy*22*d); });
      });
    }

    /* statement */
    var stTween=null;
    function setupStatement(){
      if(stTween){ if(stTween.scrollTrigger) stTween.scrollTrigger.kill(); stTween.kill(); }
      stTween=gsap.to('#statement .w',{opacity:1,stagger:.08,ease:'none',scrollTrigger:{trigger:'#statement',start:'top 78%',end:'bottom 45%',scrub:true}});
    }
    setupStatement();

    /* reveals */
    gsap.utils.toArray('.rv').forEach(function(el){
      gsap.to(el,{opacity:1,y:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 88%'}});
    });
    gsap.from('.layer-row',{x:-30,opacity:0,duration:1,ease:'expo.out',stagger:.07,scrollTrigger:{trigger:'#layers',start:'top 82%'}});
    gsap.from('.usage',{y:40,opacity:0,duration:1.1,ease:'expo.out',scrollTrigger:{trigger:'#layers',start:'top 82%'}});

    /* counters */
    document.querySelectorAll('.count').forEach(function(c){
      var o={v:0}; c.textContent='0';
      gsap.to(o,{v:function(){ return +c.dataset.to; },duration:2,ease:'power3.out',scrollTrigger:{trigger:c,start:'top 90%'},onUpdate:function(){ c.textContent=Math.round(o.v); }});
    });

    /* cases: stacking (re-run after re-render) */
    var caseCtx=null;
    function setupCases(){
      if(caseCtx) caseCtx.revert();
      caseCtx=gsap.matchMedia();
      caseCtx.add('(min-width: 761px)',function(){
        var cards=gsap.utils.toArray('.case');
        cards.forEach(function(card,i){
          if(i===cards.length-1) return;
          gsap.to(card,{scale:.9,filter:'brightness(.55)',ease:'none',scrollTrigger:{trigger:cards[i+1],start:'top 70%',end:'top 12%',scrub:true}});
        });
        cards.forEach(function(card){
          var t=card.querySelector('.tilt'); if(t) gsap.fromTo(t,{y:90,scale:.94},{y:-30,scale:1,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'top 10%',scrub:true}});
        });
      });
      if(fine){
        document.querySelectorAll('.case').forEach(function(c){
          var t=c.querySelector('.tilt'); if(!t) return;
          var tY=gsap.quickTo(t,'rotationY',{duration:1,ease:'power3'}), tX=gsap.quickTo(t,'rotationX',{duration:1,ease:'power3'});
          c.addEventListener('mousemove',function(e){ var r=c.getBoundingClientRect(); tY(((e.clientX-r.left)/r.width-.5)*12); tX(-((e.clientY-r.top)/r.height-.5)*9); });
          c.addEventListener('mouseleave',function(){ tY(0); tX(0); });
        });
      }
    }
    setupCases();

    /* contact title */
    var cTitle=null;
    function setupContactTitle(){
      if(cTitle){ if(cTitle.scrollTrigger) cTitle.scrollTrigger.kill(); cTitle.kill(); }
      cTitle=gsap.from('.c-big .char',{yPercent:115,duration:1.3,ease:'expo.out',stagger:.025,scrollTrigger:{trigger:'.c-big',start:'top 80%'}});
    }
    setupContactTitle();

    /* process horizontal */
    var mm=gsap.matchMedia();
    mm.add('(min-width: 761px)',function(){
      var track=document.querySelector('.proc-track');
      var dist=function(){ return Math.max(0,track.scrollWidth-innerWidth); };
      gsap.to(track,{x:function(){ return -dist(); },ease:'none',scrollTrigger:{trigger:'.proc-pin',start:'top top',end:function(){ return '+='+dist(); },pin:true,scrub:1,invalidateOnRefresh:true}});
      gsap.to('.proc-progress i',{scaleX:1,ease:'none',scrollTrigger:{trigger:'.proc-pin',start:'top top',end:function(){ return '+='+dist(); },scrub:true,invalidateOnRefresh:true}});
    });

    onLangChange=function(){
      setupStatement(); setupCases();
      var ct=document.querySelector('.c-big'), r=ct.getBoundingClientRect();
      if(r.top<innerHeight*.8){ gsap.set('.c-big .char',{yPercent:0}); } else { setupContactTitle(); }
      paintGrad();
      ScrollTrigger.refresh();
    };

    /* cursor */
    if(fine){
      root.classList.add('has-cursor');
      var dot=document.querySelector('.cursor'), label=document.querySelector('.cursor-label'), labelTxt=label.querySelector('span');
      var dx=gsap.quickTo(dot,'x',{duration:.18,ease:'power3'}), dy=gsap.quickTo(dot,'y',{duration:.18,ease:'power3'});
      var lx=gsap.quickTo(label,'x',{duration:.45,ease:'power3'}), ly=gsap.quickTo(label,'y',{duration:.45,ease:'power3'});
      gsap.set(label,{scale:.6});
      var shown=false, mode='';
      addEventListener('mousemove',function(e){
        if(!shown){ shown=true; gsap.set([dot,label],{x:e.clientX,y:e.clientY}); gsap.to(dot,{opacity:1,duration:.4}); }
        dx(e.clientX); dy(e.clientY); lx(e.clientX); ly(e.clientY);
      });
      document.addEventListener('mouseleave',function(){ gsap.to([dot,label],{opacity:0,duration:.3}); shown=false; mode=''; });
      var setMode=function(m){
        if(m===mode) return; mode=m;
        if(m==='case'){ labelTxt.textContent=U('cursor'); gsap.to(label,{opacity:1,scale:1,duration:.5,ease:'expo.out'}); gsap.to(dot,{scale:.6,duration:.4}); }
        else { gsap.to(label,{opacity:0,scale:.6,duration:.3,ease:'power2.out'}); }
        if(m==='link') gsap.to(dot,{scale:2.2,opacity:.85,duration:.4,ease:'expo.out'});
        else if(m==='hide') gsap.to(dot,{scale:0,duration:.3});
        else if(m==='') gsap.to(dot,{scale:1,opacity:1,duration:.4,ease:'expo.out'});
      };
      document.addEventListener('mouseover',function(e){
        var t=e.target.closest('[data-cursor], a, button, input, textarea');
        if(!t){ setMode(''); return; }
        if(t.matches('input, textarea')){ setMode('hide'); return; }
        setMode(t.dataset.cursor||'link');
      });
      addEventListener('mousedown',function(){ gsap.to(dot,{scale:'*=0.6',duration:.15}); });
      addEventListener('mouseup',function(){ var m=mode; mode='_'; setMode(m); });

      document.querySelectorAll('.magnetic').forEach(function(m){
        var mx=gsap.quickTo(m,'x',{duration:.6,ease:'elastic.out(1,.4)'}), my=gsap.quickTo(m,'y',{duration:.6,ease:'elastic.out(1,.4)'});
        m.addEventListener('mousemove',function(e){ var r=m.getBoundingClientRect(); mx((e.clientX-r.left-r.width/2)*.35); my((e.clientY-r.top-r.height/2)*.35); });
        m.addEventListener('mouseleave',function(){ mx(0); my(0); });
      });
    }

    addEventListener('load',function(){ ScrollTrigger.refresh(); });
  }
})();
