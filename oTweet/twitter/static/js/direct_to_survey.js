console.log('redirect ready')

let link = js_vars.link
console.log(link)

setTimeout('Redirect()', 3000);
function Redirect()
{
    window.location=link;
}