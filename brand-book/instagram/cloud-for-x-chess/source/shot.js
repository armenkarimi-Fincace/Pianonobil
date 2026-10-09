const {chromium}=require(process.env.PW||'playwright-core');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--allow-file-access-from-files']});
  const [file,sel,out,w,h,scale]=process.argv.slice(2);
  const p=await b.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:+(scale||1)});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+file);await p.waitForSelector('body[data-ready="1"]');await p.waitForTimeout(300);
  await (await p.$(sel)).screenshot({path:out});console.log(errs.join('\n')||'ok');await b.close();
})();
