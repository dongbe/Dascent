/**
 * Created by donatien-gbe on 11/10/15.
 */
function AddMasks()
{
    MaskedInput({
        elm: document.getElementById('ex-1'),
        format: 'MM/DD/YYYY',
        onbadkey: function(){
            ShakeShake({ elm: document.getElementById('ex-1') });
        }, badkeywait: 400
    });
    MaskedInput({
        elm: document.getElementById('ex-2'),
        format: '____-__-__',
        onbadkey: function(){
            ShakeShake({ elm: document.getElementById('ex-2') });
        }, badkeywait: 400
    });
    MaskedInput({
        elm: document.getElementById('ex-3'),
        format: '...-..-....', separator: '-', typeon: '.',
        onbadkey: function(){
            FlashBang({ elm: document.getElementById('ex-3') });
        }, badkeywait: 90
    });
    MaskedInput({
        elm: document.getElementById('ex-4'),
        format: '(___) ___-____', separator: '()- ',
        onbadkey: function(){
            FlashBang({ elm: document.getElementById('ex-4'),
                prop: 'color', delta: 120, color: '#f00' });
        }, badkeywait: 130
    });
    MaskedInput({
        elm: document.getElementById('ex-5'),
        format: 'HH:mm',
        separator: ':',
        typeon: 'Hm',
        allowedfx: function(ch, idx) {
            switch (idx) {
                case 1:
                    return ('012'.indexOf(ch) > -1);
                case 2:
                    var str = document.getElementById('ex-5').value;
                    if (str[0] === '2') {
                        return ('0123'.indexOf(ch) > -1);
                    }
                    break;
                case 4:
                    return ('012345'.indexOf(ch) > -1);
                case 5:
                    return true;
            }
            return true;
        },
        onbadkey: function(){
            FlashBang({ elm: document.getElementById('ex-5'),
                prop: 'color', delta: 120, color: '#f00' });
        }, badkeywait: 130
    });
    MaskedInput({
        elm: document.getElementById('ex-text'),
        format: 'MSG @____\n@____\n@____\n@____',
        separator: '\n@ /MSG',
        typeon: '_',
        allowed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        onbadkey: function(){
            FlashBang({ elm: document.getElementById('ex-text'),
                prop: 'color', delta: 120, color: '#f00' });
        }, badkeywait: 130
    });
}
function FlashBang(args)
{
    try {
        var elm = args['elm'],
            color = args['color'] || '#f55',
            prop	= args['prop']	|| 'backgroundColor',
            delta = args['delta'] || 80,
            origStyle = elm.style[prop];
        elm.style[prop] = color;
        setTimeout(function(){ FlashOff(); },delta);
    } catch(e) { return; }
    function FlashOff() { elm.style[prop] = origStyle; }
}
function appendOnLoad(fx) {
    try { // For browsers that know DOMContentLoaded (FF, Safari, Opera)
        document.addEventListener("DOMContentLoaded", fx, false);
    } catch(e) {
        var old = window.onload;
        if (typeof old != 'function') { window.onload = fx; }
        else { window.onload = function() { old(); fx(); } }
    }
}
appendOnLoad(AddMasks);