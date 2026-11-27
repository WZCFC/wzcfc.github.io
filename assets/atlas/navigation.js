// Opening a chapter moves the illustration once. Reading and ordinary links stay immediate.
(() => {
 const root=document.documentElement;
 const navigation=performance.getEntriesByType('navigation')[0];
 if (!location.hash && navigation?.type !== 'back_forward') root.classList.add('on-entry');
 function openTarget(){
   if(!location.hash) return;
   let id; try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
   const target=document.getElementById(id);
   if(!target) return;
   const parent=target.closest('details');
   if(parent && !parent.open){parent.open=true;target.scrollIntoView({block:'start'});}
 }
 openTarget(); window.addEventListener('hashchange',openTarget);
 const rail=document.querySelector('.section-rail');
 if(rail){
   const pairs=[...rail.querySelectorAll('a')].map(link=>[link,document.getElementById(link.hash.slice(1))]).filter(([,section])=>section);
   let scheduled=false;
   let requested=location.hash;
   function updateSection(){
     scheduled=false;
     const edge=rail.offsetHeight+24;
     let selected=pairs[0];
     for(const pair of pairs){if(pair[1].getBoundingClientRect().top<=edge)selected=pair;}
     if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2){
       const requestedSection=pairs.find(([link])=>link.hash===requested);
       const bounds=requestedSection?.[1].getBoundingClientRect();
       selected=bounds && bounds.top<innerHeight && bounds.bottom>edge ? requestedSection : pairs.at(-1);
     }
     for(const pair of pairs){
       if(pair===selected)pair[0].setAttribute('aria-current','location');
       else pair[0].removeAttribute('aria-current');
     }
   }
   function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(updateSection);}}
   rail.addEventListener('click',event=>{
     const link=event.target.closest('a');
     if(link){requested=link.hash;schedule();}
   });
   window.addEventListener('hashchange',()=>{requested=location.hash;schedule();});
   function resumeTracking(){requested='';schedule();}
   window.addEventListener('wheel',resumeTracking,{passive:true});
   window.addEventListener('touchmove',resumeTracking,{passive:true});
   window.addEventListener('keydown',event=>{if(['PageDown','PageUp','ArrowDown','ArrowUp','End','Home',' '].includes(event.key))resumeTracking();});
   window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
   window.addEventListener('load',schedule);window.addEventListener('pageshow',schedule);schedule();
 }
 window.addEventListener('pageshow',event=>{if(event.persisted)root.classList.remove('on-entry')});
})();
