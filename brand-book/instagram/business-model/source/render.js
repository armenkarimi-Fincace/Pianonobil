const {chromium}=require(process.argv[2]+'/node_modules/playwright-core');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--allow-file-access-from-files']});
  const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+process.argv[2]+'/slides.html');
  await p.waitForSelector('body[data-ready="1"]');await p.waitForTimeout(400);
  const out=process.argv[3];
  for(let i=1;i<=10;i++){await (await p.$('#s'+i)).screenshot({path:`${out}/x-chase-business-model-${String(i).padStart(2,'0')}.png`});}
  console.log(errs.join('\n')||'ok');await b.close();
})();
